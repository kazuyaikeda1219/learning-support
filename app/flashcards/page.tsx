'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { createClient } from '@/utils/supabase/client';
import { getCurrentUser } from '@/utils/currentUser';
import { DEFAULT_SUBJECT } from '@/utils/subject';
import { Layers, Loader2, ArrowRight, FolderOpen } from 'lucide-react';

type Deck = {
  id: string;
  category: string | null;
  deck_name: string;
  description: string | null;
  count: number;
};

export default function FlashcardsPortal() {
  const supabase = createClient();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const subject = getCurrentUser()?.subject ?? DEFAULT_SUBJECT;
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('id, category, deck_name, description, flashcards(count)')
        .eq('subject', subject)
        .order('sort', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('【Supabase Error】decks 取得失敗:', error.message);
        setLoading(false);
        return;
      }
      setDecks((data || []).map((d: any) => ({
        id: d.id,
        category: d.category,
        deck_name: d.deck_name,
        description: d.description,
        count: d.flashcards?.[0]?.count ?? 0,
      })));
      setLoading(false);
    };
    load();
  }, []);

  // category ごとにグループ化
  const groups = decks.reduce((acc: Record<string, Deck[]>, d) => {
    const key = d.category || 'その他';
    (acc[key] ??= []).push(d);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="p-6 text-gray-800">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10 mt-4">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Layers className="text-indigo-600" size={36} /> 単語・フラッシュカード
            </h1>
            <p className="text-gray-500 font-medium mt-2">
              教材を選んで、カードをめくりながら毎日の自主学習に。
            </p>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-9 h-9 animate-spin text-indigo-600 mb-3" />
              <p className="text-gray-400 font-medium text-sm">読み込み中...</p>
            </div>
          ) : decks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 font-bold">まだ単語帳が登録されていません。</p>
              <p className="text-gray-300 text-sm font-medium mt-2">
                管理画面の「フラッシュカード」から教材（デッキ）を追加すると、ここに表示されます。
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.keys(groups).sort().map((cat) => (
                <section key={cat}>
                  <div className="flex items-center gap-2 mb-4">
                    <FolderOpen size={18} className="text-gray-400" />
                    <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest">{cat}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {groups[cat].map((d) => (
                      <Link
                        key={d.id}
                        href={`/flashcards/${d.id}`}
                        className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all group"
                      >
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 truncate">{d.deck_name}</p>
                          <p className="text-xs text-gray-400 font-bold mt-1">{d.count} 枚のカード</p>
                          {d.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">{d.description}</p>
                          )}
                        </div>
                        <ArrowRight size={20} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <div className="h-20 md:hidden" />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
