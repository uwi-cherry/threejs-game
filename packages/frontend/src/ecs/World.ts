import { createWorld, Types, defineComponent, defineQuery, addEntity, addComponent, removeComponent, IWorld } from 'bitecs'
import * as THREE from 'three'

// ECS World Instance
export const world = createWorld()

// Component Definitions
export const Transform = defineComponent({
  position: { x: Types.f32, y: Types.f32, z: Types.f32 },
  rotation: { x: Types.f32, y: Types.f32, z: Types.f32 },
  scale: { x: Types.f32, y: Types.f32, z: Types.f32 }
})

export const Velocity = defineComponent({
  x: Types.f32,
  y: Types.f32,
  z: Types.f32
})

export const Health = defineComponent({
  current: Types.f32,
  max: Types.f32
})

export const Player = defineComponent()
export const Enemy = defineComponent()
export const Flying = defineComponent()

export const Camera = defineComponent({
  mode: Types.ui8, // 0: fixed, 1: free
  distance: Types.f32,
  height: Types.f32,
  rotationH: Types.f32,
  rotationV: Types.f32
})

export const Input = defineComponent({
  movementX: Types.f32,
  movementY: Types.f32,
  jump: Types.ui8,
  descend: Types.ui8,
  mouseX: Types.f32,
  mouseY: Types.f32,
  mouseDelta: { x: Types.f32, y: Types.f32 },
  leftClick: Types.ui8,
  rightClick: Types.ui8
})

export const ThreeObject = defineComponent()

// Three.js Object Storage (outside ECS for performance)
export const threeObjects = new Map<number, THREE.Object3D>()

// Queries
export const playerQuery = defineQuery([Player, Transform])
export const movableQuery = defineQuery([Transform, Velocity])
export const renderableQuery = defineQuery([Transform, ThreeObject])
export const cameraQuery = defineQuery([Camera, Transform])
export const inputQuery = defineQuery([Input])

// Helper Functions
export const createPlayerEntity = () => {
  const eid = addEntity(world)
  
  addComponent(world, Player, eid)
  addComponent(world, Transform, eid)
  addComponent(world, Velocity, eid)
  addComponent(world, Health, eid)
  addComponent(world, Input, eid)
  addComponent(world, ThreeObject, eid)
  
  // Initialize Transform
  Transform.position.x[eid] = 0
  Transform.position.y[eid] = 2
  Transform.position.z[eid] = 0
  Transform.rotation.x[eid] = 0
  Transform.rotation.y[eid] = 0
  Transform.rotation.z[eid] = 0
  Transform.scale.x[eid] = 1
  Transform.scale.y[eid] = 1
  Transform.scale.z[eid] = 1
  
  // Initialize Health
  Health.current[eid] = 100
  Health.max[eid] = 100
  
  return eid
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

export const createEnemyEntity = (x: number, y: number, z: number) => {
  const eid = addEntity(world)
  
  addComponent(world, Enemy, eid)
  addComponent(world, Transform, eid)
  addComponent(world, Health, eid)
  addComponent(world, ThreeObject, eid)
  
  // Initialize Transform
  Transform.position.x[eid] = x
  Transform.position.y[eid] = y
  Transform.position.z[eid] = z
  Transform.scale.x[eid] = 1
  Transform.scale.y[eid] = 1
  Transform.scale.z[eid] = 1
  
  // Initialize Health
  Health.current[eid] = 50
  Health.max[eid] = 50
  
  return eid
}

export const setThreeObject = (eid: number, object: THREE.Object3D) => {
  threeObjects.set(eid, object)
}

export const getThreeObject = (eid: number): THREE.Object3D | undefined => {
  return threeObjects.get(eid)
}

export const removeThreeObject = (eid: number) => {
  threeObjects.delete(eid)
}