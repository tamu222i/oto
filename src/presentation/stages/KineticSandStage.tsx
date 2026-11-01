/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Scissors, RefreshCw, Sparkles } from 'lucide-react';
import { FloorStage } from '../../domain/schemas/index.ts';

interface KineticSandStageProps {
  floor: FloorStage;
  onInteract: (
    type: 'kinetic_sand',
    actionType: 'slice',
    x: number,
    y: number,
    intensity: number
  ) => void;
}

interface SandSlice {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fallOffset: number;
}

export const KineticSandStage: React.FC<KineticSandStageProps> = ({ floor, onInteract }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [slices, setSlices] = useState<SandSlice[]>([]);
  const [sliceCount, setSliceCount] = useState(0);

  const handleSlice = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const normX = Math.max(0, Math.min(1, x / rect.width));
    const normY = Math.max(0, Math.min(1, y / rect.height));

    onInteract('kinetic_sand', 'slice', normX, normY, 1.3);

    // スライス片がパラパラと落ちる演出
    setSlices((prev) => [
      ...prev.slice(-20),
      {
        id: `${Date.now()}-${Math.random()}`,
        x: Math.max(20, Math.min(rect.width - 60, x - 25)),
        y,
        width: 50 + Math.random() * 40,
        height: 14 + Math.random() * 10,
        fallOffset: 30 + Math.random() * 40,
      },
    ]);
    setSliceCount((prev) => prev + 1);
  };

  const resetSand = () => {
    setSlices([]);
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-2xl mx-auto p-4 select-none touch-none">
      {/* 操作ガイド */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2 text-xs md:text-sm text-purple-300 font-semibold bg-purple-950/60 px-3 py-1.5 rounded-full border border-purple-800/60">
          <Scissors className="w-4 h-4 text-purple-400" />
          <span>タップ/スワイプで砂ブロックをザクザクスライス！</span>
        </div>

        <button
          onClick={resetSand}
          className="flex items-center gap-1.5 text-xs md:text-sm bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-200 px-3 py-1.5 rounded-full border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
          <span>砂再生 (カット数: {sliceCount})</span>
        </button>
      </div>

      {/* サンドボックス領域 */}
      <div
        ref={containerRef}
        onClick={(e) => handleSlice(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) handleSlice(e.touches[0].clientX, e.touches[0].clientY);
        }}
        className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-purple-950/30 to-slate-900/80 rounded-3xl border-2 border-purple-500/30 overflow-hidden flex flex-col items-center justify-center p-6 cursor-crosshair shadow-[0_0_35px_rgba(168,85,247,0.15)]"
      >
        {/* キネティックサンドタワー/ブロック */}
        <div className="relative w-4/5 h-4/5 max-w-md bg-gradient-to-b from-purple-400 via-fuchsia-500 to-indigo-600 rounded-3xl border-4 border-purple-300 shadow-[0_15px_35px_rgba(168,85,247,0.4),inset_0_4px_16px_rgba(255,255,255,0.6)] overflow-hidden flex items-center justify-center">
          {/* 微細な砂粒テクスチャ */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:6px_6px]" />

          {/* 中央テキスト */}
          <div className="flex flex-col items-center pointer-events-none opacity-40">
            <Sparkles className="w-12 h-12 text-white mb-1" />
            <span className="text-white font-black text-sm tracking-widest">KINETIC SAND CRUNCH</span>
            <span className="text-white text-xs font-bold">クリックしてサクサクスライス</span>
          </div>

          {/* 落ちていくスライスカット片 */}
          {slices.map((s) => (
            <div
              key={s.id}
              className="absolute pointer-events-none rounded-lg bg-gradient-to-b from-purple-200 to-fuchsia-400 border border-purple-100 shadow-md transform transition-all duration-300 translate-y-3"
              style={{
                left: s.x,
                top: s.y,
                width: s.width,
                height: s.height,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
