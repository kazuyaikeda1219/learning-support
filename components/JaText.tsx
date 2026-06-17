'use client';

import React from 'react';

export type JaReading = { furigana: string; romaji: string };

// 日本語テキストを「漢字ふりがな(ruby)＋小さいローマ字」で表示する。
// reading が無ければ原文をそのまま表示（en など対象外でも安全に使える）。
// furigana は scripts/gen-ja-readings.mjs が生成した自前データ（kuroshiro出力の
// <ruby>/<rt>/<rp> のみ）なので dangerouslySetInnerHTML で描画して問題ない。
export default function JaText({
  text,
  reading,
}: {
  text: string;
  reading?: JaReading;
}) {
  if (!reading) return <>{text}</>;

  return (
    <span className="inline-flex flex-col align-top">
      <span
        className="leading-relaxed [&_rt]:text-[0.58em] [&_rt]:font-medium [&_rt]:text-gray-500 [&_rp]:hidden"
        dangerouslySetInnerHTML={{ __html: reading.furigana }}
      />
      {reading.romaji && (
        <span className="text-[11px] font-normal text-gray-400 tracking-wide mt-0.5">
          {reading.romaji}
        </span>
      )}
    </span>
  );
}
