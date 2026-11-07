/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Sparkles, Volume2, RotateCcw } from 'lucide-react';
import { FloorStage } from '../../domain/schemas/index.ts';

interface MechanicalKeyboardStageProps {
  floor: FloorStage;
  onInteract: (
    type: 'mechanical_keyboard',
    actionType: 'type',
    x: number,
    y: number,
    intensity: number,
    meta?: { isSpacebar?: boolean }
  ) => void;
}

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const MechanicalKeyboardStage: React.FC<MechanicalKeyboardStageProps> = ({
  floor,
  onInteract,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const [typedBuffer, setTypedBuffer] = useState<string>('THOCK ');
  const [wpm, setWpm] = useState(60);

  const triggerKey = (keyChar: string, clientX?: number, clientY?: number) => {
    setActiveKeys((prev) => ({ ...prev, [keyChar]: true }));
    setTimeout(() => {
      setActiveKeys((prev) => ({ ...prev, [keyChar]: false }));
    }, 120);

    let normX = 0.5;
    let normY = 0.5;
    if (clientX !== undefined && clientY !== undefined && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      normX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      normY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    }

    const isSpace = keyChar === 'SPACE';
    onInteract(
      'mechanical_keyboard',
      'type',
      normX,
      normY,
      isSpace ? 1.4 : 1.0,
      { isSpacebar: isSpace }
    );

    setTypedBuffer((prev) => (prev + (isSpace ? ' ' : keyChar)).slice(-22));
    setWpm((prev) => Math.min(140, prev + 2));
  };

  // PC物理キーボード入力対応
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.repeat) return;
      const keyUpper = e.key.toUpperCase();
      if (keyUpper === ' ') {
        e.preventDefault();
        triggerKey('SPACE');
      } else if (/^[A-Z0-9]$/.test(keyUpper)) {
        triggerKey(keyUpper);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center w-full max-w-2xl mx-auto p-4 select-none touch-none"
    >
      {/* 操作ガイド＆タイピングバッファ */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2 text-xs md:text-sm text-indigo-300 font-semibold bg-indigo-950/60 px-3 py-1.5 rounded-full border border-indigo-800/60">
          <Keyboard className="w-4 h-4 text-indigo-400" />
          <span>画面タップ または PCキーボードでタイピング！</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
          <span className="text-slate-400 font-mono">打鍵表示:</span>
          <span className="text-indigo-300 font-mono font-bold tracking-wider">
            {typedBuffer || '...'}
          </span>
        </div>
      </div>

      {/* キーボード本体 (レトロ・クリームPBTキーキャップ風) */}
      <div className="w-full bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 p-4 sm:p-6 rounded-3xl border-2 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col items-center gap-2.5 sm:gap-3">
        {/* レトロ銘板 */}
        <div className="w-full flex justify-between items-center px-2 mb-1">
          <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">
            CREAMY LUBED LINEAR SWITCHES • 62g
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-bold text-emerald-400">THOCK ACTIVE</span>
          </div>
        </div>

        {/* キー行 1〜3 */}
        {KEY_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1.5 sm:gap-2 justify-center w-full">
            {row.map((char) => {
              const isActive = activeKeys[char];
              return (
                <button
                  key={char}
                  onClick={(e) => triggerKey(char, e.clientX, e.clientY)}
                  className={`
                    relative w-9 h-11 sm:w-12 sm:h-14 rounded-xl font-mono font-black text-xs sm:text-sm transition-all duration-75
                    flex items-center justify-center cursor-pointer select-none
                    ${
                      isActive
                        ? 'translate-y-1 bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-[0_1px_2px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(0,0,0,0.4)]'
                        : 'bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 text-slate-800 shadow-[0_4px_0_#94a3b8,0_6px_10px_rgba(0,0,0,0.4)] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#94a3b8]'
                    }
                  `}
                >
                  <span className="drop-shadow-sm">{char}</span>
                  {/* キーキャップの立体面 */}
                  <div className="absolute top-1 left-1.5 right-1.5 h-2 rounded-t-lg bg-white/40 pointer-events-none" />
                </button>
              );
            })}
          </div>
        ))}

        {/* スペースバー行 */}
        <div className="flex gap-2 justify-center w-full mt-1">
          <button
            onClick={(e) => triggerKey('SPACE', e.clientX, e.clientY)}
            className={`
              relative w-48 sm:w-64 h-11 sm:h-14 rounded-xl font-mono font-black text-xs sm:text-sm transition-all duration-75
              flex items-center justify-center cursor-pointer select-none
              ${
                activeKeys['SPACE']
                  ? 'translate-y-1 bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-[0_1px_2px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(0,0,0,0.4)]'
                  : 'bg-gradient-to-b from-indigo-200 via-indigo-300 to-indigo-400 text-indigo-950 shadow-[0_4px_0_#6366f1,0_6px_10px_rgba(0,0,0,0.4)] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#6366f1]'
              }
            `}
          >
            <span>── SPACE (THOCK) ──</span>
            <div className="absolute top-1 left-2 right-2 h-2 rounded-t-lg bg-white/40 pointer-events-none" />
          </button>
        </div>
      </div>
    </div>
  );
};
