import { IWorld, defineQuery } from 'bitecs'
import * as THREE from 'three'
import { Transform } from '../transform/Transform'
import { InputState } from '../input/InputState'
import { Camera } from '../camera/Camera'
import { Player } from './PlayerComponents'

// クエリを定義
const playerQuery = defineQuery([Player, Transform]) as (world: IWorld) => number[]
const inputQuery = defineQuery([InputState]) as (world: IWorld) => number[]
const cameraQuery = defineQuery([Camera, Transform]) as (world: IWorld) => number[]

export const createPlayerMovementSystem = (params = { moveSpeed: 0.25, jumpHeight: 0.8 }) => {
  return (world: IWorld) => {
    const players = playerQuery(world)
    const inputs = inputQuery(world)
    const cameras = cameraQuery(world)
    
    if (players.length === 0 || inputs.length === 0 || cameras.length === 0) return world
    
    const playerEid = players[0]
    const inputEid = inputs[0]
    const cameraEid = cameras[0]
    
    const { moveSpeed, jumpHeight } = params
    
    // 移動入力の取得（WASD）
    const movementX = InputState.movementX[inputEid]
    const movementZ = -InputState.movementY[inputEid]  // Y軸を反転して前後に移動
    
    // カメラの向きに基づいて移動方向を計算
    if (Math.abs(movementX) > 0.01 || Math.abs(movementZ) > 0.01) {
      const cameraRotationH = Camera.rotationH[cameraEid]
      
      const forward = new THREE.Vector3(
        Math.sin(cameraRotationH),
        0,
        Math.cos(cameraRotationH)
      )
      
      const right = new THREE.Vector3(
        Math.cos(cameraRotationH),
        0,
        -Math.sin(cameraRotationH)
      )
      
      const moveDirection = new THREE.Vector3()
      moveDirection.add(right.multiplyScalar(movementX))
      moveDirection.add(forward.multiplyScalar(movementZ))
      moveDirection.normalize()
      
      // プレイヤー位置を更新
      Transform.position.x[playerEid] += moveDirection.x * moveSpeed
      Transform.position.z[playerEid] += moveDirection.z * moveSpeed
    }
    
    // シンプルな重力と地面衝突判定
    const groundY = 2
    if (Transform.position.y[playerEid] > groundY) {
      Transform.position.y[playerEid] -= 0.05
    } else {
      Transform.position.y[playerEid] = groundY
    }
    
    // ジャンプ処理
    if (InputState.jump[inputEid] && Math.abs(Transform.position.y[playerEid] - groundY) < 0.1) {
      Transform.position.y[playerEid] = groundY + jumpHeight
    }
    
    // 移動制限
    Transform.position.x[playerEid] = Math.max(-80, Math.min(80, Transform.position.y[playerEid]))
    Transform.position.z[playerEid] = Math.max(-80, Math.min(5, Transform.position.z[playerEid]))
    Transform.position.y[playerEid] = Math.max(0.5, Math.min(50, Transform.position.y[playerEid]))
    
    return world
  }
}
