# 中学英文法 拡充プラン（作問用の整理）

learning-support の英語クイズ `中学英文法`（現状8問のプレースホルダのみ）を、
**『Mr. Evineの中学英文法を修了するドリル』の章立てを骨格に**して本格拡充するための整理。

> 元PDF: `~/Downloads/02_TEP/TEP教材/Mr. Evineの中学英文法を修了するドリル Evine.pdf`（324ページ）
> 構成 = Pre-Lesson＋全29 Lesson＋Communication Stage×5＋Proficiency Test。各レッスンは Input Stage(解説)→Output Stage(演習) の二段。

## ★著作権・方針（厳守）

- **Evineの例文・問題文を丸写ししない**。章立て（＝学習する文法項目の順序）と「どの文法を問うか」だけを借り、**例文・選択肢・解説はすべてオリジナルで作成**する（[[learning-support-app]] のDUO/Evergreen と同方針）。
- 出題形式は既存と統一 = **短文の空所補充4択（`choice`）**を主軸（[[madhand-sns-drafter]] のモードB／`_QUESTION_BRIEF.md` 準拠）。動詞の活用形など一部は記述式(`text`)も可。
- レベルは中学範囲。語彙は易しく、**問うのは文法**（語彙当てにしない）。

## 投入先（既存パイプラインに乗せる）

- `subject: "en"` / `category: "英文法"` / `book_name: "中学英文法"`（既存8問は `--replace` で置き換え＝クリーン再構築）。
- chapter は**レッスン単位**（DUO/Evergreen と同じ「章＝1テスト10問」の粒度）。
- chapter名は並び順が崩れないよう**ゼロ詰め番号を先頭**に＋学年を併記。例:
  `L01 SV文型【中1】` … `L29 英文解釈【中3】`（`/test` の naturalSort で L01→L29 の数値順に並ぶ）。
- 生成→ `node scripts/seed-questions.mjs content/<file>.json --replace` → 正解番号は `node scripts/balance-correct.mjs content/<file>.json` で均す。

---

## 章立て × 作問の整理（全30チャプター）

各レッスンで**問うべき文法項目**と**4択空所補充の出題アングル例（オリジナルで作る）**。推奨は各10問。

### ■ 中1レベル（5文型の柱）→ ファイル `chugaku-bunpo-1.json`（7章 / 70問）

| chapter | 文法項目 | 出題アングル例（オリジナル文で） | 数 |
|---|---|---|---|
| L00 5文型の基礎【中1】 | 品詞・文の要素(S/V/O/C)・5文型の概観 | 文中の下線部が S/V/O/C のどれか／適切な語順 | 10 |
| L01 SV文型【中1】 | 自動詞・第1文型・修飾語(M) | "Birds ___ in the sky."（fly/are/make…）動詞選択 | 10 |
| L02 SVC文型【中1】 | be動詞・become/look/get＋補語、S=C | "She ___ a doctor."／"He looks ___."（happy/happily） | 10 |
| L03 SVO文型【中1】 | 他動詞＋目的語 | "I ___ tennis every day."（play/am）／目的語の選択 | 10 |
| L04 形容詞と副詞【中1】 | 形容詞(限定/叙述)・副詞の位置と働き・形/副の区別 | "She runs ___."（fast/quick）／"a ___ dog"（形容詞） | 10 |
| L05 SVOO文型【中1】 | give/show/tell＋人＋物、to/for書き換え | "He gave ___ a present."（me/to me）／第4↔第3文型 | 10 |
| L06 SVOC文型【中1】 | call/make/keep＋O＋C、O=C | "We call ___ Tom."／"The news made me ___."（happy） | 10 |

### ■ 中1・2レベル（基礎の安定）→ ファイル `chugaku-bunpo-2.json`（10章 / 100問）

| chapter | 文法項目 | 出題アングル例 | 数 |
|---|---|---|---|
| L07 主語と動詞【中1】 | 三単現の-s・主語と動詞の一致・一般動詞 | "He ___ soccer."（plays/play）三単現 | 10 |
| L08 名詞と代名詞【中1】 | 名詞の単複・人称代名詞の格・所有代名詞・this/that | "This book is ___."（mine/my）／"___ are my friends." | 10 |
| L09 否定文と疑問文【中1】 | do/does・be動詞の否定/疑問・Yes/No応答 | "___ you like coffee?"（Do/Are）／否定形の選択 | 10 |
| L10 過去形【中1】 | 規則-ed・不規則動詞・was/were・過去の否定/疑問 | "He ___ to school yesterday."（went/goes） | 10 |
| L11 冠詞と名詞【中1・2】 | a/an/the・可算/不可算・量の表現 | "I want ___ apple."（an/a）／"___ water"（some/a） | 10 |
| L12 進行形【中1・2】 | 現在/過去進行形 be+-ing・進行形にしない動詞 | "She is ___ now."（cooking/cook） | 10 |
| L13 未来の表現【中2】 | will・be going to・未来の否定/疑問 | "I ___ visit Kyoto tomorrow."（will/am） | 10 |
| L14 助動詞【中2】 | can/will/must/may/should・許可/依頼/義務/推量・否定 | "You ___ finish it today."（must/are）／意味選択 | 10 |
| L15 疑問詞の疑問文【中2】 | what/who/when/where/why/how・how many/much/old | "___ is your bag?"（Where/What）／"How ___ books?" | 10 |
| L16 前置詞と名詞【中2】 | 時/場所の at/on/in・方向・前置詞句 | "I get up ___ seven."（at/on）／"___ Monday" | 10 |

### ■ 中2・3レベル（応用・読解の総まとめ）→ ファイル `chugaku-bunpo-3.json`（13章 / 130問）

| chapter | 文法項目 | 出題アングル例 | 数 |
|---|---|---|---|
| L17 不定詞【中2】 | to+原形・名詞的/形容詞的/副詞的用法 | "I want ___ English."（to study/study） | 10 |
| L18 動名詞と不定詞【中2】 | 動名詞-ing・動名詞 vs 不定詞・目的語にとる動詞 | "He enjoys ___."（playing/to play） | 10 |
| L19 接続詞【中2】 | and/but/or・that・when/if/because 等の従位接続詞 | "Stay home ___ it rains."（if/that） | 10 |
| L20 比較1 比較級・最上級【中2】 | -er/-est・more/most・than・the+最上級 | "He is ___ than me."（taller/tall） | 10 |
| L21 比較2 比較のいろいろ【中2】 | as...as・原級・不規則変化(good-better-best) | "She runs as ___ as Ken."（fast/faster） | 10 |
| L22 受け身【中2・3】 | be+過去分詞・by・受動態の否定/疑問・時制 | "This book ___ by many people."（is read/reads） | 10 |
| L23 重要表現いろいろ【中3】 | too...to／so...that／enough to／形式主語it | "It is too hard ___ solve."（to/for）／too…to↔so…that | 10 |
| L24 現在完了1 完了・結果【中3】 | have+過去分詞・just/already/yet | "I have ___ finished."（already/yet）／"___ yet?" | 10 |
| L25 現在完了2 継続・経験【中3】 | for/since(継続)・ever/never/before(経験)・回数 | "I have lived here ___ 2010."（since/for） | 10 |
| L26 分詞【中3】 | 現在/過去分詞の形容詞用法(前置/後置修飾) | "the ___ boy"（sleeping）／"a letter ___ in English"（written） | 10 |
| L27 関係代名詞1 主格・目的格【中3】 | who/which/that 主格・目的格・先行詞 | "the man ___ lives here"（who/which） | 10 |
| L28 関係代名詞2 所有格【中3】 | whose・関係代名詞のまとめ | "a girl ___ name is Mai"（whose/who） | 10 |
| L29 英文解釈のコツ【中3】 | 句と節・名詞句/形容詞句/副詞句・文構造 | 下線部の句の働き（名詞/形容詞/副詞）を選ぶ／文型識別 | 10 |

**合計 = 30章 × 10問 = 約300問**（3ファイルに分割）。

---

## マドハンドへの作業指示（次にGoが出たら）

1. このプランと `_QUESTION_BRIEF.md`（モードB・出題形式）を読む。
2. **1ファイル＝1学年帯**で生成（`chugaku-bunpo-1/2/3.json`）。各 `subject:"en"` `category:"英文法"` `book_name:"中学英文法"`。
3. 全問オリジナルの短文空所補充4択。中学レベルの易しい語彙、問うのは文法。
4. 各問 `explanation` に「正解の文法ポイント＋なぜそれか＋誤答がなぜ違うか」を中学生にわかる日本語で。
5. 生成後: `balance-correct.mjs` で正解番号を均し、人間が `seed-questions.mjs --replace` で投入。

> 補足: L00/L29 やコミュニケーション系は純粋な空所補充に乗りにくい。L00は語順・文型識別、L29は句の働き・文型識別の4択に変換して作る（記述式 `text` を一部混ぜてもよい）。

---
作成: 2026-06-24（PDF分析に基づく章立て整理。問題本体は未生成＝次セッションで作成）
