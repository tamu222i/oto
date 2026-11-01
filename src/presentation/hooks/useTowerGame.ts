/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TowerAggregate } from '../../domain/aggregates/TowerAggregate.ts';
import { AsmrAudioEngine } from '../../infrastructure/audio/AsmrAudioEngine.ts';
import { HapticService } from '../../infrastructure/haptics/HapticService.ts';
import { LocalStorageTowerRepository } from '../../infrastructure/storage/LocalStorageTowerRepository.ts';
import { TowerUseCases } from '../../application/TowerUseCases.ts';
import { PlayerState, SensoryType, AudioSettings } from '../../domain/schemas/index.ts';
import { ALL_BADGES } from '../../domain/entities/Badge.ts';

export function useTowerGame() {
  const repoRef = useRef(new LocalStorageTowerRepository());
  const useCasesRef = useRef<TowerUseCases | null>(null);

  // 初回初期化
  if (!useCasesRef.current) {
    const saved = repoRef.current.load();
    const aggregate = new TowerAggregate(saved || undefined);
    const audio = new AsmrAudioEngine(aggregate.getState().audioSettings);
    const haptic = new HapticService(aggregate.getState().audioSettings.hapticEnabled);
    useCasesRef.current = new TowerUseCases(aggregate, audio, haptic, repoRef.current);
  }

  const [state, setState] = useState<PlayerState>(() => useCasesRef.current!.getState());
  const [celebrationModalOpen, setCelebrationModalOpen] = useState(false);
  const [newlyUnlockedFloor, setNewlyUnlockedFloor] = useState<number | null>(null);
  const [recentBadgeToast, setRecentBadgeToast] = useState<string | null>(null);

  // 定期的なアイドル減衰タイマー (1秒ごと)
  useEffect(() => {
    const interval = setInterval(() => {
      if (useCasesRef.current) {
        useCasesRef.current.tick(1000);
        setState({ ...useCasesRef.current.getState() });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 触感インタラクション実行
  const triggerSensory = useCallback(
    (
      type: SensoryType,
      actionType: 'pop' | 'squish' | 'crack' | 'poke' | 'stretch' | 'slice' | 'carve',
      normalizedX: number,
      normalizedY: number,
      intensity: number = 1.0,
      audioMeta?: { isGolden?: boolean; isCut?: boolean; isStretch?: boolean }
    ) => {
      if (!useCasesRef.current) return;

      const result = useCasesRef.current.interact(
        {
          id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          sensoryType: type,
          actionType,
          x: normalizedX,
          y: normalizedY,
          intensity,
          combo: state.comboCount + 1,
          timestamp: Date.now(),
        },
        audioMeta
      );

      const newState = { ...useCasesRef.current.getState() };
      setState(newState);

      // 新しいフロアが解放されたとき
      if (result.unlockedNewFloor) {
        const nextFloorNum = newState.highestUnlockedFloor;
        setNewlyUnlockedFloor(nextFloorNum);
        setCelebrationModalOpen(true);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }

      // 新規バッジ獲得
      if (result.newBadges.length > 0) {
        const badgeObj = ALL_BADGES.find((b) => b.id === result.newBadges[0]);
        if (badgeObj) {
          setRecentBadgeToast(`🏅 実績獲得: ${badgeObj.name}`);
          setTimeout(() => setRecentBadgeToast(null), 3500);
        }
      }
    },
    [state.comboCount]
  );

  // エレベーターで次階層へ昇る
  const ascend = useCallback(() => {
    if (!useCasesRef.current) return;
    const ok = useCasesRef.current.ascend();
    if (ok) {
      setState({ ...useCasesRef.current.getState() });
      setCelebrationModalOpen(false);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.4 },
        });
      } catch {
        // ignore
      }
    }
  }, []);

  // 解放済みフロアへの移動
  const selectFloor = useCallback((floorNum: number) => {
    if (!useCasesRef.current) return;
    const ok = useCasesRef.current.selectFloor(floorNum);
    if (ok) {
      setState({ ...useCasesRef.current.getState() });
    }
  }, []);

  // 設定更新
  const updateSettings = useCallback((settings: Partial<AudioSettings>) => {
    if (!useCasesRef.current) return;
    useCasesRef.current.updateSettings(settings);
    setState({ ...useCasesRef.current.getState() });
  }, []);

  // リセット
  const resetProgress = useCallback(() => {
    if (!useCasesRef.current) return;
    useCasesRef.current.reset();
    setState({ ...useCasesRef.current.getState() });
  }, []);

  return {
    state,
    currentFloorInfo: useCasesRef.current!.getCurrentFloorInfo(),
    triggerSensory,
    ascend,
    selectFloor,
    updateSettings,
    resetProgress,
    celebrationModalOpen,
    setCelebrationModalOpen,
    newlyUnlockedFloor,
    recentBadgeToast,
  };
}
