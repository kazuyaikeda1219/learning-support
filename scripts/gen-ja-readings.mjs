// ============================================================
// 日本語クイズ用 ふりがな(ruby)＋ローマ字 生成スクリプト
//
// subject='ja' の questions から、選択肢(option_1..4)と解説(explanation)の
// 日本語テキストを集め、kuroshiro で
//   - furigana : 漢字のみに <ruby> を振った HTML
//   - romaji   : スペース区切りのヘボン式ローマ字
// を生成し、テキストをキーにした辞書を public/ja-readings.json に出力する。
//
// フロントは日本語テキスト一致で参照するため、問題IDの変更や再importに強い。
// 新しい ja 問題を足したら本スクリプトを再実行すること。
//
// 使い方: node scripts/gen-ja-readings.mjs
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const Kuroshiro = require('kuroshiro').default || require('kuroshiro');
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji').default || require('kuroshiro-analyzer-kuromoji');

// ── .env.local パース ─────────────────────────────────────
function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* ignore */ }
  return env;
}
const env = loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) { console.error('✗ .env.local に SUPABASE URL / ANON KEY が必要'); process.exit(1); }

// ローマ字の句読点まわりの余分なスペースを整える
function cleanRomaji(r) {
  return r
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:)）」』、。])/g, '$1')
    .replace(/([(（「『])\s+/g, '$1')
    .trim();
}

const hasKanji = (s) => /[一-龯㐀-䶿]/.test(s);

// XSS対策: 出力に許可するのは <ruby>/<rt>/<rp> の6タグのみ。
// それ以外の「<」「>」「&」を含むテキスト部分は HTML エスケープして保存する
// （フロントは dangerouslySetInnerHTML で描画するため、ここで安全を担保）。
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ALLOWED_TAGS = new Set(['<ruby>', '</ruby>', '<rt>', '</rt>', '<rp>', '</rp>']);
function sanitizeFurigana(html) {
  let out = '';
  let last = 0;
  const tagRe = /<\/?[a-zA-Z][^>]*>/g;
  let m;
  while ((m = tagRe.exec(html))) {
    out += escapeHtml(html.slice(last, m.index));
    const tag = m[0].toLowerCase();
    out += ALLOWED_TAGS.has(tag) ? tag : escapeHtml(m[0]);
    last = tagRe.lastIndex;
  }
  out += escapeHtml(html.slice(last));
  return out;
}

(async () => {
  const supabase = createClient(url, key);

  console.log('▶ ja 問題を取得中...');
  const { data, error } = await supabase
    .from('questions')
    .select('option_1, option_2, option_3, option_4, explanation')
    .eq('subject', 'ja');
  if (error) { console.error('✗ 取得失敗:', error.message); process.exit(1); }

  // 一意な日本語文字列を収集
  const strings = new Set();
  for (const row of data || []) {
    for (const v of [row.option_1, row.option_2, row.option_3, row.option_4, row.explanation]) {
      const t = (v ?? '').trim();
      if (t) strings.add(t);
    }
  }
  console.log(`  ja問題 ${data?.length ?? 0} 件 → 一意テキスト ${strings.size} 件`);

  console.log('▶ kuroshiro 初期化中（辞書ロード）...');
  const kuroshiro = new Kuroshiro();
  await kuroshiro.init(new KuromojiAnalyzer());

  const dict = {};
  let n = 0;
  for (const s of strings) {
    const furiganaRaw = hasKanji(s)
      ? await kuroshiro.convert(s, { to: 'hiragana', mode: 'furigana' })
      : s; // 漢字が無ければルビ不要（原文のまま）
    const furigana = sanitizeFurigana(furiganaRaw);
    const romaji = cleanRomaji(
      await kuroshiro.convert(s, { to: 'romaji', mode: 'spaced', romajiSystem: 'hepburn' })
    );
    dict[s] = { furigana, romaji };
    if (++n % 50 === 0) console.log(`  ...${n}/${strings.size}`);
  }

  // キーをソートして安定した差分に
  const sorted = {};
  for (const k of Object.keys(dict).sort()) sorted[k] = dict[k];

  const outPath = new URL('../public/ja-readings.json', import.meta.url);
  writeFileSync(outPath, JSON.stringify(sorted, null, 0) + '\n', 'utf8');
  console.log(`✓ 出力: public/ja-readings.json（${Object.keys(sorted).length} 件）`);
  process.exit(0);
})();
