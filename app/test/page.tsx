'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { getCurrentUser } from '@/utils/currentUser';
import { DEFAULT_SUBJECT } from '@/utils/subject';
import {
  Book, ArrowRight, Loader2, Zap, GraduationCap, Headphones,
  Mic, BookOpen, ClipboardCheck, FolderOpen, ChevronDown, Globe,
} from 'lucide-react';

// ── 大項目（ジャンル）ごとの見た目。未知のカテゴリはデフォルトにフォールバック ──
const CATEGORY_STYLE: Record<string, { icon: React.ReactNode; ring: string }> = {
  '英単語':   { icon: <Zap />,            ring: 'text-orange-500 bg-orange-50' },
  '英文法':   { icon: <GraduationCap />,  ring: 'text-blue-500 bg-blue-50' },
  '単語':     { icon: <Zap />,            ring: 'text-orange-500 bg-orange-50' },
  '文法':     { icon: <GraduationCap />,  ring: 'text-blue-500 bg-blue-50' },
  'リスニング': { icon: <Headphones />,     ring: 'text-emerald-500 bg-emerald-50' },
  '発音':     { icon: <Mic />,            ring: 'text-pink-500 bg-pink-50' },
  '読解':     { icon: <BookOpen />,       ring: 'text-violet-500 bg-violet-50' },
  'チェック':  { icon: <ClipboardCheck />, ring: 'text-purple-500 bg-purple-50' },
  '文化・知識 Japan FAQ': { icon: <Globe />, ring: 'text-teal-500 bg-teal-50' },
};
const DEFAULT_STYLE = { icon: <FolderOpen />, ring: 'text-gray-500 bg-gray-100' };

// 大 → 中(教材) → 小(章) → 問題数 のツリー
type Tree = Record<string, Record<string, Record<string, number>>>;
type Row = { category: string; book_name: string; chapter: string; q_type: string };

// 種別（出題形式）のラベルと表示順
const TYPE_LABEL: Record<string, string> = { choice: '4択', text: '記述' };
const TYPE_ORDER = ['choice', 'text'];

// 章・教材名を数値込みで自然順ソート（「第10課」が「第1課」より後ろに来るように）
const naturalSort = (a: string, b: string) => a.localeCompare(b, 'ja', { numeric: true });

export default function TestPortal() {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [qType, setQType] = useState<string>('all'); // 'all' | 'choice' | 'text' | ...
  const [loading, setLoading] = useState(true);
  // 開いている教材（中項目）のキー集合。`大::中` 形式。複数同時に開けるので比較できる
  const [openBooks, setOpenBooks] = useState<Set<string>>(new Set());
  const toggleBook = (key: string) =>
    setOpenBooks((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const subject = getCurrentUser()?.subject ?? DEFAULT_SUBJECT;
      const { data, error } = await supabase
        .from('questions')
        .select('category, book_name, chapter, q_type')
        .eq('subject', subject);

      if (error) {
        console.error('【Supabase Error】questions 取得失敗:', error.message);
        setLoading(false);
        return;
      }

      setRows((data || []).map((q: any) => ({
        category: q.category || '未分類',
        book_name: q.book_name || 'その他',
        chapter: q.chapter || '一般',
        q_type: q.q_type || 'choice',
      })));
      setLoading(false);
    };
    load();
  }, []);

  // その科目に実在する種別（出題形式）。1種類しかなければタブは出さない。
  const availableTypes = useMemo(() => {
    const present = new Set(rows.map(r => r.q_type));
    const known = TYPE_ORDER.filter(t => present.has(t));
    const extras = [...present].filter(t => !TYPE_ORDER.includes(t)).sort();
    return [...known, ...extras];
  }, [rows]);

  // 種別フィルタを反映した大中小ツリー
  const tree = useMemo<Tree>(() => {
    const t: Tree = {};
    rows.forEach((r) => {
      if (qType !== 'all' && r.q_type !== qType) return;
      t[r.category] ??= {};
      t[r.category][r.book_name] ??= {};
      t[r.category][r.book_name][r.chapter] = (t[r.category][r.book_name][r.chapter] || 0) + 1;
    });
    return t;
  }, [rows, qType]);

  const categories = Object.keys(tree).sort();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="p-6 text-gray-800">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10 mt-4">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Book className="text-indigo-600" size={36} /> テスト一覧
            </h1>
            <p className="text-gray-500 font-medium mt-2">
              ジャンル → 教材 → 章 の順に選んでクイズに挑戦しましょう。
            </p>
          </header>

          {/* 種別（出題形式）タブ。2種類以上あるときだけ表示 */}
          {!loading && availableTypes.length > 1 && (
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
              <span className="text-xs font-black text-gray-400 mr-1 shrink-0">種別</span>
              {['all', ...availableTypes].map((t) => (
                <button
                  key={t}
                  onClick={() => setQType(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    qType === t
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  {t === 'all' ? 'すべて' : (TYPE_LABEL[t] || t)}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-9 h-9 animate-spin text-indigo-600 mb-3" />
              <p className="text-gray-400 font-medium text-sm">テストを読み込み中...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 font-bold">まだ問題が登録されていません。</p>
              <p className="text-gray-300 text-sm font-medium mt-2">
                管理画面の「問題管理」から追加すると、ここに自動で表示されます。
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map((cat) => {
                const style = CATEGORY_STYLE[cat] || DEFAULT_STYLE;
                const books = tree[cat];
                const total = Object.values(books)
                  .flatMap((chs) => Object.values(chs))
                  .reduce((a, b) => a + b, 0);

                return (
                  <section key={cat} className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                    {/* 大項目（ジャンル）見出し */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${style.ring}`}>
                        {style.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">{cat}</h2>
                        <p className="text-xs text-gray-400 font-bold mt-0.5">
                          {Object.keys(books).length} 教材 ・ 全 {total} 問
                        </p>
                      </div>
                    </div>

                    {/* 中項目（教材）ごと */}
                    <div className="space-y-6">
                      {Object.keys(books).sort(naturalSort).map((book) => {
                        const chapters = books[book];
                        const bookKey = `${cat}::${book}`;
                        const isOpen = openBooks.has(bookKey);
                        const chapKeys = Object.keys(chapters).sort(naturalSort);
                        const bookTotal = Object.values(chapters).reduce((a, b) => a + b, 0);
                        return (
                          <div key={book}>
                            {/* 中項目（教材）見出し = クリックで小項目を開閉 */}
                            <button
                              onClick={() => toggleBook(bookKey)}
                              className="w-full flex items-center gap-2 mb-3 group/book"
                            >
                              <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                              />
                              <span className="text-sm font-black text-gray-700 group-hover/book:text-indigo-600 transition-colors">{book}</span>
                              <span className="text-xs font-bold text-gray-400">
                                {chapKeys.length}テスト ・ {bookTotal}問
                              </span>
                              <span className="h-px flex-1 bg-gray-100" />
                            </button>
                            {/* 小項目（章）ごと = クイズ。開いているときだけ表示 */}
                            {isOpen && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                                {chapKeys.map((chap) => (
                                  <Link
                                    key={chap}
                                    href={`/test/quiz?category=${encodeURIComponent(cat)}&book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chap)}${qType !== 'all' ? `&qtype=${encodeURIComponent(qType)}` : ''}`}
                                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all group"
                                  >
                                    <span className="font-bold text-sm">
                                      {chap}
                                      <span className="ml-2 text-xs font-medium text-gray-400 group-hover:text-indigo-400">
                                        {chapters[chap]}問
                                      </span>
                                    </span>
                                    <ArrowRight size={18} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          <div className="h-20 md:hidden" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
