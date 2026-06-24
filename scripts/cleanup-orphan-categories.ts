import { createClient } from "@supabase/supabase-js";

// 初期セッションの残骸を掃除するスクリプト。
// category が "grammar" / "vocabulary"（英小文字・book_name=null）の行は
// 正規カテゴリ（英検 / 英単語 / 英文法 / TOEIC ...）に属さない誤投入データ。
// /test 画面に「grammar」「vocabulary」という不正な箱として出てしまうため削除する。

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}
const supabase = createClient(supabaseUrl, supabaseKey);

const ORPHAN_CATEGORIES = ["grammar", "vocabulary"];

async function cleanup() {
  const { data, error } = await supabase
    .from("questions")
    .delete()
    .in("category", ORPHAN_CATEGORIES)
    .select("id");

  if (error) {
    console.error("❌ エラー:", error);
    process.exit(1);
  }

  console.log(
    `✅ 孤立カテゴリ削除完了: ${data?.length ?? 0}件（${ORPHAN_CATEGORIES.join(" / ")}）`
  );
}

cleanup();
