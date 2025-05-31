import { addEntity, addComponent, IWorld } from 'bitecs'
import { Transform } from '../components/Transform'
import { InputState } from '../components/InputState'
import { RenderObject, setThreeObject } from '../components/RenderObject'
import { Player } from '../components/Player'
import { Health } from '../components/Health'
import { DEFAULT_PLAYER_PARAMS } from '../components/Player'
import * as THREE from 'three'

/**
 * プレイヤーエンティティを作成します
 * @param world ECS ワールド
 * @param position 初期位置（オプション）
 * @param health 初期体力（オプション）
 * @returns 作成されたエンティティID
 */
export const createPlayerEntity = (
  world: IWorld,
  position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 },
  health: { current: number, max: number } = { current: 100, max: 100 }
) => {
  const eid = addEntity(world)
  
  // 必須コンポーネントを追加
  addComponent(world, Player, eid)
  addComponent(world, Transform, eid)
  addComponent(world, Health, eid)
  addComponent(world, InputState, eid)
  addComponent(world, RenderObject, eid)
  
  // 初期位置の設定
  Transform.position.x[eid] = position.x
  Transform.position.y[eid] = position.y
  Transform.position.z[eid] = position.z
  
  // 初期回転・スケールの設定
  Transform.rotation.x[eid] = 0
  Transform.rotation.y[eid] = 0
  Transform.rotation.z[eid] = 0
  Transform.scale.x[eid] = 1
  Transform.scale.y[eid] = 1
  Transform.scale.z[eid] = 1
  
  // 体力の初期化（デフォルト値はコンポーネント定義で設定済み）
  if (health) {
    Health.current[eid] = health.current
    Health.max[eid] = health.max
  }
  
  return eid
}

/**
 * プレイヤーの3Dメッシュを作成し、シーンに追加する
 * @param eid プレイヤーエンティティID
 * @param scene 追加先のシーン
 * @param color プレイヤーの色（オプション）
 * @returns 作成されたメッシュ
 */
export const createPlayerMesh = (eid: number, scene: THREE.Scene, color: number = 0xff69b4): THREE.Mesh => {
  const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 8, 16)
  const playerMaterial = new THREE.MeshLambertMaterial({ 
    color,
    flatShading: true
  })
  
  const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial)
  playerMesh.castShadow = true
  playerMesh.receiveShadow = true
  
  setThreeObject(eid, playerMesh)
  scene.add(playerMesh)
  
  return playerMesh
}

// 後方互換性のためエクスポート
export { DEFAULT_PLAYER_PARAMS } from '../components/Player'
export { createPlayerMovementSystem } from '../systems/PlayerMovementSystem'