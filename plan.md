# 音フェチタワー (ASMR Sensory Tower) - 設計・開発計画書 (plan.md)

## 1. プロジェクト概要 (Project Overview)
**音フェチタワー (ASMR Sensory Tower)** は、プレイヤーが極上の触感と聴覚的満足度（ASMR音フェチ）を体験しながら天空のタワーを登っていく癒やし系クリッカー＆フィジェットタワーゲームです。

### コア体験
- **プチプチくん (1F)**: 気泡緩衝材の連続破裂、マルチタッチによる一斉プチプチ、黄金のビッグバブル
- **バタースクイーズ (2F)**: クリーミーでねっとり滑らかな低摩擦スクイーズ音、バターナイフによる延ばしと押し込み音
- **パキパキスクイーズ (3F)**: テープボールや蜂の巣のような超高精細クラックル＆スナップ破裂音
- **コトコト・メカニカルキーボード (4F)**: ルブ済みリニア軸の重厚でまろやかなThock打鍵音
- **トロトロ・ハチミツキーボード (5F)**: 黄金の蜜が染み込んだゼリーキースイッチの「じゅぽっ・ぬちゃっ」粘性音
- **スライムポーク＆ストレッチ (6F)**: 湿り気のあるジュポッ・チュパッという気泡破裂音と弾性サウンド
- **フリーズドライ・パキパキキャンディ (7F)**: サクサク・パキパキと崩壊するエアリークラッシュ音
- **キネティックサンド (8F)**: サクサク切り落とす砂時計のような微細粒子切断音
- **ソープカービング (9F)**: グリッド状に刻まれたキューブがパラパラとカスケード落下する硬質かつ心地よい音
- **天空のエンドレス・シンフォニー (10F〜∞)**: どこまでも登り続けられる天空の無限タワー＆マスターモード
- **音フェチなかま（相棒キャラクター）**: ぷに助、キーボ、ハニーピヨ、パキまる、サクベアによるセリフ・パッシブボーナス・レベルアップ育成

---

## 2. アーキテクチャ設計: スキーマ駆動 ＆ 簡易DDD (Domain-Driven Design)

### 2.1 スキーマ駆動 (Schema-Driven)
Zodを用いた厳格なスキーマ定義により、実行時バリデーションとTypeScript型の完全な整合性を保証します。
- `SensoryTypeSchema`: 触感種別の列挙 (`bubble_wrap`, `butter_squeeze`, `crunchy_squeeze`, `mechanical_keyboard`, `honey_keyboard`, `slime_poke`, `freeze_dried_candy`, `kinetic_sand`, `soap_carving`, `celestial_symphony`)
- `CharacterSchema`: なかまキャラクター定義（ボーナス種別、セリフ集、解放条件、アバター色）
- `AudioProfileSchema`: 音響合成パラメータ（基底周波数、フィルターQ値、レゾナンス、ホワイト/ピンクノイズ比率、ディケイ、パン、リバーブ量）
- `FloorStageSchema`: 各階層の目標値、解放条件、獲得可能な癒やし度(Euphoria/SSP)、演出設定
- `PlayerStateSchema`: 現在の階層、総癒やしポイント、ゾクゾク度(Tingle Gauge)、アンロック実績、オーディオ設定、選択中のキャラクター、キャラ経験値・レベル
- `InteractionEventSchema`: タップ、ドラッグ、スクイーズ、タイピング、ハニーディップ、マルチタッチ入力イベント

### 2.2 ドメイン層 (Domain Layer)
- **Value Objects**:
  - `SoundFrequency`: 周波数範囲 (20Hz - 20,000Hz)
  - `TingleLevel`: ゾクゾク度 (0 - 100%)。高速連続入力や絶妙なリズムで「脳がとろけるASMRフィーバー」発動
  - `SensoryCoord`: タッチ座標・筆圧・移動ベクトルの不変値
- **Entities**:
  - `Floor`: 階層ごとのゲームパラメータ、状態（プチプチの残数、スライムの粘度、バタースライムの残り厚み）
  - `Badge`: 達成した音フェチ称号（「プチプチ職人」「バターの魔術師」など）
- **Aggregates**:
  - `TowerAggregate`: タワー全体の進行状況、階層昇降、癒やしエネルギー蓄積、昇降エレベーターの制御をカプセル化

### 2.3 インフラストラクチャ層 (Infrastructure Layer)
- `AsmrAudioEngine`: 外部音声ファイルに一切依存せず、Web Audio API (`AudioContext`, `BiquadFilterNode`, `StereoPannerNode`, `ConvolverNode`, `BufferSource`) を用いてミリ秒単位のゼロレイテンシでリアルな物理音をプロシージャル合成
- `HapticService`: `navigator.vibrate`を活用し、音の破裂・スクイーズ・切断の感触に同期したマイクロバイブレーションを提供
- `TowerRepository`: LocalStorageを利用したプログレス永続化

### 2.4 アプリケーション層 (Application / Use Cases)
- `AscendFloorUseCase`: 目標スコア達成時にエレベーターを呼び出し次階層へ昇る
- `InteractSensoryUseCase`: 触感アクションを処理し、音響再生・スコア加算・コンボ更新を行う
- `UnlockNextFloorUseCase`: 条件達成フロアの解放
- `ChangeAudioSettingsUseCase`: 立体音響（バイノーラル・ステレオパン）、マスター音量、リバーブ設定の更新

---

## 3. テスト戦略: BDD (Behavior-Driven Development) & TDD

### BDD シナリオ構成 (Given - When - Then)
1. **フィーチャー: プチプチくんの破裂と階層進行**
   - *Given*: プレイヤーが1階（プチプチくん）にいる
   - *When*: 未破裂のバブルをタップする
   - *Then*: 高音域レゾナンスの破裂音が鳴り、バブルが弾け、癒やしポイントが加算される
   - *When*: 規定の目標ポイントに到達する
   - *Then*: エレベーターのインジケーターが点灯し、2階への昇降が可能になる

2. **フィーチャー: バタースクイーズのねっとり触感**
   - *Given*: 2階（バタースクイーズ）がアンロックされている
   - *When*: スライム上を指またはナイフでドラッグする
   - *Then*: 粘性のある低周波フリクション音とバターの変形が発生し、ドラッグ速度に応じた連続音響が奏でられる

3. **フィーチャー: パキパキスクイーズの多段階クラック**
   - *Given*: 3階（パキパキスクイーズ）にいる
   - *When*: スクイーズボールを長押し・押し込む
   - *Then*: パキパキッという多重亀裂音と破壊エフェクトが発生し、ゾクゾク度ゲージが大きく上昇する

4. **フィーチャー: タブレット・マルチタッチ対応**
   - *Given*: タブレット端末で複数指で画面に触れる
   - *When*: 3本の指で同時にプチプチを押す
   - *Then*: 画面スクロールを起こさず、3つのバブルが同時に破裂音を鳴らし、マルチポップコンボが発生する

### アプリ内BDDテストランナー (Live In-App Test Runner)
ユーザーや開発者がいつでもブラウザ上でテストシナリオを検証できるよう、UI内に「BDD仕様検証モード」を搭載。各仕様がグリーン（合格）になることを視覚的に確認できます。

---

## 4. UI/UX ＆ タブレット対応設計 (Tablet & Mobile Ergonomics)
- **タッチ操作の最適化**:
  - `touch-action: none` / `user-select: none` によりスワイプ操作やピンチ時の不要なブラウザスクロールや拡大を完全防止
  - 押し心地の良い大面積の触感キャンバス＆ボタン設計
- **タワー構造ビジュアル**:
  - 画面上部またはサイドに「ASMRタワー」の昇降インジケーターとエレベーターボタン
  - 階層ごとに幻想的で美しいカラースキーム（パステルバターイエロー、ミントスライム、クリスタルアイス、キャンディピンク）
- **立体音響（バイノーラル・パン）**:
  - タッチした画面のX座標（左〜右）に応じてリアルタイムに左右のステレオパンを適用。ヘッドホン装着時にまるで耳元で触っているかのような臨場感を実現。

---

## 5. GitHub Pages (github.io) デプロイ戦略

### 5.1 相対パス構成 (Relative Base Path)
- `vite.config.ts` で `base: './'` を指定。
- GitHub Pagesのリポジトリ名ルート (`https://<user>.github.io/<repo-name>/`) 配下でも、静的アセット (`./assets/*.js`, `./assets/*.css`) が正しく解決されます。

### 5.2 GitHub Actions ワークフロー (`.github/workflows/deploy.yml`)
- `main` ブランチへのプッシュ時に自動起動。
- CIステップ:
  1. `actions/checkout@v4` でコード取得
  2. `actions/setup-node@v4` で Node.js 20 環境構築
  3. `npm ci` で依存関係インストール
  4. `npm test` でBDDテストスイート全件実行
  5. `npm run build` で本番用 `dist/` ディレクトリ生成
  6. `actions/deploy-pages@v4` で GitHub Pages へのゼロコンフィグ自動公開

### 5.3 CLIからのデプロイ (gh-pages)
- `package.json` に `"deploy": "gh-pages -d dist"` を設定済み。
- リモートリポジトリ登録後、`npm run deploy` 一発で `gh-pages` ブランチにビルド成果物をプッシュして公開可能。

