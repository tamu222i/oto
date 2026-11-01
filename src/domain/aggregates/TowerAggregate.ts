/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerState, PlayerStateSchema, InteractionEvent, AudioSettings } from '../schemas/index.ts';
import { TingleLevel } from '../value-objects/TingleLevel.ts';
import { TOWER_FLOORS } from '../entities/Floor.ts';

export class TowerAggregate {
  private state: PlayerState;

  constructor(initialState?: Partial<PlayerState>) {
    const defaultState: PlayerState = {
      currentFloor: 1,
      highestUnlockedFloor: 1,
      totalEuphoriaPoints: 0,
      floorPoints: { '1': 0 },
      tingleScore: 0,
      isFeverMode: false,
      comboCount: 0,
      lastInteractionTime: Date.now(),
      audioSettings: {
        masterVolume: 0.85,
        stereoPanningEnabled: true,
        hapticEnabled: true,
        reverbAmount: 0.25,
        ambientSound: 'none',
        ambientVolume: 0.3,
      },
      unlockedBadges: [],
    };

    const merged = { ...defaultState, ...initialState };
    this.state = PlayerStateSchema.parse(merged);
  }

  getState(): Readonly<PlayerState> {
    return { ...this.state };
  }

  getCurrentFloorInfo() {
    return TOWER_FLOORS.find(f => f.floorNumber === this.state.currentFloor) || TOWER_FLOORS[0];
  }

  getCurrentFloorPoints(): number {
    return this.state.floorPoints[String(this.state.currentFloor)] || 0;
  }

  isCurrentFloorTargetReached(): boolean {
    const currentInfo = this.getCurrentFloorInfo();
    const pts = this.getCurrentFloorPoints();
    return pts >= currentInfo.targetPoints;
  }

  canAscendToNextFloor(): boolean {
    const nextFloor = this.state.currentFloor + 1;
    if (nextFloor > TOWER_FLOORS.length) return false;
    return this.state.highestUnlockedFloor >= nextFloor || this.isCurrentFloorTargetReached();
  }

  /**
   * 触感アクション処理 (コア集約メソッド)
   */
  interact(event: InteractionEvent): {
    pointsEarned: number;
    newCombo: number;
    isFeverActivated: boolean;
    floorTargetReached: boolean;
    unlockedNewFloor: boolean;
    newBadges: string[];
  } {
    const now = Date.now();
    const timeSinceLast = now - this.state.lastInteractionTime;

    // コンボ計算 (2.5秒以内のタップでコンボ継続)
    let combo = this.state.comboCount;
    if (timeSinceLast < 2500) {
      combo += 1;
    } else {
      combo = 1;
    }

    // ゾクゾク度 (Tingle) 計算
    const tingle = new TingleLevel(this.state.tingleScore);
    const tingleBoost = Math.min(8, (2 + combo * 0.4) * event.intensity);
    const updatedTingle = tingle.add(tingleBoost);

    let isFever = this.state.isFeverMode;
    let feverJustActivated = false;

    if (updatedTingle.isFeverReady() && !this.state.isFeverMode) {
      isFever = true;
      feverJustActivated = true;
    }

    const tingleMultiplier = updatedTingle.getMultiplier();
    const comboMultiplier = 1 + Math.min(2.0, combo * 0.05);

    // 基礎点 × 強度 × ゾクゾク倍率 × コンボ倍率
    const basePts = 5;
    const pointsEarned = Math.round(basePts * event.intensity * tingleMultiplier * comboMultiplier);

    // フロアポイント更新
    const floorKey = String(this.state.currentFloor);
    const currentFloorPts = (this.state.floorPoints[floorKey] || 0) + pointsEarned;
    const newFloorPoints = {
      ...this.state.floorPoints,
      [floorKey]: currentFloorPts,
    };

    const newTotalPoints = this.state.totalEuphoriaPoints + pointsEarned;

    // 次のフロアのアンロック判定
    let highestUnlocked = this.state.highestUnlockedFloor;
    let unlockedNewFloor = false;
    const currentFloorInfo = this.getCurrentFloorInfo();
    if (currentFloorPts >= currentFloorInfo.targetPoints) {
      const nextFloor = this.state.currentFloor + 1;
      if (nextFloor <= TOWER_FLOORS.length && highestUnlocked < nextFloor) {
        highestUnlocked = nextFloor;
        unlockedNewFloor = true;
      }
    }

    // バッジ解放判定
    const newBadges: string[] = [];
    const checkBadge = (id: string, condition: boolean) => {
      if (condition && !this.state.unlockedBadges.includes(id)) {
        newBadges.push(id);
      }
    };

    checkBadge('first_pop', event.actionType === 'pop' || this.state.totalEuphoriaPoints > 0);
    checkBadge('butter_master', event.sensoryType === 'butter_squeeze' && currentFloorPts >= 100);
    checkBadge('crackle_king', combo >= 10);
    checkBadge('tingle_fever', feverJustActivated || isFever);
    checkBadge('tower_climber_3f', highestUnlocked >= 3);
    checkBadge('tower_conqueror', highestUnlocked >= 6 && currentFloorPts >= (TOWER_FLOORS[5]?.targetPoints || 1400));

    this.state = {
      ...this.state,
      floorPoints: newFloorPoints,
      totalEuphoriaPoints: newTotalPoints,
      comboCount: combo,
      tingleScore: isFever ? 100 : updatedTingle.percentage,
      isFeverMode: isFever,
      highestUnlockedFloor: highestUnlocked,
      lastInteractionTime: now,
      unlockedBadges: [...this.state.unlockedBadges, ...newBadges],
    };

    return {
      pointsEarned,
      newCombo: combo,
      isFeverActivated: feverJustActivated,
      floorTargetReached: currentFloorPts >= currentFloorInfo.targetPoints,
      unlockedNewFloor,
      newBadges,
    };
  }

  /**
   * エレベーターで上の階へ昇る
   */
  ascend(): boolean {
    if (!this.canAscendToNextFloor()) return false;
    const nextFloor = this.state.currentFloor + 1;
    if (nextFloor > TOWER_FLOORS.length) return false;

    this.state = {
      ...this.state,
      currentFloor: nextFloor,
      comboCount: 0,
      tingleScore: Math.min(40, this.state.tingleScore),
      isFeverMode: false,
    };
    return true;
  }

  /**
   * エレベーターで任意の解放済みフロアへ移動
   */
  selectFloor(floorNumber: number): boolean {
    if (floorNumber < 1 || floorNumber > this.state.highestUnlockedFloor) {
      return false;
    }
    this.state = {
      ...this.state,
      currentFloor: floorNumber,
      comboCount: 0,
    };
    return true;
  }

  /**
   * アイドル時間によるゾクゾク度とコンボの減衰
   */
  tick(elapsedMs: number): void {
    const now = Date.now();
    const idleTime = now - this.state.lastInteractionTime;

    if (idleTime > 2000) {
      if (this.state.comboCount > 0 && idleTime > 3000) {
        this.state = { ...this.state, comboCount: 0 };
      }

      if (this.state.isFeverMode) {
        // フィーバーモードは時間経過で解除
        const remainingTingle = Math.max(0, this.state.tingleScore - (elapsedMs / 1000) * 15);
        if (remainingTingle <= 0) {
          this.state = { ...this.state, tingleScore: 0, isFeverMode: false };
        } else {
          this.state = { ...this.state, tingleScore: remainingTingle };
        }
      } else if (this.state.tingleScore > 0) {
        const tingle = new TingleLevel(this.state.tingleScore);
        const decayed = tingle.decay(elapsedMs, 3.5);
        this.state = { ...this.state, tingleScore: decayed.percentage };
      }
    }
  }

  updateAudioSettings(settings: Partial<AudioSettings>): void {
    this.state = {
      ...this.state,
      audioSettings: {
        ...this.state.audioSettings,
        ...settings,
      },
    };
  }

  reset(): void {
    this.state = {
      currentFloor: 1,
      highestUnlockedFloor: 1,
      totalEuphoriaPoints: 0,
      floorPoints: { '1': 0 },
      tingleScore: 0,
      isFeverMode: false,
      comboCount: 0,
      lastInteractionTime: Date.now(),
      audioSettings: this.state.audioSettings,
      unlockedBadges: [],
    };
  }
}
