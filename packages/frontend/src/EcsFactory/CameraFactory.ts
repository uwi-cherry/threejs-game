import { addEntity, addComponent, defineComponent, Types, IWorld, defineQuery } from 'bitecs'
import { world } from '../EcsSystem/world'
import { Transform } from '../EcsSystem/transform/Transform'
import { InputState } from '../EcsSystem/input/InputState'
import * as THREE from 'three'

export interface CameraParams {
  distance: number
  height: number
  sensitivity: number
  verticalLimitUp: number
  verticalLimitDown: number
}

// Game-specific camera component
export const Camera = defineComponent({
  mode: Types.ui8, // 0: fixed, 1: free
  distance: Types.f32,
  height: Types.f32,
  rotationH: Types.f32,
  rotationV: Types.f32
})

// Queries
const cameraQuery = defineQuery([Camera, Transform])
const inputQuery = defineQuery([InputState])

let threeCamera: THREE.PerspectiveCamera | null = null

export const setCameraReference = (camera: THREE.PerspectiveCamera) => {
  threeCamera = camera
}

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

export const cameraSystem = (world: IWorld, playerEid: number, params?: CameraParams) => {
  // Default parameters
  const defaultParams: CameraParams = {
    distance: 15,
    height: 8,
    sensitivity: 0.005,
    verticalLimitUp: 45,
    verticalLimitDown: -45
  }
  
  const cameraParams = params || defaultParams
  if (!threeCamera) return world
  
  const cameras = cameraQuery(world)
  const inputs = inputQuery(world)
  
  if (cameras.length === 0) return world
  
  const cameraEid = cameras[0]
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
  }
  
  const playerPos = new THREE.Vector3(
    Transform.position.x[playerEid],
    Transform.position.y[playerEid],
    Transform.position.z[playerEid]
  )
  
  console.log(`Current camera mode: ${Camera.mode[cameraEid]} (0=FIXED, 1=FREE)`)
  
  if (Camera.mode[cameraEid] === 0) {
    // Fixed mode - simple follow camera
    const distance = cameraParams.distance
    const height = cameraParams.height
    
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
    console.log(`Free camera mode - inputEid: ${inputEid}`)
    if (inputEid !== null) {
      // Get camera parameters
      const sensitivity = cameraParams.sensitivity
      
      // Mouse delta accumulation for smoother rotation
      const deltaX = InputState.mouseDelta.x[inputEid]
      const deltaY = InputState.mouseDelta.y[inputEid]
      
      console.log(`CameraFactory Mouse delta: X=${deltaX.toFixed(3)}, Y=${deltaY.toFixed(3)}`)
      console.log(`Current camera rotations: H=${Camera.rotationH[cameraEid].toFixed(3)}, V=${Camera.rotationV[cameraEid].toFixed(3)}`)
      
      if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
        Camera.rotationH[cameraEid] -= deltaX * sensitivity
        Camera.rotationV[cameraEid] -= deltaY * sensitivity
        console.log(`Camera rotation updated: H=${Camera.rotationH[cameraEid].toFixed(3)}, V=${Camera.rotationV[cameraEid].toFixed(3)}`)
        
        // Wrap horizontal rotation to prevent accumulation
        Camera.rotationH[cameraEid] = Camera.rotationH[cameraEid] % (Math.PI * 2)
        
        // Clamp vertical rotation using camera parameters
        const upLimit = (cameraParams.verticalLimitUp * Math.PI) / 180
        const downLimit = (cameraParams.verticalLimitDown * Math.PI) / 180
        Camera.rotationV[cameraEid] = Math.max(
          downLimit,
          Math.min(upLimit, Camera.rotationV[cameraEid])
        )
        
      } else {
        console.log(`Delta too small, threshold is 0.01`)
      }
    }
    
    // Use injected parameters
    const distance = cameraParams.distance
    const height = cameraParams.height
    const rotH = Camera.rotationH[cameraEid]
    const rotV = Camera.rotationV[cameraEid]
    
    // Update ECS values to match debug parameters
    Camera.distance[cameraEid] = distance
    Camera.height[cameraEid] = height
    
    // Spherical coordinate system for smooth camera movement
    const cosV = Math.cos(rotV)
    const sinV = Math.sin(rotV)
    const cosH = Math.cos(rotH)
    const sinH = Math.sin(rotH)
    
    const cameraOffset = new THREE.Vector3(
      sinH * cosV * distance,  // X: side movement
      sinV * distance + height, // Y: height + vertical look
      cosH * cosV * distance   // Z: forward/back
    )
    
    threeCamera.position.copy(playerPos).add(cameraOffset)
    threeCamera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z)  // Look slightly above player center
    
    console.log(`Camera position: (${threeCamera.position.x.toFixed(2)}, ${threeCamera.position.y.toFixed(2)}, ${threeCamera.position.z.toFixed(2)})`)
    console.log(`Camera looking at: (${playerPos.x.toFixed(2)}, ${(playerPos.y + 1).toFixed(2)}, ${playerPos.z.toFixed(2)})`)
  }
  
  return world
}