/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SensoryType } from '../../domain/schemas/index.ts';

export class HapticService {
  private enabled: boolean = true;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public trigger(type: SensoryType, intensity: number = 1.0): void {
    if (!this.enabled || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return;
    }

    try {
      switch (type) {
        case 'bubble_wrap':
          // 短い鋭い破裂 (15ms)
          navigator.vibrate(15);
          break;
        case 'butter_squeeze':
          // 柔らかい長めの振動 (35ms)
          navigator.vibrate(35);
          break;
        case 'crunchy_squeeze':
          // パキパキッという多段階振動 ([10, 15, 10, 15, 15])
          navigator.vibrate([12, 18, 12, 18, 15]);
          break;
        case 'slime_poke':
          // ジュポッ感のある振動 (25ms)
          navigator.vibrate(25);
          break;
        case 'kinetic_sand':
          // ザクザク摩擦振動 ([10, 10, 10])
          navigator.vibrate([10, 10, 10]);
          break;
        case 'soap_carving':
          // カリッとした硬質振動 (18ms)
          navigator.vibrate(18);
          break;
      }
    } catch {
      // ignore
    }
  }

  public triggerAscend(): void {
    if (!this.enabled || typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    try {
      navigator.vibrate([40, 60, 40, 60, 80]);
    } catch {
      // ignore
    }
  }
}
