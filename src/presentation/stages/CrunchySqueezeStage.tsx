/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Zap, RefreshCw, Flame } from 'lucide-react';
import { FloorStage } from '../../domain/schemas/index.ts';

interface CrunchySqueezeStageProps {
  floor: FloorStage;
  onInteract: (
    type: 'crunchy_squeeze',
    actionType: 'crack',
    x: number,
    y: number,
    intensity: number
  ) => void;
}

interface CrackLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const CrunchySqueezeStage: React.FC<CrunchySqueezeStageProps> = ({ floor, onInteract }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cracks, setCracks] = useState<CrackLine[]>([]);
  const [squeezeProgress, setSqueezeProgress] = useState(0); // 0 - 100%
  const [isPressing, setIsPressing] = useState(false);
  const [shatterCount, setShatterCount] = useState(0);
  const [currentColorIdx, setCurrentColorIdx] = useState(0);

  const colors = [
    { name: 'ローズクランチ', from: 'from-rose-500', via: 'via-pink-400', to: 'to-rose-300', border: 'border-rose-400' },
    { name: 'ハニカムクリスピー', from: 'from-amber-500', via: 'via-yellow-400', to: 'to-amber-300', border: 'border-amber-400' },
    { name: 'クリスタルアイス', from: 'from-cyan-500', via: 'via-sky-400', to: 'to-cyan-200', border: 'border-cyan-400' },
    { name: 'ミントキャンディ', from: 'from-emerald-500', via: 'via-teal-400', to: 'to-emerald-200', border: 'border-emerald-400' },
  ];

  const currentTheme = colors[currentColorIdx % colors.length];

  const handlePress = (clientX: number, clientY: number) => {
    setIsPressing(true);

    let normX = 0.5;
    let normY = 0.5;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      normX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      normY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    }

    const nextProgress = squeezeProgress + 20;

    // 亀裂（クラックライン）の追加
    const centerX = 160;
    const centerY = 160;
    const angle = Math.random() * Math.PI * 2;
    const length = 40 + Math.random() * 80;
    const x2 = centerX + Math.cos(angle) * length;
    const y2 = centerY + Math.sin(angle) * length;

    setCracks((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        x1: centerX + (Math.random() * 40 - 20),
        y1: centerY + (Math.random() * 40 - 20),
        x2,
        y2,
      },
    ]);

    if (nextProgress >= 100) {
      // 全壊シャッター！超快感クラッシュ
      onInteract('crunchy_squeeze', 'crack', normX, normY, 2.5);
      setSqueezeProgress(0);
      setCracks([]);
      setShatterCount((prev) => prev + 1);
      setCurrentColorIdx((prev) => prev + 1);
    } else {
      setSqueezeProgress(nextProgress);
      onInteract('crunchy_squeeze', 'crack', normX, normY, 1.2);
    }
  };

  const handleRelease = () => {
    setIsPressing(false);
  };

  const resetBall = () => {
    setSqueezeProgress(0);
    setCracks([]);
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-2xl mx-auto p-4 select-none touch-none">
      {/* 操作ガイド */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2 text-xs md:text-sm text-rose-300 font-semibold bg-rose-950/60 px-3 py-1.5 rounded-full border border-rose-800/60">
          <Zap className="w-4 h-4 text-rose-400" />
          <span>タップ/長押しでパキパキ連続破壊！</span>
        </div>

        <button
          onClick={resetBall}
          className="flex items-center gap-1.5 text-xs md:text-sm bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-200 px-3 py-1.5 rounded-full border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
          <span>リセット (粉砕数: {shatterCount})</span>
        </button>
      </div>

      {/* スクイーズ領域 */}
      <div
        ref={containerRef}
        className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-rose-950/30 to-slate-900/80 rounded-3xl border-2 border-rose-500/30 overflow-hidden flex flex-col items-center justify-center p-6 shadow-[0_0_35px_rgba(244,63,94,0.15)]"
      >
        {/* クラッキングプログレスバー */}
        <div className="w-48 bg-slate-800 rounded-full h-3 mb-6 p-0.5 border border-slate-700">
          <div
            className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full transition-all duration-150"
            style={{ width: `${squeezeProgress}%` }}
          />
        </div>

        {/* パキパキボール本体 */}
        <div
          onMouseDown={(e) => handlePress(e.clientX, e.clientY)}
          onMouseUp={handleRelease}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handlePress(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchEnd={handleRelease}
          className={`
            relative w-56 h-56 sm:w-64 sm:h-64 rounded-full cursor-pointer
            bg-gradient-to-br ${currentTheme.from} ${currentTheme.via} ${currentTheme.to}
            border-4 ${currentTheme.border} shadow-[0_15px_40px_rgba(244,63,94,0.4),inset_0_4px_16px_rgba(255,255,255,0.8),inset_0_-8px_20px_rgba(0,0,0,0.5)]
            flex items-center justify-center transform active:scale-95 transition-transform duration-75
            ${isPressing ? 'scale-90 rotate-1' : ''}
          `}
        >
          {/* 光沢 */}
          <div className="absolute top-5 left-10 w-16 h-8 rounded-full bg-white/60 -rotate-45 blur-[1px] pointer-events-none" />

          {/* SVG亀裂ライン */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {cracks.map((c) => (
              <line
                key={c.id}
                x1={c.x1}
                y1={c.y1}
                x2={c.x2}
                y2={c.y2}
                stroke="rgba(255, 255, 255, 0.95)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="filter drop-shadow-[0_0_3px_rgba(0,0,0,0.8)]"
              />
            ))}
          </svg>

          {/* 中央テキスト */}
          <div className="flex flex-col items-center pointer-events-none text-slate-900 font-black">
            <Flame className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
            <span className="text-sm font-extrabold text-white tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              CRACK ME!
            </span>
            <span className="text-xs text-white/90 drop-shadow">
              {squeezeProgress}% クラック
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
