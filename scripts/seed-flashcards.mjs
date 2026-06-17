// ============================================================
// フラッシュカード デッキ投入スクリプト
//
// 使い方:
//   node scripts/seed-flashcards.mjs content/<deck>.json            … 追記
//   node scripts/seed-flashcards.mjs content/<deck>.json --replace  … 同名デッキ(subject+deck_name)を消して入れ直す
//
// JSON 形式:
//   {
//     "subject": "ja",            // 'en' | 'ja'（未指定は en）
//     "category": "カタカナ",      // 任意（一覧の見出し）
//     "deck_name": "カタカナ",     // 教材名（必須）
//     "description": "…",         // 任意
//     "cards": [
//       { "front": "ア", "back": "a" },
//       { "front": "ねこ", "back": "cat", "reading": "ねこ", "example": "かわいいねこ" }
//     ]
//   }
// ============================================================
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* ignore */ }
  return env;
}
const env = loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) { console.error('✗ .env.local に SUPABASE URL / ANON KEY が必要'); process.exit(1); }

const file = process.argv[2];
const replace = process.argv.includes('--replace');
if (!file) { console.error('使い方: node scripts/seed-flashcards.mjs content/<deck>.json [--replace]'); process.exit(1); }

const doc = JSON.parse(readFileSync(file, 'utf8'));
const subject = doc.subject === 'ja' ? 'ja' : 'en';
const { category = null, deck_name, description = null, cards } = doc;
if (!deck_name || !Array.isArray(cards)) { console.error('✗ JSON に deck_name / cards(配列) が必要'); process.exit(1); }

const supabase = createClient(url, key, { auth: { persistSession: false } });

if (replace) {
  const { error } = await supabase.from('flashcard_decks').delete().eq('subject', subject).eq('deck_name', deck_name);
  if (error) { console.error('✗ 既存デッキ削除に失敗:', error.message); process.exit(1); }
  console.log(`🗑  [${subject}] ${deck_name} の既存デッキを削除`);
}

const { data: deck, error: dErr } = await supabase.from('flashcard_decks')
  .insert({ subject, category, deck_name, description })
  .select('id').single();
if (dErr) { console.error('✗ デッキ作成に失敗:', dErr.message); process.exit(1); }

const rows = cards.map((c, i) => ({
  deck_id: deck.id,
  front: c.front, back: c.back,
  reading: c.reading || null, example: c.example || null,
  sort_order: i,
}));
for (let i = 0; i < rows.length; i += 100) {
  const { error } = await supabase.from('flashcards').insert(rows.slice(i, i + 100));
  if (error) { console.error('✗ カード投入に失敗:', error.message); process.exit(1); }
}
console.log(`✓ [${subject}] ${deck_name}（${category || '—'}）に ${rows.length} 枚を投入`);
