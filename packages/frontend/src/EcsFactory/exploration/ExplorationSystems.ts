import { IWorld, defineQuery } from 'bitecs'
import { Transform } from '../../engine/transform/Transform'
import { InputState } from '../../engine/input/InputState'
import { Player } from '../player/PlayerFactory'
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
  const deltaTime = (world as any).time.delta / 1000
  const players = playerQuery(world)
  const inputs = inputQuery(world)
  
  console.log(`Players: ${players.length}, Inputs: ${inputs.length}`)
  
  if (players.length > 0 && inputs.length > 0) {
    const playerEid = players[0]
    const inputEid = inputs[0]
    
    const moveSpeed = 0.25
    const jumpHeight = 0.8
    
    // Manual movement (WASD)
    const movementX = InputState.movementX[inputEid]
    const movementZ = -InputState.movementY[inputEid]
    
    console.log(`Movement: X=${movementX}, Z=${movementZ}`)
    console.log(`Player position before: ${Transform.position.x[playerEid]}, ${Transform.position.y[playerEid]}, ${Transform.position.z[playerEid]}`)
    
    // Apply movement directly
    if (Math.abs(movementX) > 0.01) {
      Transform.position.x[playerEid] += movementX * moveSpeed
    }
    if (Math.abs(movementZ) > 0.01) {
      Transform.position.z[playerEid] += movementZ * moveSpeed
    }
    
    console.log(`Player position after: ${Transform.position.x[playerEid]}, ${Transform.position.y[playerEid]}, ${Transform.position.z[playerEid]}`)
    
    // Simple gravity and ground collision
    const groundY = 2
    if (Transform.position.y[playerEid] > groundY) {
      Transform.position.y[playerEid] -= 0.05  // Gentler gravity
    } else {
      Transform.position.y[playerEid] = groundY
    }
    
    // Simple jump
    if (InputState.jump[inputEid] && Math.abs(Transform.position.y[playerEid] - groundY) < 0.1) {
      Transform.position.y[playerEid] = groundY + jumpHeight
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
  const inputEid = inputs.length > 0 ? inputs[0] : null
  
  // Check safe zone for camera mode switching
  const playerZ = Transform.position.z[playerEid]
  const inSafeZone = playerZ > -5
  const newMode = inSafeZone ? 0 : 1 // 0: fixed, 1: free (TPS)
  
  if (Camera.mode[cameraEid] !== newMode) {
    Camera.mode[cameraEid] = newMode
    console.log(`Camera mode changed to: ${newMode === 0 ? 'fixed' : 'TPS'} at Z=${playerZ}`)
  }
  
  const playerPos = new THREE.Vector3(
    Transform.position.x[playerEid],
    Transform.position.y[playerEid],
    Transform.position.z[playerEid]
  )
  
  if (Camera.mode[cameraEid] === 0) {
    // Fixed mode - simple follow camera
    const distance = Camera.distance[cameraEid]
    const height = Camera.height[cameraEid]
    
    threeCamera.position.set(
      playerPos.x,
      playerPos.y + height,
      playerPos.z + distance
    )
    threeCamera.lookAt(playerPos)
    
  } else {
    // TPS mode (原神風) - mouse controls camera, camera controls movement direction
    if (inputEid) {
      const sensitivity = 0.003
      Camera.rotationH[cameraEid] -= InputState.mouseDelta.x[inputEid] * sensitivity
      Camera.rotationV[cameraEid] -= InputState.mouseDelta.y[inputEid] * sensitivity
      
      // Clamp vertical rotation (prevent camera flip)
      Camera.rotationV[cameraEid] = Math.max(
        -Math.PI / 6,  // Look down limit
        Math.min(Math.PI / 3, Camera.rotationV[cameraEid])  // Look up limit
      )
    }
    
    const distance = Camera.distance[cameraEid]
    const rotH = Camera.rotationH[cameraEid]
    const rotV = Camera.rotationV[cameraEid]
    
    // Calculate camera position around player (原神風)
    const cameraOffset = new THREE.Vector3(
      Math.sin(rotH) * Math.cos(rotV) * distance,
      Math.sin(rotV) * distance + 2, // Base height + vertical rotation
      Math.cos(rotH) * Math.cos(rotV) * distance
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