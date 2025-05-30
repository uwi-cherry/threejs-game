import { IWorld } from 'bitecs'
import { Transform, Camera, Player, Input, cameraQuery, playerQuery, inputQuery } from '../World'
import * as THREE from 'three'

let threeCamera: THREE.PerspectiveCamera | null = null

export const setCameraReference = (camera: THREE.PerspectiveCamera) => {
  threeCamera = camera
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
    Camera.rotationH[cameraEid] -= Input.mouseDelta.x[inputEid] * sensitivity
    Camera.rotationV[cameraEid] += Input.mouseDelta.y[inputEid] * sensitivity
    
    // Clamp vertical rotation
    Camera.rotationV[cameraEid] = Math.max(
      -Math.PI / 3,
      Math.min(Math.PI / 3, Camera.rotationV[cameraEid])
    )
  }
  
  // Update camera position based on mode
  if (Camera.mode[cameraEid] === 0) {
    // Fixed mode - side-scrolling style
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
    // Free mode - third person
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