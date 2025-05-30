import { IWorld } from 'bitecs'
import { addEntity, addComponent } from 'bitecs'
import { world } from '../world'
import { Transform } from '../components/Transform'
import { Camera } from '../components/Camera'
import { setCameraReference } from '../systems/CameraFollowSystem'
import { cameraInputSystem } from '../systems/CameraInputSystem'
import { cameraFollowSystem } from '../systems/CameraFollowSystem'
import { PerspectiveCamera } from 'three'

export interface CameraSystemParams {
  // Camera reference
  camera: PerspectiveCamera
  
  // Camera entity parameters
  initialPosition?: {
    x: number
    y: number
    z: number
  }
  
  // Camera system parameters
  distance?: number
  height?: number
  minDistance?: number
  maxDistance?: number
  lookAtOffset?: number
  lookPlayDistance?: number
  cameraPlayDistance?: number
  followSmooth?: number
  leaveSmooth?: number
  sensitivity?: number
  verticalLimitUp?: number
  verticalLimitDown?: number
}

export const createCameraEntity = (params: CameraSystemParams) => {
  const eid = addEntity(world)

  // Add components
  addComponent(world, Camera, eid)
  addComponent(world, Transform, eid)

  // Set camera reference
  setCameraReference(params.camera)


  // Set default values
  const {
    initialPosition = { x: 0, y: 8, z: 12 },
    distance = 15,
    height = 8,
    minDistance = 3,
    maxDistance = 25,
    lookAtOffset = 1.0,
    lookPlayDistance = 0,
    cameraPlayDistance = 0,
    followSmooth = 1.0,
    leaveSmooth = 1.0,
    sensitivity = 0.001,
    verticalLimitUp = 60,
    verticalLimitDown = -20
  } = params

  // Initialize camera component
  Camera.mode[eid] = 0
  Camera.distance[eid] = distance
  Camera.height[eid] = height
  Camera.rotationH[eid] = 0
  Camera.rotationV[eid] = 0.2
  Camera.velocityH[eid] = 0
  Camera.velocityV[eid] = 0
  Camera.targetDistance[eid] = distance
  Camera.actualDistance[eid] = distance
  Camera.lookPosX[eid] = 0
  Camera.lookPosY[eid] = lookAtOffset
  Camera.lookPosZ[eid] = 0
  Camera.currentHeight[eid] = height

  // Set transform
  Transform.position.x[eid] = initialPosition.x
  Transform.position.y[eid] = initialPosition.y
  Transform.position.z[eid] = initialPosition.z

  // Return both entity ID and system parameters
  return {
    eid,
    systemParams: {
      // For cameraInputSystem
      sensitivity,
      verticalLimitUp,
      verticalLimitDown,
      minDistance,
      maxDistance,
      
      // For cameraFollowSystem
      distance,
      height,
      lookAtOffset,
      lookPlayDistance,
      cameraPlayDistance,
      followSmooth,
      leaveSmooth
    }
  }
}

export const createCameraSystem = (world: IWorld, playerEid: number, params: ReturnType<typeof createCameraEntity>['systemParams']) => {
  return (world: IWorld) => {
    // Run camera input system
    world = cameraInputSystem(world, playerEid, {
      sensitivity: params.sensitivity,
      verticalLimitUp: params.verticalLimitUp,
      verticalLimitDown: params.verticalLimitDown,
      minDistance: params.minDistance,
      maxDistance: params.maxDistance
    })
    
    // Run camera follow system
    const deltaTime = (world as any).time?.delta || 1/60
    return cameraFollowSystem(world, playerEid, deltaTime, {
      distance: params.distance,
      height: params.height,
      minDistance: params.minDistance,
      lookAtOffset: params.lookAtOffset,
      lookPlayDistance: params.lookPlayDistance,
      cameraPlayDistance: params.cameraPlayDistance,
      followSmooth: params.followSmooth,
      leaveSmooth: params.leaveSmooth
    })
  }
}
