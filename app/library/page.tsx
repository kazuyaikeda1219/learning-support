'use client';

import React from 'react';
import { Video, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

// ⚠️ ライブラリは現在「準備中」。以前のダミー動画（Sample Video 1〜6）は撤去した。
// 実教材の差し替え／DB化（materials テーブル）は Phase 3 で対応予定（CONTENT_HANDOFF.md 参照）。
export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="p-6 text-gray-800">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 text-center md:text-left mt-4">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Video className="text-blue-600" size={32} /> ライブラリ
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">
              学習に役立つ教材をまとめて掲載します。
            </p>
          </header>

          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-5">
              <Sparkles size={30} />
            </div>
            <p className="text-gray-700 font-black text-lg">準備中です</p>
            <p className="text-gray-400 text-sm font-medium mt-2">
              教材コンテンツを準備しています。公開までもうしばらくお待ちください。
            </p>
          </div>

          <div className="h-20 md:hidden" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
