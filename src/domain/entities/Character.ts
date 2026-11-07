/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character } from '../schemas/index.ts';

export const ALL_CHARACTERS: Character[] = [
  {
    id: 'punisuke',
    name: 'ぷに助',
    title: 'もちぷにスライム妖精',
    description: 'ぷにぷにした弾力としっとりした触感が大好きな妖精。触感に反応してポヨンと弾む！',
    avatarColor: 'from-sky-400 to-cyan-300',
    moodEmoji: '( ˶ᵔ ᵕ ᵔ˶ )',
    favoriteSensory: 'bubble_wrap',
    bonusType: 'point_boost',
    bonusDescription: '癒やしポイント獲得量 +25%',
    reactionQuotes: [
      'ぷにっ！いい音〜♪',
      'ぽよよ〜んととろける！',
      'ぷちぷち気持ちいい〜！',
      'もっと触って〜！',
    ],
    feverQuotes: [
      '脳がとろけちゃう〜〜！！✨',
      'ぷにぷにフィーバー！！💖',
    ],
    unlockRequiredFloor: 1,
  },
  {
    id: 'keybo',
    name: 'キーボ',
    title: 'メカニカルタイピスト',
    description: '潤滑油を塗ったキースイッチの「コトコト」「スコスコ」音を愛してやまないレトロロボ。',
    avatarColor: 'from-indigo-400 to-purple-400',
    moodEmoji: '[ •̀ ω •́ ]',
    favoriteSensory: 'mechanical_keyboard',
    bonusType: 'combo_grace',
    bonusDescription: 'コンボ受付時間が+1.5秒延長',
    reactionQuotes: [
      'コトコト…至高の打鍵音！',
      'このスイッチ、潤滑済みだ！',
      'カチャカチャ最高！',
      'リズムが整ってきたぞ！',
    ],
    feverQuotes: [
      '超高速オーバードライブ打鍵！！⚡',
      '無限コトコトハーモニー！！🎶',
    ],
    unlockRequiredFloor: 4,
  },
  {
    id: 'honeypiyo',
    name: 'ハニーピヨ',
    title: '蜜浸しスイーツヒヨコ',
    description: 'とろ〜り甘いハチミツが染み込んだキーボードの「じゅぽっ・ぬちゃっ」という音が大好物。',
    avatarColor: 'from-amber-400 to-yellow-300',
    moodEmoji: '(・θ・)♡',
    favoriteSensory: 'honey_keyboard',
    bonusType: 'honey_sweetness',
    bonusDescription: 'キーボード＆ハチミツの癒やし度 2倍！',
    reactionQuotes: [
      'じゅわ〜っ！甘い音ピヨ！',
      'ねっとり極上ピヨ〜！',
      'ハチミツが指に絡みつくピヨ！',
      'とろ〜り癒やされるピヨ♪',
    ],
    feverQuotes: [
      'あまあまハニーシンフォニー！！🍯✨',
      '全身ハチミツに包まれたピヨ〜！！💛',
    ],
    unlockRequiredFloor: 5,
  },
  {
    id: 'pakimaru',
    name: 'パキまる',
    title: '結晶クラッシュラビット',
    description: 'パリパリ、パキパキと何かが砕ける瞬間の一番鋭いASMR音を聴くと耳がピンと立つ。',
    avatarColor: 'from-rose-400 to-pink-300',
    moodEmoji: '( ≧∇≦ )',
    favoriteSensory: 'crunchy_squeeze',
    bonusType: 'fever_duration',
    bonusDescription: 'ASMRフィーバーの持続時間 +40%',
    reactionQuotes: [
      'パキパキッ！たまらん！',
      'いいヒビが入ったよ！',
      '粉砕の快感ッ！',
      'ゾクゾクしてきた〜！',
    ],
    feverQuotes: [
      '全方位パキパキ破壊ラッシュ！！💥',
      'シバーが止まらない〜〜！！❄️',
    ],
    unlockRequiredFloor: 3,
  },
  {
    id: 'sakusaku_bear',
    name: 'サクベア',
    title: '無心の彫刻職人クマ',
    description: 'キネティックサンドや石鹸をサクサクと無心に削り落とす時の微細な擦れ音で安眠する。',
    avatarColor: 'from-emerald-400 to-teal-300',
    moodEmoji: '( ˘ω˘ )zzZ',
    favoriteSensory: 'soap_carving',
    bonusType: 'tingle_charge',
    bonusDescription: 'ゾクゾク度の上昇速度 +35%',
    reactionQuotes: [
      'サクッ…心が整うクマ…',
      '均等に切れて気持ちいいクマ。',
      '無心になれる音クマ…',
      'ザクザク最高クマ…',
    ],
    feverQuotes: [
      '究極の無心・整いゾーン突入クマ！！🧘‍♂️',
      '静寂とサクサクの調和クマ…！🍃',
    ],
    unlockRequiredFloor: 6,
  },
];
