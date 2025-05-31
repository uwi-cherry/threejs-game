import { IWorld, defineQuery } from 'bitecs'
import { Transform } from '../components/Transform'

const transformQuery = defineQuery([Transform])

export const transformSystem = (world: IWorld) => {
  const entities = transformQuery(world)
  
  for (let i = 0; i < entities.length; i++) {
    const eid = entities[i]
    
    // Apply bounds if needed (can be overridden by game-specific systems)
    // This is a basic transform validation system
    
    // Ensure scale never goes negative
    if (Transform.scale.x[eid] < 0.01) Transform.scale.x[eid] = 0.01
    if (Transform.scale.y[eid] < 0.01) Transform.scale.y[eid] = 0.01
    if (Transform.scale.z[eid] < 0.01) Transform.scale.z[eid] = 0.01
  }
  
  return world
}