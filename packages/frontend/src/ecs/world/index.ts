export * from './types'
export * from './EntityManager'
export * from './SystemManager'
export * from './WorldManager'
export * from './GameWorld'

// 従来のworld export（後方互換性のため）
import { createWorld } from 'bitecs'
export const world = createWorld()
