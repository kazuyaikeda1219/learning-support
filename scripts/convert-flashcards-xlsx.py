#!/usr/bin/env python3
# ============================================================
# フラッシュカード.xlsx → content/*.json 変換
#
# 各シートを seed-flashcards.mjs が読める形
#   { subject, category, deck_name, description, cards:[{front,back,reading?,example?}] }
# に整形して content/ に書き出す。シートごとに列構成が違うので個別ハンドラ。
#
#   使い方:  python3 scripts/convert-flashcards-xlsx.py
#   生成後:  for f in <生成ファイル>; do node scripts/seed-flashcards.mjs "$f" --replace; done
# ============================================================
import zipfile, re, json, os
from xml.etree import ElementTree as ET

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(HERE, 'フラッシュカード.xlsx')
OUT  = os.path.join(HERE, 'content')
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

z = zipfile.ZipFile(XLSX)
ss = [''.join(t.text or '' for t in si.iter(NS + 't'))
      for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall(NS + 'si')]
wb = z.read('xl/workbook.xml').decode()
sheets = re.findall(r'<sheet [^>]*name="([^"]+)"[^>]*r:id="(rId\d+)"', wb)
relmap = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"',
                         z.read('xl/_rels/workbook.xml.rels').decode()))

def rows_of(name):
    rid = [r for n, r in sheets if n == name][0]
    root = ET.fromstring(z.read('xl/' + relmap[rid]))
    out = []
    for row in root.iter(NS + 'row'):
        cells = {}
        for c in row.findall(NS + 'c'):
            v = c.find(NS + 'v')
            if v is None:
                continue
            col = re.match(r'([A-Z]+)', c.get('r')).group(1)
            cells[col] = ss[int(v.text)] if c.get('t') == 's' else v.text
        out.append(cells)
    return out

def g(r, c):
    return (r.get(c, '') or '').strip()

SPLIT = re.compile(r'\s+')          # 半角/全角どちらの空白でも分割
JP = re.compile(r'[ぁ-んァ-ヶ一-龯々ー]')
skipped = {}                         # シート名 -> 取りこぼした行

def log_skip(name, row):
    skipped.setdefault(name, []).append(row)

def has_jp(s):
    return bool(JP.search(s or ''))

def is_note(s):                      # 直前の語への補足注釈行か（( … ) / ☆ / 「じんjin: 意味」）
    s = (s or '').strip()
    if not s:
        return False
    if s[0] in '(（☆':
        return True
    return bool(re.match(r'^[ぁ-んァ-ヶ一-龯ー・/]+[A-Za-z]+\s*[:：]', s))

def fix_time(s):                     # 壊れたExcel時刻シリアル(0.128…)を H:MM に
    if re.fullmatch(r'0?\.\d+', s or ''):
        mins = round(float(s) * 24 * 60)
        return f'{mins // 60}:{mins % 60:02d}'
    return s

# ── シート別ハンドラ ───────────────────────────────────────
def h_kana(name):                    # A=かな, B=ローマ字
    return [{'front': g(r, 'A'), 'back': g(r, 'B')}
            for r in rows_of(name) if g(r, 'A') and g(r, 'B')]

def h_katakana_words(name):          # A=カタカナ語, B="ひらがな english"
    cards = []
    for r in rows_of(name):
        a, b = g(r, 'A'), g(r, 'B')
        if not a or not b:
            continue
        parts = SPLIT.split(b, 1)
        if len(parts) == 2:
            cards.append({'front': a, 'back': parts[1], 'reading': parts[0]})
        else:
            cards.append({'front': a, 'back': b})
    return cards

def h_pair_kanji(name):              # 2行1組: [A=漢字,B=読み] / [A=意味]
    rws = [r for r in rows_of(name) if g(r, 'A') or g(r, 'B')]
    cards, i = [], 0
    while i < len(rws):
        a = rws[i]
        if g(a, 'A') and g(a, 'B') and i + 1 < len(rws) and g(rws[i + 1], 'A') and not g(rws[i + 1], 'B'):
            cards.append({'front': g(a, 'A'), 'back': g(rws[i + 1], 'A'), 'reading': g(a, 'B')})
            i += 2
        else:
            log_skip(name, a); i += 1
    return cards

def h_pair_vocab(name):              # 2行1組: [A=日本語] / [A=ローマ字,B=英語]
    rws = [r for r in rows_of(name) if g(r, 'A') or g(r, 'B')]
    cards, i = [], 0

    def attach_note(text):           # 補足注釈は直前カードの example に寄せる
        if cards:
            ex = cards[-1].get('example')
            cards[-1]['example'] = (ex + ' ／ ' + text) if ex else text
        else:
            log_skip(name, {'note': text})

    while i < len(rws):
        a = rws[i]
        A, B = g(a, 'A'), g(a, 'B')
        nxt = rws[i + 1] if i + 1 < len(rws) else {}
        nA, nB = g(nxt, 'A'), g(nxt, 'B')
        nx2 = rws[i + 2] if i + 2 < len(rws) else {}

        if is_note(A):                                   # ☆/( )/読み注釈 → 直前へ
            attach_note(A); i += 1; continue

        if has_jp(A) and not B:                          # 見出し語（日本語行）
            if nA and nB and not has_jp(nA) and not is_note(nA):   # 次=ローマ字+英語
                cards.append({'front': A, 'back': fix_time(nB), 'reading': nA}); i += 2; continue
            if is_note(nA) and nB:                       # 英語が☆注釈側のBにある語
                cards.append({'front': A, 'back': fix_time(nB), 'reading': nA}); i += 2; continue
            if nA and not nB and not has_jp(nA) and is_note(g(nx2, 'A')) and g(nx2, 'B'):
                # 3行構成: [日本語][ローマ字(Bなし)][☆注釈 B=英語]（例: えいがをみる）
                cards.append({'front': A, 'back': fix_time(g(nx2, 'B')),
                              'reading': nA, 'example': g(nx2, 'A')}); i += 3; continue
            if has_jp(nA) and not nB:
                # 見出し語が複数行に割れている（例: にんき＋がある → ninki ga aru）
                run, k = [A], i + 1
                while k < len(rws) and has_jp(g(rws[k], 'A')) and not g(rws[k], 'B') and not is_note(g(rws[k], 'A')):
                    run.append(g(rws[k], 'A')); k += 1
                tail = rws[k] if k < len(rws) else {}
                if g(tail, 'A') and g(tail, 'B') and not has_jp(g(tail, 'A')):
                    cards.append({'front': ''.join(run), 'back': fix_time(g(tail, 'B')),
                                  'reading': g(tail, 'A')}); i = k + 1; continue
            log_skip(name, a); i += 1; continue

        if has_jp(A) and B:                              # 単一行で完結（例: 「ぜひ zehi」/by all means）
            m = re.match(r'^(\S+?)\s+([A-Za-z].*)$', A)
            if m and has_jp(m.group(1)) and not has_jp(m.group(2)):
                cards.append({'front': m.group(1), 'back': fix_time(B), 'reading': m.group(2)})
            else:
                cards.append({'front': A, 'back': fix_time(B)})
            i += 1; continue

        log_skip(name, a); i += 1
    return cards

def h_youbi(name):                   # A="月曜日／げつようび", B=English
    cards = []
    for r in rows_of(name):
        a, b = g(r, 'A'), g(r, 'B')
        if not a or not b:
            continue
        kanji, _, kana = a.partition('／')
        if not kana:
            kanji, _, kana = a.partition('/')
        cards.append({'front': kanji.strip(), 'back': b,
                      'reading': kana.strip() or None})
    return cards

def h_suuji(name):                   # A=数字, B=よみ
    cards = []
    for r in rows_of(name):
        a, b = g(r, 'A'), g(r, 'B')
        if not a or not b:
            continue
        if re.fullmatch(r'\d+\.0', a):      # 1.0 -> 1
            a = a[:-2]
        cards.append({'front': a, 'back': b})
    return cards

def h_hizuke(name):                  # 2行1組: [A=かな] / [A=ローマ字, B="一日 1st"]
    rws = [r for r in rows_of(name) if g(r, 'A') or g(r, 'B')]
    cards, i = [], 0
    while i < len(rws):
        a = rws[i]
        nxt = rws[i + 1] if i + 1 < len(rws) else {}
        if g(a, 'A') and not g(a, 'B') and g(nxt, 'B'):
            cards.append({'front': g(a, 'A'), 'back': g(nxt, 'B'), 'reading': g(nxt, 'A')})
            i += 2
        else:
            log_skip(name, a); i += 1
    return cards

def h_phrases(name):                 # A=日本語フレーズ, B=英語（構成が不揃いなので個別救済）
    rws = rows_of(name)
    cards, i = [], 0

    def attach_ex(text):
        if cards:
            ex = cards[-1].get('example')
            cards[-1]['example'] = (ex + ' / ' + text) if ex else text

    while i < len(rws):
        r = rws[i]
        A, B = g(r, 'A'), g(r, 'B')
        if not A and not B:
            i += 1; continue

        if A.startswith('→'):                # Q&A の回答行 → 直前の質問カードへ
            jp, en = [], []
            while i < len(rws) and g(rws[i], 'A').startswith('→'):
                t = g(rws[i], 'A')[1:].strip()
                (jp if has_jp(t) else en).append(t)
                i += 1
            pairs = []
            for k in range(max(len(jp), len(en))):
                j = jp[k] if k < len(jp) else ''
                e = en[k] if k < len(en) else ''
                pairs.append(f'{j}（{e}）' if j and e else (j or e))
            attach_ex(' / '.join(pairs)); continue

        if A and not B and re.fullmatch(r'[①-⑳]+', A):   # セクション見出し
            i += 1; continue

        if A and B:
            cards.append({'front': A, 'back': B}); i += 1; continue

        # A だけ（英語が後続行にまとまっているケース: ここ/そこ/あそこ, 1234円 等）
        if A and not B:
            if cards and cards[-1]['front'] == A:          # 直後に→が来る重複質問行 → 捨てる
                i += 1; continue
            jp_run, j = [A], i + 1
            while j < len(rws) and g(rws[j], 'A') and not g(rws[j], 'B') \
                    and has_jp(g(rws[j], 'A')) and not g(rws[j], 'A').startswith('→'):
                jp_run.append(g(rws[j], 'A')); j += 1
            english = []
            if j < len(rws) and g(rws[j], 'A') and g(rws[j], 'B'):   # 境界行（A=日本語, B=英語）
                jp_run.append(g(rws[j], 'A')); english.append(g(rws[j], 'B')); j += 1
            while j < len(rws) and g(rws[j], 'A') and not g(rws[j], 'B') \
                    and not has_jp(g(rws[j], 'A')) and not g(rws[j], 'A').startswith('→'):
                english.append(g(rws[j], 'A')); j += 1
            if english:
                for k, jpw in enumerate(jp_run):
                    cards.append({'front': jpw, 'back': english[k] if k < len(english) else english[-1]})
                i = j; continue
            log_skip(name, r); i += 1; continue

        i += 1
    return cards

def h_kanji_phrases(name, has_header):   # A=日本語 B=ふりがな C=ローマ字 D=意味
    cards = []
    for r in rows_of(name):
        a, b, c, d = g(r, 'A'), g(r, 'B'), g(r, 'C'), g(r, 'D')
        if has_header and a == '日本語':
            continue
        if a and d:
            cards.append({'front': a, 'back': d,
                          'reading': b or None, 'example': c or None})
        elif any([a, b, c, d]):
            log_skip(name, r)
    return cards

# ── デッキ定義（出力ファイル / 見出し / 説明 / カード生成）────────
DECKS = [
    ('hiragana.json',          'かな',       'ひらがな（五十音）',        'Basic hiragana — flip to see the romaji reading.',  lambda: h_kana('ひらがな')),
    ('katakana.json',          'かな',       'カタカナ（五十音）',        'Basic katakana — flip to see the romaji reading.',  lambda: h_kana('カタカナ①')),
    ('katakana-words.json',    'かな',       'カタカナ語 100',            'Common loanwords written in katakana.',             lambda: h_katakana_words('カタカナ②')),
    ('n5-kanji.json',          '漢字',       'N5 漢字',                  'JLPT N5 kanji — readings and meaning.',             lambda: h_pair_kanji('N5 Kanji')),
    ('genki1-vocab-1.json',    '単語',       'Genki I 単語 ①',           'Genki I vocabulary (first half).',                  lambda: h_pair_vocab('Genki1 Vocabulary①')),
    ('genki1-vocab-2.json',    '単語',       'Genki I 単語 ②',           'Genki I vocabulary (second half).',                 lambda: h_pair_vocab('Genki1 Vocabulary②')),
    ('youbi.json',             '基礎',       '曜日',                     'Days of the week.',                                 lambda: h_youbi('曜日')),
    ('suuji.json',             '基礎',       '数字',                     'Numbers and their Japanese readings.',              lambda: h_suuji('数字')),
    ('hizuke.json',            '基礎',       '日付',                     'Days of the month (1st–31st).',                     lambda: h_hizuke('日付')),
    ('phrases-100.json',       'フレーズ',   '100 Useful Phrases',       'Everyday useful phrases (with furigana).',          lambda: h_phrases('100 Useful Phrases (no romaji)')),
    ('n5-kanji-phrases.json',  '漢字フレーズ', 'N5 漢字フレーズ',         'Example sentences using N5 kanji.',                 lambda: h_kanji_phrases('N5 漢字フレーズ', True)),
    ('n4-kanji-phrases.json',  '漢字フレーズ', 'N4 漢字フレーズ',         'Example sentences using N4 kanji.',                 lambda: h_kanji_phrases('N4漢字フレーズ', False)),
]

os.makedirs(OUT, exist_ok=True)
files = []
print('=== 変換結果 ===')
for fname, category, deck_name, desc, build in DECKS:
    cards = build()
    # None の reading/example は落としてキーを綺麗に
    clean = []
    for c in cards:
        clean.append({k: v for k, v in c.items() if v not in (None, '')})
    doc = {'subject': 'ja', 'category': category, 'deck_name': deck_name,
           'description': desc, 'cards': clean}
    path = os.path.join(OUT, fname)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    files.append('content/' + fname)
    print(f'  ✓ {deck_name:<22} {len(clean):>4} 枚  -> content/{fname}')

print('\n=== 取りこぼした行（要確認 / 見出し行など）===')
if not skipped:
    print('  なし')
for name, rows in skipped.items():
    print(f'  [{name}] {len(rows)} 行:')
    for r in rows[:12]:
        print('     ', {k: r[k] for k in sorted(r)})
    if len(rows) > 12:
        print(f'      … 他 {len(rows) - 12} 行')

print('\n=== seed コマンド ===')
print('  ' + ' && \\\n  '.join(f'node scripts/seed-flashcards.mjs {f} --replace' for f in files))
