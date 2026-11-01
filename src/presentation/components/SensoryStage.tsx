/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FloorStage } from '../../domain/schemas/index.ts';
import { BubbleWrapStage } from '../stages/BubbleWrapStage.tsx';
import { ButterSqueezeStage } from '../stages/ButterSqueezeStage.tsx';
import { CrunchySqueezeStage } from '../stages/CrunchySqueezeStage.tsx';
import { SlimePokeStage } from '../stages/SlimePokeStage.tsx';
import { KineticSandStage } from '../stages/KineticSandStage.tsx';
import { SoapCarvingStage } from '../stages/SoapCarvingStage.tsx';
import { Sparkles, ArrowUpCircle } from 'lucide-react';

interface SensoryStageProps {
  currentFloor: FloorStage;
  currentFloorPoints: number;
  canAscend: boolean;
  onAscend: () => void;
  onInteract: (
    type: FloorStage['type'],
    actionType: 'pop' | 'squish' | 'crack' | 'poke' | 'stretch' | 'slice' | 'carve',
    x: number,
    y: number,
    intensity: number,
    meta?: { isGolden?: boolean; isCut?: boolean; isStretch?: boolean }
  ) => void;
}

export const SensoryStage: React.FC<SensoryStageProps> = ({
  currentFloor,
  currentFloorPoints,
  canAscend,
  onAscend,
  onInteract,
}) => {
  const targetPts = currentFloor.targetPoints;
  const progressPercent = Math.min(100, Math.round((currentFloorPoints / targetPts) * 100));

  const renderActiveStage = () => {
    switch (currentFloor.type) {
      case 'bubble_wrap':
        return <BubbleWrapStage floor={currentFloor} onInteract={onInteract} />;
      case 'butter_squeeze':
        return <ButterSqueezeStage floor={currentFloor} onInteract={onInteract} />;
      case 'crunchy_squeeze':
        return <CrunchySqueezeStage floor={currentFloor} onInteract={onInteract} />;
      case 'slime_poke':
        return <SlimePokeStage floor={currentFloor} onInteract={onInteract} />;
      case 'kinetic_sand':
        return <KineticSandStage floor={currentFloor} onInteract={onInteract} />;
      case 'soap_carving':
        return <SoapCarvingStage floor={currentFloor} onInteract={onInteract} />;
      default:
        return <BubbleWrapStage floor={currentFloor} onInteract={onInteract} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between w-full max-w-4xl mx-auto px-4 py-2 overflow-y-auto">
      {/* フロアヘッダー＆プログレス */}
      <div className="w-full flex flex-col items-center mb-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            {currentFloor.name}
          </h1>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {currentFloor.subtitle}
          </span>
        </div>

        {/* 階層クリア進捗バー */}
        <div className="w-full max-w-md flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              次フロア解禁まで
            </span>
            <span className="text-slate-200">
              <strong className="text-amber-300">{currentFloorPoints}</strong> / {targetPts} pt ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/80">
            <div
              className="bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 上の階へ昇るバナー (目標達成時) */}
        {canAscend && (
          <button
            onClick={onAscend}
            className="mt-1 flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition animate-bounce cursor-pointer"
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>エレベーター準備完了！次の階層へ昇る</span>
          </button>
        )}
      </div>

      {/* 触感ステージ本体 */}
      <div className="w-full flex-1 flex items-center justify-center">
        {renderActiveStage()}
      </div>

      {/* フッター豆知識 */}
      <div className="w-full max-w-xl text-center py-2 px-3 text-[11px] text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800/80 mb-2">
        <span className="text-sky-400 font-bold mr-1.5">ASMR音フェチの秘密:</span>
        <span>{currentFloor.funFact}</span>
      </div>
    </div>
  );
};
