/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Layers, RefreshCw, Scissors, Hand } from 'lucide-react';
import { FloorStage } from '../../domain/schemas/index.ts';

interface ButterSqueezeStageProps {
  floor: FloorStage;
  onInteract: (
    type: 'butter_squeeze',
    actionType: 'squish' | 'slice',
    x: number,
    y: number,
    intensity: number,
    meta?: { isCut?: boolean }
  ) => void;
}

interface CutMark {
  id: string;
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
}

export const ButterSqueezeStage: React.FC<ButterSqueezeStageProps> = ({ floor, onInteract }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [toolMode, setToolMode] = useState<'knife' | 'hand'>('knife');
  const [squishScale, setSquishScale] = useState({ x: 1, y: 1 });
  const [cuts, setCuts] = useState<CutMark[]>([]);
  const isDraggingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const soundThrottleRef = useRef(0);

  // バターを捏ねる・切るインタラクション
  const handleStart = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    lastPointRef.current = { x: clientX, y: clientY };
    performAction(clientX, clientY, 1.2);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const now = Date.now();
    if (now - soundThrottleRef.current < 90) return; // 連続サウンドのスロットル
    soundThrottleRef.current = now;

    performAction(clientX, clientY, 0.9);
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
    lastPointRef.current = null;
    setSquishScale({ x: 1, y: 1 });
  };

  const performAction = (clientX: number, clientY: number, intensity: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    const isCut = toolMode === 'knife';

    // バターの弾性変形
    const deformX = 1 + (Math.random() * 0.12 - 0.06);
    const deformY = 1 + (Math.random() * 0.12 - 0.06);
    setSquishScale({ x: deformX, y: deformY });

    // カット痕の追加
    if (isCut && lastPointRef.current) {
      const dx = clientX - lastPointRef.current.x;
      const dy = clientY - lastPointRef.current.y;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const length = Math.min(120, Math.max(30, Math.sqrt(dx * dx + dy * dy) * 1.5));

      setCuts((prev) => [
        ...prev.slice(-25),
        {
          id: `${Date.now()}-${Math.random()}`,
          x: clientX - rect.left,
          y: clientY - rect.top,
          angle,
          length,
          width: 8 + Math.random() * 6,
        },
      ]);
    }

    lastPointRef.current = { x: clientX, y: clientY };

    onInteract(
      'butter_squeeze',
      isCut ? 'slice' : 'squish',
      normX,
      normY,
      intensity,
      { isCut }
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const resetButter = () => {
    setCuts([]);
    setSquishScale({ x: 1, y: 1 });
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-2xl mx-auto p-4 select-none touch-none">
      {/* ツールバー */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setToolMode('knife')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold transition ${
              toolMode === 'knife'
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>バターナイフ</span>
          </button>
          <button
            onClick={() => setToolMode('hand')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold transition ${
              toolMode === 'hand'
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>指先スクイーズ</span>
          </button>
        </div>

        <button
          onClick={resetButter}
          className="flex items-center gap-1.5 text-xs md:text-sm bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-200 px-3 py-1.5 rounded-full border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>バター再生</span>
        </button>
      </div>

      {/* バター粘土ブロック */}
      <div
        ref={containerRef}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-amber-950/40 to-slate-900/80 rounded-3xl border-2 border-amber-500/30 overflow-hidden cursor-crosshair shadow-[0_0_35px_rgba(251,191,36,0.15)] flex items-center justify-center p-6"
      >
        {/* 背景テクスチャ */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* バター本体 (なめらかな直方体＋丸み) */}
        <div
          style={{
            transform: `scale(${squishScale.x}, ${squishScale.y})`,
            transition: isDraggingRef.current ? 'none' : 'transform 0.3s ease-out',
          }}
          className="relative w-4/5 h-4/5 max-w-md bg-gradient-to-br from-amber-200 via-amber-300 to-yellow-400 rounded-3xl shadow-[0_15px_35px_rgba(217,119,6,0.4),inset_0_4px_12px_rgba(255,255,255,0.7),inset_0_-8px_16px_rgba(180,83,9,0.4)] border-4 border-amber-100/90 overflow-hidden"
        >
          {/* なめらかな光沢ハイライト */}
          <div className="absolute top-4 left-6 right-6 h-8 bg-white/40 rounded-full blur-[2px]" />

          {/* バターの刻印 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30">
            <Layers className="w-16 h-16 text-amber-800 mb-1" />
            <span className="text-amber-900 font-extrabold text-lg tracking-wider">CREAMY BUTTER SLIME</span>
            <span className="text-amber-950 text-xs font-semibold">ドラッグしてナイフでスライス＆押し込み</span>
          </div>

          {/* カット痕 */}
          {cuts.map((cut) => (
            <div
              key={cut.id}
              className="absolute pointer-events-none rounded-full bg-gradient-to-b from-amber-600/70 via-amber-500/50 to-amber-200/90 shadow-inner"
              style={{
                left: cut.x - cut.length / 2,
                top: cut.y - cut.width / 2,
                width: cut.length,
                height: cut.width,
                transform: `rotate(${cut.angle}deg)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
