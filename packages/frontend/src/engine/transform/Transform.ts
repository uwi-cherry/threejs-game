import { defineComponent, Types } from 'bitecs'

export const Transform = defineComponent({
  position: { x: Types.f32, y: Types.f32, z: Types.f32 },
  rotation: { x: Types.f32, y: Types.f32, z: Types.f32 },
  scale: { x: Types.f32, y: Types.f32, z: Types.f32 }
})