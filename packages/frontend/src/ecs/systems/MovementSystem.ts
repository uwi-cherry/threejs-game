import { IWorld } from 'bitecs'
import { Transform, Velocity, Player, Flying, Input, movableQuery, playerQuery, inputQuery } from '../World'

export const movementSystem = (world: IWorld) => {
  const deltaTime = world.time.delta / 1000 // Convert to seconds
  
  // Process input for player movement
  const players = playerQuery(world)
  const inputs = inputQuery(world)
  
  if (players.length > 0 && inputs.length > 0) {
    const playerEid = players[0]
    const inputEid = inputs[0]
    
    const isFlying = Flying.has(playerEid)
    const moveSpeed = isFlying ? 0.3 : 0.15
    const jumpSpeed = 0.2
    
    // Manual movement (WASD)
    const movementX = Input.movementX[inputEid]
    const movementY = Input.movementY[inputEid]
    
    if (Math.abs(movementX) > 0.1 || Math.abs(movementY) > 0.1) {
      // Apply movement
      const movement = { x: movementX, y: 0, z: movementY }
      
      // Normalize movement vector
      const length = Math.sqrt(movement.x * movement.x + movement.z * movement.z)
      if (length > 0) {
        movement.x = (movement.x / length) * moveSpeed
        movement.z = (movement.z / length) * moveSpeed
      }
      
      Transform.position.x[playerEid] += movement.x
      Transform.position.z[playerEid] += movement.z
    }
    
    // Vertical movement
    if (isFlying) {
      // Flying mode
      if (Input.jump[inputEid]) {
        Transform.position.y[playerEid] += jumpSpeed
      }
      if (Input.descend[inputEid]) {
        Transform.position.y[playerEid] -= jumpSpeed
      }
    } else {
      // Ground mode - apply gravity
      if (Transform.position.y[playerEid] > 2) {
        Transform.position.y[playerEid] -= 0.1
      } else {
        Transform.position.y[playerEid] = 2
      }
      
      // Jump
      if (Input.jump[inputEid] && Transform.position.y[playerEid] <= 2.1) {
        Transform.position.y[playerEid] += jumpSpeed * 3
      }
    }
    
    // Apply bounds
    Transform.position.x[playerEid] = Math.max(-80, Math.min(80, Transform.position.x[playerEid]))
    Transform.position.z[playerEid] = Math.max(-80, Math.min(80, Transform.position.z[playerEid]))
    Transform.position.y[playerEid] = Math.max(0.5, Math.min(50, Transform.position.y[playerEid]))
  }
  
  // Process velocity-based movement for other entities
  const movableEntities = movableQuery(world)
  for (let i = 0; i < movableEntities.length; i++) {
    const eid = movableEntities[i]
    
    Transform.position.x[eid] += Velocity.x[eid] * deltaTime
    Transform.position.y[eid] += Velocity.y[eid] * deltaTime
    Transform.position.z[eid] += Velocity.z[eid] * deltaTime
  }
  
  return world
}