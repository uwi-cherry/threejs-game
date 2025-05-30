import { addEntity, addComponent } from 'bitecs'
import { world } from '../EcsSystem/world'
import { Transform } from '../EcsSystem/transform/Transform'
import { InputState } from '../EcsSystem/input/InputState'
import { RenderObject, setThreeObject } from '../EcsSystem/rendering/RenderObject'
import { 
  Player, 
  Health, 
  DEFAULT_PLAYER_PARAMS,
  initializePlayerComponents
} from '../EcsSystem/player/PlayerComponents'

// コンポーネントを初期化
const { Player: PlayerComponent, Health: HealthComponent } = initializePlayerComponents()
import * as THREE from 'three'

/**
 * プレイヤーエンティティを作成する
 * @param position 初期位置（オプション）
 * @param health 初期体力（オプション）
 * @returns 作成されたエンティティID
 */
export const createPlayerEntity = (position?: { x: number, y: number, z: number }, health?: { current: number, max: number }) => {
  const eid = addEntity(world)
  
  // 必須コンポーネントを追加
  addComponent(world, PlayerComponent, eid)
  addComponent(world, Transform, eid)
  addComponent(world, HealthComponent, eid)
  addComponent(world, InputState, eid)
  addComponent(world, RenderObject, eid)
  
  // 初期位置の設定
  const pos = position || { x: 0, y: 2, z: 0 }
  Transform.position.x[eid] = pos.x
  Transform.position.y[eid] = pos.y
  Transform.position.z[eid] = pos.z
  
  // 初期回転・スケールの設定
  Transform.rotation.x[eid] = 0
  Transform.rotation.y[eid] = 0
  Transform.rotation.z[eid] = 0
  Transform.scale.x[eid] = 1
  Transform.scale.y[eid] = 1
  Transform.scale.z[eid] = 1
  
  // 体力の初期化（デフォルト値はコンポーネント定義で設定済み）
  if (health) {
    // Healthコンポーネントのプロパティにアクセスするために型アサーションを使用
    const healthComp = Health as any
    healthComp.current[eid] = health.current
    healthComp.max[eid] = health.max
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
export { DEFAULT_PLAYER_PARAMS } from '../EcsSystem/player/PlayerComponents'
export { createPlayerMovementSystem } from '../EcsSystem/player/PlayerMovementSystem'