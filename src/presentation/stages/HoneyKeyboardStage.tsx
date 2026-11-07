/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Droplets, Sparkles, RefreshCw } from 'lucide-react';
import { FloorStage } from '../../domain/schemas/index.ts';

interface HoneyKeyboardStageProps {
  floor: FloorStage;
  onInteract: (
    type: 'honey_keyboard',
    actionType: 'honey_drip' | 'type',
    x: number,
    y: number,
    intensity: number
  ) => void;
}

interface HoneyDrip {
  id: string;
  x: number;
  y: number;
  size: number;
}

const HONEY_KEYS = [
  ['🍯', '🐝', '💛', '🍯', '✨', '🍯'],
  ['H', 'O', 'N', 'E', 'Y', '🍯'],
  ['S', 'W', 'E', 'E', 'T', '💛'],
];

export const HoneyKeyboardStage: React.FC<HoneyKeyboardStageProps> = ({
  floor,
  onInteract,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drips, setDrips] = useState<HoneyDrip[]>([]);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const pressHoneyKey = (keyId: string, clientX: number, clientY: number) => {
    setPressedKey(keyId);
    setTimeout(() => setPressedKey(null), 250);

    let normX = 0.5;
    let normY = 0.5;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      normX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      normY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      // 蜜滴エフェクトの追加
      setDrips((prev) => [
        ...prev.slice(-15),
        {
          id: `${Date.now()}-${Math.random()}`,
          x: clientX - rect.left,
          y: clientY - rect.top,
          size: 24 + Math.random() * 20,
        },
      ]);
    }

    onInteract('honey_keyboard', 'honey_drip', normX, normY, 1.4);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const btn = target?.closest('[data-honey-key]');
      if (btn) {
        const id = btn.getAttribute('data-honey-key') || 'honey';
        pressHoneyKey(id, touch.clientX, touch.clientY);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center w-full max-w-2xl mx-auto p-4 select-none touch-none"
      onTouchStart={handleTouchStart}
    >
      {/* 操作ガイド */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2 text-xs md:text-sm text-amber-300 font-semibold bg-amber-950/60 px-3 py-1.5 rounded-full border border-amber-800/60">
          <Droplets className="w-4 h-4 text-amber-400" />
          <span>蜂蜜キーをプッシュ！濃厚な粘性じゅぽっ音</span>
        </div>

        <button
          onClick={() => setDrips([])}
          className="flex items-center gap-1.5 text-xs md:text-sm bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-200 px-3 py-1.5 rounded-full border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>蜜拭き取り</span>
        </button>
      </div>

      {/* ハチミツキーボード本体 (ハニカム六角形＋琥珀ジェルキー) */}
      <div className="relative w-full bg-gradient-to-b from-amber-950/60 via-stone-900 to-amber-950/80 p-5 sm:p-7 rounded-3xl border-2 border-amber-500/40 shadow-[0_0_45px_rgba(245,158,11,0.25)] flex flex-col items-center gap-3 overflow-hidden">
        {/* 背景のハニカムグリッド */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none" />

        {/* 蜜滴グラフィック */}
        {drips.map((d) => (
          <div
            key={d.id}
            className="absolute pointer-events-none rounded-full bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.6)] animate-pulse"
            style={{
              left: d.x - d.size / 2,
              top: d.y - d.size / 2,
              width: d.size,
              height: d.size * 1.25,
            }}
          >
            <div className="absolute top-1 left-2 w-2 h-1 bg-white/70 rounded-full" />
          </div>
        ))}

        {/* キーボード行 */}
        {HONEY_KEYS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-2.5 sm:gap-4 justify-center w-full z-10">
            {row.map((char, cIdx) => {
              const keyId = `k-${rIdx}-${cIdx}`;
              const isPressed = pressedKey === keyId;

              return (
                <button
                  key={keyId}
                  data-honey-key={keyId}
                  onClick={(e) => pressHoneyKey(keyId, e.clientX, e.clientY)}
                  className={`
                    relative w-12 h-14 sm:w-16 sm:h-18 rounded-2xl font-black text-sm sm:text-base transition-all duration-150
                    flex flex-col items-center justify-center cursor-pointer select-none
                    ${
                      isPressed
                        ? 'translate-y-2 bg-gradient-to-b from-amber-500 via-amber-600 to-yellow-600 scale-95 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]'
                        : 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-[0_8px_0_#b45309,0_12px_20px_rgba(245,158,11,0.4),inset_0_2px_4px_rgba(255,255,255,0.8)] hover:brightness-110 active:translate-y-2 active:shadow-[0_2px_0_#b45309]'
                    }
                  `}
                >
                  <span className="text-amber-950 font-black drop-shadow-sm">{char}</span>
                  {/* とろ〜り光沢ハイライト */}
                  <div className="absolute top-1.5 left-2 right-2 h-3 rounded-full bg-white/60 blur-[1px] pointer-events-none" />
                  {/* 下部の蜜溜まり */}
                  <div className="absolute -bottom-1 left-3 right-3 h-2 bg-amber-600/70 rounded-b-full blur-[0.5px] pointer-events-none" />
                </button>
              );
            })}
          </div>
        ))}

        {/* 濃厚ハチミツバー */}
        <div className="w-full flex justify-center mt-2 z-10">
          <button
            data-honey-key="honey-space"
            onClick={(e) => pressHoneyKey('honey-space', e.clientX, e.clientY)}
            className={`
              relative w-60 sm:w-80 h-12 sm:h-14 rounded-2xl font-black text-xs sm:text-sm transition-all duration-150
              flex items-center justify-center cursor-pointer select-none text-amber-950
              ${
                pressedKey === 'honey-space'
                  ? 'translate-y-2 bg-gradient-to-b from-amber-500 via-amber-600 to-yellow-600 scale-95 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]'
                  : 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 shadow-[0_8px_0_#b45309,0_12px_20px_rgba(245,158,11,0.4),inset_0_2px_4px_rgba(255,255,255,0.8)] hover:brightness-110 active:translate-y-2 active:shadow-[0_2px_0_#b45309]'
              }
            `}
          >
            <Sparkles className="w-4 h-4 text-amber-800 mr-2" />
            <span>🍯 濃厚ハニーディップ・スペース 🍯</span>
          </button>
        </div>
      </div>
    </div>
  );
};
