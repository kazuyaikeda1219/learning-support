'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { createClient } from '@/utils/supabase/client';
import {
  Loader2, ArrowLeft, ChevronLeft, ChevronRight, Shuffle, RotateCcw,
} from 'lucide-react';

type Card = { id: string; front: string; back: string; reading: string | null; example: string | null };
type Deck = { id: string; deck_name: string; category: string | null };

export default function FlashcardStudy() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const deckId = params?.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: d }, { data: c }] = await Promise.all([
        supabase.from('flashcard_decks').select('id, deck_name, category').eq('id', deckId).single(),
        supabase.from('flashcards').select('id, front, back, reading, example').eq('deck_id', deckId)
          .order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
      ]);
      setDeck(d as Deck);
      setCards((c as Card[]) || []);
      setOrder(((c as Card[]) || []).map((_, i) => i));
      setLoading(false);
    };
    if (deckId) load();
  }, [deckId]);

  const total = order.length;
  const card = total > 0 ? cards[order[pos]] : null;

  const go = useCallback((delta: number) => {
    setFlipped(false);
    setPos((p) => Math.min(Math.max(p + delta, 0), total - 1));
  }, [total]);

  const reshuffle = () => {
    const idx = cards.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    setOrder(idx);
    setPos(0);
    setFlipped(false);
    setShuffled(true);
  };

  const resetOrder = () => {
    setOrder(cards.map((_, i) => i));
    setPos(0);
    setFlipped(false);
    setShuffled(false);
  };

  // キーボード操作: ←→ で移動、Space/↑↓ で反転
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="p-6 text-gray-800">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push('/flashcards')}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-gray-700 transition-all mb-6 mt-2"
          >
            <ArrowLeft size={16} /> 単語帳一覧へ
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-9 h-9 animate-spin text-indigo-600 mb-3" />
              <p className="text-gray-400 font-medium text-sm">読み込み中...</p>
            </div>
          ) : !deck ? (
            <p className="text-center text-gray-400 font-bold py-20">デッキが見つかりませんでした。</p>
          ) : total === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 font-bold">このデッキにはカードがありません。</p>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between mb-4">
                <div>
                  {deck.category && <p className="text-xs font-bold text-indigo-500 mb-0.5">{deck.category}</p>}
                  <h1 className="text-2xl font-black text-gray-900">{deck.deck_name}</h1>
                </div>
                <span className="text-sm font-black text-gray-400">{pos + 1} / {total}</span>
              </div>

              {/* 進捗バー */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full mb-6 overflow-hidden">
                <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${((pos + 1) / total) * 100}%` }} />
              </div>

              {/* カード本体（クリックで反転）*/}
              <button
                onClick={() => setFlipped(f => !f)}
                className="relative w-full aspect-[3/2] bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-all flex flex-col items-center justify-center p-8 text-center select-none active:scale-[0.99]"
              >
                <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  {flipped ? '裏 BACK' : '表 FRONT'}
                </span>
                {!flipped ? (
                  <p className="text-4xl md:text-5xl font-black text-gray-900 break-words">{card!.front}</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-3xl md:text-4xl font-black text-indigo-600 break-words">{card!.back}</p>
                    {card!.reading && <p className="text-base font-bold text-gray-400">{card!.reading}</p>}
                    {card!.example && <p className="text-sm text-gray-500 italic mt-2">{card!.example}</p>}
                  </div>
                )}
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-300">タップ / Space で反転</span>
              </button>

              {/* 操作 */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => go(-1)}
                  disabled={pos === 0}
                  className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                  aria-label="前のカード"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setFlipped(f => !f)}
                  className="px-8 h-14 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  めくる
                </button>
                <button
                  onClick={() => go(1)}
                  disabled={pos === total - 1}
                  className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                  aria-label="次のカード"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* シャッフル / 並び戻し */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={reshuffle}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all"
                >
                  <Shuffle size={14} /> シャッフル
                </button>
                {shuffled && (
                  <button
                    onClick={resetOrder}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    <RotateCcw size={14} /> 元の順番
                  </button>
                )}
              </div>
            </>
          )}

          <div className="h-20 md:hidden" />
        </div>
      </div>
    </div>
  );
}
