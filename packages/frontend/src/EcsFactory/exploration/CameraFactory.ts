import { addEntity, addComponent, defineComponent, Types } from 'bitecs'
import { world } from '../../engine/world'
import { Transform } from '../../engine/transform/Transform'

// Game-specific camera component
export const Camera = defineComponent({
  mode: Types.ui8, // 0: fixed, 1: free
  distance: Types.f32,
  height: Types.f32,
  rotationH: Types.f32,
  rotationV: Types.f32
})

export const createCameraEntity = () => {
  const eid = addEntity(world)
  
  addComponent(world, Camera, eid)
  addComponent(world, Transform, eid)
  
  // Initialize Camera
  Camera.mode[eid] = 0 // fixed mode
  Camera.distance[eid] = 15
  Camera.height[eid] = 8
  Camera.rotationH[eid] = 0
  Camera.rotationV[eid] = 0
  
  // Initialize Transform
  Transform.position.x[eid] = 0
  Transform.position.y[eid] = 8
  Transform.position.z[eid] = 12
  
  return eid
}