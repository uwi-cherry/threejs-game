import { createWorld } from 'bitecs'

// ECS World Instance
export const world = createWorld()

// Initialize time object for animation loop
world.time = {
  elapsed: 0,
  delta: 0
}