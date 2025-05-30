import { addEntity, addComponent } from 'bitecs'
import { world } from '../EcsSystem/world'
import { Transform } from '../EcsSystem/transform/Transform'
import { Camera } from '../EcsSystem/camera/Camera'

export const createCameraEntity = () => {
  const eid = addEntity(world)

  addComponent(world, Camera, eid)
  addComponent(world, Transform, eid)

  Camera.mode[eid] = 0
  Camera.distance[eid] = 15
  Camera.height[eid] = 8
  Camera.rotationH[eid] = 0
  Camera.rotationV[eid] = 0
  Camera.velocityH[eid] = 0
  Camera.velocityV[eid] = 0
  Camera.targetDistance[eid] = 15
  Camera.actualDistance[eid] = 15
  Camera.lookPosX[eid] = 0
  Camera.lookPosY[eid] = 2
  Camera.lookPosZ[eid] = 0
  Camera.currentHeight[eid] = 8

  Transform.position.x[eid] = 0
  Transform.position.y[eid] = 8
  Transform.position.z[eid] = 12

  return eid
}
