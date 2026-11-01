/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, X, Sparkles, Layers, Zap, Flame, Crown } from 'lucide-react';
import { ALL_BADGES } from '../../domain/entities/Badge.ts';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedBadgeIds: string[];
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  unlockedBadgeIds,
}) => {
  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-amber-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-rose-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-yellow-300" />;
      default:
        return <Award className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-slate-100">
              音フェチ実績バッジ ({unlockedBadgeIds.length} / {ALL_BADGES.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  isUnlocked
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-800/30 border-slate-800 opacity-40'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                    isUnlocked
                      ? 'bg-amber-500/20 border-amber-400/50 shadow-md'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  {getIcon(badge.icon)}
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-200">
                      {badge.name}
                    </span>
                    {isUnlocked && (
                      <span className="text-[10px] font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-700/50">
                        獲得済
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5">
                    {badge.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
