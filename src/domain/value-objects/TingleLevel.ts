/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ゾクゾク度 (ASMR Tingle Gauge) Value Object
 * 0% 〜 100% の範囲。100%に達すると「とろけるフィーバーモード」が発動
 */
export class TingleLevel {
  private readonly value: number;

  constructor(score: number) {
    this.value = Math.max(0, Math.min(100, Math.round(score * 10) / 10));
  }

  get percentage(): number {
    return this.value;
  }

  isFeverReady(): boolean {
    return this.value >= 100;
  }

  add(delta: number): TingleLevel {
    return new TingleLevel(this.value + delta);
  }

  decay(elapsedMs: number, decayRatePerSec: number = 4.0): TingleLevel {
    const decayAmount = (elapsedMs / 1000) * decayRatePerSec;
    return new TingleLevel(Math.max(0, this.value - decayAmount));
  }

  getMultiplier(): number {
    if (this.value >= 100) return 3.0; // フィーバーモードは3倍
    if (this.value >= 75) return 2.0;
    if (this.value >= 50) return 1.5;
    return 1.0;
  }
}
