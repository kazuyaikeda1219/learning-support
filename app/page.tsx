'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/currentUser';
import { ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  // ✅ 利用者を選択済みならmypageへ自動リダイレクト
  useEffect(() => {
    if (getCurrentUser()) router.push('/mypage');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-10">
        今日の学習を始める
      </h1>

      <Link
        href="/login"
        className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
      >
        学習を開始する <ArrowRight size={20} />
      </Link>
    </div>
  );
}
