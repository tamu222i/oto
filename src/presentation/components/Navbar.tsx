/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Volume2, TestTube2, Building2, Flame, Award } from 'lucide-react';
import { PlayerState, FloorStage } from '../../domain/schemas/index.ts';

interface NavbarProps {
  state: PlayerState;
  currentFloor: FloorStage;
  onOpenSettings: () => void;
  onOpenBddTests: () => void;
  onOpenElevator: () => void;
  onOpenBadges: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  currentFloor,
  onOpenSettings,
  onOpenBddTests,
  onOpenElevator,
  onOpenBadges,
}) => {
  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-2 z-40">
      {/* タワー階層＆フロア名 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenElevator}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 border border-sky-500/40 px-3 py-1.5 rounded-2xl active:scale-95 transition"
        >
          <Building2 className="w-4 h-4 text-sky-400" />
          <span className="font-extrabold text-sky-300 text-sm md:text-base">
            {currentFloor.floorNumber}F
          </span>
          <span className="text-xs text-slate-300 hidden sm:inline font-medium">
            {currentFloor.name.split(':')[1]?.trim() || currentFloor.name}
          </span>
        </button>

        {/* 癒やしエネルギー (Euphoria Points) */}
        <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-2xl">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold leading-none">癒やし度</span>
            <span className="text-sm font-black text-amber-300 leading-tight">
              {state.totalEuphoriaPoints.toLocaleString()} pt
            </span>
          </div>
        </div>
      </div>

      {/* ゾクゾク度 (Tingle Gauge) & コンボ */}
      <div className="flex items-center gap-2 flex-1 max-w-xs mx-2">
        <div className="w-full flex flex-col gap-0.5">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="flex items-center gap-1 text-rose-400">
              <Flame className={`w-3 h-3 ${state.isFeverMode ? 'text-amber-400 animate-bounce' : 'text-rose-400'}`} />
              {state.isFeverMode ? 'ASMR FEVER (3x)' : 'ゾクゾク度'}
            </span>
            <span className="text-slate-400">
              {state.comboCount > 1 ? `${state.comboCount} COMBO!` : `${Math.round(state.tingleScore)}%`}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/80">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                state.isFeverMode
                  ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-yellow-300 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-400 to-rose-500'
              }`}
              style={{ width: `${state.tingleScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* アクションボタン群 */}
      <div className="flex items-center gap-1.5">
        {/* 実績バッジ */}
        <button
          onClick={onOpenBadges}
          aria-label="実績バッジ"
          className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition border border-slate-700"
        >
          <Award className="w-4 h-4 text-amber-400" />
          {state.unlockedBadges.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {state.unlockedBadges.length}
            </span>
          )}
        </button>

        {/* BDDテストランナー */}
        <button
          onClick={onOpenBddTests}
          aria-label="BDD仕様検証テスト"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-300 text-xs font-semibold active:scale-95 transition"
        >
          <TestTube2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">BDDテスト</span>
        </button>

        {/* オーディオ＆立体音響設定 */}
        <button
          onClick={onOpenSettings}
          aria-label="音響設定"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition border border-slate-700"
        >
          <Volume2 className="w-4 h-4 text-sky-400" />
        </button>
      </div>
    </header>
  );
};
