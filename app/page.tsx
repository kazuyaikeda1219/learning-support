'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/currentUser';
import { ArrowRight, Sprout, Quote, Lightbulb } from 'lucide-react';

// 日替わりの応援メッセージ（DB不要・日付で自動切替）。
// 追加・編集はこの配列を増やすだけ。順番に意味はなく、日ごとに巡回する。
const DAILY_MESSAGES: { ja: string; en: string }[] = [
  { ja: '継続は力なり。1日5分でも前に進める。', en: 'Little by little, you get there.' },
  { ja: '昨日の自分を、少しだけ追い越そう。', en: "Get just a little ahead of yesterday's you." },
  { ja: '完璧じゃなくていい。まず始めることが一番むずかしい。', en: 'Starting is the hardest part — and you just did.' },
  { ja: '小さな積み重ねが、大きな自信になる。', en: 'Small steps build big confidence.' },
  { ja: 'わからないは、これから伸びる場所のしるし。', en: '"I don\'t get it yet" just marks where you\'ll grow.' },
  { ja: '今日の一歩は、未来のあなたへの贈り物。', en: "Today's effort is a gift to your future self." },
  { ja: '焦らなくていい。自分のペースが一番つづく。', en: 'No rush — your own pace lasts the longest.' },
  { ja: 'できることが、また一つ増える日。', en: 'Today, you can do one more thing than before.' },
];

// 時間帯であいさつを切り替え（自分に向けられた感じを出す）。
function getGreeting(hour: number): { ja: string; en: string } {
  if (hour < 4) return { ja: 'おつかれさま', en: 'Working late?' };
  if (hour < 11) return { ja: 'おはよう', en: 'Good morning' };
  if (hour < 18) return { ja: 'こんにちは', en: 'Hello — good to see you' };
  return { ja: 'こんばんは', en: 'Good evening' };
}

export default function WelcomePage() {
  const router = useRouter();

  // ✅ 利用者を選択済みならmypageへ自動リダイレクト
  useEffect(() => {
    if (getCurrentUser()) router.push('/mypage');
  }, [router]);

  // 日付ベースで決定的に選ぶ（同じ日は同じメッセージ／ハイドレーション差異も出ない）。
  const { greeting, message } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
    return {
      greeting: getGreeting(now.getHours()),
      message: DAILY_MESSAGES[dayOfYear % DAILY_MESSAGES.length],
    };
  }, []);

  return (
    <div className="min-h-screen bg-lime-50/60 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm bg-[#F4F8EC] border border-black/5 rounded-3xl px-6 py-8 sm:px-8 sm:py-10 flex flex-col">
        {/* あいさつ */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-lime-400 flex items-center justify-center shrink-0">
            <Sprout size={20} className="text-lime-950" />
          </div>
          <div>
            <div className="text-base font-bold text-lime-950 leading-tight">{greeting.ja}</div>
            <div className="text-[11px] text-lime-700">{greeting.en}</div>
          </div>
        </div>

        {/* 今日のひとこと */}
        <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-5 mb-7">
          <Quote size={22} className="text-lime-400" />
          <p className="text-[15px] font-bold text-lime-950 leading-relaxed mt-1 whitespace-pre-line">
            {message.ja}
          </p>
          <p className="text-xs text-lime-700 mt-2 leading-snug">{message.en}</p>
          <div className="border-t border-black/5 mt-3.5 pt-2.5 flex items-center gap-1.5">
            <Lightbulb size={15} className="text-amber-500" />
            <span className="text-[11px] text-amber-700">今日のひとこと</span>
            <span className="text-[10px] text-gray-400">/ Today&apos;s word</span>
          </div>
        </div>

        {/* スタート */}
        <Link
          href="/login"
          className="bg-lime-600 hover:bg-lime-700 active:scale-[0.98] transition-all text-white font-bold text-[15px] py-4 rounded-2xl w-full flex items-center justify-center gap-2 shadow-lg shadow-lime-600/15"
        >
          今日の学習を始める <ArrowRight size={18} />
        </Link>
        <p className="text-[11px] text-gray-400 text-center mt-2">Start today&apos;s lesson</p>
      </div>
    </div>
  );
}
