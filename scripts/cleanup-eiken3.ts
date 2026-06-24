import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  try {
    console.log("🗑️  古い「英検3級」データを削除中...");

    // 「英検3級」というbook_nameのすべてのレコードを削除
    const { count, error } = await supabase
      .from("questions")
      .delete()
      .eq("book_name", "英検3級");

    if (error) {
      console.error("❌ エラー:", error);
      process.exit(1);
    }

    console.log(`✅ ${count}件削除完了`);
  } catch (err) {
    console.error("❌ 予期しないエラー:", err);
    process.exit(1);
  }
}

cleanup();
