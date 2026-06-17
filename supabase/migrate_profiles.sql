-- ============================================================
-- 既存 profiles テーブル補正用マイグレーション
-- このプロジェクトには既に profiles（id / display_name / grade_level / created_at）が
-- 存在していたため、schema.sql の create が効かなかった。
-- Learning Support が必要とする不足カラムだけを追加する（既存データは温存）。
-- SQL Editor に貼って Run。
-- ============================================================

-- 管理画面からの新規登録(insert)で id を自動採番できるように
alter table public.profiles alter column id set default gen_random_uuid();

-- 不足カラムを追加（既存行には default が backfill される）
alter table public.profiles
  add column if not exists username      text,
  add column if not exists avatar_url    text,
  add column if not exists current_level text default 'Beginner',
  add column if not exists role          text not null default 'student',
  add column if not exists student_id    text,
  add column if not exists start_date    date,
  add column if not exists updated_at    timestamptz not null default now();

-- PostgREST のスキーマキャッシュ再読込
notify pgrst, 'reload schema';
