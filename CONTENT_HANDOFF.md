# Learning Support — コンテンツ作り込み 引き継ぎ

> 別セッションでこのファイルを最初に読めば、続きから「問題・教材・文言」の作り込みを始められます。
> （アプリの土台＝認証なし化・DB・全フローはローカル検証済みで完成しています。）

---

## ★更新（2026-06-17）再設計に着手 — 学習内容(subject)で出し分け

方針確定: **システムは分割せず1つのまま**、`subject`（`'en'`=英語 / `'ja'`=日本語＝外国人向け日本語学習）という1次元で出し分ける。違いはコードでなく**データ（問題・教材・項目）だけ**。段階リリース計画（Phase 1〜4）の全体像と理由は、本人と合意済み。

### ✅ Phase 1 完了（subject 基盤・2026-06-17 適用＆検証済み）
- マイグレーション `supabase/migrate_add_subject.sql` 適用済み: `profiles.subject` / `questions.subject`（default `'en'`、CHECK `in ('en','ja')`、`questions_subject_idx`）。既存4利用者・20問はすべて `en`。
- 共通定数 `utils/subject.ts`（`Subject` 型・`SUBJECTS`・`SUBJECT_LABEL`・`normalizeSubject`・科目別の学習ログ候補 `STUDY_CATEGORIES`）。
- `utils/currentUser.ts`: `CurrentUser` に `subject` を追加（旧localStorageは `en` に自動丸め）。
- `app/login`: ログイン時に subject を取得して保存。
- `app/admin`: 生徒登録に「学習内容」セレクト、問題編集に学習内容セレクト、問題一覧に学習内容フィルタ。
- `app/test` `app/test/quiz`: ログイン中の subject で問題を自動フィルタ。`app/dashboard`: 学習ログの教材候補を科目別に。
- 検証: en利用者→単語/文法ツリー表示、ja利用者→空状態、CHECK制約が不正値を拒否、tsc/コンソールともにエラー無し。
- ⚠️ 未対応（Phase 1範囲外・今後）: `/admin/students/[id]` での subject 変更UI（登録時に決定する仕様）。

### ✅ 実コンテンツ投入済み（テスト用データ・2026-06-17）
- ソース: `/Users/kazuya_ikeda/Downloads/04_開発/テスト用データ/{英語学習,日本語学習}/*.csv`（共通形式: `question_text,choice_1..4,correct_choice,category,grade_level,explanation`）。
- 取り込みスクリプト `scripts/import-test-data.mjs`（再実行可。`--replace` で対象 book_name×subject の既存を消して入れ直す。anonキー）。
  - 割り当て: 英語学習→`en`/Evergreen→`総合英語Evergreen`、日本語学習→`ja`/genki1→`Genki I`・genki2→`Genki II`、`category` grammar→`文法`、`chapter`=grade_level。
- 投入結果: en「総合英語Evergreen」240問(24章) ＋ 既存サンプル20問、ja「Genki I」120問(12章)・「Genki II」110問(11章)。DB総計490問。`/test`・クイズ出題ともブラウザ検証済み。
- ⚠️ 旧スターターの遺物カラム `choice_1..4 / correct_choice / grade_level` に **NOT NULL 制約が残存**しており、新カラムだけの insert は弾かれる。import スクリプトは旧カラムにも同値を入れて回避している。将来 `migrate_questions_schema.sql` 末尾の drop 文で旧カラムを削除すれば回避コードは不要になる（任意・要SQL Editor）。
- `scripts/seed-questions.mjs` も subject 対応済み（JSON先頭に `"subject":"ja"`、未指定はen）。

### ⚠️ ja トラック実コンテンツ: 投入済み（上記）。さらに追加する場合は管理画面 or import/seed スクリプトで。

### ✅ ja 動作確認用アカウント作成済み（2026-06-17）
- `profiles` に **`display_name='テストEN'` / `subject='ja'` / `password_hash=null`**（id `8b4cb069-2627-44a4-9a94-fed39f1181aa`）を追加。日本語学習者の見え方確認用。
- 検証: ログイン後 → ダッシュボードの学習ログ「教材」が ja カテゴリ（漢字/語彙/文法/JLPT N5〜N1…）に切替、`/test` は文法→Genki I/II・全230問のみ表示（英語コンテンツ非表示）、Genki I 第10課クイズが日本語で正常出題。コンソールエラー無し。
- ⚠️ 名前が「テストEN」だが中身は ja。紛らわしければ管理画面で改名可。
- ✅ `/test` の章並び（旧: 文字列ソートで「第10課→…第1課」）を**数値順に修正済み（2026-06-17）**。`app/test/page.tsx` に `naturalSort`（`localeCompare(.., 'ja', {numeric:true})`）を追加し、教材順(book)・章順(chapter)の両方に適用。ja(Genki I/II)で 第1課→…→第23課 の連続表示を検証済み。

### ✅ Phase 2 完了（テスト細分化・種別タブ・2026-06-17 検証済み）
- スコープ確定（本人合意）: **種別=出題形式**（`q_type`）の絞り込みタブを追加。**単元(unit)は入れない**（教材→章のまま）。並べ替え(reorder)は見送り。→ **マイグレーション不要**（既存 `q_type` を活用、フロントのみ）。
- `app/test/page.tsx`: 生データ＋`q_type`を取得し、`useMemo`で種別フィルタ後のツリーを生成。ヘッダーに種別タブ（すべて / 4択 / 記述 …）。その科目に**実在する種別が2種類以上のときだけ表示**（`TYPE_LABEL`/`TYPE_ORDER`、未知種別はそのままラベル表示）。種別選択時はクイズリンクに `&qtype=` を付与。
- `app/test/quiz/page.tsx`: `qtype` クエリを読み、あれば `.eq('q_type', qtype)` で出題を絞る（useEffect deps にも追加）。
- 検証: 一時的に ja へ記述問題を1問入れ、種別タブ すべて/4択/記述 表示 → 「記述」で該当章のみ(&qtype=text) に絞り込み → 記述式UIが出題、を確認後その問題を削除。tsc/コンソールともにエラー無し。現状の実データは全て4択なので、記述問題を入れるまで種別タブは自動的に出ない（=すべて/4択の1種のみ）。

### ✅ ja 問題文を英訳化（giveaway修正・2026-06-17 検証済み）
- 問題: ja(Genki I/II)の `question_text` が「『彼は先生です。』を表す正しい日本語表現はどれか。」のように**正解の日本語文をそのまま埋め込んでいて答えがバレていた**（問題文＝4択の正解と一致）。
- 対応: ja全230問（Genki I 120 + Genki II 110）の **`question_text` のみ英語に差し替え**（例 `Which is the correct Japanese for "He is a teacher."?`）。選択肢・正解番号・解説（日本語）はそのまま。文法注記も英訳（`(present affirmative form of an i-adjective)` 等）。**enトラックは対象外**（日本人向けで問題文が日本語なのは正しく、答えとも一致しないため）。
- 反映: DB `questions`(subject=ja) を **ID据え置きでUPDATE**（subject+book_name+chapter+旧question_text でマッチ。quiz_results等に影響なし）＋ ソースCSV 23ファイル(`テスト用データ/日本語学習/`)も同期書き換え。
- 新規スクリプト: `scripts/ja-question-en.mjs`（英訳マップ＝ファイル基底名→10問の配列）, `scripts/apply-ja-question-en.mjs`（CSV＋DB反映、`--dry`で確認可・再実行安全＝oldText一致のみ更新）。
- 検証: 日本語文字が残る問題文 0件 / 答え埋め込み 0件 / DB230問・CSV23ファイル更新成功 / CSV列構成(9列)健全。
- ℹ️ ja問題を追加・再投入する際は、新しい問題文も英語で書くこと（CSV→`import-test-data.mjs`、または管理画面）。

### 残りフェーズ（未着手）
- **Phase 3**: ライブラリのDB化（`materials` テーブル）＋スライド／フラッシュカード（`flashcard_decks`/`flashcards`）自主学習UI。
- **Phase 4**: ロードマップのDB化・科目別（`ROADMAP_DATA` → `roadmap_items` テーブル）。
- ℹ️ 日本語(ja)トラックの実コンテンツは Genki I/II を投入済み（下記「実コンテンツ投入済み」参照）。追加は管理画面 or import/seed スクリプトで（`subject='ja'`）。

---

## ★更新（2026-06-16）クイズを「大中小・DB駆動」に作り替え

方針確定: **大=ジャンル(category) / 中=教材(book_name) / 小=章(chapter)** の3階層。
テスト一覧は **DB駆動**（`questions` を読んで大中小ツリーを自動生成）に変更。
ハードコードの `TEST_CATEGORIES` / `resolveQuizMeta` は**廃止済み**。
→ 管理画面で問題を足す or seedスクリプトで投入するだけで、テスト一覧に自動で出る。

✅ **【適用済み 2026-06-17】questions スキーマ修正マイグレーション**:
- `supabase/migrate_questions_schema.sql` を Supabase SQL Editor で実行済み。`questions` に新列（`option_1..4 / correct_option / book_name / chapter / q_type / correct_text`）追加・旧→新バックフィル・既存20問を大中小に整理・`quiz_results.book_name` 追加 すべて完了。REST で検証済み（20問が 単語/文法 → 教材 → 章 に整理されている）。
- ⚠️ 適用時のハマりどころ（再実行時の参考）: ①旧スターターの `category` に CHECK 制約（`questions_category_check`＝`vocabulary`/`grammar` 固定）が残っており category 更新で弾かれた → ファイル内で `drop constraint if exists` を追加済み。②SQL Editor は全文を1トランザクションで実行するため、途中で失敗すると add column ごとロールバックされる（順序: カラム追加→バックフィル→制約削除→category更新）。

コンテンツ投入パイプライン（マイグレーション適用後に使える）:
- 問題は `content/<教材>.json` に記述（形式は `content/_TEMPLATE.json`）。
- 投入: `node scripts/seed-questions.mjs content/<教材>.json [--replace]`（`--replace` は同じ book_name の既存を消して入れ直す＝再実行向き。RLS無効なので anon キーでinsert/delete）。
- サンプル済み: `content/chugaku-bunpo-tangenbetsu.json`（中学英文法・単元別14問）。
- 方針: 教材の電子データはそのまま使わず、**参考にした類似のオリジナル問題**を章・単元に合わせて作る。

変更ファイル: `app/test/page.tsx`（DB駆動ツリー）, `app/test/quiz/page.tsx`（?category=&book=&chapter= で出題）, `app/mypage/page.tsx`（受験履歴に教材表示）, `supabase/migrate_questions_schema.sql`, `scripts/seed-questions.mjs`, `content/`。

---

## 0. このアプリは何か

- **Learning Support** = 英語学習ポータル。`/Users/kazuya_ikeda/learning-support`（Next.js 14, app router, Supabase, Tailwind）。
- TEP英語学習アプリ（`/Users/kazuya_ikeda/english-learning-app`, port 3100）のクローンだが、**認証を撤廃**し「**登録した利用者を一覧から選んで入る**」方式に作り替えた**別アプリ**。中身（問題・教材・文言）はこれから独自に作り込む。
- ⚠️ TEPと混同しない。TEPは Googleログイン＋ホワイトリスト。こちらは認証なし。

## 1. 起動方法

- VS Code等の launch.json: **`learning-support-dev`**（port **3200**）。
- またはCLI: `npm run dev --prefix /Users/kazuya_ikeda/learning-support -- --port 3200`
- URL: http://localhost:3200
- 管理画面: http://localhost:3200/admin → 合い言葉 **`learning2026`**（env `NEXT_PUBLIC_ADMIN_PASSCODE`）

## 2. Supabase

- プロジェクト: `ayzsyynvpiqlnqokycnb`（URL/anon は `.env.local` に設定済み・**完全分離**。TEPとは別DB）。
- **認証なし運用 → RLS無効**。anonキーで全操作。`service_role` キーは不要。
- テーブル（適用済み・全フロー動作確認済み）:
  - `profiles` … 登録済み利用者の名簿。id=自前uuid。列: id/display_name/student_id/role/current_level/username/avatar_url/start_date/created_at/updated_at/grade_level
  - `student_profiles` … オンボーディングのアンケート回答（id=profiles.id）
  - `questions` … 問題バンク（後述）
  - `study_logs` / `roadmap_progress` / `quiz_results` … 個人別データ（user_id=profiles.id）
- スキーマ群: `supabase/schema.sql`, `supabase/migrate_profiles.sql`, `supabase/migrate_drop_profiles_fk.sql`（**適用済み。再実行不要**）。
- ⚠️ 既知の落とし穴（解消済み・再発時の参考）: このプロジェクトには元々「認証ありスターターの profiles（auth.usersへのFK付き）」が残っていた。`migrate_drop_profiles_fk.sql` でFK削除済み。新テーブル追加後にAPIが404(PGRST205)なら SQL末尾に `notify pgrst, 'reload schema';`。

## 3. 認証なしの仕組み（コンテンツ改修時に壊さない用）

- 現在の利用者は `utils/currentUser.ts` の `getCurrentUser()`（localStorage `ls_current_user` = {id,name}）。
- **個人別データのクエリには必ず `.eq('user_id', cu.id)` を付ける**（RLSが無いので付け忘れると他人のデータが混ざる）。
- 管理画面ガード: `utils/useRequireAdmin.ts`（localStorage `ls_admin_ok`）＋ パスコード。
- `supabase.auth.*` はもう使わない（全廃済み）。

---

## 4. 「中身」がどこにあるか（作り込みの地図）

### 4-1. 問題（クイズ）★最重要
- **データ本体は DB `questions` テーブル**。列: `category, chapter, question_text, option_1〜4, correct_option(1-4), q_type('choice'|'text'), correct_text, explanation`。
- ✅ **解説表示（2026-06-17）**: `app/test/quiz/page.tsx` で回答確定後（`isAnswered`）に `explanation` を💡解説パネルで表示（4択・記述の両形式共通、Nextボタンの上）。`explanation` が空の問題ではパネル非表示。改行は `whitespace-pre-line` で反映。→ 問題ごとの解説の質を上げたい場合は `questions.explanation` を編集（管理画面 or CSV/import）。
- ✅ **ja クイズのふりがな＋ローマ字（2026-06-17）**: ja(日本語学習)利用者のとき、**選択肢と解説**の漢字に `<ruby>` ふりがな、下に小さいローマ字を表示（`components/JaText.tsx`）。en は対象外（原文表示）。
  - 読みは**事前生成してJSON保存**: `node scripts/gen-ja-readings.mjs` が subject=ja の questions から選択肢/解説の一意な日本語を集め、kuroshiro で furigana(HTML)＋romaji を生成し `public/ja-readings.json`（テキスト→{furigana,romaji}）に出力。**フロントは日本語テキスト一致で参照**（問題ID変更・再importに強い）。
  - ⚠️ **ja問題を追加/変更したら `gen-ja-readings.mjs` を再実行**（未生成のテキストはふりがな無しの原文表示にフォールバック）。devDependency: `kuroshiro` / `kuroshiro-analyzer-kuromoji`。
  - XSS対策: furigana は生成時に `<ruby>/<rt>/<rp>` のみ許可しそれ以外をHTMLエスケープ済み（`JaText` の `dangerouslySetInnerHTML` は安全）。
  - 検証: Genki I 第1課で選択肢「医者→いしゃ / anata wa isha desu ka.」、解説も漢字ふりがな＋ローマ字表示。tsc・コンソールOK。
- **登録UI**: 管理画面 `/admin` → 「問題管理」タブ。1問ずつ追加/編集/削除できる（`app/admin/page.tsx` の `QuestionsTab`）。大量投入はDB直insert/CSVでも可。
- **クイズの選び方の仕組み**（ここが要）:
  - クイズ一覧 = `app/test/page.tsx` の `TEST_CATEGORIES`（レベルチェック/単語/文法/プログレスチェック。各テストに `id`）。
  - 各テスト `id` → `category`+`chapter` への対応 = `app/test/quiz/page.tsx` の `resolveQuizMeta()`。
  - クイズ画面は `questions` を `category` と `chapter` で絞って出題する。
  - **新しいテストを足す手順** = ①`TEST_CATEGORIES`に項目追加 → ②`resolveQuizMeta`にid→category/chapter追加 → ③その category/chapter で `questions` を登録。
  - 現状の対応例: `vocab-basic`→(LevelCheck/Vocab-intro), `duo-s1`→(VocabCheck/Duo-s1), `evine-c1`→(GrammarCheck/Evine-c1), `progress-N`→(ProgressCheck/Progress-N) など。

### 4-2. ロードマップ（習得チェックリスト）
- **ハードコード**: `app/roadmap/page.tsx` の `ROADMAP_DATA`（pronunciation p1〜47, grammar_evine g1〜, …。各itemは {id, detail, category}）。
- 進捗は `roadmap_progress`(user_id, item_key=itemのid, is_completed) に保存。
- ⚠️ **総項目数は `app/dashboard/page.tsx:27` の `TOTAL_ROADMAP_ITEMS = 145` にハードコード**。item数を変えたらここも更新。
- マイページのセクション別進捗計算: `app/mypage/page.tsx:28` の `SECTION_ID_PREFIXES`（idのプレフィックスでセクション判定）。item追加時はここも整合を取る。

### 4-3. 教材（ライブラリ）
- **現状＝「準備中」表示（2026-06-17）**: ダミー（`Sample Video 1〜6`）を公開してしまっていたため撤去し、`app/library/page.tsx` を「準備中です」の空状態カードのみに差し替え済み（検索/カテゴリフィルタ/ダミー配列はすべて削除）。日本語UIに統一・subject非依存。
- 実コンテンツ投入時の方針: 実教材URLに差し替えるか、Phase 3 で `materials` テーブル化（管理画面から追加）するか。後者が本命。差し替え前の旧ダミー実装は git 履歴に残る。

### 4-4. 文言・コピー
- トップLP: `app/page.tsx`（"Master English with Learning Support." 等）。
- オンボーディング設問: `app/onboarding/page.tsx` の `STEPS`（survey id `goal_after_tep` は**DB列キーなので変えない**。表示ラベルのみ変更可。現在「プログラム終了後（6ヶ月後）の目標」）。
- ナビ/各見出し: `components/Navbar.tsx`, 各ページ。ブランドは "Learning Support" に統一済み。
- ✅ **ナビ整理済み（2026-06-17）**: 上(PC `Navbar`)・下(スマホ `BottomNav`)の主要メニューを **`components/navItems.ts` の `PRIMARY_NAV` に一元化**（ホーム/テスト/単語/ロードマップ/ライブラリ/マイページ）。ここを編集すれば上下両方に反映。アクティブ判定は `isNavActive`（`/test/quiz` 等の子ページは親タブを点灯）。PC上バーは主要ナビを中央に並べ、右側にAdmin＋利用者アバター＋ログアウト。スマホは下バー6タブ＋**ログアウト/管理画面はマイページの「アカウント」欄に集約**（`md:hidden`、PCは上バー側に集約）。ライブラリは準備中だがナビには表示する方針。検証: PC/スマホ両幅・tsc・コンソールOK。

---

## 5. これからやること（コンテンツ作り込みのTODO）

優先度や具体内容は本人の意向に合わせて決める。たたき台:
1. **問題の投入**: どの教材/章をクイズ化するか決め、`questions` に実問題を入れる（管理画面の問題管理タブ）。必要なら `TEST_CATEGORIES`/`resolveQuizMeta` にテスト枠を追加。
2. **ロードマップの中身**: `ROADMAP_DATA` を本アプリ用の学習項目に再編。総数を変えたら `TOTAL_ROADMAP_ITEMS` と `SECTION_ID_PREFIXES` を更新。
3. **教材ライブラリ**: `INITIAL_VIDEOS` をダミーから実教材へ。点数が多い/管理したいなら `materials` テーブル化を検討。
4. **文言**: LP・オンボーディング・各画面のコピーをLearning Support向けに調整。

## 6. 残タスク（コンテンツ外）

- ✅ **【適用済み 2026-06-17確認】パスワードログインのDBマイグレーション**: `profiles.password_hash` 列は実DBに存在済み（REST検証）。`supabase/migrate_add_password.sql` は適用不要。
- 🚫 **【運用ルール】git push / 本番デプロイは本人が明示的に指示するまで行わない**。コミットは作ってよいが、`git push`・`netlify deploy --prod` は本人の「pushして」等の指示を待つこと（`main` への push は自動で本番反映されるため）。
- ✅ **【完了 2026-06-17】GitHub + Netlify デプロイ（Vercelではなく Netlify を採用）**:
  - GitHub: `https://github.com/kazuyaikeda1219/learning-support`（**public**）。
  - Netlify: team `k-ikeda0031` の project `learning-support` → 本番 `https://learning-support.netlify.app`（site_id `bb67b0b9-fb86-4349-ac31-e1299500f5cc`）。`@netlify/plugin-nextjs` でNext.js SSRビルド。
  - **CI/CD有効**: `main` に push すると自動ビルド＆本番反映（deploy key＋webhook 設定済み。`netlify.toml`: build `npm run build` / publish `.next`）。env 3つ（`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`/`NEXT_PUBLIC_ADMIN_PASSCODE`）は Netlify サイトに設定済み。
  - ⚠️ public 化の経緯: 無料プランで private リポの自動ビルドが "Unrecognized Git contributor" でブロックされ、Netlifyアカウント(k.ikeda0031)に GitHub(kazuyaikeda1219)を連携できなかった（その GitHub は別Netlifyアカウントに連携済み）ため public 化で回避。anon鍵/passcodeは元々 `NEXT_PUBLIC_*` で client 配信済み・`.env.local` は未コミットのため新規漏洩なし。
  - このリポの git author は repo-local 設定で `kazuyaikeda1219 <…@users.noreply.github.com>`（グローバル設定は変更していない）。
  - 手動デプロイしたい場合: `netlify deploy --build --prod`（`~/.local/bin/netlify`）。

## 6-1. ログイン仕様（パスワード方式・2026-06-16 追加）

- トップ(`app/page.tsx`)は画像を撤去し「今日の学習を始める」＋ログインへのボタンのみのシンプル構成。
- 入口(`app/login/page.tsx`)は **①利用者を一覧から選ぶ → ②パスワード入力** の2段階。
- パスワードは平文保存せず **SHA-256(hex)** を `profiles.password_hash` に保存（`utils/password.ts` の `hashPassword`/`verifyPassword`）。⚠️ anonキーで読める前提なので簡易ロック。
- **初期設定**: 管理画面 `/admin`→生徒管理の登録フォームに「初期パスワード（任意）」欄。`StudentsTab.addStudent` でハッシュ化して insert。
- **本人による変更**: マイページ `/mypage` のプロフィール編集モーダルに「パスワード変更（任意）」欄（新規＋確認）。4文字以上・一致チェックあり。
- **管理者によるリセット**: `/admin/students/[id]` のヘッダーに「パスワードを設定/リセット」欄。
- **後方互換**: `password_hash` が null の既存利用者はパスワードなしでログイン可能（`verifyPassword` が null→true）。

---

## 7. 検証のしかた（このリポの作法）

- preview ツール（`learning-support-dev`）で起動 → 画面操作。利用者選択ボタンは React 合成イベントが効かない場合があるので、検証時は DOM の `.click()`/value setter 経由が確実。
- DBの実データ確認は anon キーで REST 直叩き（`.env.local` 参照）。個人データは `?user_id=eq.<profiles.id>` で絞る。
- 型チェック: `npx tsc --noEmit`。
