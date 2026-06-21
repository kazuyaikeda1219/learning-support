import { LayoutDashboard, ClipboardList, Layers, Map, Library, UserCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Subject } from '@/utils/subject';

// subjectOnly を付けた項目は、その学習内容の利用者にだけ表示する。
// （ロードマップは英語学習向けの内容なので en 専用）
export type NavItem = { label: string; href: string; icon: LucideIcon; subjectOnly?: Subject };

// 上(Navbar)・下(BottomNav)で共通の主要ナビ。ここを編集すれば両方に反映される。
export const PRIMARY_NAV: NavItem[] = [
  { label: '学習記録',     href: '/dashboard', icon: LayoutDashboard },
  { label: 'テスト',       href: '/test',      icon: ClipboardList },
  { label: '単語',         href: '/flashcards', icon: Layers },
  { label: 'ロードマップ', href: '/roadmap',   icon: Map, subjectOnly: 'en' },
  { label: 'ライブラリ',   href: '/library',   icon: Library },
  { label: 'マイページ',   href: '/mypage',    icon: UserCircle },
];

// ログイン中の利用者の subject に合わせて表示するナビ項目を返す。
// subject 未確定（null）の間は subjectOnly 付き項目を一旦隠す（誤表示防止）。
export const navItemsForSubject = (subject: Subject | null): NavItem[] =>
  PRIMARY_NAV.filter((item) => !item.subjectOnly || item.subjectOnly === subject);

// 現在地の判定（/test/quiz のような子ページは親タブをアクティブに）
export const isNavActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(href + '/');
