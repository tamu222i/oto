/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Building2, ChevronRight, Lock, CheckCircle2, ArrowUpCircle } from 'lucide-react';
import { PlayerState } from '../../domain/schemas/index.ts';
import { TOWER_FLOORS } from '../../domain/entities/Floor.ts';

interface TowerElevatorProps {
  state: PlayerState;
  isOpen: boolean;
  onClose: () => void;
  onSelectFloor: (floorNum: number) => void;
  onAscend: () => void;
}

export const TowerElevator: React.FC<TowerElevatorProps> = ({
  state,
  isOpen,
  onClose,
  onSelectFloor,
  onAscend,
}) => {
  if (!isOpen) return null;

  const currentFloorKey = String(state.currentFloor);
  const currentFloorPts = state.floorPoints[currentFloorKey] || 0;
  const currentFloorData = TOWER_FLOORS.find((f) => f.floorNumber === state.currentFloor) || TOWER_FLOORS[0];
  const targetReached = currentFloorPts >= currentFloorData.targetPoints;
  const canAscend = state.highestUnlockedFloor > state.currentFloor || targetReached;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-sky-500/30 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sky-400" />
            <div>
              <h2 className="text-lg font-black text-slate-100">音フェチタワー・エレベーター</h2>
              <p className="text-xs text-slate-400">極上のASMRフロアを昇り天空を目指そう</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 現在の昇降状況 */}
        {canAscend && state.currentFloor < TOWER_FLOORS.length && (
          <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-sky-500/50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-sky-300">次階層のエレベーターが到着！</span>
              <span className="text-[11px] text-slate-300">目標達成！さらに上の階層へ昇れます</span>
            </div>
            <button
              onClick={() => {
                onAscend();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>上の階へ昇る</span>
            </button>
          </div>
        )}

        {/* フロア一覧 (最上階から下層へ並べるタワー順) */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2.5 pr-1">
          {[...TOWER_FLOORS].reverse().map((floor) => {
            const isUnlocked = state.highestUnlockedFloor >= floor.floorNumber;
            const isCurrent = state.currentFloor === floor.floorNumber;
            const floorPts = state.floorPoints[String(floor.floorNumber)] || 0;
            const isCompleted = floorPts >= floor.targetPoints;

            return (
              <div
                key={floor.floorNumber}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectFloor(floor.floorNumber);
                    onClose();
                  }
                }}
                className={`
                  relative p-3.5 rounded-2xl border transition-all flex items-center justify-between
                  ${
                    isCurrent
                      ? 'bg-sky-950/60 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)] ring-1 ring-sky-400'
                      : isUnlocked
                      ? 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 cursor-pointer'
                      : 'bg-slate-950/40 border-slate-800/40 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                      isCurrent
                        ? 'bg-sky-400 text-slate-950 shadow-md'
                        : isUnlocked
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    {isUnlocked ? `${floor.floorNumber}F` : <Lock className="w-4 h-4 text-slate-500" />}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-100 text-sm">
                        {floor.name}
                      </span>
                      {isCompleted && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {floor.subtitle}
                    </span>
                    {isUnlocked && (
                      <span className="text-[10px] text-sky-400/90 mt-0.5">
                        進捗: {floorPts} / {floor.targetPoints} pt
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCurrent ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-400 text-slate-950">
                      現在地
                    </span>
                  ) : isUnlocked ? (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  ) : (
                    <span className="text-[10px] text-slate-500">ロック</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
