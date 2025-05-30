import { defineComponent, Types } from 'bitecs'

export const Camera = defineComponent({
  mode: Types.ui8,
  distance: Types.f32,
  height: Types.f32,
  rotationH: Types.f32,
  rotationV: Types.f32,
  velocityH: Types.f32,
  velocityV: Types.f32,
  targetDistance: Types.f32,
  actualDistance: Types.f32,
  lookPosX: Types.f32,
  lookPosY: Types.f32,
  lookPosZ: Types.f32,
  currentHeight: Types.f32
})
