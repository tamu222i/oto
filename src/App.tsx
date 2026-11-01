/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTowerGame } from './presentation/hooks/useTowerGame.ts';
import { Navbar } from './presentation/components/Navbar.tsx';
import { SensoryStage } from './presentation/components/SensoryStage.tsx';
import { TowerElevator } from './presentation/components/TowerElevator.tsx';
import { AudioSettingsModal } from './presentation/components/AudioSettingsModal.tsx';
import { BddTestRunnerModal } from './presentation/components/BddTestRunnerModal.tsx';
import { FloorCompletedModal } from './presentation/components/FloorCompletedModal.tsx';
import { BadgesModal } from './presentation/components/BadgesModal.tsx';
import { Headphones, Sparkles, Volume2 } from 'lucide-react';

export default function App() {
  const {
    state,
    currentFloorInfo,
    triggerSensory,
    ascend,
    selectFloor,
    updateSettings,
    resetProgress,
    celebrationModalOpen,
    setCelebrationModalOpen,
    newlyUnlockedFloor,
    recentBadgeToast,
  } = useTowerGame();

  const [isElevatorOpen, setIsElevatorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBddTestsOpen, setIsBddTestsOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);

  const currentFloorPts = state.floorPoints[String(state.currentFloor)] || 0;
  const targetReached = currentFloorPts >= currentFloorInfo.targetPoints;
  const canAscend = state.highestUnlockedFloor > state.currentFloor || targetReached;

  const handleStartSound = () => {
    setAudioStarted(true);
    triggerSensory('bubble_wrap', 'pop', 0.5, 0.5, 0.7);
  };

  return (
    <div className={`relative w-screen h-screen flex flex-col bg-gradient-to-b ${currentFloorInfo.bgGradient} overflow-hidden select-none font-['M_PLUS_Rounded_1c']`}>
      {/* スタート画面 / 音声アンロックバナー */}
      {!audioStarted && (
        <div
          onClick={handleStartSound}
          className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center cursor-pointer animate-in fade-in"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-amber-300 p-0.5 shadow-2xl shadow-sky-500/30 mb-5 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Headphones className="w-10 h-10 text-sky-400" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mb-2">
            音フェチタワー - ASMR Sensory Tower
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            バタースクイーズ、パキパキ、プチプチ、スライム...
            <br />
            極上の触感と立体音響を味わいながらタワーをのぼろう。
          </p>

          <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition">
            <Volume2 className="w-5 h-5" />
            <span>タップしてスタート（イヤホン推奨🎧）</span>
          </div>
        </div>
      )}

      {/* トップナビゲーションバー */}
      <Navbar
        state={state}
        currentFloor={currentFloorInfo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBddTests={() => setIsBddTestsOpen(true)}
        onOpenElevator={() => setIsElevatorOpen(true)}
        onOpenBadges={() => setIsBadgesOpen(true)}
      />

      {/* メイン触感フロアステージ */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <SensoryStage
          currentFloor={currentFloorInfo}
          currentFloorPoints={currentFloorPts}
          canAscend={canAscend}
          onAscend={ascend}
          onInteract={(type, actionType, x, y, intensity, meta) => {
            if (!audioStarted) setAudioStarted(true);
            triggerSensory(type, actionType, x, y, intensity, meta);
          }}
        />
      </main>

      {/* バッジトースト通知 */}
      {recentBadgeToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-4 py-2 rounded-2xl font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{recentBadgeToast}</span>
        </div>
      )}

      {/* モーダル群 */}
      <TowerElevator
        state={state}
        isOpen={isElevatorOpen}
        onClose={() => setIsElevatorOpen(false)}
        onSelectFloor={selectFloor}
        onAscend={ascend}
      />

      <AudioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={state.audioSettings}
        onUpdateSettings={updateSettings}
        onResetProgress={resetProgress}
      />

      <BddTestRunnerModal
        isOpen={isBddTestsOpen}
        onClose={() => setIsBddTestsOpen(false)}
      />

      <FloorCompletedModal
        isOpen={celebrationModalOpen}
        unlockedFloorNumber={newlyUnlockedFloor}
        onClose={() => setCelebrationModalOpen(false)}
        onAscend={ascend}
      />

      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        unlockedBadgeIds={state.unlockedBadges}
      />
    </div>
  );
}
