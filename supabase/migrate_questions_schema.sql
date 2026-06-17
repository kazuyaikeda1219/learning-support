-- ============================================================
-- Learning Support — questions テーブル スキーマ修正マイグレーション
-- Supabase SQL Editor にこの全文を貼って実行する（1回だけ）。
--
-- 背景:
--   このプロジェクトには以前のスターターが作った「旧スキーマの questions」が
--   残っていた（列: choice_1..4 / correct_choice / grade_level）。
--   schema.sql の `create table if not exists questions` は既存テーブルを
--   スキップするため、アプリが使う新列（option_*/correct_option/book_name/
--   chapter/q_type/correct_text）が追加されないまま動かなかった。
--   → 管理画面の問題追加は失敗、クイズ出題は0件になっていた。
--
-- このマイグレーションで:
--   1) 不足列を追加（add column if not exists なので安全・再実行可）
--   2) 旧 choice_*/correct_choice から新 option_*/correct_option へバックフィル
--   3) 既存20問を「大=ジャンル / 中=教材 / 小=章」の3階層に整理
--   4) quiz_results に book_name（中項目）を追加し受験履歴で教材を表示できるように
-- ============================================================

-- ── 1. questions に不足列を追加 ─────────────────────────────
alter table public.questions add column if not exists book_name      text;
alter table public.questions add column if not exists chapter        text;
alter table public.questions add column if not exists option_1       text;
alter table public.questions add column if not exists option_2       text;
alter table public.questions add column if not exists option_3       text;
alter table public.questions add column if not exists option_4       text;
alter table public.questions add column if not exists correct_option integer;
alter table public.questions add column if not exists q_type         text default 'choice';
alter table public.questions add column if not exists correct_text   text;

-- ── 2. 旧列 → 新列へバックフィル（旧データがある行のみ）──────────
update public.questions set
  option_1       = coalesce(option_1, choice_1),
  option_2       = coalesce(option_2, choice_2),
  option_3       = coalesce(option_3, choice_3),
  option_4       = coalesce(option_4, choice_4),
  correct_option = coalesce(correct_option, correct_choice),
  q_type         = coalesce(q_type, 'choice')
where choice_1 is not null;

-- ── 3-0. 旧 category の CHECK 制約を外す ───────────────────────
--   旧スターターは category を 'vocabulary' / 'grammar' に固定する
--   CHECK 制約を付けていた。新しい日本語ジャンル（単語/文法/…）に
--   更新できるよう、ここで外す（drop constraint if exists で安全・再実行可）。
alter table public.questions drop constraint if exists questions_category_check;

-- ── 3. 既存20問を 大=ジャンル / 中=教材 / 小=章 に整理 ──────────
--   旧 category は 'vocabulary' / 'grammar'、grade_level は 中1〜高1。
update public.questions set
  category  = '単語',
  book_name = case when grade_level like '中%' then '中学英単語' else '高校英単語' end,
  chapter   = grade_level
where category = 'vocabulary';

update public.questions set
  category  = '文法',
  book_name = case when grade_level like '中%' then '中学英文法' else '高校英文法' end,
  chapter   = grade_level
where category = 'grammar';

-- ── 4. quiz_results に book_name（中項目）を追加 ────────────────
alter table public.quiz_results add column if not exists book_name text;

-- ── 5. PostgREST スキーマキャッシュ再読込 ──────────────────────
notify pgrst, 'reload schema';

-- ============================================================
-- 補足: 旧列 choice_1..4 / correct_choice / grade_level はもう
-- アプリでは使わない。データ移行を確認できたら、以下を実行して
-- 削除してもよい（任意・非可逆なので確認後に）:
--
--   alter table public.questions drop column if exists choice_1;
--   alter table public.questions drop column if exists choice_2;
--   alter table public.questions drop column if exists choice_3;
--   alter table public.questions drop column if exists choice_4;
--   alter table public.questions drop column if exists correct_choice;
--   -- grade_level は chapter に移したので削除可（残してもよい）
--   alter table public.questions drop column if exists grade_level;
--   notify pgrst, 'reload schema';
-- ============================================================
