import { addEntity, addComponent } from 'bitecs'
import { world } from '../../engine/world'
import { Transform } from '../../engine/transform/Transform'
import { InputState } from '../../engine/input/InputState'
import { RenderObject, setThreeObject } from '../../engine/rendering/RenderObject'
import * as THREE from 'three'

// Game-specific components
import { defineComponent, Types } from 'bitecs'

export const Player = defineComponent()
export const Health = defineComponent({
  current: Types.f32,
  max: Types.f32
})
export const Flying = defineComponent()

export const createPlayerEntity = () => {
  const eid = addEntity(world)
  
  addComponent(world, Player, eid)
  addComponent(world, Transform, eid)
  addComponent(world, Health, eid)
  addComponent(world, InputState, eid)
  addComponent(world, RenderObject, eid)
  
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

export const createPlayerMesh = (eid: number, scene: THREE.Scene) => {
  const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.5)
  const playerMaterial = new THREE.MeshLambertMaterial({ color: 0xff69b4 })
  const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial)
  playerMesh.castShadow = true
  setThreeObject(eid, playerMesh)
  scene.add(playerMesh)
  return playerMesh
}