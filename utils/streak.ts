// ────────────────────────────────────────────────────────────
// 学習ログの日付配列から「連続学習日数（ストリーク）」を計算する。
// study_logs.study_date（'YYYY-MM-DD' 文字列）の配列を渡す。
//  - current : 今日 or 昨日から途切れず続いている連続日数
//  - longest : 過去最長の連続日数
//  - studiedToday : 今日のログが既にあるか
// 「今日まだ記録が無いがストリークは継続中（＝昨日まで連続）」を区別できるよう、
// current は “昨日まで連続している” 場合も維持する（今日記録すれば伸びる状態）。
// ────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

/** 'YYYY-MM-DD'（ローカル日付）を返す。タイムゾーンのズレを避けるため UTC変換は使わない。 */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function diffDays(aKey: string, bKey: string): number {
  const a = new Date(`${aKey}T00:00:00`);
  const b = new Date(`${bKey}T00:00:00`);
  return Math.round((a.getTime() - b.getTime()) / DAY_MS);
}

export type StreakInfo = {
  current: number;
  longest: number;
  studiedToday: boolean;
};

export function computeStreak(dates: (string | null | undefined)[]): StreakInfo {
  const unique = Array.from(
    new Set(dates.filter((d): d is string => !!d))
  ).sort(); // 昇順

  if (unique.length === 0) {
    return { current: 0, longest: 0, studiedToday: false };
  }

  // 最長連続
  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    if (diffDays(unique[i], unique[i - 1]) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
  }

  // 現在の連続（今日 or 昨日を起点に遡る）
  const todayKey = toDateKey(new Date());
  const latest = unique[unique.length - 1];
  const gapFromToday = diffDays(todayKey, latest);

  let current = 0;
  if (gapFromToday <= 1) {
    // 最新ログが今日(0)または昨日(1)なら連続は生きている
    current = 1;
    for (let i = unique.length - 1; i > 0; i--) {
      if (diffDays(unique[i], unique[i - 1]) === 1) current += 1;
      else break;
    }
  }

  return { current, longest, studiedToday: gapFromToday === 0 };
}
