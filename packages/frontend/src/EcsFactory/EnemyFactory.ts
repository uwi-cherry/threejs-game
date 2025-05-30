import { addEntity, addComponent } from 'bitecs'
import { world } from '../EcsSystem/world'
import { Transform } from '../EcsSystem/transform/Transform'
import { RenderObject, setThreeObject } from '../EcsSystem/rendering/RenderObject'
import * as THREE from 'three'

// Game-specific components
import { defineComponent } from 'bitecs'
import { Health, initializePlayerComponents } from '../EcsSystem/player/PlayerComponents'

// コンポーネントを初期化
const { Health: HealthComponent } = initializePlayerComponents()

export const Enemy = defineComponent()

export const createEnemyEntity = (x: number, y: number, z: number) => {
  const eid = addEntity(world)
  
  addComponent(world, Enemy, eid)
  addComponent(world, Transform, eid)
  addComponent(world, HealthComponent, eid)
  addComponent(world, RenderObject, eid)
  
  // Initialize Transform
  Transform.position.x[eid] = x
  Transform.position.y[eid] = y
  Transform.position.z[eid] = z
  Transform.scale.x[eid] = 1
  Transform.scale.y[eid] = 1
  Transform.scale.z[eid] = 1
  
  // Initialize Health
  const healthComp = Health as any
  healthComp.current[eid] = 50
  healthComp.max[eid] = 50
  
  return eid
}

export const createEnemyMesh = (eid: number, scene: THREE.Scene) => {
  const enemyGeometry = new THREE.BoxGeometry(1, 1, 1)
  const enemyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })
  const enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial)
  enemyMesh.castShadow = true
  setThreeObject(eid, enemyMesh)
  scene.add(enemyMesh)
  return enemyMesh
}