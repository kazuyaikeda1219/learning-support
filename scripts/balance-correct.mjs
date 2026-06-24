// ============================================================
// 4択問題の「正解番号の偏り」を均すユーティリティ。
//   node scripts/balance-correct.mjs content/<file>.json
// 各 choice 問題の options の並び順だけを組み替え、正解(correct)が
// 1〜4 にほぼ均等(各25%前後)に分布するようにする。
//   - 語・問題文・解説は一切変えない（位置だけ入れ替え）。
//   - 正解語は options[correct-1]。これを目標スロットへ移し、
//     残り3つのダミーは元の相対順のまま空きスロットへ詰める。
//   - 目標位置は [1,2,3,4] を均等回数ぶん用意してシャッフルし割当 → ほぼ完全に均一。
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('使い方: node scripts/balance-correct.mjs content/<file>.json'); process.exit(1); }

const doc = JSON.parse(readFileSync(file, 'utf8'));
const qs = doc.questions || [];

// choice 問題のインデックスを集める
const choiceIdx = qs.map((q, i) => ({ q, i })).filter(({ q }) => (q.q_type || 'choice') === 'choice');

// 目標位置プール: 1..4 を均等に。端数は先頭から配る。
const n = choiceIdx.length;
const pool = [];
for (let k = 0; k < n; k++) pool.push((k % 4) + 1);
// Fisher–Yates シャッフル（決定的でなくてよい）
for (let i = pool.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [pool[i], pool[j]] = [pool[j], pool[i]];
}

let moved = 0;
choiceIdx.forEach(({ q }, k) => {
  const opts = q.options || [];
  const cur = q.correct;
  if (!(opts.length === 4 && cur >= 1 && cur <= 4)) return; // 異常はスキップ
  const correctVal = opts[cur - 1];
  const dummies = opts.filter((_, idx) => idx !== cur - 1); // 元の相対順を保持
  const target = pool[k];               // 1..4
  const next = [];
  let d = 0;
  for (let slot = 1; slot <= 4; slot++) {
    if (slot === target) next.push(correctVal);
    else next.push(dummies[d++]);
  }
  if (next.join('') !== opts.join('')) moved++;
  q.options = next;
  q.correct = target;
});

writeFileSync(file, JSON.stringify(doc, null, 2) + '\n', 'utf8');

// 結果分布
const dist = { 1: 0, 2: 0, 3: 0, 4: 0 };
choiceIdx.forEach(({ q }) => { if (q.correct >= 1 && q.correct <= 4) dist[q.correct]++; });
console.log(`✓ ${file}: ${n}問の正解位置を再配置（${moved}問の並びを変更）`);
console.log(`   分布: 1=${dist[1]} 2=${dist[2]} 3=${dist[3]} 4=${dist[4]}`);
