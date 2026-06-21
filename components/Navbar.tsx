'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, clearCurrentUser } from '@/utils/currentUser';
import { BookOpen, LogOut, ShieldCheck, LogIn } from 'lucide-react';
import { navItemsForSubject, isNavActive } from '@/components/navItems';
import type { Subject } from '@/utils/subject';

export default function Navbar() {
  const [userName, setUserName] = useState<string>('');
  const [hasUser, setHasUser] = useState(false);
  const [subject, setSubject] = useState<Subject | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const cu = getCurrentUser();
    if (cu) {
      setHasUser(true);
      setUserName(cu.name || 'User');
      setSubject(cu.subject);
    }
  }, []);

  const navItems = navItemsForSubject(subject);

  const handleLogout = () => {
    clearCurrentUser();
    setHasUser(false);
    setUserName('');
    router.push('/');
  };

  return (
    // ✅ スマホでは非表示、PCのみ表示
    <nav className="hidden md:block bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center gap-6">
        {/* ── ロゴ ── */}
        <Link href="/mypage" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tighter text-gray-900 uppercase hidden lg:inline">
            Learning Support
          </span>
        </Link>

        {/* ── 主要ナビ（上下で共通。スマホ下バーと同じ並び） ── */}
        {hasUser && (
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = isNavActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* ── アカウント操作 ── */}
        <div className="flex items-center gap-3 shrink-0">
          {hasUser ? (
            <>
              <Link href="/admin" className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-red-50 text-red-600 rounded-full border border-red-100 hover:bg-red-100 transition-all">
                <ShieldCheck size={14} /> Admin
              </Link>
              <div className="h-7 w-[1px] bg-gray-100" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-gray-600 hidden lg:inline max-w-[8rem] truncate">{userName}</span>
                <button onClick={handleLogout} title="利用者を切り替え" className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              <LogIn size={18} /> 利用者を選択
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
