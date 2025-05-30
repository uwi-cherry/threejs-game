import { IWorld } from 'bitecs'
import { Transform, ThreeObject, renderableQuery, getThreeObject } from '../World'
import * as THREE from 'three'

export const renderSystem = (world: IWorld) => {
  const renderableEntities = renderableQuery(world)
  
  for (let i = 0; i < renderableEntities.length; i++) {
    const eid = renderableEntities[i]
    const threeObject = getThreeObject(eid)
    
    if (threeObject) {
      // Sync ECS Transform with Three.js object
      threeObject.position.set(
        Transform.position.x[eid],
        Transform.position.y[eid],
        Transform.position.z[eid]
      )
      
      threeObject.rotation.set(
        Transform.rotation.x[eid],
        Transform.rotation.y[eid],
        Transform.rotation.z[eid]
      )
      
      threeObject.scale.set(
        Transform.scale.x[eid],
        Transform.scale.y[eid],
        Transform.scale.z[eid]
      )
    }
  }
  
  return world
}