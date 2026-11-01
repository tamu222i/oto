/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 触感入力座標 Value Object
 * 画面上の位置 (0.0 - 1.0) を表し、立体音響のステレオパン (-1.0 左 〜 +1.0 右) を計算する
 */
export class SensoryCoord {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = Math.max(0, Math.min(1, x));
    this.y = Math.max(0, Math.min(1, y));
  }

  /**
   * Web Audio API StereoPannerNode 向けのパン値 (-1.0 ~ 1.0)
   */
  get pan(): number {
    return (this.x - 0.5) * 2;
  }

  /**
   * 高さに応じた微小なピッチバイアス
   */
  get pitchModulation(): number {
    // 画面上部ほど少し高め、下部ほど重低音
    return 1.2 - this.y * 0.4;
  }
}
