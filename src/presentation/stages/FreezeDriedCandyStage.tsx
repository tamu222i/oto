/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Candy, RefreshCw, Zap } from 'lucide-react';
import { FloorStage } from '../../domain/schemas/index.ts';

interface FreezeDriedCandyStageProps {
  floor: FloorStage;
  onInteract: (
    type: 'freeze_dried_candy',
    actionType: 'crack',
    x: number,
    y: number,
    intensity: number
  ) => void;
}

interface CandyItem {
  id: number;
  cracked: boolean;
  color: string;
  name: string;
}

const CANDY_PALETTES = [
  { color: 'from-pink-400 via-rose-300 to-pink-200', border: 'border-pink-300', name: 'サクラ' },
  { color: 'from-cyan-400 via-sky-300 to-blue-200', border: 'border-cyan-300', name: 'ソーダ' },
  { color: 'from-amber-400 via-yellow-300 to-yellow-100', border: 'border-amber-300', name: 'レモン' },
  { color: 'from-purple-400 via-fuchsia-300 to-pink-200', border: 'border-purple-300', name: 'グレープ' },
];

export const FreezeDriedCandyStage: React.FC<FreezeDriedCandyStageProps> = ({
  floor,
  onInteract,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [candies, setCandies] = useState<CandyItem[]>([]);

  const initCandies = () => {
    const list: CandyItem[] = [];
    for (let i = 0; i < 24; i++) {
      const p = CANDY_PALETTES[i % CANDY_PALETTES.length];
      list.push({
        id: i,
        cracked: false,
        color: p.color,
        name: p.name,
      });
    }
    setCandies(list);
  };

  useEffect(() => {
    initCandies();
  }, []);

  const crackCandy = (idx: number, clientX: number, clientY: number) => {
    const candy = candies[idx];
    if (!candy || candy.cracked) return;

    setCandies((prev) => {
      const next = [...prev];
      next[idx] = { ...candy, cracked: true };
      return next;
    });

    let normX = 0.5;
    let normY = 0.5;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      normX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      normY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    }

    onInteract('freeze_dried_candy', 'crack', normX, normY, 1.35);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const candyEl = target?.closest('[data-candy-index]');
      if (candyEl) {
        const idx = Number(candyEl.getAttribute('data-candy-index'));
        if (!isNaN(idx)) {
          crackCandy(idx, touch.clientX, touch.clientY);
        }
      }
    }
  };

  const crackedCount = candies.filter((c) => c.cracked).length;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center w-full max-w-2xl mx-auto p-4 select-none touch-none"
      onTouchStart={handleTouchStart}
    >
      {/* 操作ガイド */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2 text-xs md:text-sm text-pink-300 font-semibold bg-pink-950/60 px-3 py-1.5 rounded-full border border-pink-800/60">
          <Zap className="w-4 h-4 text-pink-400" />
          <span>サクサク・パキパキ！フリーズドライを粉砕</span>
        </div>

        <button
          onClick={initCandies}
          className="flex items-center gap-1.5 text-xs md:text-sm bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-200 px-3 py-1.5 rounded-full border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
          <span>キャンディ補充 ({crackedCount}/{candies.length})</span>
        </button>
      </div>

      {/* キャンディトレイ */}
      <div className="w-full bg-gradient-to-b from-pink-950/40 to-slate-900/80 p-5 rounded-3xl border-2 border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.2)]">
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4 justify-items-center">
          {candies.map((c, idx) => (
            <button
              key={c.id}
              data-candy-index={idx}
              onClick={(e) => crackCandy(idx, e.clientX, e.clientY)}
              disabled={c.cracked}
              className={`
                relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all duration-150 transform cursor-pointer flex items-center justify-center
                ${
                  c.cracked
                    ? 'bg-slate-900/60 border border-slate-800 shadow-inner scale-85 opacity-30 cursor-default'
                    : `bg-gradient-to-br ${c.color} border-2 border-white/60 shadow-[0_6px_16px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.8)] hover:scale-105 active:scale-90`
                }
              `}
            >
              {!c.cracked && (
                <>
                  <div className="absolute top-1.5 left-2 w-4 h-2 rounded-full bg-white/70 -rotate-30 pointer-events-none" />
                  <span className="text-[10px] font-black text-slate-800/80">{c.name}</span>
                </>
              )}
              {c.cracked && (
                <div className="w-4 h-4 text-slate-500 font-mono text-xs">💥</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
