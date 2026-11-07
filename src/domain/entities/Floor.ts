/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FloorStage } from '../schemas/index.ts';

export const TOWER_FLOORS: FloorStage[] = [
  {
    floorNumber: 1,
    type: 'bubble_wrap',
    name: '1F: プチプチくん',
    subtitle: 'Bubble Wrap Pop Sanctuary',
    description: '指先でパチパチ弾ける気泡緩衝材。マルチタッチで複数一斉ポップ！黄金のレアバブルも出現。',
    themeColor: '#38bdf8',
    bgGradient: 'from-sky-950 via-slate-900 to-cyan-950',
    targetPoints: 120,
    icon: 'Sparkles',
    funFact: 'プチプチの音は脳のα波を活性化させ、短時間でストレスホルモンを低減させる効果が研究されています。',
    soundProfile: {
      baseFrequency: 520,
      resonance: 14,
      noiseRatio: 0.25,
      decayTime: 0.08,
      filterType: 'bandpass',
      filterFreq: 3200,
      crunchDensity: 1,
      pitchVariance: 0.25,
    },
  },
  {
    floorNumber: 2,
    type: 'butter_squeeze',
    name: '2F: バタースクイーズ',
    subtitle: 'Creamy Butter Slime Studio',
    description: 'しっとり柔らかい粘土のようなバタースライム。ナイフでスッと伸ばしたり、手で揉み潰すねっとりサウンド。',
    themeColor: '#fbbf24',
    bgGradient: 'from-amber-950 via-slate-900 to-yellow-950',
    targetPoints: 260,
    icon: 'Layers',
    funFact: 'バタースライム特有の空気を含んだ低摩擦音は、耳の奥に心地よいぬくもりと深い安心感をもたらします。',
    soundProfile: {
      baseFrequency: 160,
      resonance: 8,
      noiseRatio: 0.45,
      decayTime: 0.22,
      filterType: 'lowpass',
      filterFreq: 1100,
      crunchDensity: 2,
      pitchVariance: 0.15,
    },
  },
  {
    floorNumber: 3,
    type: 'crunchy_squeeze',
    name: '3F: パキパキスクイーズ',
    subtitle: 'Crisp Crackle & Honeycomb',
    description: 'テープボールや蜂の巣、クリスピーコーティングを握り潰した時の「パキッ・パリパリッ」という超絶快感音。',
    themeColor: '#f43f5e',
    bgGradient: 'from-rose-950 via-slate-900 to-pink-950',
    targetPoints: 450,
    icon: 'Zap',
    funFact: 'マイクロフラクチャー（微小破壊音）の連続は、ASMRトリガーの中でも最強のゾクゾク感（シバー）を引き起こします。',
    soundProfile: {
      baseFrequency: 820,
      resonance: 18,
      noiseRatio: 0.65,
      decayTime: 0.09,
      filterType: 'highpass',
      filterFreq: 2400,
      crunchDensity: 6,
      pitchVariance: 0.35,
    },
  },
  {
    floorNumber: 4,
    type: 'mechanical_keyboard',
    name: '4F: コトコト・メカニカルキーボード',
    subtitle: 'Creamy Thock Keyboard Lounge',
    description: 'ルブ済みリニア軸の「コトコト」「スコスコ」という重厚でまろやかな打鍵音。タイピングやランダムタップで極上のリズムを刻もう。',
    themeColor: '#818cf8',
    bgGradient: 'from-indigo-950 via-slate-900 to-purple-950',
    targetPoints: 700,
    icon: 'Keyboard',
    funFact: 'キーボードの深みのある低音打鍵音（Thock音）はタイピング音フェチ界隈で世界的な大ブームを巻き起こしています。',
    soundProfile: {
      baseFrequency: 280,
      resonance: 12,
      noiseRatio: 0.3,
      decayTime: 0.12,
      filterType: 'bandpass',
      filterFreq: 1400,
      crunchDensity: 2,
      pitchVariance: 0.2,
    },
  },
  {
    floorNumber: 5,
    type: 'honey_keyboard',
    name: '5F: トロトロ・ハチミツキーボード',
    subtitle: 'Honey Dipped Viscous Keyboard',
    description: '透き通る黄金のハチミツがたっぷり染み込んだゼリーキースイッチ。沈み込むときの「じゅぽっ・ぬちゃっ」という甘美な粘性サウンド！',
    themeColor: '#f59e0b',
    bgGradient: 'from-amber-950 via-stone-900 to-yellow-950',
    targetPoints: 1000,
    icon: 'Droplets',
    funFact: 'ハチミツの粘性摩擦音は、触感動画で数千万再生を誇る大人気の「じゅわ〜っ」という高密度キャビテーション音です。',
    soundProfile: {
      baseFrequency: 190,
      resonance: 15,
      noiseRatio: 0.4,
      decayTime: 0.18,
      filterType: 'lowpass',
      filterFreq: 900,
      crunchDensity: 3,
      pitchVariance: 0.22,
    },
  },
  {
    floorNumber: 6,
    type: 'slime_poke',
    name: '6F: スライムポーク＆ストレッチ',
    subtitle: 'Wet Squelch & Bubble Poke',
    description: '艶やかなクリアスライムを指でポーク（突く）したときのジュポッ音と、気泡が破裂するチュパチュパ音。',
    themeColor: '#10b981',
    bgGradient: 'from-emerald-950 via-slate-900 to-teal-950',
    targetPoints: 1350,
    icon: 'Droplet',
    funFact: 'スライムポークの「ジュポッ」という音は、不快感のない快感刺激として世界中で愛されています。',
    soundProfile: {
      baseFrequency: 240,
      resonance: 16,
      noiseRatio: 0.35,
      decayTime: 0.14,
      filterType: 'bandpass',
      filterFreq: 1600,
      crunchDensity: 3,
      pitchVariance: 0.28,
    },
  },
  {
    floorNumber: 7,
    type: 'freeze_dried_candy',
    name: '7F: フリーズドライ・パキパキキャンディ',
    subtitle: 'Ultra-Crispy Freeze-Dried Crunch',
    description: 'サクサク・パキパキと音を立てて砕けるフリーズドライマシュマロとキャンディ。軽やかでクリスピーなエアリークラッシュ！',
    themeColor: '#ec4899',
    bgGradient: 'from-pink-950 via-slate-900 to-rose-950',
    targetPoints: 1750,
    icon: 'Candy',
    funFact: '水分を昇華させた微細多孔質構造が崩壊する音は、超高音域の倍音成分をたっぷり含んでいます。',
    soundProfile: {
      baseFrequency: 950,
      resonance: 22,
      noiseRatio: 0.6,
      decayTime: 0.08,
      filterType: 'highpass',
      filterFreq: 3100,
      crunchDensity: 5,
      pitchVariance: 0.3,
    },
  },
  {
    floorNumber: 8,
    type: 'kinetic_sand',
    name: '8F: キネティックサンド',
    subtitle: 'Kinetic Sand Slice & Fall',
    description: 'ザクザクとナイフで切り落とす不思議な砂。砂粒同士が擦れ合って崩れ落ちる繊細なアコースティック。',
    themeColor: '#a855f7',
    bgGradient: 'from-purple-950 via-slate-900 to-indigo-950',
    targetPoints: 2200,
    icon: 'Scissors',
    funFact: 'キネティックサンドの摩擦周波数は、砂時計や雨音に似たホワイトノイズ成分を多く含み、入眠を促します。',
    soundProfile: {
      baseFrequency: 440,
      resonance: 10,
      noiseRatio: 0.75,
      decayTime: 0.18,
      filterType: 'bandpass',
      filterFreq: 3800,
      crunchDensity: 4,
      pitchVariance: 0.3,
    },
  },
  {
    floorNumber: 9,
    type: 'soap_carving',
    name: '9F: ソープカービング',
    subtitle: 'Precision Soap Grid Crunch',
    description: '格子状に切り込みの入った石鹸バーを削り、小さな四角いキューブがパラパラと弾け落ちるサクサク音。',
    themeColor: '#06b6d4',
    bgGradient: 'from-cyan-950 via-slate-900 to-blue-950',
    targetPoints: 2700,
    icon: 'Grid',
    funFact: '刃先が固形石鹸を割る瞬間の一瞬の抵抗と開放音は、視覚と聴覚の心地よいシンクロを生み出します。',
    soundProfile: {
      baseFrequency: 680,
      resonance: 20,
      noiseRatio: 0.5,
      decayTime: 0.07,
      filterType: 'highpass',
      filterFreq: 2900,
      crunchDensity: 5,
      pitchVariance: 0.25,
    },
  },
  {
    floorNumber: 10,
    type: 'celestial_symphony',
    name: '10F: 天空のASMRシンフォニー',
    subtitle: 'Celestial Infinite Tower Sanctum',
    description: '全音フェチを極めし者だけが辿り着く天空の聖域。すべての触感を自由に召喚し、無限にタワーを登り続けられるエンドレスモード！',
    themeColor: '#eab308',
    bgGradient: 'from-amber-950 via-indigo-950 to-slate-950',
    targetPoints: 3300,
    icon: 'Crown',
    funFact: '天空のシンフォニーでは、複数触感の重奏（レイヤー）によって脳内ホルモンが最大化されます。',
    soundProfile: {
      baseFrequency: 550,
      resonance: 25,
      noiseRatio: 0.4,
      decayTime: 0.25,
      filterType: 'bandpass',
      filterFreq: 2200,
      crunchDensity: 3,
      pitchVariance: 0.3,
    },
  },
];

export class FloorEntity {
  readonly stage: FloorStage;

  constructor(stage: FloorStage) {
    this.stage = stage;
  }

  get floorNumber(): number {
    return this.stage.floorNumber;
  }

  get name(): string {
    return this.stage.name;
  }

  get targetPoints(): number {
    return this.stage.targetPoints;
  }

  isUnlocked(highestUnlockedFloor: number): boolean {
    return highestUnlockedFloor >= this.stage.floorNumber;
  }

  canAscend(currentPoints: number): boolean {
    return currentPoints >= this.stage.targetPoints;
  }
}
