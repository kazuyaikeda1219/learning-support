-- ============================================================
-- profiles.id → auth.users への外部キーを削除
-- 既存 profiles は認証ありスターターの名残で id が auth.users(id) を参照しており、
-- 認証なし運用では「auth.users に無い id は登録不可」となり新規登録が 23503 で失敗する。
-- このFKを外して profiles を独立した名簿テーブルにする。
-- SQL Editor に貼って Run。
-- ============================================================

alter table public.profiles drop constraint if exists profiles_id_fkey;

notify pgrst, 'reload schema';
