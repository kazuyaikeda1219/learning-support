// ============================================================
// テスト用データ(CSV) 一括取り込みスクリプト
//
// 「04_開発/テスト用データ/英語学習・日本語学習」配下の *.csv を読み、
// questions テーブルへ subject/category/book_name/chapter を割り当てて投入する。
//
// 使い方:
//   node scripts/import-test-data.mjs                 … 追記投入
//   node scripts/import-test-data.mjs --replace       … 対象の教材(book_name×subject)を消してから投入（再実行向き）
//   node scripts/import-test-data.mjs "/path/to/テスト用データ" [--replace]
//
// CSV 形式（全ファイル共通）:
//   question_text, choice_1..4, correct_choice(1-4), category, grade_level, explanation
//
// 割り当て:
//   subject   : フォルダ名「英語学習」→en / 「日本語学習」→ja
//   category  : grammar→文法 / vocabulary→単語 / それ以外はそのまま
//   book_name : Evergreen→「総合英語Evergreen」 / genki1_*→「Genki I」 / genki2_*→「Genki II」
//   chapter   : CSV の grade_level（例「第1章 文の種類」「第1課」）
// ============================================================
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

// ── .env.local パース ─────────────────────────────────────
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

// ── 引数 ──────────────────────────────────────────────────
const args = process.argv.slice(2);
const replace = args.includes('--replace');
const baseDir = args.find(a => !a.startsWith('--')) || '/Users/kazuya_ikeda/Downloads/04_開発/テスト用データ';

// ── RFC4180 風 CSV パーサ（引用符・""エスケープ・改行対応）──
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

function mapCategory(c) {
  const v = (c || '').trim().toLowerCase();
  if (v === 'grammar') return '文法';
  if (v === 'vocabulary' || v === 'vocab') return '単語';
  return c || '未分類';
}

function bookNameFor(subject, fileName) {
  if (subject === 'en') return '総合英語Evergreen';
  if (/genki1/i.test(fileName)) return 'Genki I';
  if (/genki2/i.test(fileName)) return 'Genki II';
  return '日本語教材';
}

const FOLDERS = [
  { dir: '英語学習', subject: 'en' },
  { dir: '日本語学習', subject: 'ja' },
];

// ── 全CSVを行に変換 ───────────────────────────────────────
const allRows = [];
const bookKeys = new Set(); // `${subject}\t${book_name}`
for (const { dir, subject } of FOLDERS) {
  let files;
  try { files = readdirSync(join(baseDir, dir)).filter(f => f.endsWith('.csv')); }
  catch { console.error(`✗ フォルダが見つからない: ${join(baseDir, dir)}`); process.exit(1); }

  for (const fileName of files) {
    const text = readFileSync(join(baseDir, dir, fileName), 'utf8');
    const grid = parseCSV(text);
    const header = grid[0].map(h => h.trim());
    const idx = Object.fromEntries(header.map((h, i) => [h, i]));
    const book_name = bookNameFor(subject, fileName);
    bookKeys.add(`${subject}\t${book_name}`);

    for (let r = 1; r < grid.length; r++) {
      const cols = grid[r];
      if (!cols[idx.question_text]) continue;
      const correct = parseInt(cols[idx.correct_choice], 10);
      const c1 = cols[idx.choice_1] || '';
      const c2 = cols[idx.choice_2] || '';
      const c3 = cols[idx.choice_3] || '';
      const c4 = cols[idx.choice_4] || '';
      const co = correct >= 1 && correct <= 4 ? correct : 1;
      const chapter = (cols[idx.grade_level] || '一般').trim();
      allRows.push({
        subject,
        category: mapCategory(cols[idx.category]),
        book_name,
        chapter,
        question_text: cols[idx.question_text],
        option_1: c1, option_2: c2, option_3: c3, option_4: c4,
        correct_option: co,
        q_type: 'choice',
        correct_text: null,
        explanation: cols[idx.explanation] || null,
        // 旧スターター由来の NOT NULL 列（アプリ未使用・将来削除予定）を満たす
        choice_1: c1, choice_2: c2, choice_3: c3, choice_4: c4,
        correct_choice: co,
        grade_level: chapter,
      });
    }
  }
}

console.log(`読み込み: ${allRows.length}問 / 教材 ${bookKeys.size}種`);

const supabase = createClient(url, key, { auth: { persistSession: false } });

// ── --replace: 対象教材の既存を削除 ───────────────────────
if (replace) {
  for (const k of bookKeys) {
    const [subject, book_name] = k.split('\t');
    const { error } = await supabase.from('questions').delete().eq('subject', subject).eq('book_name', book_name);
    if (error) { console.error(`✗ 既存削除に失敗 (${subject}/${book_name}):`, error.message); process.exit(1); }
    console.log(`🗑  [${subject}] ${book_name} の既存を削除`);
  }
}

// ── 100件ずつ投入 ─────────────────────────────────────────
let inserted = 0;
for (let i = 0; i < allRows.length; i += 100) {
  const chunk = allRows.slice(i, i + 100);
  const { error } = await supabase.from('questions').insert(chunk);
  if (error) { console.error('✗ 投入に失敗:', error.message); process.exit(1); }
  inserted += chunk.length;
}

// ── 集計表示 ──────────────────────────────────────────────
const tree = {};
for (const r of allRows) {
  tree[r.subject] ??= {};
  tree[r.subject][r.book_name] ??= 0;
  tree[r.subject][r.book_name]++;
}
console.log(`✓ ${inserted}問を投入`);
for (const [s, books] of Object.entries(tree)) {
  for (const [b, n] of Object.entries(books)) console.log(`   [${s}] ${b}: ${n}問`);
}
