import { defineComponent, Types } from 'bitecs'

export const InputState = defineComponent({
  movementX: Types.f32,
  movementY: Types.f32,
  jump: Types.ui8,
  descend: Types.ui8,
  mouseX: Types.f32,
  mouseY: Types.f32,
  mouseDelta: { x: Types.f32, y: Types.f32 },
  leftClick: Types.ui8,
  rightClick: Types.ui8,
  mouseWheel: Types.f32,
  reset: Types.ui8
})