-- ============================================================
-- Learning Support — Phase 3: フラッシュカード（単語等の自主学習）
-- Supabase SQL Editor にこの全文を貼って実行する（1回だけ・冪等）。
--
-- 構成:
--   flashcard_decks … 教材ごとのデッキ（subject で出し分け）
--   flashcards      … デッキ内のカード（表/裏＋任意の reading/example）
-- 学習者は自分の subject のデッキだけ見える。RLS は他テーブル同様 無効。
-- ============================================================

-- ── デッキ（教材単位）─────────────────────────────────────
create table if not exists public.flashcard_decks (
  id          uuid primary key default gen_random_uuid(),
  subject     text not null default 'en',          -- 'en' | 'ja'
  category    text,                                 -- 例: 単語 / カタカナ / 漢字
  deck_name   text not null,                        -- 教材名（例: カタカナ / Genki I 単語）
  description text,
  sort        integer default 0,
  created_at  timestamptz not null default now()
);
alter table public.flashcard_decks drop constraint if exists flashcard_decks_subject_check;
alter table public.flashcard_decks add  constraint flashcard_decks_subject_check check (subject in ('en','ja'));
create index if not exists flashcard_decks_subject_idx on public.flashcard_decks (subject);

-- ── カード（表/裏）────────────────────────────────────────
create table if not exists public.flashcards (
  id         uuid primary key default gen_random_uuid(),
  deck_id    uuid not null references public.flashcard_decks(id) on delete cascade,
  front      text not null,                         -- 表（語・カタカナ 等）
  back       text not null,                         -- 裏（意味・読み 等）
  reading    text,                                  -- 任意（ふりがな/発音）
  example    text,                                  -- 任意（例文）
  sort_order integer default 0,
  created_at timestamptz not null default now()
);
create index if not exists flashcards_deck_idx on public.flashcards (deck_id);

-- ── RLS 無効（anon 運用）＋ スキーマ再読込 ────────────────────
alter table public.flashcard_decks disable row level security;
alter table public.flashcards      disable row level security;
notify pgrst, 'reload schema';
