/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

/**
 * 触感種別スキーマ
 */
export const SensoryTypeSchema = z.enum([
  'bubble_wrap',          // 1F: プチプチくん
  'butter_squeeze',       // 2F: バタースクイーズ
  'crunchy_squeeze',      // 3F: パキパキスクイーズ
  'mechanical_keyboard',  // 4F: コトコト・メカニカルキーボード
  'honey_keyboard',       // 5F: トロトロ・ハチミツキーボード
  'slime_poke',           // 6F: スライムポーク＆ストレッチ
  'freeze_dried_candy',   // 7F: フリーズドライ・パキパキキャンディ
  'kinetic_sand',         // 8F: キネティックサンド
  'soap_carving',         // 9F: ソープカービング
  'celestial_symphony',   // 10F: 天空のASMRシンフォニー
]);
export type SensoryType = z.infer<typeof SensoryTypeSchema>;

/**
 * キャラクター種別
 */
export const CharacterBonusTypeSchema = z.enum([
  'point_boost',      // 癒やしポイント+25%
  'combo_grace',      // コンボ持続時間延長
  'fever_duration',   // フィーバー持続+40%
  'tingle_charge',    // ゾクゾク度の上昇速度+35%
  'honey_sweetness',  // キーボード＆ハチミツの癒やし度2倍
]);
export type CharacterBonusType = z.infer<typeof CharacterBonusTypeSchema>;

export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string(),
  avatarColor: z.string(),
  moodEmoji: z.string(),
  favoriteSensory: SensoryTypeSchema,
  bonusType: CharacterBonusTypeSchema,
  bonusDescription: z.string(),
  reactionQuotes: z.array(z.string()),
  feverQuotes: z.array(z.string()),
  unlockRequiredFloor: z.number().int().default(1),
});
export type Character = z.infer<typeof CharacterSchema>;

/**
 * 音響パラメータスキーマ (Web Audio API プロシージャル合成用)
 */
export const SoundProfileSchema = z.object({
  baseFrequency: z.number().min(20).max(20000).default(350),
  resonance: z.number().min(0).max(50).default(5),
  noiseRatio: z.number().min(0).max(1).default(0.3),
  decayTime: z.number().min(0.01).max(3).default(0.15),
  filterType: z.enum(['lowpass', 'highpass', 'bandpass', 'notch']).default('lowpass'),
  filterFreq: z.number().min(50).max(18000).default(2000),
  crunchDensity: z.number().min(1).max(20).default(1),
  pitchVariance: z.number().min(0).max(1).default(0.2),
});
export type SoundProfile = z.infer<typeof SoundProfileSchema>;

/**
 * 触感フロア設定スキーマ
 */
export const FloorStageSchema = z.object({
  floorNumber: z.number().int().min(1),
  type: SensoryTypeSchema,
  name: z.string(),
  subtitle: z.string(),
  description: z.string(),
  themeColor: z.string(),
  bgGradient: z.string(),
  targetPoints: z.number().min(100),
  soundProfile: SoundProfileSchema,
  icon: z.string(),
  funFact: z.string(),
});
export type FloorStage = z.infer<typeof FloorStageSchema>;

/**
 * プレイヤーインタラクションイベントスキーマ
 */
export const InteractionEventSchema = z.object({
  id: z.string(),
  sensoryType: SensoryTypeSchema,
  actionType: z.enum(['pop', 'squish', 'crack', 'poke', 'stretch', 'slice', 'carve', 'type', 'honey_drip']),
  x: z.number().min(0).max(1),       // 正規化座標 0.0 - 1.0 (ステレオパン計算用)
  y: z.number().min(0).max(1),
  intensity: z.number().min(0.1).max(3.0).default(1.0),
  combo: z.number().int().min(1).default(1),
  timestamp: z.number(),
});
export type InteractionEvent = z.infer<typeof InteractionEventSchema>;

/**
 * オーディオ設定スキーマ
 */
export const AudioSettingsSchema = z.object({
  masterVolume: z.number().min(0).max(1).default(0.85),
  stereoPanningEnabled: z.boolean().default(true),
  hapticEnabled: z.boolean().default(true),
  reverbAmount: z.number().min(0).max(1).default(0.25),
  ambientSound: z.enum(['none', 'gentle_rain', 'room_tone', 'soft_breeze', 'tape_hiss']).default('none'),
  ambientVolume: z.number().min(0).max(1).default(0.3),
});
export type AudioSettings = z.infer<typeof AudioSettingsSchema>;

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.85,
  stereoPanningEnabled: true,
  hapticEnabled: true,
  reverbAmount: 0.25,
  ambientSound: 'none',
  ambientVolume: 0.3,
};

/**
 * 実績バッジスキーマ
 */
export const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  unlockedAt: z.number().nullable().default(null),
});
export type Badge = z.infer<typeof BadgeSchema>;

/**
 * プレイヤータワーステートスキーマ
 */
export const PlayerStateSchema = z.object({
  currentFloor: z.number().int().min(1).default(1),
  highestUnlockedFloor: z.number().int().min(1).default(1),
  totalEuphoriaPoints: z.number().min(0).default(0),
  floorPoints: z.record(z.string(), z.number()).default({}),
  tingleScore: z.number().min(0).max(100).default(0),
  isFeverMode: z.boolean().default(false),
  comboCount: z.number().int().min(0).default(0),
  lastInteractionTime: z.number().default(0),
  audioSettings: AudioSettingsSchema.default(DEFAULT_AUDIO_SETTINGS),
  unlockedBadges: z.array(z.string()).default([]),
  // キャラクター関連
  selectedCharacterId: z.string().default('punisuke'),
  characterLevels: z.record(z.string(), z.number()).default({ punisuke: 1 }),
  characterExp: z.record(z.string(), z.number()).default({ punisuke: 0 }),
});
export type PlayerState = z.infer<typeof PlayerStateSchema>;
