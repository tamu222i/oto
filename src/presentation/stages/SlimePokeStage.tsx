/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Droplet, Sparkles, RefreshCw, Move } from 'lucide-react';
import { FloorStage } from '../../domain/schemas/index.ts';

interface SlimePokeStageProps {
  floor: FloorStage;
  onInteract: (
    type: 'slime_poke',
    actionType: 'poke' | 'stretch',
    x: number,
    y: number,
    intensity: number,
    meta?: { isStretch?: boolean }
  ) => void;
}

interface SlimeDimple {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface SlimeBubble {
  id: string;
  x: number;
  y: number;
  r: number;
}

export const SlimePokeStage: React.FC<SlimePokeStageProps> = ({ floor, onInteract }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimples, setDimples] = useState<SlimeDimple[]>([]);
  const [bubbles, setBubbles] = useState<SlimeBubble[]>([]);
  const [isStretching, setIsStretching] = useState(false);
  const [stretchOffset, setStretchOffset] = useState({ x: 0, y: 0 });
  const [theme, setTheme] = useState<'emerald' | 'bubblegum' | 'ocean' | 'glitter'>('emerald');

  const themes = {
    emerald: { bg: 'from-emerald-400 via-teal-300 to-green-200', border: 'border-emerald-300/80', glow: 'rgba(16,185,129,0.3)' },
    bubblegum: { bg: 'from-pink-400 via-rose-300 to-fuchsia-200', border: 'border-pink-300/80', glow: 'rgba(244,63,94,0.3)' },
    ocean: { bg: 'from-cyan-400 via-sky-300 to-blue-200', border: 'border-cyan-300/80', glow: 'rgba(6,182,212,0.3)' },
    glitter: { bg: 'from-purple-400 via-indigo-300 to-violet-200', border: 'border-purple-300/80', glow: 'rgba(168,85,247,0.3)' },
  };

  const currentTheme = themes[theme];

  // スライム内の気泡を自然発生
  useEffect(() => {
    const initBubbles = Array.from({ length: 12 }, (_, i) => ({
      id: `b-${i}`,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      r: 8 + Math.random() * 14,
    }));
    setBubbles(initBubbles);
  }, [theme]);

  // ディンプルの時間減衰（スライムがゆっくり元の滑らかさに戻る）
  useEffect(() => {
    const timer = setInterval(() => {
      setDimples((prev) =>
        prev
          .map((d) => ({ ...d, opacity: d.opacity - 0.08 }))
          .filter((d) => d.opacity > 0)
      );
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handlePoke = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const normX = Math.max(0, Math.min(1, x / rect.width));
    const normY = Math.max(0, Math.min(1, y / rect.height));

    // 気泡の近くなら気泡バースト！
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;
    const hitBubble = bubbles.find((b) => Math.hypot(b.x - pctX, b.y - pctY) < 10);

    if (hitBubble) {
      setBubbles((prev) => prev.filter((b) => b.id !== hitBubble.id));
      onInteract('slime_poke', 'poke', normX, normY, 1.8);
    } else {
      onInteract('slime_poke', 'poke', normX, normY, 1.1);
    }

    // 指の窪み (ポーク穴)
    setDimples((prev) => [
      ...prev.slice(-15),
      {
        id: `${Date.now()}-${Math.random()}`,
        x,
        y,
        size: 38 + Math.random() * 16,
        opacity: 0.9,
      },
    ]);
  };

  // タブレット用マルチタッチ対応 (複数指でのポーク)
  const handleTouchStart = (e: React.TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      handlePoke(e.touches[i].clientX, e.touches[i].clientY);
    }
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsStretching(true);
    handlePoke(clientX, clientY);
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isStretching || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setStretchOffset({
      x: (clientX - rect.left - cx) * 0.15,
      y: (clientY - rect.top - cy) * 0.15,
    });
  };

  const handleDragEnd = () => {
    if (isStretching) {
      onInteract('slime_poke', 'stretch', 0.5, 0.5, 1.4, { isStretch: true });
    }
    setIsStretching(false);
    setStretchOffset({ x: 0, y: 0 });
  };

  const resetSlime = () => {
    setDimples([]);
    const freshBubbles = Array.from({ length: 14 }, (_, i) => ({
      id: `b-${Date.now()}-${i}`,
      x: 18 + Math.random() * 64,
      y: 18 + Math.random() * 64,
      r: 8 + Math.random() * 14,
    }));
    setBubbles(freshBubbles);
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-2xl mx-auto p-4 select-none touch-none">
      {/* テーマ＆リフレッシュ */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTheme('emerald')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${theme === 'emerald' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}
          >
            エメラルド
          </button>
          <button
            onClick={() => setTheme('bubblegum')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${theme === 'bubblegum' ? 'bg-pink-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}
          >
            バブルガム
          </button>
          <button
            onClick={() => setTheme('ocean')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${theme === 'ocean' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}
          >
            オーシャン
          </button>
          <button
            onClick={() => setTheme('glitter')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${theme === 'glitter' ? 'bg-purple-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}
          >
            グリッター
          </button>
        </div>

        <button
          onClick={resetSlime}
          className="flex items-center gap-1.5 text-xs md:text-sm bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-200 px-3 py-1.5 rounded-full border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>気泡再生</span>
        </button>
      </div>

      {/* スライムボウル */}
      <div
        ref={containerRef}
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
        onMouseUp={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={(e) => {
          if (e.touches.length > 0) handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handleDragEnd}
        className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-emerald-950/30 to-slate-900/80 rounded-3xl border-2 border-emerald-500/30 overflow-hidden flex items-center justify-center p-6 cursor-pointer shadow-[0_0_35px_rgba(16,185,129,0.15)]"
      >
        {/* スライム液塊 */}
        <div
          style={{
            transform: `translate(${stretchOffset.x}px, ${stretchOffset.y}px)`,
            transition: isStretching ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
          className={`
            relative w-5/6 h-5/6 rounded-[45%_55%_60%_40%/50%_45%_55%_50%]
            bg-gradient-to-br ${currentTheme.bg}
            border-4 ${currentTheme.border}
            shadow-[0_15px_40px_rgba(0,0,0,0.5),inset_0_8px_20px_rgba(255,255,255,0.7),inset_0_-12px_24px_rgba(0,0,0,0.3)]
            overflow-hidden
          `}
        >
          {/* 水滴光沢ハイライト */}
          <div className="absolute top-6 left-12 w-24 h-12 bg-white/60 rounded-full blur-[2px] -rotate-12" />
          <div className="absolute top-10 right-14 w-12 h-6 bg-white/40 rounded-full blur-[1px] rotate-12" />

          {/* スライム内部の気泡 */}
          {bubbles.map((b) => (
            <div
              key={b.id}
              className="absolute rounded-full border border-white/60 bg-white/20 shadow-inner animate-pulse"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.r * 2}px`,
                height: `${b.r * 2}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="absolute top-1 left-1.5 w-2 h-1 bg-white/80 rounded-full" />
            </div>
          ))}

          {/* 指先ポーク穴 (ディンプル) */}
          {dimples.map((d) => (
            <div
              key={d.id}
              className="absolute pointer-events-none rounded-full bg-slate-900/40 shadow-[inset_0_4px_8px_rgba(0,0,0,0.7),0_2px_4px_rgba(255,255,255,0.3)]"
              style={{
                left: d.x - d.size / 2,
                top: d.y - d.size / 2,
                width: d.size,
                height: d.size,
                opacity: d.opacity,
              }}
            />
          ))}

          {/* 中央テキスト */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
            <Droplet className="w-12 h-12 text-teal-900 mb-1" />
            <span className="text-teal-950 font-black text-sm tracking-wider">SLIME POKE & POP</span>
            <span className="text-teal-950 text-xs font-bold">突いてジュポッ音 / 気泡をタップ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
