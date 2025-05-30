import { IWorld, defineQuery } from 'bitecs'
import { Transform } from '../../engine/transform/Transform'
import { InputState } from '../../engine/input/InputState'
import { Player, Flying } from '../player/PlayerFactory'
import { Camera } from './CameraFactory'
import * as THREE from 'three'

// Queries
const playerQuery = defineQuery([Player, Transform])
const inputQuery = defineQuery([InputState])
const cameraQuery = defineQuery([Camera, Transform])

let threeCamera: THREE.PerspectiveCamera | null = null

export const setCameraReference = (camera: THREE.PerspectiveCamera) => {
  threeCamera = camera
}

export const playerMovementSystem = (world: IWorld) => {
  const deltaTime = world.time.delta / 1000
  const players = playerQuery(world)
  const inputs = inputQuery(world)
  
  if (players.length > 0 && inputs.length > 0) {
    const playerEid = players[0]
    const inputEid = inputs[0]
    
    const isFlying = Flying.has(playerEid)
    const moveSpeed = isFlying ? 0.3 : 0.15
    const jumpSpeed = 0.2
    
    // Manual movement (WASD)
    const movementX = InputState.movementX[inputEid]
    const movementY = InputState.movementY[inputEid]
    
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
      if (InputState.jump[inputEid]) {
        Transform.position.y[playerEid] += jumpSpeed
      }
      if (InputState.descend[inputEid]) {
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
      if (InputState.jump[inputEid] && Transform.position.y[playerEid] <= 2.1) {
        Transform.position.y[playerEid] += jumpSpeed * 3
      }
    }
    
    // Apply bounds
    Transform.position.x[playerEid] = Math.max(-80, Math.min(80, Transform.position.x[playerEid]))
    Transform.position.z[playerEid] = Math.max(-80, Math.min(80, Transform.position.z[playerEid]))
    Transform.position.y[playerEid] = Math.max(0.5, Math.min(50, Transform.position.y[playerEid]))
  }
  
  return world
}

export const cameraSystem = (world: IWorld) => {
  if (!threeCamera) return world
  
  const cameras = cameraQuery(world)
  const players = playerQuery(world)
  const inputs = inputQuery(world)
  
  if (cameras.length === 0 || players.length === 0) return world
  
  const cameraEid = cameras[0]
  const playerEid = players[0]
  const inputEid = inputs[0]
  
  // Check safe zone for camera mode switching
  const playerZ = Transform.position.z[playerEid]
  const inSafeZone = playerZ > -10
  const newMode = inSafeZone ? 0 : 1 // 0: fixed, 1: free
  
  if (Camera.mode[cameraEid] !== newMode) {
    Camera.mode[cameraEid] = newMode
    
    // Reset camera rotation when entering fixed mode
    if (newMode === 0) {
      Camera.rotationH[cameraEid] = 0
      Camera.rotationV[cameraEid] = 0
    }
    
    console.log(`Camera mode changed to: ${newMode === 0 ? 'fixed' : 'free'}`)
  }
  
  // Handle mouse input for camera rotation (free mode only)
  if (Camera.mode[cameraEid] === 1 && inputEid) {
    const sensitivity = 0.005
    Camera.rotationH[cameraEid] -= InputState.mouseDelta.x[inputEid] * sensitivity
    Camera.rotationV[cameraEid] += InputState.mouseDelta.y[inputEid] * sensitivity
    
    // Clamp vertical rotation
    Camera.rotationV[cameraEid] = Math.max(
      -Math.PI / 3,
      Math.min(Math.PI / 3, Camera.rotationV[cameraEid])
    )
  }
  
  // Update camera position based on mode
  if (Camera.mode[cameraEid] === 0) {
    // Fixed mode
    const playerX = Transform.position.x[playerEid]
    const playerZ = Transform.position.z[playerEid]
    const distance = Camera.distance[cameraEid]
    const height = Camera.height[cameraEid]
    
    threeCamera.position.x = playerX
    threeCamera.position.y = height
    threeCamera.position.z = playerZ + distance
    
    threeCamera.lookAt(
      playerX,
      Transform.position.y[playerEid],
      playerZ
    )
  } else {
    // Free mode
    const playerPos = new THREE.Vector3(
      Transform.position.x[playerEid],
      Transform.position.y[playerEid],
      Transform.position.z[playerEid]
    )
    
    const distance = Camera.distance[cameraEid]
    const height = Camera.height[cameraEid]
    const rotH = Camera.rotationH[cameraEid]
    const rotV = Camera.rotationV[cameraEid]
    
    const cameraOffset = new THREE.Vector3(
      Math.sin(rotH) * distance,
      height + Math.sin(rotV) * 8,
      Math.cos(rotH) * distance
    )
    
    threeCamera.position.copy(playerPos).add(cameraOffset)
    threeCamera.lookAt(playerPos)
  }
  
  return world
}

// System pipeline utility
export const createSystemPipeline = (...systems: Array<(world: any) => any>) => {
  return (world: any) => {
    let currentWorld = world
    for (const system of systems) {
      currentWorld = system(currentWorld)
    }
    return currentWorld
  }
}