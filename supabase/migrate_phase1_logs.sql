-- ============================================================
-- Phase 1: ログ活用の基盤
--   1) profiles に週目標(分) を追加（生徒が自分で設定）
--   2) quiz_answers（クイズの問題単位ログ）を新規作成
-- 既存の Supabase プロジェクトの SQL Editor にこの全文を貼って実行する。
-- 既存データ・既存テーブルには破壊的変更を加えない（追加のみ）。
-- ============================================================

-- ── 1. 週目標（分）。未設定は 150 分（≒ 週2.5時間）を既定値とする ──
alter table public.profiles
  add column if not exists weekly_goal_minutes integer not null default 150;

-- ── 2. quiz_answers（クイズの1問ごとの解答ログ）─────────────────
--   quiz_results（合計点）は従来どおり残し、それに紐づく明細をここに保存する。
--   question_id を残すので「chapter単位」「問題単位」どちらの弱点分析にも使える。
create table if not exists public.quiz_answers (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  quiz_result_id  uuid references public.quiz_results(id) on delete cascade,
  question_id     uuid references public.questions(id) on delete set null,
  category        text,
  chapter         text,
  selected_option integer,   -- 4択のとき選んだ番号（1-4）。記述式は null
  answer_text     text,      -- 記述式のとき入力した文字列。4択は null
  is_correct      boolean not null default false,
  answered_at     timestamptz not null default now()
);
create index if not exists quiz_answers_user_idx     on public.quiz_answers (user_id);
create index if not exists quiz_answers_question_idx on public.quiz_answers (question_id);
create index if not exists quiz_answers_category_idx on public.quiz_answers (user_id, category, chapter);

-- 認証なし運用方針に合わせ RLS は無効（schema.sql と同じ前提）
alter table public.quiz_answers disable row level security;

-- PostgREST のスキーマキャッシュ再読込
notify pgrst, 'reload schema';
