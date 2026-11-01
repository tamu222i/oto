/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerState } from '../schemas/index.ts';

export interface ITowerRepository {
  load(): PlayerState | null;
  save(state: PlayerState): void;
  clear(): void;
}
