import { addEntity, addComponent, defineComponent, Types, IWorld, defineQuery } from 'bitecs'
import { world } from '../EcsSystem/world'
import { Transform } from '../EcsSystem/transform/Transform'
import { InputState } from '../EcsSystem/input/InputState'
import { RenderObject, setThreeObject } from '../EcsSystem/rendering/RenderObject'
import { Camera } from '../EcsSystem/camera/Camera'
import * as THREE from 'three'

export interface PlayerParams {
  moveSpeed: number
  jumpHeight: number
}

export const Player = defineComponent()
export const Health = defineComponent({
  current: Types.f32,
  max: Types.f32
})

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

// Player movement system
const playerQuery = defineQuery([Player, Transform])
const inputQuery = defineQuery([InputState])
const cameraQuery = defineQuery([Camera, Transform])

export const playerMovementSystem = (world: IWorld, params?: PlayerParams) => {
  // Default parameters
  const defaultParams: PlayerParams = {
    moveSpeed: 0.25,
    jumpHeight: 0.8
  }
  
  const playerParams = params || defaultParams
  
  const players = playerQuery(world)
  const inputs = inputQuery(world)
  const cameras = cameraQuery(world)
  
  if (players.length === 0 || inputs.length === 0 || cameras.length === 0) return world
  
  const playerEid = players[0]
  const inputEid = inputs[0]
  const cameraEid = cameras[0]
  
  const moveSpeed = playerParams.moveSpeed
  const jumpHeight = playerParams.jumpHeight
  
  // Manual movement (WASD) - カメラ方向ベース
  const movementX = InputState.movementX[inputEid]
  const movementZ = -InputState.movementY[inputEid]
  
  if (Math.abs(movementX) > 0.01 || Math.abs(movementZ) > 0.01) {
    // カメラの水平回転を取得
    const cameraRotationH = Camera.rotationH[cameraEid]
    
    // カメラ方向ベースの移動ベクトルを計算
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
    
    // 移動ベクトルを合成
    const moveDirection = new THREE.Vector3()
    moveDirection.add(right.multiplyScalar(movementX))
    moveDirection.add(forward.multiplyScalar(movementZ))
    moveDirection.normalize()
    
    // プレイヤー位置を更新
    Transform.position.x[playerEid] += moveDirection.x * moveSpeed
    Transform.position.z[playerEid] += moveDirection.z * moveSpeed
  }
  
  // Simple gravity and ground collision
  const groundY = 2
  if (Transform.position.y[playerEid] > groundY) {
    Transform.position.y[playerEid] -= 0.05
  } else {
    Transform.position.y[playerEid] = groundY
  }
  
  // Jump
  if (InputState.jump[inputEid] && Math.abs(Transform.position.y[playerEid] - groundY) < 0.1) {
    Transform.position.y[playerEid] = groundY + jumpHeight
  }
  
  // Apply bounds - prevent going too far forward (positive Z)
  Transform.position.x[playerEid] = Math.max(-80, Math.min(80, Transform.position.x[playerEid]))
  Transform.position.z[playerEid] = Math.max(-80, Math.min(5, Transform.position.z[playerEid]))
  Transform.position.y[playerEid] = Math.max(0.5, Math.min(50, Transform.position.y[playerEid]))
  
  return world
}