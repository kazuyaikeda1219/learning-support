// ============================================================
// 問題バンク投入スクリプト（大中小: category / book_name / chapter）
//
// 使い方:
//   node scripts/seed-questions.mjs content/<file>.json            … 追記投入
//   node scripts/seed-questions.mjs content/<file>.json --replace  … 同じ教材(book_name)の既存問題を消してから投入（再実行向き）
//
// .env.local の NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を使う
// （RLS無効運用なので anon キーで insert/delete 可）。
//
// JSON の形式（content/_TEMPLATE.json 参照）:
//   {
//     "category": "文法",          // 大項目（ジャンル）
//     "book_name": "中学英文法",    // 中項目（教材）
//     "questions": [
//       { "chapter": "中1 - be動詞", "question_text": "...",
//         "options": ["am","is","are","be"], "correct": 1, "explanation": "..." },
//       { "chapter": "中1 - be動詞", "q_type": "text",
//         "question_text": "...", "correct_text": "am", "explanation": "..." }
//     ]
//   }
// ============================================================
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// ── .env.local を素朴にパース ─────────────────────────────
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

if (!url || !key) {
  console.error('✗ .env.local に NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が必要です');
  process.exit(1);
}

const file = process.argv[2];
const replace = process.argv.includes('--replace');
if (!file) {
  console.error('使い方: node scripts/seed-questions.mjs content/<file>.json [--replace]');
  process.exit(1);
}

const doc = JSON.parse(readFileSync(file, 'utf8'));
const { category, book_name, questions } = doc;
// 学習内容(subject): 'en'=英語 / 'ja'=日本語(外国人向け)。未指定は英語(en)。
const subject = doc.subject === 'ja' ? 'ja' : 'en';
if (!category || !book_name || !Array.isArray(questions)) {
  console.error('✗ JSON に category / book_name / questions(配列) が必要です');
  process.exit(1);
}

const rows = questions.map((q, i) => {
  const opts = q.options || [];
  const qType = q.q_type || 'choice';
  if (qType === 'choice') {
    if (opts.length !== 4) throw new Error(`Q${i + 1}: choice は options を4つ必要（chapter=${q.chapter}）`);
    if (!(q.correct >= 1 && q.correct <= 4)) throw new Error(`Q${i + 1}: correct は1〜4（chapter=${q.chapter}）`);
  } else if (qType === 'text') {
    if (!q.correct_text) throw new Error(`Q${i + 1}: text は correct_text 必須（chapter=${q.chapter}）`);
  }
  return {
    subject,
    category,
    book_name,
    chapter: q.chapter || '一般',
    question_text: q.question_text,
    option_1: opts[0] ?? null,
    option_2: opts[1] ?? null,
    option_3: opts[2] ?? null,
    option_4: opts[3] ?? null,
    correct_option: qType === 'choice' ? q.correct : null,
    q_type: qType,
    correct_text: qType === 'text' ? q.correct_text : null,
    explanation: q.explanation || null,
    // ── 旧スターター由来の legacy 列（choice_*/correct_choice/grade_level）は
    //    まだ NOT NULL 制約が残っており、未充填だと anon insert が失敗する。
    //    アプリは option_*/correct_option しか読まないが、insert を通すため新列をミラーする。
    //    （DDL で legacy 列を drop できれば不要。migrate_questions_schema.sql 末尾の任意手順参照）
    choice_1: opts[0] ?? '',
    choice_2: opts[1] ?? '',
    choice_3: opts[2] ?? '',
    choice_4: opts[3] ?? '',
    correct_choice: qType === 'choice' ? q.correct : 1,
    grade_level: q.chapter || '一般',
  };
});

const supabase = createClient(url, key, { auth: { persistSession: false } });

if (replace) {
  const { error } = await supabase.from('questions').delete().eq('subject', subject).eq('book_name', book_name);
  if (error) { console.error('✗ 既存削除に失敗:', error.message); process.exit(1); }
  console.log(`🗑  「${book_name}」(${subject}) の既存問題を削除しました`);
}

// 100件ずつ投入
let inserted = 0;
for (let i = 0; i < rows.length; i += 100) {
  const chunk = rows.slice(i, i + 100);
  const { error } = await supabase.from('questions').insert(chunk);
  if (error) { console.error('✗ 投入に失敗:', error.message); process.exit(1); }
  inserted += chunk.length;
}

// 章ごとの集計
const byChapter = {};
for (const r of rows) byChapter[r.chapter] = (byChapter[r.chapter] || 0) + 1;
console.log(`✓ [${subject}] ${category} / ${book_name} に ${inserted} 問を投入`);
for (const [chap, n] of Object.entries(byChapter)) console.log(`   ・${chap}: ${n}問`);
