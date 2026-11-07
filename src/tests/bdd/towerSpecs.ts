/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BddFeature } from './bddTypes.ts';
import { expect } from './bddRunner.ts';
import { TowerAggregate } from '../../domain/aggregates/TowerAggregate.ts';
import { SensoryTypeSchema, SoundProfileSchema } from '../../domain/schemas/index.ts';
import { TingleLevel } from '../../domain/value-objects/TingleLevel.ts';
import { SensoryCoord } from '../../domain/value-objects/SensoryCoord.ts';

export const TOWER_BDD_FEATURES: BddFeature[] = [
  {
    id: 'feature_bubble_wrap',
    title: 'フィーチャー 1: プチプチくんの破裂と癒やし度計算',
    userStory: 'プレイヤーとして、指でプチプチを破裂させて心地よい音を聞き、タワー昇降のためのポイントを獲得したい',
    scenarios: [
      {
        id: 'scenario_single_pop',
        name: '単一バブルの破裂とポイント加算',
        description: '未破裂の気泡をタップした際にポイントが獲得され、コンボが1になる',
        steps: [
          {
            type: 'GIVEN',
            description: 'タワーが1階（プチプチくん）の初期状態で開始されている',
            action: () => {
              const tower = new TowerAggregate();
              expect(tower.getState().currentFloor).toBe(1);
            },
          },
          {
            type: 'WHEN',
            description: '中央 (x: 0.5, y: 0.5) のバブルを通常強度でタップする',
            action: () => {
              const tower = new TowerAggregate();
              const result = tower.interact({
                id: 'evt-1',
                sensoryType: 'bubble_wrap',
                actionType: 'pop',
                x: 0.5,
                y: 0.5,
                intensity: 1.0,
                combo: 1,
                timestamp: Date.now(),
              });
              expect(result.pointsEarned).toBeGreaterThan(0);
              expect(result.newCombo).toBe(1);
              expect(tower.getState().totalEuphoriaPoints).toBeGreaterThan(0);
            },
          },
          {
            type: 'THEN',
            description: 'バッジ「プチプチの目覚め」が解放される',
            action: () => {
              const tower = new TowerAggregate();
              const result = tower.interact({
                id: 'evt-1',
                sensoryType: 'bubble_wrap',
                actionType: 'pop',
                x: 0.5,
                y: 0.5,
                intensity: 1.0,
                combo: 1,
                timestamp: Date.now(),
              });
              expect(result.newBadges).toContain('first_pop');
            },
          },
        ],
      },
    ],
  },
  {
    id: 'feature_tower_ascension',
    title: 'フィーチャー 2: タワー目標達成とエレベーター昇降',
    userStory: 'プレイヤーとして、各フロアの癒やし目標を満たしたらエレベーターで次階層へ昇りたい',
    scenarios: [
      {
        id: 'scenario_ascend_success',
        name: '目標ポイント到達後に2階へ昇れる',
        description: '1Fの目標ポイント120ptを満たすと、2階への昇降が許可され、現在フロアが2になる',
        steps: [
          {
            type: 'GIVEN',
            description: '1階の目標ポイントが未達成の状態では昇降できない',
            action: () => {
              const tower = new TowerAggregate();
              expect(tower.canAscendToNextFloor()).toBeFalsy();
              expect(tower.ascend()).toBeFalsy();
            },
          },
          {
            type: 'WHEN',
            description: '1階で目標の120ポイント以上を稼ぐ',
            action: () => {
              const tower = new TowerAggregate({
                currentFloor: 1,
                highestUnlockedFloor: 1,
                floorPoints: { '1': 150 },
                totalEuphoriaPoints: 150,
              });
              expect(tower.isCurrentFloorTargetReached()).toBeTruthy();
              expect(tower.canAscendToNextFloor()).toBeTruthy();
            },
          },
          {
            type: 'THEN',
            description: 'エレベーターを操作すると2階へ昇り、現在フロアが2Fになる',
            action: () => {
              const tower = new TowerAggregate({
                currentFloor: 1,
                highestUnlockedFloor: 2,
                floorPoints: { '1': 150 },
                totalEuphoriaPoints: 150,
              });
              const ascended = tower.ascend();
              expect(ascended).toBeTruthy();
              expect(tower.getState().currentFloor).toBe(2);
            },
          },
        ],
      },
    ],
  },
  {
    id: 'feature_tingle_fever',
    title: 'フィーチャー 3: ゾクゾク度 (ASMR Tingle) とフィーバーモード',
    userStory: 'プレイヤーとして、リズミカルに触感を味わうことで脳がとろけるフィーバーモードを発動させたい',
    scenarios: [
      {
        id: 'scenario_fever_trigger',
        name: 'ゾクゾク度100%でASMRフィーバー発動＆3倍ブースト',
        description: 'TingleLevelが100%に達すると、フィーバーモードになりスコア倍率が3倍になる',
        steps: [
          {
            type: 'GIVEN',
            description: 'TingleLevelの値オブジェクトが正しく倍率を返す',
            action: () => {
              const low = new TingleLevel(20);
              expect(low.getMultiplier()).toBe(1.0);
              const high = new TingleLevel(80);
              expect(high.getMultiplier()).toBe(2.0);
              const max = new TingleLevel(100);
              expect(max.getMultiplier()).toBe(3.0);
              expect(max.isFeverReady()).toBeTruthy();
            },
          },
          {
            type: 'WHEN',
            description: '素早く連続で触感アクションを行いゾクゾク度を満たす',
            action: () => {
              const tower = new TowerAggregate({ tingleScore: 98 });
              const result = tower.interact({
                id: 'evt-fever',
                sensoryType: 'crunchy_squeeze',
                actionType: 'crack',
                x: 0.5,
                y: 0.5,
                intensity: 1.5,
                combo: 5,
                timestamp: Date.now(),
              });
              expect(result.isFeverActivated).toBeTruthy();
              expect(tower.getState().isFeverMode).toBeTruthy();
            },
          },
          {
            type: 'THEN',
            description: '実績バッジ「脳がとろけるフィーバー」が付与される',
            action: () => {
              const tower = new TowerAggregate({ tingleScore: 99 });
              const result = tower.interact({
                id: 'evt-fever-badge',
                sensoryType: 'crunchy_squeeze',
                actionType: 'crack',
                x: 0.5,
                y: 0.5,
                intensity: 1.0,
                combo: 1,
                timestamp: Date.now(),
              });
              expect(result.newBadges).toContain('tingle_fever');
            },
          },
        ],
      },
    ],
  },
  {
    id: 'feature_tablet_binaural',
    title: 'フィーチャー 4: タブレット対応＆立体音響（ステレオパン）',
    userStory: 'プレイヤーとして、画面の左や右をタッチした際にその位置から音が聴こえるステレオ立体音響を楽しみたい',
    scenarios: [
      {
        id: 'scenario_panning_calc',
        name: 'SensoryCoordによる左右ステレオパンの精密計算',
        description: 'X座標0.0なら左極大(-1.0)、X座標1.0なら右極大(+1.0)として計算される',
        steps: [
          {
            type: 'GIVEN',
            description: '画面左端 (x: 0.0) をタップした入力座標',
            action: () => {
              const leftCoord = new SensoryCoord(0.0, 0.5);
              expect(leftCoord.pan).toBe(-1.0);
            },
          },
          {
            type: 'WHEN',
            description: '画面右端 (x: 1.0) をタップした入力座標',
            action: () => {
              const rightCoord = new SensoryCoord(1.0, 0.5);
              expect(rightCoord.pan).toBe(1.0);
            },
          },
          {
            type: 'THEN',
            description: '中央 (x: 0.5) ではパンがニュートラル (0.0) になる',
            action: () => {
              const centerCoord = new SensoryCoord(0.5, 0.5);
              expect(centerCoord.pan).toBe(0.0);
            },
          },
        ],
      },
    ],
  },
  {
    id: 'feature_schema_validation',
    title: 'フィーチャー 5: スキーマ駆動の厳格バリデーション',
    userStory: 'システムとして、不正な触感パラメータや音響周波数が渡された場合にZodで検知・保護したい',
    scenarios: [
      {
        id: 'scenario_zod_protection',
        name: 'Zodスキーマが不正な触感タイプを正しくリジェクトする',
        description: '未知の文字列をSensoryTypeSchemaでパースするとエラーになる',
        steps: [
          {
            type: 'GIVEN',
            description: '定義済みのSensoryTypeSchema',
            action: () => {
              const valid = SensoryTypeSchema.safeParse('butter_squeeze');
              expect(valid.success).toBeTruthy();
            },
          },
          {
            type: 'WHEN',
            description: '未定義の不正タイプ "metal_clang" をパースする',
            action: () => {
              const invalid = SensoryTypeSchema.safeParse('metal_clang');
              expect(invalid.success).toBeFalsy();
            },
          },
          {
            type: 'THEN',
            description: 'SoundProfileSchemaの周波数範囲チェックが作動する',
            action: () => {
              const invalidFreq = SoundProfileSchema.safeParse({
                baseFrequency: 999999, // 人間の可聴域外
              });
              expect(invalidFreq.success).toBeFalsy();
            },
          },
        ],
      },
    ],
  },
  {
    id: 'feature_character_companion',
    title: 'フィーチャー 6: 音フェチなかま（キャラクター）の成長とパッシブ効果',
    userStory: 'プレイヤーとして、好きな音フェチキャラを相棒にしてタワーを登り、キャラの特技で癒やし度を高めたい',
    scenarios: [
      {
        id: 'scenario_character_passives',
        name: 'ぷに助のポイントボーナス適用と経験値蓄積',
        description: 'ぷに助を選択時は癒やしポイントに+25%ボーナスが加算され、キャラ経験値が蓄積される',
        steps: [
          {
            type: 'GIVEN',
            description: '初期キャラ「ぷに助」が選択されている',
            action: () => {
              const tower = new TowerAggregate();
              expect(tower.getSelectedCharacter().id).toBe('punisuke');
            },
          },
          {
            type: 'WHEN',
            description: '触感アクションを行うとボーナス補正が計算される',
            action: () => {
              const tower = new TowerAggregate();
              const result = tower.interact({
                id: 'evt-char-1',
                sensoryType: 'bubble_wrap',
                actionType: 'pop',
                x: 0.5,
                y: 0.5,
                intensity: 1.0,
                combo: 1,
                timestamp: Date.now(),
              });
              expect(result.pointsEarned).toBeGreaterThan(5);
              expect(tower.getState().characterExp['punisuke']).toBeGreaterThan(0);
            },
          },
          {
            type: 'THEN',
            description: 'フロア解放に応じて新キャラ（キーボ等）が選択可能になる',
            action: () => {
              const tower = new TowerAggregate({ highestUnlockedFloor: 4 });
              const success = tower.selectCharacter('keybo');
              expect(success).toBeTruthy();
              expect(tower.getSelectedCharacter().id).toBe('keybo');
            },
          },
        ],
      },
    ],
  },
  {
    id: 'feature_keyboard_and_honey',
    title: 'フィーチャー 7: メカニカルキーボード ＆ ハチミツキーボード',
    userStory: 'プレイヤーとして、コトコト鳴るメカニカルキーボードやトロトロのハチミツキーボードで長時間タワーを登りたい',
    scenarios: [
      {
        id: 'scenario_keyboard_thock',
        name: 'メカニカルキーボードのタイピング打鍵音と癒やし獲得',
        description: '4Fのメカニカルキーボードでタイプアクションを行うと打鍵ポイントが加算される',
        steps: [
          {
            type: 'GIVEN',
            description: '4階（メカニカルキーボード）に到達している',
            action: () => {
              const tower = new TowerAggregate({ currentFloor: 4, highestUnlockedFloor: 4 });
              expect(tower.getCurrentFloorInfo().type).toBe('mechanical_keyboard');
            },
          },
          {
            type: 'WHEN',
            description: 'スペースバーで重厚なThock打鍵を行う',
            action: () => {
              const tower = new TowerAggregate({ currentFloor: 4, highestUnlockedFloor: 4 });
              const result = tower.interact({
                id: 'evt-thock-1',
                sensoryType: 'mechanical_keyboard',
                actionType: 'type',
                x: 0.5,
                y: 0.8,
                intensity: 1.4,
                combo: 1,
                timestamp: Date.now(),
              });
              expect(result.pointsEarned).toBeGreaterThan(0);
            },
          },
          {
            type: 'THEN',
            description: '5階（トロトロ・ハチミツキーボード）へ昇降が可能になる',
            action: () => {
              const tower = new TowerAggregate({
                currentFloor: 4,
                highestUnlockedFloor: 4,
                floorPoints: { '4': 800 },
              });
              expect(tower.canAscendToNextFloor()).toBeTruthy();
              const ascended = tower.ascend();
              expect(ascended).toBeTruthy();
              expect(tower.getState().currentFloor).toBe(5);
              expect(tower.getCurrentFloorInfo().type).toBe('honey_keyboard');
            },
          },
        ],
      },
    ],
  },
];
