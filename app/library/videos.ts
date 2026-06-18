// ──────────────────────────────────────────────────────────────
// ライブラリ動画データ（フォルダ「Japanese lesson with Anne」由来）
//
// 📌 動画の配信方法は未確定（本人が検討中）。各動画の `url` は空のまま掲載すると
//    カードに「準備中」バッジが付く。配信先（YouTube限定公開 / Vimeo / Supabase Storage 等）
//    が決まったら、各 `url` に視聴URLを差し込むだけで自動的に再生可能になる。
//      - YouTube / Vimeo のURL → 埋め込みプレーヤーで再生
//      - .mp4 / .mov などの直リンク → そのまま <video> で再生
// ──────────────────────────────────────────────────────────────

import type { Subject } from '@/utils/subject';

export type LibraryCategory = 'life' | 'vocab' | 'writing';

export type LibraryVideo = {
  /** 一意ID（URL差し込み・並び替えの目印。元ファイル名ベース） */
  id: string;
  /**
   * 学習内容。'ja'=日本語学習者向け / 'en'=英語学習者向け。
   * ライブラリはログイン中の利用者の subject でフィルタするので、ここを間違えると
   * 別の学習者に表示されてしまう。今回の「Anne先生」動画はすべて日本語学習者向け＝'ja'。
   */
  subject: Subject;
  /** 表示タイトル */
  title: string;
  /** 補足（英語タイトルや内容メモ）。任意 */
  subtitle?: string;
  /** カテゴリ（ラベル） */
  category: LibraryCategory;
  /** 視聴URL。空のうちは「準備中」表示。決まり次第ここに差し込む */
  url: string;
  /** 任意のレベルタグ（例: 'N5'） */
  level?: string;
};

export const CATEGORY_META: Record<
  LibraryCategory,
  { label: string; emoji: string; accent: string }
> = {
  life:    { label: '日本の生活シーン', emoji: '📷', accent: 'text-blue-600 bg-blue-50' },
  vocab:   { label: '単語 Vocabulary',  emoji: '🗣', accent: 'text-orange-600 bg-orange-50' },
  writing: { label: '書き取り練習',      emoji: '✍️', accent: 'text-emerald-600 bg-emerald-50' },
};

// 表示順はこの配列順。url を後から埋めるだけで公開できる。
export const LIBRARY_VIDEOS: LibraryVideo[] = [
  // ── 日本の生活シーン（Videos in Japan📷） ──
  { id: 'cafe-order',      title: 'カフェでの注文',          subtitle: 'How to Order at Cafe',           subject: 'ja', category: 'life', url: '' },
  { id: 'fruit-price',     title: '果物の値段',              subtitle: 'Price of fruits 🍎🍉🍊',         subject: 'ja', category: 'life', url: '' },
  { id: 'unique-gym',      title: '日本のユニークなジム',     subtitle: 'Unique Gym in Japan',            subject: 'ja', category: 'life', url: '' },
  { id: 'mcd-drivethrough', title: 'マクドナルドのドライブスルー', subtitle: "Drive-through at McDonald's", subject: 'ja', category: 'life', url: '' },
  { id: 'supermarket',     title: 'スーパーでの会話',         subtitle: 'Conversation at Supermarket',    subject: 'ja', category: 'life', url: '' },
  { id: 'oita-festival',   title: '大分の地元のお祭り',       subtitle: 'Local festival in Oita, Japan',  subject: 'ja', category: 'life', url: '' },
  { id: 'starbucks',       title: 'スターバックスでの会話',    subtitle: 'Conversation at Starbucks',      subject: 'ja', category: 'life', url: '' },
  { id: 'saizeriya',       title: 'サイゼリヤ',              subtitle: 'Popular Italian Restaurant',     subject: 'ja', category: 'life', url: '' },
  { id: 'taiyaki',         title: 'たい焼き屋での会話',       subtitle: 'Conversation at Taiyaki shop',   subject: 'ja', category: 'life', url: '' },
  { id: 'yatai',           title: '屋台での会話',            subtitle: 'Conversation at やたい (local shop)', subject: 'ja', category: 'life', url: '' },

  // ── 単語 Vocabulary ──
  { id: 'vocab-donki-1',   title: 'ドンキホーテ ①',          subtitle: 'Vocabulary: ドン・キホーテ',      subject: 'ja', category: 'vocab', url: '' },
  { id: 'vocab-donki-2',   title: 'ドンキホーテ ②',          subtitle: 'Vocabulary: ドン・キホーテ',      subject: 'ja', category: 'vocab', url: '' },
  { id: 'vocab-donki-3',   title: 'ドンキホーテ ③',          subtitle: 'Vocabulary: ドン・キホーテ',      subject: 'ja', category: 'vocab', url: '' },
  { id: 'vocab-cosmetics', title: '化粧品',                 subtitle: 'Vocabulary: Cosmetics',          subject: 'ja', category: 'vocab', url: '' },

  // ── 書き取り練習 Writing Practice ──
  { id: 'write-hiragana-all',   title: 'ひらがな（全文字）',      subtitle: 'All hiragana',               subject: 'ja', category: 'writing', url: '' },
  { id: 'write-sentences',      title: '日本語の文を書く',        subtitle: 'Writing Japanese sentences', subject: 'ja', category: 'writing', url: '' },
  { id: 'write-hiragana-words', title: 'ひらがなで単語を書く',    subtitle: 'Write words in hiragana',    subject: 'ja', category: 'writing', url: '' },
  { id: 'write-numbers',        title: '数字の書き方',            subtitle: 'Numbers 1-10, 100, 1000',    subject: 'ja', category: 'writing', url: '' },
  { id: 'write-katakana-words', title: 'カタカナで単語を書く',    subtitle: 'Write words in Katakana',    subject: 'ja', category: 'writing', url: '' },
  { id: 'write-kanji-n5-1',     title: 'N5漢字 ①',              subtitle: 'N5 Kanji',                   subject: 'ja', category: 'writing', url: '', level: 'N5' },
  { id: 'write-kanji-n5-2',     title: 'N5漢字 ②',              subtitle: 'N5 Kanji',                   subject: 'ja', category: 'writing', url: '', level: 'N5' },
  { id: 'write-kanji-n5-3',     title: 'N5漢字 ③',              subtitle: 'N5 Kanji',                   subject: 'ja', category: 'writing', url: '', level: 'N5' },
];

/** URL を埋め込み用に解決。YouTube/Vimeo は iframe、その他は直リンク扱い。 */
export function resolveVideo(url: string):
  | { kind: 'youtube' | 'vimeo'; embed: string }
  | { kind: 'file'; embed: string }
  | null {
  if (!url) return null;
  // YouTube
  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: 'youtube', embed: `https://www.youtube.com/embed/${yt[1]}` };
  // Vimeo
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: 'vimeo', embed: `https://player.vimeo.com/video/${vm[1]}` };
  // 直リンク（.mp4 / .mov / Supabase Storage 等）
  return { kind: 'file', embed: url };
}
