# Changelog (音フェチタワー - ASMR Sensory Tower)

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-11-01
### Added
- **音フェチなかま（キャラクターコンパニオン）システム**
  - 5人のユニークな音フェチ相棒キャラクターを追加:
    - **ぷに助**: もちぷにスライム妖精（癒やしポイント獲得 +25%）
    - **キーボ**: メカニカルタイピスト（コンボ受付時間 +1.5秒延長）
    - **ハニーピヨ**: 蜜浸しスイーツヒヨコ（キーボード＆ハチミツの癒やし度2倍）
    - **パキまる**: 結晶クラッシュラビット（ASMRフィーバー持続時間 +40%）
    - **サクベア**: 無心の彫刻職人クマ（ゾクゾク度の上昇速度 +35%）
  - 常時画面上でプレイヤーのタッチやフィーバーに連動して表情が変化・跳ねるアニメーション＆ASMRセリフ吹き出し機能。
  - キャラクターの育成・レベルアップ機能（タップによるEXP蓄積とレベルアップ演出）。
  - キャラクター切り替えモーダル。
- **長層タワー＆新感覚音フェチフロア拡張**
  - **4F: コトコト・メカニカルキーボード**: ルブ済みリニア軸キースイッチによる重厚でまろやかなThock打鍵音（PC物理キーボード連動＆タッチ対応）。
  - **5F: トロトロ・ハチミツキーボード**: 琥珀色の蜂蜜が染み込んだゼリーキースイッチ。沈み込むときの「じゅぽっ・ぬちゃっ」という甘美な粘性サウンドと蜜滴エフェクト。
  - **7F: フリーズドライ・パキパキキャンディ**: 軽やかで超クリスピーなエアリーキャンディクラッシュ。
  - **10F: 天空のASMRシンフォニー**: 全音フェチを極めし天空の聖域＆どこまでも登り続けられるエンドレス・インフィニティタワーモード。
- **BDDテストシナリオ拡張**
  - キャラクター選択・経験値獲得・パッシブボーナス適用シナリオ、およびキーボード＆ハチミツキーボード昇降シナリオを追加（全7シナリオ完全合格）。

## [1.1.1] - 2026-11-01
### Fixed
- **GitHub Actions ロックファイル未検出エラーの解消**
  - GitHub Actions の `actions/setup-node` (`cache: 'npm'`) および `npm ci` で要求される `package-lock.json` を生成しリポジトリにコミット。
  - Vite 8 との esbuild バージョン不整合 (`esbuild@^0.28.0`) を解決し、クリーンな依存性解決を保証。

## [1.1.0] - 2026-11-01
### Added
- **GitHub Pages (github.io) デプロイ対応**
  - `vite.config.ts` に `base: './'` を指定し、GitHub Pagesの任意のリポジトリ名パス（`/<repo-name>/`）でもアセットが404にならず正常にロードされる相対パス構成を実装。
  - GitHub Actions ワークフロー (`.github/workflows/deploy.yml`) を作成:
    - `main` ブランチへのプッシュまたは手動実行 (`workflow_dispatch`) で、自動的に依存関係インストール、BDDテスト実行、本番バンドルビルド、GitHub Pagesへの公開を完結。
  - `package.json` に `predeploy` および `deploy` (`gh-pages -d dist`) スクリプトを追加。
  - ローカルGitリポジトリを初期化し、初期コミットを作成。

## [1.0.0] - 2026-11-01
### Added
- **スキーマ駆動アーキテクチャ (Schema-Driven Architecture)**
  - Zodを活用したドメインスキーマ (`domain/schemas/index.ts`) の策定:
    - `SensoryTypeSchema`, `SoundProfileSchema`, `FloorStageSchema`, `PlayerProgressSchema`, `InteractionEventSchema`
  - 実行時バリデーションおよび静的型推論の結合。
- **簡易DDD (Domain-Driven Design) 実装**
  - **Domain Entities & Value Objects**:
    - `SoundFrequency`, `TingleLevel`, `SensoryCoord`, `Floor`, `Badge`
  - **Aggregates**:
    - `TowerAggregate`: タワーの階層進行、癒やしエネルギー計算、エレベーター開閉判定、フィーバー（ゾクゾク度）ステート管理
  - **Domain Services**:
    - `AsmrAudioEngine`: Web Audio APIによるプロシージャル音響合成（プチプチ破裂音、バタースクイーズ低摩擦音、パキパキ多重亀裂音、スライムジュポジュポ音、キネティックサンド切断音、ソープカービングカスケード音）
    - `HapticService`: `navigator.vibrate`と連動した触感フィードバック
  - **Repositories**:
    - `LocalStorageTowerRepository`: プレイヤーのタワー進行データおよびアンロック状態の永続化
  - **Use Cases**:
    - `InteractSensoryUseCase`, `AscendFloorUseCase`, `DescendFloorUseCase`, `ResetProgressUseCase`
- **6つの極上音フェチ階層 (Sensory Tower Floors)**
  - 1F: **プチプチくん (Bubble Wrap)** - マルチタッチ一斉破裂、黄金バブル、ぷちぷちリセット機能
  - 2F: **バタースクイーズ (Butter Squish)** - クリーミーな粘性ドラッグ、バターナイフカット、低周波フリクション
  - 3F: **パキパキスクイーズ (Crunchy Crackle)** - 3Dスナップ、多段階亀裂、ハチの巣クラック
  - 4F: **スライムポーク＆ストレッチ (Slime Poke & Stretch)** - 粘液ポーク、気泡バースト、指先追従スライム物理
  - 5F: **キネティックサンド (Kinetic Sand)** - サクサクスライス、幾何学キューブ削り、砂粒テクスチャ
  - 6F: **ソープカービング (Soap Carving)** - グリッドカッター、キューブカスケード落下、クリスプサウンド
- **天空のフリープレイ・スタジオ (Celestial Sound Sanctum)**
  - 登頂フロアを自由にリミックスできるアンビエント音響（雨音・ホワイトノイズ・微風・ベル）
- **タブレット＆モバイル完全対応**
  - タッチジェスチャーの誤動作防止 (`touch-action: none`)
  - マルチタッチ同時タップ破裂対応
  - 横画面・縦画面フレキシブルレイアウト
- **BDD & TDD テストスイート**
  - Given-When-Thenスタイルで記述された自動テストシナリオ
  - アプリ内にいつでもワンクリックで実行できる「BDD仕様検証ランナー (Live BDD Test Runner)」を搭載
