import { IWorld, defineQuery } from 'bitecs'
import * as THREE from 'three'
import { Camera } from '../components/Camera'
import { Transform } from '../components/Transform'
import { PhysicsWorld } from '../../ecs/systems/PhysicsWorld'

export interface CameraInputParams {
  sensitivity: number
  verticalLimitUp: number
  verticalLimitDown: number
  minDistance: number
  maxDistance: number
}

export interface CameraFollowParams {
  distance: number
  height: number
  minDistance: number
  lookAtOffset: number
  lookPlayDistance: number
  cameraPlayDistance: number
  followSmooth: number
  leaveSmooth: number
}

export type CameraParams = CameraInputParams & CameraFollowParams

const cameraQuery = defineQuery([Camera, Transform])

let threeCamera: THREE.PerspectiveCamera | null = null

export const setCameraReference = (camera: THREE.PerspectiveCamera) => {
  threeCamera = camera
}

export const resetCameraRotation = (cameraEid: number) => {
  Camera.rotationH[cameraEid] = 0
  Camera.rotationV[cameraEid] = 0.2
}

const updateLookPosition = (
  cameraEid: number,
  playerPos: THREE.Vector3,
  params: {
    lookPlayDistance: number
    followSmooth: number
  },
  deltaTime: number
) => {
  const currentLookPos = new THREE.Vector3(
    Camera.lookPosX[cameraEid],
    Camera.lookPosY[cameraEid],
    Camera.lookPosZ[cameraEid]
  )

  const vec = playerPos.clone().sub(currentLookPos)
  const distance = vec.length()

  if (distance > params.lookPlayDistance) {
    const moveDistance =
      (distance - params.lookPlayDistance) * (deltaTime * params.followSmooth)
    const moveVec = vec.normalize().multiplyScalar(moveDistance)

    Camera.lookPosX[cameraEid] += moveVec.x
    Camera.lookPosY[cameraEid] += moveVec.y
    Camera.lookPosZ[cameraEid] += moveVec.z
  }
}

export const cameraFollowSystem = (
  world: IWorld,
  playerEid: number,
  deltaTime: number,
  params: CameraFollowParams
) => {
  if (!threeCamera) return world

  const cameras = cameraQuery(world)
  if (cameras.length === 0) return world

  const cameraEid = cameras[0]
  const playerPos = new THREE.Vector3(
    Transform.position.x[playerEid],
    Transform.position.y[playerEid],
    Transform.position.z[playerEid]
  )

  // Handle camera mode based on player position
  const playerZ = Transform.position.z[playerEid]
  const inSafeZone = playerZ > -5
  const newMode = inSafeZone ? 0 : 1

  if (Camera.mode[cameraEid] !== newMode) {
    console.log(
      `Camera mode change: ${Camera.mode[cameraEid]} -> ${newMode}, playerZ: ${playerZ}, inSafeZone: ${inSafeZone}`
    )
    Camera.mode[cameraEid] = newMode
  }

  // Update camera position based on mode
  if (Camera.mode[cameraEid] === 0) {
    // Simple follow mode
    threeCamera.position.set(
      playerPos.x,
      playerPos.y + params.height,
      playerPos.z + params.distance
    )
    threeCamera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z)
  } else {
    // Advanced follow mode with collision detection
    updateLookPosition(
      cameraEid,
      playerPos,
      {
        lookPlayDistance: params.lookPlayDistance,
        followSmooth: params.followSmooth
      },
      deltaTime
    )

    // Smoothly interpolate the actual distance
    Camera.actualDistance[cameraEid] = THREE.MathUtils.lerp(
      Camera.actualDistance[cameraEid],
      Camera.targetDistance[cameraEid],
      0.1
    )

    // Calculate camera position with collision detection
    const distance = Camera.actualDistance[cameraEid]
    const height = params.height
    const rotH = Camera.rotationH[cameraEid]
    const rotV = Camera.rotationV[cameraEid]

    const cosV = Math.cos(rotV)
    const sinV = Math.sin(rotV)
    const cosH = Math.cos(rotH)
    const sinH = Math.sin(rotH)

    const cameraOffset = new THREE.Vector3(
      sinH * cosV * distance,
      sinV * distance + height,
      cosH * cosV * distance
    )

    const idealPosition = new THREE.Vector3().copy(playerPos).add(cameraOffset)
    let actualCameraDistance = distance

    // Perform raycast for collision detection
    const physics = PhysicsWorld.getInstance()
    const rayStart = new THREE.Vector3(
      playerPos.x,
      playerPos.y + params.lookAtOffset,
      playerPos.z
    )
    const rayEnd = idealPosition.clone()

    const hitResult = physics.raycast(rayStart, rayEnd)

    if (hitResult && hitResult.distance > 0) {
      const collisionDistance = hitResult.distance * 0.9
      actualCameraDistance = Math.max(params.minDistance, collisionDistance)
    }

    const directionToCamera = cameraOffset.clone().normalize()
    const finalCameraOffset = directionToCamera.multiplyScalar(actualCameraDistance)
    threeCamera.position.copy(playerPos).add(finalCameraOffset)

    const lookAtY = playerPos.y + params.lookAtOffset
    threeCamera.lookAt(playerPos.x, lookAtY, playerPos.z)
  }

  return world
}
