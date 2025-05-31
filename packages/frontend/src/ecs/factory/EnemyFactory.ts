import { addEntity, addComponent, IWorld } from 'bitecs'
import { Transform } from '../components/Transform'
import { RenderObject, setThreeObject } from '../components/RenderObject'
import * as THREE from 'three'

// Game-specific components
import { defineComponent } from 'bitecs'
import { Health } from '../components/Health'

export const Enemy = defineComponent()

/**
 * 敵エンティティを作成します
 * @param world ECS ワールド
 * @param position 初期位置
 * @param health 初期体力（オプション）
 * @returns 作成されたエンティティID
 */
export const createEnemyEntity = (
  world: IWorld,
  position: { x: number; y: number; z: number },
  health?: { current: number; max: number }
) => {
  const eid = addEntity(world)
  
  addComponent(world, Enemy, eid)
  addComponent(world, Transform, eid)
  addComponent(world, Health, eid)
  addComponent(world, RenderObject, eid)
  
  // 初期位置を設定
  Transform.position.x[eid] = position.x
  Transform.position.y[eid] = position.y
  Transform.position.z[eid] = position.z
  
  // スケールを設定
  Transform.scale.x[eid] = 1
  Transform.scale.y[eid] = 1
  Transform.scale.z[eid] = 1
  
  // 体力を設定
  Health.current[eid] = health?.current ?? 50
  Health.max[eid] = health?.max ?? 50
  
  return eid
}

/**
 * 敵の3Dメッシュを作成します
 * @param eid エンティティID
 * @param scene 追加先のシーン
 * @param color 色（オプション）
 * @returns 作成されたメッシュ
 */
export const createEnemyMesh = (
  eid: number,
  scene: THREE.Scene,
  color: number = 0xff0000
): THREE.Mesh => {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({ color })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  
  // エンティティにメッシュを関連付け
  setThreeObject(eid, mesh)
  scene.add(mesh)
  
  return mesh
}