/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Users, X, Lock, Check } from 'lucide-react';
import { Character, PlayerState } from '../../domain/schemas/index.ts';
import { ALL_CHARACTERS } from '../../domain/entities/Character.ts';

interface CharacterCompanionProps {
  selectedCharacter: Character;
  state: PlayerState;
  onSelectCharacter: (id: string) => void;
  recentQuote?: string;
  isFever: boolean;
}

export const CharacterCompanion: React.FC<CharacterCompanionProps> = ({
  selectedCharacter,
  state,
  onSelectCharacter,
  recentQuote,
  isFever,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const charId = selectedCharacter.id;
  const level = state.characterLevels[charId] || 1;
  const exp = state.characterExp[charId] || 0;
  const expToNext = level * 200;
  const expPercent = Math.min(100, Math.round((exp / expToNext) * 100));

  // デフォルトセリフ
  const displayQuote =
    recentQuote ||
    (isFever
      ? selectedCharacter.feverQuotes[0]
      : selectedCharacter.reactionQuotes[0]);

  return (
    <>
      {/* 画面上のキャラコンパニオンバナー */}
      <div className="w-full max-w-xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 my-1 shadow-lg">
        {/* アバターとセリフ */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => setModalOpen(true)}
            title="なかまの切り替え"
            className={`
              relative w-11 h-11 rounded-2xl bg-gradient-to-tr ${selectedCharacter.avatarColor}
              flex items-center justify-center shadow-md border-2 border-white/60 active:scale-95 transition-transform
              ${isFever ? 'animate-bounce' : 'animate-pulse'}
            `}
          >
            <span className="text-base font-black text-slate-900">
              {selectedCharacter.moodEmoji}
            </span>
            <span className="absolute -bottom-1 -right-1 bg-slate-900 text-[9px] font-black text-amber-300 px-1 rounded-full border border-slate-700">
              Lv.{level}
            </span>
          </button>

          {/* セリフ吹き出し */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-200">
                {selectedCharacter.name}
              </span>
              <span className="text-[10px] font-medium text-amber-300/90 bg-amber-950/60 px-1.5 py-0.5 rounded-full border border-amber-800/50">
                {selectedCharacter.bonusDescription}
              </span>
            </div>

            <div className="relative mt-0.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60 text-[11px] text-slate-200 truncate flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">&ldquo;{displayQuote}&rdquo;</span>
            </div>
          </div>
        </div>

        {/* なかま切り替えボタン */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs font-bold border border-slate-700 transition shrink-0"
        >
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">なかま変更</span>
        </button>
      </div>

      {/* キャラクター選択モーダル */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <div>
                  <h2 className="text-base font-black text-slate-100">
                    音フェチなかま選択
                  </h2>
                  <p className="text-xs text-slate-400">
                    タワーを一緒に登る相棒を選ぼう
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {ALL_CHARACTERS.map((char) => {
                const isSelected = char.id === selectedCharacter.id;
                const isUnlocked = state.highestUnlockedFloor >= char.unlockRequiredFloor;
                const charLvl = state.characterLevels[char.id] || 1;

                return (
                  <div
                    key={char.id}
                    onClick={() => {
                      if (isUnlocked) {
                        onSelectCharacter(char.id);
                        setModalOpen(false);
                      }
                    }}
                    className={`
                      relative p-3.5 rounded-2xl border transition-all flex items-center justify-between
                      ${
                        isSelected
                          ? 'bg-sky-950/60 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] ring-1 ring-sky-400'
                          : isUnlocked
                          ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 cursor-pointer'
                          : 'bg-slate-950/40 border-slate-800/40 opacity-40 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${char.avatarColor} flex items-center justify-center text-xl font-black text-slate-900 border-2 border-white/60 shadow-md`}
                      >
                        {isUnlocked ? char.moodEmoji : <Lock className="w-5 h-5 text-slate-700" />}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-100">
                            {char.name}
                          </span>
                          {isUnlocked && (
                            <span className="text-[10px] font-bold text-amber-300">
                              Lv.{charLvl}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {char.title}
                        </span>
                        <span className="text-[10px] text-sky-400 font-semibold mt-0.5">
                          {char.bonusDescription}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[11px] font-black text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-full border border-sky-500/50">
                          <Check className="w-3.5 h-3.5" /> 選択中
                        </span>
                      ) : isUnlocked ? (
                        <button className="text-xs font-bold text-slate-300 px-3 py-1 rounded-xl bg-slate-700 hover:bg-slate-600">
                          選ぶ
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold">
                          {char.unlockRequiredFloor}Fで解禁
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
