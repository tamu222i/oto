/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 音響周波数 Value Object
 */
export class SoundFrequency {
  private readonly hz: number;

  constructor(frequencyHz: number) {
    if (frequencyHz < 20 || frequencyHz > 20000) {
      throw new Error(`Frequency must be within human hearing range (20Hz - 20000Hz), got: ${frequencyHz}`);
    }
    this.hz = frequencyHz;
  }

  get value(): number {
    return this.hz;
  }

  /**
   * ランダムなピッチ分散（生の生々しいASMR触感を生み出す微小な揺らぎ）
   */
  withVariance(varianceRatio: number = 0.15): number {
    const shift = (Math.random() * 2 - 1) * varianceRatio;
    const randomized = this.hz * (1 + shift);
    return Math.max(20, Math.min(20000, randomized));
  }

  /**
   * 倍音（オーバートーン）の計算
   */
  harmonic(multiple: number): number {
    return Math.min(20000, this.hz * multiple);
  }
}
