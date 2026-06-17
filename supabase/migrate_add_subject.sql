-- ============================================================
-- Learning Support — Phase 1: 学習内容(subject) 列の追加
-- Supabase SQL Editor にこの全文を貼って実行する（1回だけ・冪等）。
--
-- 方針:
--   - 1システムのまま「学習内容」を 1 列で表現する（システム分割はしない）。
--   - subject = 'en'（英語） | 'ja'（日本語＝外国人向け日本語学習）。
--   - default 'en' にすることで、既存の利用者・問題はすべて英語側に入り
--     既存挙動はそのまま維持される（後方互換）。
-- ============================================================

-- ── profiles: 利用者ごとの学習内容（登録時に決定）──────────────
alter table public.profiles  add column if not exists subject text not null default 'en';

-- ── questions: 問題ごとの学習内容（テスト一覧/クイズの出し分けに使用）──
alter table public.questions add column if not exists subject text not null default 'en';

-- 値域チェック（'en' / 'ja' のみ。再実行できるよう一度落としてから付ける）
alter table public.profiles  drop constraint if exists profiles_subject_check;
alter table public.profiles  add  constraint profiles_subject_check  check (subject in ('en','ja'));
alter table public.questions drop constraint if exists questions_subject_check;
alter table public.questions add  constraint questions_subject_check check (subject in ('en','ja'));

-- 一覧フィルタ用のインデックス
create index if not exists questions_subject_idx on public.questions (subject);

-- ── PostgREST スキーマキャッシュ再読込 ──────────────────────────
notify pgrst, 'reload schema';
