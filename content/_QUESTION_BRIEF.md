# 英語クイズ 作問ブリーフ（マドハンド向け）

learning-support の `/test`（英語＝`subject:"en"`）の問題を量産するための作業仕様。
**このファイルの形式どおりに `content/<file>.json` を作れば、そのまま投入できる。**

---

## 1. 投入の仕組み（必読）

- 問題はすべて Supabase の `questions` テーブルに入っており、`/test` ページはそこを読む。
- ソースは `content/*.json`。1ファイル = 1教材（`book_name`）。
- 投入コマンド（リポルートで）:
  ```bash
  node scripts/seed-questions.mjs content/<file>.json            # 追記
  node scripts/seed-questions.mjs content/<file>.json --replace  # 同じ book_name を消して入れ直し（再実行向き）
  ```
- 階層は **大(category) → 中(book_name) → 小(chapter)**。`/test` はこの3階層で表示する。

## 2. JSON フォーマット

```jsonc
{
  "subject": "en",                 // 英語は必ず "en"（省略すると en 扱い）
  "category": "英文法",            // 大項目。下の「使えるカテゴリ」から選ぶ
  "book_name": "中学英文法",       // 中項目（教材名）。同名は同じ教材に集約される
  "questions": [
    {
      "chapter": "中1 - be動詞",   // 小項目。同じ chapter が1つのテストになる
      "question_text": "I ___ a student.（私は学生です）に入るのは？",
      "options": ["am", "is", "are", "be"],   // 4択は必ず4つ
      "correct": 1,                            // 正解の番号（1〜4、1始まり）
      "explanation": "主語が I のとき be動詞は am。is=三単現、are=you/複数。"
    },
    {
      "chapter": "中1 - be動詞",
      "q_type": "text",                        // 記述式はこれを付ける
      "question_text": "「私は学生です」を英語で（I ___ a student.）",
      "correct_text": "am",                    // 記述の模範解答（大小文字・前後空白は無視して判定）
      "explanation": "I に対応する be動詞は am。"
    }
  ]
}
```

## 3. 守るルール（バリデーションで弾かれる）

- **4択（既定 / `choice`）**: `options` はちょうど4つ、`correct` は 1〜4。
- **記述（`q_type:"text"`）**: `correct_text` 必須。`options`/`correct` は不要。
- `question_text` は必須。日本語の意味やヒントを `（…）` で添えると学習効果が高い。
- `explanation` は毎問つける（正解の理由＋誤答の意味を一言ずつ）。
- 1教材＝1ファイル。`chapter` でテスト単位に分ける。**1テスト=10問**を標準とする（DUO/Evergreen がこの粒度）。

## 4. 品質ガイドライン

- 誤答（ダミー）は「もっともらしいが明確に違う」もの。正解だけ文法的に成立、は避ける。
- 4択の正解番号は1〜4に散らす（全部 1 にしない）。
- 既存問題と重複させない。DUO/Evergreen の語・例文は確認してから使う。
- 中学→高校→受験 とレベルが上がるよう chapter 名にレベルを明記（例「中1 -」「高2 -」「英検準2級 -」）。

## 5. 使えるカテゴリ（`category`）

`/test` がアイコン付きで認識する大項目:

| category | 用途 | 現状 |
|---|---|---|
| `英単語` | 単語・語彙 | DUO 3.0(450) 充実 / 中学・高校はガラ空き |
| `英文法` | 文法 | Evergreen(240) 充実 / 中学・高校はガラ空き |
| `リスニング` | 聴解 | **0問（未着手）** |
| `発音` | 発音 | 0問 |
| `読解` | 長文・読解 | 0問 |
| `チェック` | 習熟チェック | 0問 |
| `英検` | 英検対策（級別） | **今回新設** |
| `TOEIC` | TOEIC対策（スキル別） | **今回新設** |

※未知のカテゴリでも表示はされる（デフォルトアイコン）。新カテゴリを足すなら `app/test/page.tsx` の `CATEGORY_STYLE` にも追記すると見栄えが揃う。

## 6. 今回の拡充ターゲット = 英検・TOEIC 対策の新設【これだけやる】

英語クイズに**資格試験トラックを新設**する。既存の `英単語`/`英文法` とは別に、
**新カテゴリ `英検` と `TOEIC` の2ジャンル**を立てる（`/test` のアイコンは追加済み）。

### ★出題形式（厳守）= 文中空所補充の4択

**全問とも「短文の中の空所(`___`)に、単語または熟語を差し込む」4択（`choice`）形式**で作る。

- ❌ やらない: `"apple の意味は？"` のような **英語⇔日本語の単純な意味当て**。
- ✅ やる: 文脈のある英文に空所を1つ作り、そこに入る語/熟語を4択から選ばせる。
- `question_text`: 英文（空所は半角3つ `___`）＋末尾に `（日本語訳）` を添える。
- `options`: 紛らわしい同レベルの4語/4熟語。品詞は揃える（全部動詞、など）。
- `correct`: 正解番号 1〜4（散らす）。
- `explanation`: 正解の語義＋なぜ文脈に合うか＋他3つの語義を一言ずつ。

例（単語）:
```jsonc
{ "chapter": "TOEIC 単語 ①",
  "question_text": "Please ___ the report to me by Friday.（金曜までに報告書を提出してください）",
  "options": ["submit", "subtract", "subscribe", "substitute"], "correct": 1,
  "explanation": "submit=提出する。subtract=引く、subscribe=購読する、substitute=代用する。" }
```
例（熟語）:
```jsonc
{ "chapter": "英検準2級 熟語 ①",
  "question_text": "We had to ___ the meeting because of the typhoon.（台風のため会議を延期した）",
  "options": ["put off", "put on", "put up", "put out"], "correct": 1,
  "explanation": "put off=延期する。put on=着る、put up=掲げる/泊める、put out=消す。" }
```

### 今回作る3ファイル（この順・各100問）

| 順 | ファイル | category | book_name | レベル/内容 |
|---|---|---|---|---|
| 1 | `toeic-vocab-500.json` | `TOEIC` | `TOEIC 頻出単語（〜500）` | TOEICスコア〜500相当の基礎ビジネス語彙・熟語。100問 |
| 2 | `eiken-pre2-vocab.json` | `英検` | `英検準2級 単語` | 英検準2級相当の単語・熟語。100問 |
| 3 | `eiken-2-vocab.json` | `英検` | `英検2級 単語` | 英検2級相当の単語・熟語。100問 |

- 各100問 = **10 chapter × 10問**。chapter は通し番号で（例「①」「②」…「⑩」）、必要なら熟語回を混ぜる（例「⑧ 熟語①」）。
- TOEICはビジネス文脈（オフィス/会議/出張/経理/顧客対応 など）。固有名詞は架空でOK（Mr. Tanaka, ABC Corp.）。
- 英検は日常〜社会的話題の短文。級レベルに語彙の難度を合わせる（準2級＜2級）。
- レベル目安: 〜500/準2級は中学〜高校基礎の語彙、2級は高校卒業レベルの抽象語も可。

## 7. 作業単位（マドハンドの1バッチ）

- **1バッチ = 1ファイル（= 1 book_name、10 chapter × 10問 = 100問）**。
- ファイル名は上表のとおり。
- 完成したら投入は人間（or 検証担当）が `node scripts/seed-questions.mjs content/<file>.json --replace` で行う。**マドハンドは JSON 生成まで**。
- 1バッチ作るごとに止めて、人間が中身を確認 → 投入 → 次バッチ、の順で進める。

## 8. 次トラック（整理済み・生成待ち）

- **中学英文法の本格拡充**（現状8問のプレースホルダ → 約300問へ）。
  Evineドリルの章立てを骨格にした作問プラン = `content/_CHUGAKU_BUNPO_PLAN.md`。
  全30章（Pre＋Lesson01〜29）の文法項目・出題アングル・3ファイル分割まで整理済み。Goが出たらマドハンドが着手可能。

---
最終更新: 2026-06-24
