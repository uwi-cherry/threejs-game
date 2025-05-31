import { IWorld, defineQuery } from 'bitecs'
import { Transform } from '../components/Transform'
import { Velocity } from '../components/Velocity'

const movableQuery = defineQuery([Transform, Velocity])

export const movementSystem = (world: IWorld) => {
  const deltaTime = world.time.delta / 1000 // Convert to seconds
  const movableEntities = movableQuery(world)
  
  for (let i = 0; i < movableEntities.length; i++) {
    const eid = movableEntities[i]
    
    Transform.position.x[eid] += Velocity.x[eid] * deltaTime
    Transform.position.y[eid] += Velocity.y[eid] * deltaTime
    Transform.position.z[eid] += Velocity.z[eid] * deltaTime
  }
  
  return world
}