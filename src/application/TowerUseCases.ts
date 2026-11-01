/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TowerAggregate } from '../domain/aggregates/TowerAggregate.ts';
import { AsmrAudioEngine } from '../infrastructure/audio/AsmrAudioEngine.ts';
import { HapticService } from '../infrastructure/haptics/HapticService.ts';
import { ITowerRepository } from '../domain/repositories/ITowerRepository.ts';
import { InteractionEvent, AudioSettings, PlayerState } from '../domain/schemas/index.ts';

export class TowerUseCases {
  private aggregate: TowerAggregate;
  private audioEngine: AsmrAudioEngine;
  private hapticService: HapticService;
  private repository: ITowerRepository;

  constructor(
    aggregate: TowerAggregate,
    audioEngine: AsmrAudioEngine,
    hapticService: HapticService,
    repository: ITowerRepository
  ) {
    this.aggregate = aggregate;
    this.audioEngine = audioEngine;
    this.hapticService = hapticService;
    this.repository = repository;
  }

  getState(): Readonly<PlayerState> {
    return this.aggregate.getState();
  }

  getCurrentFloorInfo() {
    return this.aggregate.getCurrentFloorInfo();
  }

  /**
   * 触感アクション実行ユースケース
   */
  interact(
    event: InteractionEvent,
    audioMeta?: { isGolden?: boolean; isCut?: boolean; isStretch?: boolean }
  ) {
    // 1. ドメイン集約の更新
    const result = this.aggregate.interact(event);

    // 2. 音響再生 (ステレオパン & 触感プロファイル)
    const pan = this.aggregate.getState().audioSettings.stereoPanningEnabled
      ? (event.x - 0.5) * 2
      : 0;

    this.audioEngine.playSensorySound(
      event.sensoryType,
      pan,
      event.intensity,
      audioMeta
    );

    // 3. フィーバー発動音
    if (result.isFeverActivated) {
      this.audioEngine.playFeverTrigger();
    }

    // 4. ハプティクス触感
    this.hapticService.trigger(event.sensoryType, event.intensity);

    // 5. 永続化保存
    this.repository.save(this.aggregate.getState());

    return result;
  }

  /**
   * タワー昇降 (エレベーターで次階層へ)
   */
  ascend(): boolean {
    const success = this.aggregate.ascend();
    if (success) {
      this.audioEngine.playAscendChime();
      this.hapticService.triggerAscend();
      this.repository.save(this.aggregate.getState());
    }
    return success;
  }

  /**
   * 階層切り替え (エレベーター移動)
   */
  selectFloor(floorNumber: number): boolean {
    const success = this.aggregate.selectFloor(floorNumber);
    if (success) {
      this.repository.save(this.aggregate.getState());
    }
    return success;
  }

  /**
   * アイドル減衰タイマー更新
   */
  tick(elapsedMs: number): void {
    this.aggregate.tick(elapsedMs);
  }

  /**
   * 音響・触感設定変更
   */
  updateSettings(settings: Partial<AudioSettings>): void {
    this.aggregate.updateAudioSettings(settings);
    const updated = this.aggregate.getState().audioSettings;
    this.audioEngine.updateSettings(updated);
    this.hapticService.setEnabled(updated.hapticEnabled);
    this.repository.save(this.aggregate.getState());
  }

  /**
   * 最初からやり直す
   */
  reset(): void {
    this.aggregate.reset();
    this.repository.clear();
  }
}
