import { LayoutDashboard, ClipboardList, Layers, Map, Library, UserCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = { label: string; href: string; icon: LucideIcon };

// 上(Navbar)・下(BottomNav)で共通の主要ナビ。ここを編集すれば両方に反映される。
export const PRIMARY_NAV: NavItem[] = [
  { label: 'ホーム',       href: '/dashboard', icon: LayoutDashboard },
  { label: 'テスト',       href: '/test',      icon: ClipboardList },
  { label: '単語',         href: '/flashcards', icon: Layers },
  { label: 'ロードマップ', href: '/roadmap',   icon: Map },
  { label: 'ライブラリ',   href: '/library',   icon: Library },
  { label: 'マイページ',   href: '/mypage',    icon: UserCircle },
];

// 現在地の判定（/test/quiz のような子ページは親タブをアクティブに）
export const isNavActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(href + '/');
