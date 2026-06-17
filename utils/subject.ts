// ────────────────────────────────────────────────────────────
// 学習内容(subject)の定義。
// 1システムのまま「英語」「日本語(外国人向け)」を出し分けるための共通定数。
//   - 'en' = 英語学習
//   - 'ja' = 日本語学習（外国人向け：JLPT/語彙/文法など）
// profiles.subject / questions.subject に保存され、各ページはログイン中の
// 利用者の subject でコンテンツをフィルタする。
// ────────────────────────────────────────────────────────────

export type Subject = 'en' | 'ja';

export const DEFAULT_SUBJECT: Subject = 'en';

export const SUBJECTS: { value: Subject; label: string }[] = [
  { value: 'en', label: '英語' },
  { value: 'ja', label: '日本語' },
];

export const SUBJECT_LABEL: Record<Subject, string> = {
  en: '英語',
  ja: '日本語',
};

// 不正値・未設定は既定(en)に丸める
export function normalizeSubject(value: unknown): Subject {
  return value === 'ja' ? 'ja' : 'en';
}

// ダッシュボードの学習ログ「教材／内容」候補（subject別）
export const STUDY_CATEGORIES: Record<Subject, string[]> = {
  en: [
    'Mr.Evine中学英文法', '総合英語Evergreen', 'Evergreen問題集', 'シャドーイング',
    'オンライン英会話', 'キクタンEntry', 'キクタンBasic', 'キクタンAdvanced',
    'DataBase 3300', 'Duo 3.0', '瞬間英作文（青）', '瞬間英作文（緑）',
    '瞬間英作文（銀）', '瞬間英作文（金）', '自由英作文', '音声添削',
    'リーディング（精読）', '独り言英会話', 'TOEIC学習（問題集・単語）',
    '英検学習（過去問）', 'その他',
  ],
  ja: [
    '漢字', '語彙', '文法', '読解', '聴解', '会話', '作文',
    'JLPT N5', 'JLPT N4', 'JLPT N3', 'JLPT N2', 'JLPT N1', 'その他',
  ],
};
