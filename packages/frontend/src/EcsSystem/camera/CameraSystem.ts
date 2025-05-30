import { IWorld, defineQuery } from 'bitecs'
import * as THREE from 'three'
import { Camera } from './Camera'
import { Transform } from '../transform/Transform'
import { InputState } from '../input/InputState'
import { PhysicsWorld } from '../physics/PhysicsWorld'

export interface CameraParams {
  distance: number
  height: number
  sensitivity: number
  verticalLimitUp: number
  verticalLimitDown: number
  damping: number
  minDistance: number
  maxDistance: number
  lookAtOffset: number
  sensitivityCurvePower: number
  lookPlayDistance: number
  cameraPlayDistance: number
  followSmooth: number
  leaveSmooth: number
}

const cameraQuery = defineQuery([Camera, Transform])
const inputQuery = defineQuery([InputState])

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
  params: CameraParams,
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

const updateCameraPosition = (
  cameraEid: number,
  playerPos: THREE.Vector3,
  params: CameraParams,
  deltaTime: number
) => {
  const currentCameraPos = new THREE.Vector3(
    threeCamera!.position.x,
    threeCamera!.position.y,
    threeCamera!.position.z
  )

  const xzVec = new THREE.Vector3(
    playerPos.x - currentCameraPos.x,
    0,
    playerPos.z - currentCameraPos.z
  )
  const distance = xzVec.length()

  let moveDistance = 0
  const targetDistance = Camera.actualDistance[cameraEid]

  if (distance > targetDistance + params.cameraPlayDistance) {
    moveDistance = distance - (targetDistance + params.cameraPlayDistance)
    moveDistance *= deltaTime * params.followSmooth
  } else if (distance < targetDistance - params.cameraPlayDistance) {
    moveDistance = distance - (targetDistance - params.cameraPlayDistance)
    moveDistance *= deltaTime * params.leaveSmooth
  }

  if (Math.abs(moveDistance) > 0.001) {
    const moveVec = xzVec.normalize().multiplyScalar(moveDistance)
    return new THREE.Vector3(
      currentCameraPos.x + moveVec.x,
      Camera.lookPosY[cameraEid] + Camera.currentHeight[cameraEid],
      currentCameraPos.z + moveVec.z
    )
  }

  return new THREE.Vector3(
    currentCameraPos.x,
    Camera.lookPosY[cameraEid] + Camera.currentHeight[cameraEid],
    currentCameraPos.z
  )
}

export const cameraSystem = (
  world: IWorld,
  playerEid: number,
  params?: CameraParams
) => {
  const defaultParams: CameraParams = {
    distance: 15,
    height: 8,
    sensitivity: 0.001,
    verticalLimitUp: 60,
    verticalLimitDown: -30,
    damping: 0.9,
    minDistance: 3,
    maxDistance: 25,
    lookAtOffset: 1.0,
    sensitivityCurvePower: 1.0,
    lookPlayDistance: 0,
    cameraPlayDistance: 0,
    followSmooth: 1.0,
    leaveSmooth: 1.0
  }

  const cameraParams = params || defaultParams
  if (!threeCamera) return world

  const cameras = cameraQuery(world)
  const inputs = inputQuery(world)

  if (cameras.length === 0) return world

  const cameraEid = cameras[0]
  const inputEid = inputs.length > 0 ? inputs[0] : null

  const playerZ = Transform.position.z[playerEid]
  const inSafeZone = playerZ > -5
  const newMode = inSafeZone ? 0 : 1

  if (Camera.mode[cameraEid] !== newMode) {
    console.log(
      `Camera mode change: ${Camera.mode[cameraEid]} -> ${newMode}, playerZ: ${playerZ}, inSafeZone: ${inSafeZone}`
    )
    Camera.mode[cameraEid] = newMode
  }

  const playerPos = new THREE.Vector3(
    Transform.position.x[playerEid],
    Transform.position.y[playerEid],
    Transform.position.z[playerEid]
  )

  if (Camera.mode[cameraEid] === 0) {
    const distance = cameraParams.distance
    const height = cameraParams.height

    Camera.distance[cameraEid] = distance
    Camera.height[cameraEid] = height

    threeCamera.position.set(
      playerPos.x,
      playerPos.y + height,
      playerPos.z + distance
    )
    threeCamera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z)
  } else {
    if (inputEid !== null) {
      const wheelDelta = InputState.mouseWheel?.[inputEid] || 0
      if (Math.abs(wheelDelta) > 0.1) {
        Camera.targetDistance[cameraEid] = Math.max(
          cameraParams.minDistance,
          Math.min(
            cameraParams.maxDistance,
            Camera.targetDistance[cameraEid] + wheelDelta * 2
          )
        )
      }
    }

    Camera.actualDistance[cameraEid] = THREE.MathUtils.lerp(
      Camera.actualDistance[cameraEid],
      Camera.targetDistance[cameraEid],
      0.1
    )

    if (inputEid !== null) {
      const deltaX = InputState.mouseDelta.x[inputEid]
      const mouseY = InputState.mouseY[inputEid]

      const rotationSpeed = 0.02
      if (Math.abs(deltaX) > 0.001) {
        Camera.rotationH[cameraEid] -= Math.sign(deltaX) * rotationSpeed
      }

      const verticalRange =
        (cameraParams.verticalLimitUp - cameraParams.verticalLimitDown) *
        (Math.PI / 180)
      Camera.rotationV[cameraEid] =
        mouseY * verticalRange * 0.5 + (cameraParams.verticalLimitDown * Math.PI) / 180

      if (InputState.reset?.[inputEid]) {
        resetCameraRotation(cameraEid)
      }
    }

    const upLimit = (cameraParams.verticalLimitUp * Math.PI) / 180
    const downLimit = (cameraParams.verticalLimitDown * Math.PI) / 180
    Camera.rotationV[cameraEid] = Math.max(
      downLimit,
      Math.min(upLimit, Camera.rotationV[cameraEid])
    )
  }

  if (Camera.mode[cameraEid] === 1) {
    const distance = Camera.actualDistance[cameraEid]
    const height = cameraParams.height
    const rotH = Camera.rotationH[cameraEid]
    const rotV = Camera.rotationV[cameraEid]

    Camera.distance[cameraEid] = distance
    Camera.height[cameraEid] = height

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

    const physics = PhysicsWorld.getInstance()
    const rayStart = new THREE.Vector3(
      playerPos.x,
      playerPos.y + cameraParams.lookAtOffset,
      playerPos.z
    )
    const rayEnd = idealPosition.clone()

    const hitResult = physics.raycast(rayStart, rayEnd)

    if (hitResult && hitResult.distance > 0) {
      const collisionDistance = hitResult.distance * 0.9
      actualCameraDistance = Math.max(cameraParams.minDistance, collisionDistance)
    }

    const directionToCamera = cameraOffset.clone().normalize()
    const finalCameraOffset = directionToCamera.multiplyScalar(actualCameraDistance)
    threeCamera.position.copy(playerPos).add(finalCameraOffset)

    const lookAtY = playerPos.y + cameraParams.lookAtOffset
    threeCamera.lookAt(playerPos.x, lookAtY, playerPos.z)
  }

  return world
}
