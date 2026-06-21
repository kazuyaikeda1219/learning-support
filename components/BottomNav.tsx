'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItemsForSubject, isNavActive } from '@/components/navItems';
import { getCurrentUser } from '@/utils/currentUser';
import type { Subject } from '@/utils/subject';

export default function BottomNav() {
  const pathname = usePathname();
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    setSubject(getCurrentUser()?.subject ?? null);
  }, []);

  const navItems = navItemsForSubject(subject);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden">
      <div className="flex items-center justify-around px-1 py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = isNavActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all ${
                isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
