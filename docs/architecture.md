# プロジェクトアーキテクチャ

## ディレクトリ構造

```
  engineは汎用ドメイン別ディレクトリ構造:

  engine/
  ├── world.ts
  ├── transform/          # 汎用ドメイン
  │   ├── Transform.ts
  │   └── TransformSystem.ts
  ├── physics/            # 汎用ドメイン
  │   ├── Velocity.ts
  │   └── MovementSystem.ts
  ├── rendering/          # 汎用ドメイン
  │   ├── RenderObject.ts
  │   └── RenderSystem.ts
  └── input/              # 汎用ドメイン
      ├── InputState.ts
      └── InputSystem.ts

  EcsFactory/             # componentsから分離
  ├── player/
  │   └── PlayerFactory.ts
  ├── enemy/
  │   └── EnemyFactory.ts
  └── exploration/
      └── ExplorationFactory.ts
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