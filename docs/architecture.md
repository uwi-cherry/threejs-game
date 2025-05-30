# プロジェクトアーキテクチャ

## ディレクトリ構造

```
src/
├── app/                    # Next.js pages
├── components/             # UI components
│   ├── game/               # ゲーム関連コンポーネント
│   │   ├── entities/       # プレイヤー、敵、カメラ
│   │   ├── behaviors/      # 移動、戦闘、カメラ制御
│   │   └── world/          # ゲーム世界
│   └── VisualNovelPlayer/  # ビジュアルノベル関連
├── engine/                 # ゲームエンジン
│   ├── world.ts           # ECS World
│   ├── components/        # ECS Components
│   └── systems/           # ECS Systems
├── infrastructure/         # インフラ
│   ├── assets/            # AssetManager
│   └── auth/              # 認証
└── types/                 # 型定義
```

## 設計原則

### レイヤー分離
- **ドメイン**: 何をするか（プレイヤー移動、戦闘）
- **エンジン**: どうやるか（ECS、レンダリング）
- **インフラ**: 基盤（アセット、認証）

### ECSアーキテクチャ
- **Entity**: ゲームオブジェクト（プレイヤー、敵など）
- **Component**: データ（Transform, Health, Velocityなど）
- **System**: ロジック（MovementSystem, RenderSystemなど）

### 命名規則
- **ディレクトリ**: 小文字（game, engine, infrastructure）
- **ファイル**: PascalCase（PlayerEntity.ts, MovementSystem.ts）
- **避けるもの**: index.ts（明示的importを推奨）

## 技術スタック

- **ECS**: bitECS
- **3D**: Three.js
- **UI**: React + Next.js
- **パッケージ管理**: Bun (workspace)

## 注意点

- npmとBunを混在させない（常にBunを使用）
- index.tsは使わず、直接importする
- ドメインとシステムを分離する