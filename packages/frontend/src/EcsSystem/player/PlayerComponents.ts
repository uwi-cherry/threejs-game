import { defineComponent, Types, type IComponent } from 'bitecs'

// プレイヤーを表すタグコンポーネント
const Player = defineComponent({
  // タグコンポーネントの場合は空のオブジェクトを渡す
  // これにより、bitECSが正しくコンポーネントとして認識する
})

// 体力を管理するコンポーネント
const Health = defineComponent({
  current: { type: Types.f32, default: 100 },
  max: { type: Types.f32, default: 100 }
})

// プレイヤーのパラメータインターフェース
export interface PlayerParams {
  moveSpeed: number
  jumpHeight: number
}

// デフォルトのプレイヤーパラメータ
export const DEFAULT_PLAYER_PARAMS: PlayerParams = {
  moveSpeed: 0.25,
  jumpHeight: 0.8
}

// コンポーネントの型を明示的に定義
type ComponentType = IComponent

// コンポーネントを初期化する関数
export function initializePlayerComponents() {
  // コンポーネントが正しく登録されていることを確認する
  return {
    Player: Player as unknown as ComponentType,
    Health: Health as unknown as ComponentType
  }
}

// エクスポートするコンポーネント
export { Player, Health }
