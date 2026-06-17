-- ============================================================
-- Learning Support — Supabase schema （認証なし運用版）
-- 新規 Supabase プロジェクトの SQL Editor にこの全文を貼って実行する。
--
-- 設計方針:
--  - ログイン認証は使わない。利用者は入口で profiles 一覧から自分を選ぶ。
--  - profiles が「登録済み利用者の名簿」。id は自前の uuid（auth.users を参照しない）。
--  - 個人別データは user_id = profiles.id で紐づく。
--  - JWT が無いため RLS は使わず無効化（anon キー＋管理画面パスコードで運用）。
--    ⚠️ anon キーを知る人は全データを読み書きできる。社内/限定配布前提で運用すること。
-- ============================================================

create extension if not exists pgcrypto;

-- ── 1. profiles（登録済み利用者の名簿。管理画面から登録）──────────────
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  username      text,
  display_name  text,
  avatar_url    text,
  current_level text default 'Beginner',
  role          text not null default 'student',   -- 表示用ラベル（管理は別途パスコード）
  student_id    text,                              -- 任意の生徒ID（CSVのC列）
  start_date    date,                              -- 任意の開始日（CSVのE列）
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── 2. student_profiles（オンボーディングのアンケート。id = profiles.id）──
create table if not exists public.student_profiles (
  id                          uuid primary key references public.profiles(id) on delete cascade,
  name                        text,
  furigana                    text,
  certifications              text,
  learning_type               text[] default '{}',
  daily_study_time            text,
  learning_history            text,
  learning_purpose            text,
  goal_after_tep              text,   -- 列名はコード(survey id)互換のため維持
  struggles                   text,
  self_analysis_pronunciation integer default 0,
  self_analysis_grammar       integer default 0,
  self_analysis_vocabulary    integer default 0,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- ── 3. questions（問題バンク）───────────────────────────────────────
create table if not exists public.questions (
  id             uuid primary key default gen_random_uuid(),
  category       text,
  book_name      text,
  chapter        text,
  question_text  text,
  option_1       text,
  option_2       text,
  option_3       text,
  option_4       text,
  correct_option integer,
  explanation    text,
  q_type         text default 'choice',   -- 'choice' | 'text'
  correct_text   text,
  created_at     timestamptz not null default now()
);

-- ── 4. study_logs（学習ログ）────────────────────────────────────────
create table if not exists public.study_logs (
  id                 bigint generated always as identity primary key,
  user_id            uuid not null references public.profiles(id) on delete cascade,
  study_date         date not null,
  study_time_minutes integer default 0,
  category           text,
  note               text,
  created_at         timestamptz not null default now()
);
create index if not exists study_logs_user_idx on public.study_logs (user_id);

-- ── 5. roadmap_progress（ロードマップ進捗。item毎に1行）──────────────
create table if not exists public.roadmap_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  item_key     text not null,
  is_completed boolean not null default false,
  updated_at   timestamptz not null default now(),
  unique (user_id, item_key)
);
create index if not exists roadmap_progress_user_idx on public.roadmap_progress (user_id);

-- ── 6. quiz_results（クイズ結果履歴）───────────────────────────────
create table if not exists public.quiz_results (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references public.profiles(id) on delete cascade,
  category text,
  chapter  text,
  score    integer,
  total    integer,
  taken_at timestamptz not null default now()
);
create index if not exists quiz_results_user_idx on public.quiz_results (user_id);

-- ============================================================
-- RLS は使わない（明示的に無効化）。anon キーで全操作する前提。
-- ============================================================
alter table public.profiles         disable row level security;
alter table public.student_profiles disable row level security;
alter table public.questions        disable row level security;
alter table public.study_logs       disable row level security;
alter table public.roadmap_progress disable row level security;
alter table public.quiz_results     disable row level security;

-- ============================================================
-- PostgREST のスキーマキャッシュを再読込（テーブルがAPIに反映されない時の対策）
-- ============================================================
notify pgrst, 'reload schema';

-- ============================================================
-- 動作確認用: 最初の利用者を1人登録しておくと入口で選べる
--   insert into public.profiles (display_name, student_id)
--   values ('テスト太郎', 'S001');
-- ============================================================
