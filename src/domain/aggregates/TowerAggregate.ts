/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerState, PlayerStateSchema, InteractionEvent, AudioSettings, FloorStage } from '../schemas/index.ts';
import { TingleLevel } from '../value-objects/TingleLevel.ts';
import { TOWER_FLOORS } from '../entities/Floor.ts';
import { ALL_CHARACTERS } from '../entities/Character.ts';

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
      selectedCharacterId: 'punisuke',
      characterLevels: { punisuke: 1 },
      characterExp: { punisuke: 0 },
    };

    const merged = { ...defaultState, ...initialState };
    this.state = PlayerStateSchema.parse(merged);
  }

  getState(): Readonly<PlayerState> {
    return { ...this.state };
  }

  getSelectedCharacter() {
    return ALL_CHARACTERS.find((c) => c.id === this.state.selectedCharacterId) || ALL_CHARACTERS[0];
  }

  selectCharacter(characterId: string): boolean {
    const char = ALL_CHARACTERS.find((c) => c.id === characterId);
    if (!char) return false;
    if (this.state.highestUnlockedFloor < char.unlockRequiredFloor) return false;

    this.state = {
      ...this.state,
      selectedCharacterId: characterId,
    };
    return true;
  }

  /**
   * 現在のフロア情報を取得 (10F以降は無限エターナルタワーとして動的スケール)
   */
  getCurrentFloorInfo(): FloorStage {
    const current = this.state.currentFloor;
    const baseInfo = TOWER_FLOORS.find((f) => f.floorNumber === current);
    if (baseInfo) return baseInfo;

    // 10F以上の無限タワー: 既存フロアのバリエーションをベースに動的生成
    const cycleIdx = (current - 1) % TOWER_FLOORS.length;
    const template = TOWER_FLOORS[cycleIdx];
    const loop = Math.floor((current - 1) / TOWER_FLOORS.length);

    return {
      ...template,
      floorNumber: current,
      name: `${current}F: 天空の${template.name.split(':')[1]?.trim() || template.name}`,
      subtitle: `Infinity Tower Loop ${loop + 1}`,
      targetPoints: Math.round(template.targetPoints * (1 + loop * 0.8)),
    };
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
    characterQuote?: string;
    charLevelUp?: boolean;
  } {
    const now = Date.now();
    const timeSinceLast = now - this.state.lastInteractionTime;
    const character = this.getSelectedCharacter();

    // コンボ受付時間 (キャラクター特性: combo_grace の場合 4.0秒、通常は 2.5秒)
    const comboGraceWindow = character.bonusType === 'combo_grace' ? 4000 : 2500;
    let combo = this.state.comboCount;
    if (timeSinceLast < comboGraceWindow) {
      combo += 1;
    } else {
      combo = 1;
    }

    // ゾクゾク度 (Tingle) 計算 (キャラクター特性: tingle_charge の場合 +35%)
    const tingleChargeMultiplier = character.bonusType === 'tingle_charge' ? 1.35 : 1.0;
    const tingle = new TingleLevel(this.state.tingleScore);
    const tingleBoost = Math.min(8, (2 + combo * 0.4) * event.intensity * tingleChargeMultiplier);
    const updatedTingle = tingle.add(tingleBoost);

    let isFever = this.state.isFeverMode;
    let feverJustActivated = false;

    if (updatedTingle.isFeverReady() && !this.state.isFeverMode) {
      isFever = true;
      feverJustActivated = true;
    }

    const tingleMultiplier = updatedTingle.getMultiplier();
    const comboMultiplier = 1 + Math.min(2.0, combo * 0.05);

    // キャラクターパッシブ倍率
    let charBonusMultiplier = 1.0;
    if (character.bonusType === 'point_boost') {
      charBonusMultiplier = 1.25;
    } else if (
      character.bonusType === 'honey_sweetness' &&
      (event.sensoryType === 'honey_keyboard' || event.sensoryType === 'mechanical_keyboard' || event.sensoryType === 'butter_squeeze')
    ) {
      charBonusMultiplier = 2.0;
    }

    // 基礎点 × 強度 × ゾクゾク倍率 × コンボ倍率 × キャラ補正
    const basePts = 5;
    const pointsEarned = Math.round(basePts * event.intensity * tingleMultiplier * comboMultiplier * charBonusMultiplier);

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
      if (highestUnlocked < nextFloor) {
        highestUnlocked = nextFloor;
        unlockedNewFloor = true;
      }
    }

    // キャラクター経験値とレベルアップ
    const charId = character.id;
    const currentExp = (this.state.characterExp[charId] || 0) + pointsEarned;
    const currentLvl = this.state.characterLevels[charId] || 1;
    const expToNextLvl = currentLvl * 200;
    let charLevelUp = false;
    let newLvl = currentLvl;
    let newExp = currentExp;

    if (currentExp >= expToNextLvl) {
      newLvl = currentLvl + 1;
      newExp = currentExp - expToNextLvl;
      charLevelUp = true;
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
    checkBadge('keyboard_artisan', event.sensoryType === 'mechanical_keyboard' && combo >= 15);
    checkBadge('honey_lover', event.sensoryType === 'honey_keyboard' && currentFloorPts >= 300);
    checkBadge('tower_climber_3f', highestUnlocked >= 3);
    checkBadge('tower_climber_5f', highestUnlocked >= 5);
    checkBadge('tower_climber_10f', highestUnlocked >= 10);

    // キャラクターのセリフ選出
    let characterQuote = '';
    if (isFever) {
      characterQuote = character.feverQuotes[Math.floor(Math.random() * character.feverQuotes.length)];
    } else if (combo % 5 === 0) {
      characterQuote = character.reactionQuotes[Math.floor(Math.random() * character.reactionQuotes.length)];
    }

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
      characterExp: { ...this.state.characterExp, [charId]: newExp },
      characterLevels: { ...this.state.characterLevels, [charId]: newLvl },
    };

    return {
      pointsEarned,
      newCombo: combo,
      isFeverActivated: feverJustActivated,
      floorTargetReached: currentFloorPts >= currentFloorInfo.targetPoints,
      unlockedNewFloor,
      newBadges,
      characterQuote,
      charLevelUp,
    };
  }

  /**
   * エレベーターで上の階へ昇る
   */
  ascend(): boolean {
    if (!this.canAscendToNextFloor()) return false;
    const nextFloor = this.state.currentFloor + 1;

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
    const character = this.getSelectedCharacter();

    if (idleTime > 2000) {
      const comboGrace = character.bonusType === 'combo_grace' ? 4000 : 3000;
      if (this.state.comboCount > 0 && idleTime > comboGrace) {
        this.state = { ...this.state, comboCount: 0 };
      }

      if (this.state.isFeverMode) {
        // キャラクター特性: fever_duration の場合は減衰が緩やか
        const decayRate = character.bonusType === 'fever_duration' ? 8 : 15;
        const remainingTingle = Math.max(0, this.state.tingleScore - (elapsedMs / 1000) * decayRate);
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
      selectedCharacterId: 'punisuke',
      characterLevels: { punisuke: 1 },
      characterExp: { punisuke: 0 },
    };
  }
}
