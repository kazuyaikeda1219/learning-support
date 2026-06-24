// ────────────────────────────────────────────────────────────
// バッジ（達成称号）の定義と判定。
// 専用テーブルは持たず、既存の集計値（学習時間・連続日数・ロードマップ％・
// 受験回数・平均正答率）から都度算出する。YAGNI：必要になるまで永続化しない。
// ────────────────────────────────────────────────────────────

export type BadgeStats = {
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  roadmapPercent: number;
  quizAttempts: number;
  avgQuizPercent: number;
};

export type Badge = {
  key: string;
  emoji: string;
  label: string;
  desc: string;
  earned: boolean;
  /** 0–100。未獲得バッジの「あと少し」を見せるための達成率 */
  progress: number;
};

type BadgeDef = {
  key: string;
  emoji: string;
  label: string;
  desc: string;
  /** 達成率 0–100 を返す。100 で獲得。 */
  rate: (s: BadgeStats) => number;
};

const pctOf = (value: number, goal: number) =>
  goal <= 0 ? 0 : Math.min(100, Math.round((value / goal) * 100));

const BADGE_DEFS: BadgeDef[] = [
  { key: 'first_step',   emoji: '🌱', label: 'はじめの一歩', desc: '学習を記録した',           rate: (s) => (s.totalMinutes > 0 ? 100 : 0) },
  { key: 'time_10h',     emoji: '⏱️', label: '10時間達成',   desc: '累計10時間を学習',         rate: (s) => pctOf(s.totalMinutes, 600) },
  { key: 'time_50h',     emoji: '🔥', label: '50時間達成',   desc: '累計50時間を学習',         rate: (s) => pctOf(s.totalMinutes, 3000) },
  { key: 'time_100h',    emoji: '👑', label: '100時間達成',  desc: '累計100時間を学習',        rate: (s) => pctOf(s.totalMinutes, 6000) },
  { key: 'streak_3',     emoji: '✨', label: '3日継続',      desc: '3日連続で学習',            rate: (s) => pctOf(Math.max(s.currentStreak, s.longestStreak), 3) },
  { key: 'streak_7',     emoji: '🗓️', label: '1週間継続',    desc: '7日連続で学習',            rate: (s) => pctOf(Math.max(s.currentStreak, s.longestStreak), 7) },
  { key: 'streak_30',    emoji: '🏆', label: '皆勤マスター',  desc: '30日連続で学習',           rate: (s) => pctOf(Math.max(s.currentStreak, s.longestStreak), 30) },
  { key: 'quiz_first',   emoji: '📝', label: '初テスト',     desc: 'テストに挑戦した',         rate: (s) => (s.quizAttempts > 0 ? 100 : 0) },
  { key: 'quiz_10',      emoji: '🎯', label: 'テスト10回',   desc: 'テストを10回受験',         rate: (s) => pctOf(s.quizAttempts, 10) },
  { key: 'quiz_ace',     emoji: '💯', label: '高得点',       desc: '平均正答率80%以上',        rate: (s) => (s.quizAttempts > 0 ? pctOf(s.avgQuizPercent, 80) : 0) },
  { key: 'roadmap_half', emoji: '🚀', label: '折り返し',     desc: 'ロードマップ50%完了',      rate: (s) => pctOf(s.roadmapPercent, 50) },
  { key: 'roadmap_done', emoji: '🎓', label: '完走',         desc: 'ロードマップ100%完了',     rate: (s) => pctOf(s.roadmapPercent, 100) },
];

export function evaluateBadges(stats: BadgeStats): Badge[] {
  return BADGE_DEFS.map((def) => {
    const progress = Math.max(0, Math.min(100, Math.round(def.rate(stats))));
    return {
      key: def.key,
      emoji: def.emoji,
      label: def.label,
      desc: def.desc,
      earned: progress >= 100,
      progress,
    };
  });
}
