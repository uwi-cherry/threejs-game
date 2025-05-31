import { defineComponent, type IComponent } from 'bitecs'

// プレイヤーを表すタグコンポーネント
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

// コンポーネントの型をエクスポート
export type PlayerType = typeof Player

// コンポーネントを初期化する関数
export function initializeComponents() {
  return {
    Player: Player as unknown as IComponent
  }
}
