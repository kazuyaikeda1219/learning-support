'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Video, Play, Clock, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { getCurrentUser } from '@/utils/currentUser';
import { DEFAULT_SUBJECT, type Subject } from '@/utils/subject';
import {
  LIBRARY_VIDEOS,
  CATEGORY_META,
  resolveVideo,
  type LibraryCategory,
  type LibraryVideo,
} from './videos';

type Filter = 'all' | LibraryCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'life', label: `${CATEGORY_META.life.emoji} ${CATEGORY_META.life.label}` },
  { key: 'vocab', label: `${CATEGORY_META.vocab.emoji} ${CATEGORY_META.vocab.label}` },
  { key: 'writing', label: `${CATEGORY_META.writing.emoji} ${CATEGORY_META.writing.label}` },
];

export default function LibraryPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [playing, setPlaying] = useState<LibraryVideo | null>(null);
  // ログイン中の利用者の学習内容(subject)。localStorage 依存なのでマウント後に確定。
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    setSubject(getCurrentUser()?.subject ?? DEFAULT_SUBJECT);
  }, []);

  // まず subject で絞り込み（日本語学習者の動画が英語学習者に出ないように）、次にカテゴリで絞る。
  const subjectVideos = useMemo(
    () => (subject ? LIBRARY_VIDEOS.filter((v) => v.subject === subject) : []),
    [subject]
  );
  const videos = useMemo(
    () => (filter === 'all' ? subjectVideos : subjectVideos.filter((v) => v.category === filter)),
    [filter, subjectVideos]
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="p-6 text-gray-800">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6 text-center md:text-left mt-4">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 justify-center md:justify-start">
              <Video className="text-blue-600" size={32} /> ライブラリ
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">
              学習に役立つ動画教材をカテゴリ別に掲載しています。
            </p>
          </header>

          {/* カテゴリフィルタ */}
          <div className="flex flex-wrap gap-2 mb-7">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* 動画グリッド */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((v) => {
              const meta = CATEGORY_META[v.category];
              const ready = Boolean(v.url);
              return (
                <button
                  key={v.id}
                  onClick={() => ready && setPlaying(v)}
                  disabled={!ready}
                  className={`group text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all ${
                    ready ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {/* サムネ部 */}
                  <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    {ready ? (
                      <div className="w-14 h-14 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                        <Play size={26} className="ml-0.5" fill="currentColor" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-gray-400">
                        <Clock size={26} />
                        <span className="text-xs font-bold">準備中</span>
                      </div>
                    )}
                    <span
                      className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${meta.accent}`}
                    >
                      {meta.emoji} {meta.label}
                    </span>
                    {v.level && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-900/80 text-white">
                        {v.level}
                      </span>
                    )}
                  </div>
                  {/* テキスト部 */}
                  <div className="p-4">
                    <h3 className="font-black text-gray-900 leading-snug">{v.title}</h3>
                    {v.subtitle && (
                      <p className="text-gray-400 text-xs font-medium mt-1 truncate">{v.subtitle}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {subject !== null && videos.length === 0 && (
            <p className="text-center text-gray-400 py-16 font-medium">
              現在ご利用の学習内容に対応する動画はまだありません。
            </p>
          )}

          <div className="h-20 md:hidden" />
        </div>
      </div>

      {/* 再生モーダル */}
      {playing && <VideoModal video={playing} onClose={() => setPlaying(null)} />}

      <BottomNav />
    </div>
  );
}

function VideoModal({ video, onClose }: { video: LibraryVideo; onClose: () => void }) {
  const resolved = resolveVideo(video.url);
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-black text-gray-900 truncate pr-3">{video.title}</h3>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>
        </div>
        <div className="aspect-video bg-black">
          {resolved?.kind === 'file' ? (
            <video src={resolved.embed} controls autoPlay className="w-full h-full" />
          ) : resolved ? (
            <iframe
              src={resolved.embed}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/70 text-sm">
              再生できる動画URLが設定されていません。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
