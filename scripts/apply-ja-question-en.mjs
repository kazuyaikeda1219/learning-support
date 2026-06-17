// ============================================================
// ja(日本語学習)トラックの question_text を英訳に差し替える。
//
//   node scripts/apply-ja-question-en.mjs            … CSV書き換え＋DB更新
//   node scripts/apply-ja-question-en.mjs --dry      … 変更内容の確認のみ(書き込まない)
//
// 対象: テスト用データ/日本語学習/genki*_questions.csv（subject=ja）
// 変更するのは question_text 列のみ。選択肢・解説・正解番号は変えない。
// DBは subject+book_name+chapter+旧question_text でマッチして更新（ID据え置き）。
// ============================================================
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { TRANSLATIONS } from './ja-question-en.mjs';

const DRY = process.argv.includes('--dry');
const BASE = '/Users/kazuya_ikeda/Downloads/04_開発/テスト用データ/日本語学習';

// ── .env.local ────────────────────────────────────────────
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
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) { console.error('✗ .env.local に SUPABASE URL / ANON KEY が必要'); process.exit(1); }

// ── CSV パース/シリアライズ（全フィールド引用・""エスケープ）──
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
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
const q = (s) => '"' + String(s ?? '').replace(/"/g, '""') + '"';
const serializeCSV = (grid) => grid.map(r => r.map(q).join(',')).join('\n') + '\n';

function bookNameFor(fileName) {
  if (/genki1/i.test(fileName)) return 'Genki I';
  if (/genki2/i.test(fileName)) return 'Genki II';
  return '日本語教材';
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const files = readdirSync(BASE).filter(f => f.endsWith('.csv')).sort();
let totalRows = 0, dbUpdated = 0, csvUpdated = 0, problems = 0;

for (const fileName of files) {
  const base = fileName.replace(/_questions\.csv$/, '');
  const trans = TRANSLATIONS[base];
  if (!trans) { console.error(`✗ 翻訳が見つからない: ${base}`); problems++; continue; }

  const fullPath = join(BASE, fileName);
  const grid = parseCSV(readFileSync(fullPath, 'utf8'));
  const header = grid[0].map(h => h.trim());
  const qi = header.indexOf('question_text');
  if (qi < 0) { console.error(`✗ question_text 列なし: ${fileName}`); problems++; continue; }

  const book_name = bookNameFor(fileName);
  const dataRows = grid.slice(1).filter(r => (r[qi] ?? '') !== '');
  if (dataRows.length !== trans.length) {
    console.error(`✗ 行数不一致 ${base}: CSV ${dataRows.length}問 / 翻訳 ${trans.length}問`);
    problems++; continue;
  }

  const gli = header.indexOf('grade_level');
  let di = 0; // data row pointer
  for (let r = 1; r < grid.length; r++) {
    if ((grid[r][qi] ?? '') === '') continue;
    const oldText = grid[r][qi];
    const newText = trans[di];
    const chapter = (grid[r][gli] ?? '').trim();
    di++;
    totalRows++;
    if (oldText === newText) continue;

    // DB更新（subject+book+chapter+旧question_text で一意）
    if (!DRY) {
      const { data, error } = await supabase
        .from('questions')
        .update({ question_text: newText })
        .eq('subject', 'ja').eq('book_name', book_name).eq('chapter', chapter)
        .eq('question_text', oldText)
        .select('id');
      if (error) { console.error(`✗ DB更新失敗 ${base} #${di}:`, error.message); problems++; }
      else if (!data || data.length === 0) { console.error(`⚠ DB該当なし ${base} #${di} (${book_name}/${chapter})`); problems++; }
      else dbUpdated += data.length;
    }
    grid[r][qi] = newText; // CSVも書き換え
  }

  if (!DRY) writeFileSync(fullPath, serializeCSV(grid), 'utf8');
  csvUpdated++;
}

console.log('────────────────────────────────');
console.log(`${DRY ? '[DRY] ' : ''}対象問題: ${totalRows}問 / CSV ${csvUpdated}ファイル`);
if (!DRY) console.log(`DB更新: ${dbUpdated}問`);
console.log(problems ? `⚠ 問題 ${problems}件あり（上記参照）` : '✓ 問題なし');
