// ECS Systems
export { movementSystem } from './MovementSystem'
export { cameraSystem, setCameraReference } from './CameraSystem'
export { renderSystem } from './RenderSystem'
export { InputSystemManager } from './InputSystem'

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