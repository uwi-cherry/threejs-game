import { defineComponent, Types } from 'bitecs'

export const Player = defineComponent({
  // タグコンポーネントの場合は空のオブジェクトを渡す
  // これにより、bitECSが正しくコンポーネントとして認識する
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

// プレイヤーコンポーネントの型をエクスポート
export type PlayerComponent = typeof Player
