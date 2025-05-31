import { defineComponent, Types, type IComponent } from 'bitecs'

// 体力を管理するコンポーネント
export const Health = defineComponent({
  current: { type: Types.f32, default: 100 },
  max: { type: Types.f32, default: 100 }
})

// コンポーネントの型をエクスポート
export type HealthType = typeof Health

// コンポーネントを初期化する関数
export function initializeComponents() {
  return {
    Health: Health as unknown as IComponent
  }
}
