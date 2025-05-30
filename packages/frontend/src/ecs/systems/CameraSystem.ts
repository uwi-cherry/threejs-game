// This file is now a re-export module for backward compatibility.
// The functionality has been split into CameraInputSystem.ts and CameraFollowSystem.ts.

import { IWorld } from 'bitecs'

// Re-export types and functions from the split systems
export * from './CameraInputSystem'
export * from './CameraFollowSystem'

// Re-export the Camera component for backward compatibility
export { Camera } from '../components/Camera'

// Define the CameraParams interface
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

// For backward compatibility
export const cameraSystem = (
  world: IWorld,
  playerEid: number,
  params?: CameraParams
) => {
  console.warn('cameraSystem is deprecated. Please use cameraInputSystem and cameraFollowSystem instead.')
  return world
}
