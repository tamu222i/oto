/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ITowerRepository } from '../../domain/repositories/ITowerRepository.ts';
import { PlayerState, PlayerStateSchema } from '../../domain/schemas/index.ts';

const STORAGE_KEY = 'asmr_tower_progress_v1';

export class LocalStorageTowerRepository implements ITowerRepository {
  load(): PlayerState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const validated = PlayerStateSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }
      return null;
    } catch (e) {
      console.warn('Failed to load tower progress from localStorage', e);
      return null;
    }
  }

  save(state: PlayerState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save tower progress to localStorage', e);
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear tower progress', e);
    }
  }
}
