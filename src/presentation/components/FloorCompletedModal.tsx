/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowUpCircle, X } from 'lucide-react';
import { TOWER_FLOORS } from '../../domain/entities/Floor.ts';

interface FloorCompletedModalProps {
  isOpen: boolean;
  unlockedFloorNumber: number | null;
  onClose: () => void;
  onAscend: () => void;
}

export const FloorCompletedModal: React.FC<FloorCompletedModalProps> = ({
  isOpen,
  unlockedFloorNumber,
  onClose,
  onAscend,
}) => {
  if (!isOpen || !unlockedFloorNumber) return null;

  const nextFloorData = TOWER_FLOORS.find((f) => f.floorNumber === unlockedFloorNumber) || TOWER_FLOORS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(251,191,36,0.3)] flex flex-col items-center text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* トロフィーアイコン */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
          <Sparkles className="w-8 h-8 text-slate-950" />
        </div>

        <div>
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
            FLOOR UNLOCKED!
          </span>
          <h2 className="text-xl font-black text-slate-100 mt-1">
            {nextFloorData.name} 到達！
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {nextFloorData.subtitle}
          </p>
        </div>

        {/* 新フロアの紹介 */}
        <div className="w-full p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-left space-y-2">
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {nextFloorData.description}
          </p>
          <div className="pt-2 border-t border-slate-700/50 flex items-center gap-1.5 text-[11px] text-amber-300">
            <span className="font-bold">ASMRトリガー:</span>
            <span className="text-slate-300">{nextFloorData.funFact}</span>
          </div>
        </div>

        {/* 昇降ボタン */}
        <button
          onClick={() => {
            onAscend();
            onClose();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowUpCircle className="w-5 h-5" />
          <span>エレベーターで {nextFloorData.floorNumber}F へ昇る！</span>
        </button>
      </div>
    </div>
  );
};
