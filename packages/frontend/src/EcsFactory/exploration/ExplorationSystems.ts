import { IWorld, defineQuery } from 'bitecs'
import { Transform } from '../../engine/transform/Transform'
import { InputState } from '../../engine/input/InputState'
import { Player } from '../player/PlayerFactory'
import { Camera } from './CameraFactory'
import { cameraDebugger } from '../../engine/debug/CameraDebugger'
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
  const players = playerQuery(world)
  const inputs = inputQuery(world)
  
  console.log(`Movement System - Players: ${players.length}, Inputs: ${inputs.length}`)
  
  if (players.length > 0 && inputs.length > 0) {
    const playerEid = players[0]
    const inputEid = inputs[0]
    
    // Get debug parameters
    const debugParams = cameraDebugger.getParams()
    const moveSpeed = debugParams.moveSpeed
    const jumpHeight = debugParams.jumpHeight
    
    console.log(`Debug params - Move speed: ${moveSpeed}, Jump height: ${jumpHeight}`)
    
    // Manual movement (WASD)
    const movementX = InputState.movementX[inputEid]
    const movementZ = -InputState.movementY[inputEid]
    
    console.log(`Input values - X: ${movementX}, Z: ${movementZ}`)
    console.log(`Player position before: X=${Transform.position.x[playerEid]}, Y=${Transform.position.y[playerEid]}, Z=${Transform.position.z[playerEid]}`)
    
    // Apply movement directly
    if (Math.abs(movementX) > 0.01) {
      Transform.position.x[playerEid] += movementX * moveSpeed
      console.log(`Applied X movement: ${movementX * moveSpeed}`)
    }
    if (Math.abs(movementZ) > 0.01) {
      Transform.position.z[playerEid] += movementZ * moveSpeed
      console.log(`Applied Z movement: ${movementZ * moveSpeed}`)
    }
    
    console.log(`Player position after: X=${Transform.position.x[playerEid]}, Y=${Transform.position.y[playerEid]}, Z=${Transform.position.z[playerEid]}`);
    
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
    
    // Apply bounds - prevent going too far forward (positive Z)
    Transform.position.x[playerEid] = Math.max(-80, Math.min(80, Transform.position.x[playerEid]))
    Transform.position.z[playerEid] = Math.max(-80, Math.min(5, Transform.position.z[playerEid]))  // Limit forward movement
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
  
  // Prevent going forward from safe zone
  if (inSafeZone && Transform.position.z[playerEid] > 0) {
    Transform.position.z[playerEid] = 0
  }
  
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
    const debugParams = cameraDebugger.getParams()
    const distance = debugParams.distance
    const height = debugParams.height
    
    // Update ECS values
    Camera.distance[cameraEid] = distance
    Camera.height[cameraEid] = height
    
    threeCamera.position.set(
      playerPos.x,
      playerPos.y + height,
      playerPos.z + distance
    )
    threeCamera.lookAt(playerPos)
    
  } else {
    // TPS mode (原神風) - free camera with full rotation
    if (inputEid) {
      // Get debug parameters for sensitivity and limits
      const debugParams = cameraDebugger.getParams()
      const sensitivity = debugParams.sensitivity
      
      console.log(`Camera debug params - Distance: ${debugParams.distance}, Height: ${debugParams.height}, Sensitivity: ${sensitivity}`)
      
      // Mouse delta accumulation for smoother rotation
      const deltaX = InputState.mouseDelta.x[inputEid]
      const deltaY = InputState.mouseDelta.y[inputEid]
      
      if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
        Camera.rotationH[cameraEid] -= deltaX * sensitivity
        Camera.rotationV[cameraEid] -= deltaY * sensitivity
        
        // Wrap horizontal rotation to prevent accumulation
        Camera.rotationH[cameraEid] = Camera.rotationH[cameraEid] % (Math.PI * 2)
        
        // Clamp vertical rotation using debug parameters
        const upLimit = (debugParams.verticalLimitUp * Math.PI) / 180
        const downLimit = (debugParams.verticalLimitDown * Math.PI) / 180
        Camera.rotationV[cameraEid] = Math.max(
          downLimit,
          Math.min(upLimit, Camera.rotationV[cameraEid])
        )
        
      }
    }
    
    // Use debug parameters if available, otherwise use ECS values
    const debugParams = cameraDebugger.getParams()
    const distance = debugParams.distance
    const height = debugParams.height
    const rotH = Camera.rotationH[cameraEid]
    const rotV = Camera.rotationV[cameraEid]
    
    // Update ECS values to match debug parameters
    Camera.distance[cameraEid] = distance
    Camera.height[cameraEid] = height
    
    console.log(`Using camera values - Distance: ${distance}, Height: ${height}, RotH: ${rotH}, RotV: ${rotV}`)
    
    // Spherical coordinate system for smooth camera movement
    const cosV = Math.cos(rotV)
    const sinV = Math.sin(rotV)
    const cosH = Math.cos(rotH)
    const sinH = Math.sin(rotH)
    
    const cameraOffset = new THREE.Vector3(
      sinH * cosV * distance,  // X: side movement
      sinV * distance + 4,     // Y: height + vertical look
      cosH * cosV * distance   // Z: forward/back
    )
    
    threeCamera.position.copy(playerPos).add(cameraOffset)
    threeCamera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z)  // Look slightly above player center
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