import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  // book_name が「英検3級」で始まる全レコードを削除（誤投入の掃除）
  const { data, error } = await supabase
    .from("questions")
    .delete()
    .like("book_name", "英検3級%")
    .select("id");

  if (error) {
    console.error("❌ エラー:", error);
    process.exit(1);
  }

  console.log(`✅ 削除完了: ${data?.length ?? 0}件`);
}

cleanup();
