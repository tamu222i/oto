/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, HandMetal } from 'lucide-react';
import { FloorStage } from '../../domain/schemas/index.ts';

interface Bubble {
  id: number;
  popped: boolean;
  isGolden: boolean;
}

interface BubbleWrapStageProps {
  floor: FloorStage;
  onInteract: (
    type: 'bubble_wrap',
    actionType: 'pop',
    x: number,
    y: number,
    intensity: number,
    meta?: { isGolden?: boolean }
  ) => void;
}

export const BubbleWrapStage: React.FC<BubbleWrapStageProps> = ({ floor, onInteract }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popEffects, setPopEffects] = useState<{ id: string; x: number; y: number; isGolden: boolean }[]>([]);

  // 40個のバブルグリッドを生成 (黄金バブルが約8%の確率で出現)
  const initSheet = () => {
    const list: Bubble[] = [];
    for (let i = 0; i < 48; i++) {
      list.push({
        id: i,
        popped: false,
        isGolden: Math.random() < 0.1,
      });
    }
    setBubbles(list);
  };

  useEffect(() => {
    initSheet();
  }, []);

  const popBubble = (index: number, clientX: number, clientY: number) => {
    const bubble = bubbles[index];
    if (!bubble || bubble.popped) return;

    // バブルを破裂済みに更新
    setBubbles((prev) => {
      const next = [...prev];
      next[index] = { ...bubble, popped: true };
      return next;
    });

    // 画面正規化座標 (0.0 - 1.0) の計算
    let normX = 0.5;
    let normY = 0.5;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      normX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      normY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    }

    onInteract(
      'bubble_wrap',
      'pop',
      normX,
      normY,
      bubble.isGolden ? 1.8 : 1.0,
      { isGolden: bubble.isGolden }
    );

    // ポップエフェクト
    const effectId = `${Date.now()}-${Math.random()}`;
    setPopEffects((prev) => [
      ...prev.slice(-10),
      { id: effectId, x: clientX, y: clientY, isGolden: bubble.isGolden },
    ]);
    setTimeout(() => {
      setPopEffects((prev) => prev.filter((e) => e.id !== effectId));
    }, 600);
  };

  // タブレット用マルチタッチ対応 (複数指での同時ポップ)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const bubbleEl = target?.closest('[data-bubble-index]');
      if (bubbleEl) {
        const idx = Number(bubbleEl.getAttribute('data-bubble-index'));
        if (!isNaN(idx)) {
          popBubble(idx, touch.clientX, touch.clientY);
        }
      }
    }
  };

  const poppedCount = bubbles.filter((b) => b.popped).length;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center w-full max-w-2xl mx-auto p-4 select-none touch-none"
      onTouchStart={handleTouchStart}
    >
      {/* 操作ガイド・バブル情報 */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2 text-xs md:text-sm text-sky-300 font-semibold bg-sky-950/60 px-3 py-1.5 rounded-full border border-sky-800/60">
          <HandMetal className="w-4 h-4 text-sky-400" />
          <span>タブレット複数指OK！指先で一斉プチプチ</span>
        </div>

        <button
          onClick={initSheet}
          className="flex items-center gap-1.5 text-xs md:text-sm bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-200 px-3 py-1.5 rounded-full border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          <span>シート補充 ({poppedCount}/{bubbles.length})</span>
        </button>
      </div>

      {/* プチプチシート本体 */}
      <div className="w-full bg-gradient-to-b from-sky-900/30 to-slate-900/60 backdrop-blur-md p-4 sm:p-6 rounded-3xl border-2 border-sky-500/30 shadow-[0_0_35px_rgba(56,189,248,0.15)]">
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2.5 sm:gap-3.5 justify-items-center">
          {bubbles.map((b, idx) => (
            <button
              key={b.id}
              data-bubble-index={idx}
              onClick={(e) => popBubble(idx, e.clientX, e.clientY)}
              disabled={b.popped}
              aria-label={`プチプチバブル ${idx + 1}`}
              className={`
                relative w-11 h-11 sm:w-13 sm:h-13 rounded-full transition-all duration-150 transform active:scale-90
                flex items-center justify-center
                ${
                  b.popped
                    ? 'bg-slate-800/50 border border-slate-700/40 shadow-inner scale-95 opacity-50 cursor-default'
                    : b.isGolden
                    ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 border-2 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse cursor-pointer'
                    : 'bg-gradient-to-tr from-sky-400/80 via-sky-300/90 to-cyan-100 border-2 border-sky-300/80 shadow-[0_4px_12px_rgba(56,189,248,0.4),inset_0_-2px_6px_rgba(14,116,144,0.6)] hover:brightness-110 cursor-pointer'
                }
              `}
            >
              {!b.popped && (
                <>
                  {/* 光沢ハイライト */}
                  <div className="absolute top-1.5 left-2 w-3.5 h-2 rounded-full bg-white/70 -rotate-45 pointer-events-none" />
                  {b.isGolden && (
                    <Sparkles className="w-4 h-4 text-amber-900 animate-spin" />
                  )}
                </>
              )}
              {b.popped && (
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900/60 shadow-inner" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 画面上の破裂パーティクル演出 */}
      {popEffects.map((eff) => (
        <div
          key={eff.id}
          className="fixed pointer-events-none z-50 animate-ping font-extrabold text-sm"
          style={{ left: eff.x - 14, top: eff.y - 14 }}
        >
          {eff.isGolden ? (
            <span className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,1)]">✨POPW!!</span>
          ) : (
            <span className="text-sky-300 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]">POP!</span>
          )}
        </div>
      ))}
    </div>
  );
};
