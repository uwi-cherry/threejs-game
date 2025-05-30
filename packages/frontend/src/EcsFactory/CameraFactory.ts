import { addEntity, addComponent, defineComponent, Types, IWorld, defineQuery } from 'bitecs'
import { world } from '../EcsSystem/world'
import { Transform } from '../EcsSystem/transform/Transform'
import { InputState } from '../EcsSystem/input/InputState'
import { PhysicsWorld } from '../EcsSystem/physics/PhysicsWorld'
import * as THREE from 'three'

export interface CameraParams {
  distance: number
  height: number
  sensitivity: number
  verticalLimitUp: number
  verticalLimitDown: number
  // 酔い対策パラメータ
  damping: number
  minDistance: number
  maxDistance: number
  lookAtOffset: number
  sensitivityCurvePower: number
  // 3D酔い対策の「遊び」パラメータ
  lookPlayDistance: number    // 視点の遊び
  cameraPlayDistance: number  // カメラ位置の遊び
  followSmooth: number        // 追従時のスムース強度
  leaveSmooth: number         // 離れる時のスムース強度
}

// Game-specific camera component
export const Camera = defineComponent({
  mode: Types.ui8, // 0: fixed, 1: free
  distance: Types.f32,
  height: Types.f32,
  rotationH: Types.f32,
  rotationV: Types.f32,
  // 慣性用のベロシティ
  velocityH: Types.f32,
  velocityV: Types.f32,
  // ズーム用
  targetDistance: Types.f32,
  actualDistance: Types.f32,
  // 3D酔い対策用の「遊び」
  lookPosX: Types.f32,     // 実際にカメラが向ける座標
  lookPosY: Types.f32,
  lookPosZ: Types.f32,
  currentHeight: Types.f32 // 現在のカメラ高さ
})

// Queries
const cameraQuery = defineQuery([Camera, Transform])
const inputQuery = defineQuery([InputState])

let threeCamera: THREE.PerspectiveCamera | null = null

export const setCameraReference = (camera: THREE.PerspectiveCamera) => {
  threeCamera = camera
}

// 原神風のマウス感度カーブ関数
const applySensitivityCurve = (delta: number, sensitivity: number, curvePower: number): number => {
  const abs = Math.abs(delta)
  const sign = Math.sign(delta)
  // 小さな動きは敏感に、大きな動きは緩やかに
  return sign * Math.pow(abs / 100, curvePower) * 100 * sensitivity
}

// 視点の「遊び」を考慮した更新（3D酔い対策）
const updateLookPosition = (cameraEid: number, playerPos: THREE.Vector3, params: CameraParams, deltaTime: number) => {
  const currentLookPos = new THREE.Vector3(
    Camera.lookPosX[cameraEid],
    Camera.lookPosY[cameraEid], 
    Camera.lookPosZ[cameraEid]
  )
  
  // プレイヤー位置と現在の視点の距離
  const vec = playerPos.clone().sub(currentLookPos)
  const distance = vec.length()
  
  if (distance > params.lookPlayDistance) {
    // 遊びの距離を超えた場合、徐々に追従
    const moveDistance = (distance - params.lookPlayDistance) * (deltaTime * params.followSmooth)
    const moveVec = vec.normalize().multiplyScalar(moveDistance)
    
    Camera.lookPosX[cameraEid] += moveVec.x
    Camera.lookPosY[cameraEid] += moveVec.y
    Camera.lookPosZ[cameraEid] += moveVec.z
  }
}

// カメラ位置の「遊び」を考慮した更新（3D酔い対策）
const updateCameraPosition = (cameraEid: number, playerPos: THREE.Vector3, params: CameraParams, deltaTime: number) => {
  const currentCameraPos = new THREE.Vector3(
    threeCamera!.position.x,
    threeCamera!.position.y,
    threeCamera!.position.z
  )
  
  // XZ平面での距離を計算
  const xzVec = new THREE.Vector3(
    playerPos.x - currentCameraPos.x,
    0,
    playerPos.z - currentCameraPos.z
  )
  const distance = xzVec.length()
  
  let moveDistance = 0
  const targetDistance = Camera.actualDistance[cameraEid]
  
  if (distance > targetDistance + params.cameraPlayDistance) {
    // 遊びを超えて離れた場合、追いかける
    moveDistance = distance - (targetDistance + params.cameraPlayDistance)
    moveDistance *= deltaTime * params.followSmooth
  } else if (distance < targetDistance - params.cameraPlayDistance) {
    // 遊びを超えて近づいた場合、離れる
    moveDistance = distance - (targetDistance - params.cameraPlayDistance)
    moveDistance *= deltaTime * params.leaveSmooth
  }
  
  if (Math.abs(moveDistance) > 0.001) {
    const moveVec = xzVec.normalize().multiplyScalar(moveDistance)
    return new THREE.Vector3(
      currentCameraPos.x + moveVec.x,
      Camera.lookPosY[cameraEid] + Camera.currentHeight[cameraEid],
      currentCameraPos.z + moveVec.z
    )
  }
  
  return new THREE.Vector3(
    currentCameraPos.x,
    Camera.lookPosY[cameraEid] + Camera.currentHeight[cameraEid],
    currentCameraPos.z
  )
}

// カメラリセット関数
export const resetCameraRotation = (cameraEid: number, playerPos?: THREE.Vector3) => {
  Camera.rotationH[cameraEid] = 0
  Camera.rotationV[cameraEid] = 0.2
  Camera.velocityH[cameraEid] = 0
  Camera.velocityV[cameraEid] = 0
  
  // 視点もリセット
  if (playerPos) {
    Camera.lookPosX[cameraEid] = playerPos.x
    Camera.lookPosY[cameraEid] = playerPos.y
    Camera.lookPosZ[cameraEid] = playerPos.z
  }
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
  // 新しいプロパティの初期化
  Camera.velocityH[eid] = 0
  Camera.velocityV[eid] = 0
  Camera.targetDistance[eid] = 15
  Camera.actualDistance[eid] = 15
  // 3D酔い対策用の初期化
  Camera.lookPosX[eid] = 0
  Camera.lookPosY[eid] = 2
  Camera.lookPosZ[eid] = 0
  Camera.currentHeight[eid] = 8
  
  // Initialize Transform
  Transform.position.x[eid] = 0
  Transform.position.y[eid] = 8
  Transform.position.z[eid] = 12
  
  return eid
}

export const cameraSystem = (world: IWorld, playerEid: number, params?: CameraParams) => {
  // Default parameters - 3D酔い対策強化版
  const defaultParams: CameraParams = {
    distance: 15,
    height: 8,
    sensitivity: 0.0001, // 1/10にさらに削減（超低感度）
    verticalLimitUp: 45, // さらに控えめに
    verticalLimitDown: -15,
    damping: 0.95, // 更に強い減衰で滑らかに
    minDistance: 3,
    maxDistance: 25,
    lookAtOffset: 1.0,
    sensitivityCurvePower: 0.9, // より緩やかなカーブ
    // 3D酔い対策の「遊び」パラメータ
    lookPlayDistance: 0.8,      // 視点の遊び（大きめに）
    cameraPlayDistance: 1.2,    // カメラ位置の遊び（大きめに）
    followSmooth: 2.0,          // 追従は緩やかに
    leaveSmooth: 8.0            // 離れる時は少し早めに
  }
  
  const cameraParams = params || defaultParams
  if (!threeCamera) return world
  
  const cameras = cameraQuery(world)
  const inputs = inputQuery(world)
  
  if (cameras.length === 0) return world
  
  const cameraEid = cameras[0]
  const inputEid = inputs.length > 0 ? inputs[0] : null
  
  // Check safe zone for camera mode switching
  const playerZ = Transform.position.z[playerEid]
  const inSafeZone = playerZ > -5
  const newMode = inSafeZone ? 0 : 1 // 0: fixed, 1: free (TPS)
  
  // Prevent going forward from safe zone
  if (inSafeZone && Transform.position.z[playerEid] > 0) {
    Transform.position.z[playerEid] = 0
  }
  
  if (Camera.mode[cameraEid] !== newMode) {
    Camera.mode[cameraEid] = newMode
  }
  
  const playerPos = new THREE.Vector3(
    Transform.position.x[playerEid],
    Transform.position.y[playerEid],
    Transform.position.z[playerEid]
  )
  
  // Camera mode: ${Camera.mode[cameraEid]} (0=FIXED, 1=FREE)
  
  if (Camera.mode[cameraEid] === 0) {
    // Fixed mode - 横スクロール風カメラ
    const distance = cameraParams.distance
    const height = cameraParams.height
    
    // Update ECS values
    Camera.distance[cameraEid] = distance
    Camera.height[cameraEid] = height
    
    // 横スクロール風：カメラを横に配置
    threeCamera.position.set(
      playerPos.x + distance, // プレイヤーの横に配置
      playerPos.y + height,
      playerPos.z
    )
    threeCamera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z)
    
  } else {
    // TPS mode (原神風) - free camera with full rotation
    
    // ズーム処理（マウスホイール）
    if (inputEid !== null) {
      const wheelDelta = InputState.mouseWheel?.[inputEid] || 0
      if (Math.abs(wheelDelta) > 0.1) {
        Camera.targetDistance[cameraEid] = Math.max(
          cameraParams.minDistance,
          Math.min(cameraParams.maxDistance, Camera.targetDistance[cameraEid] + wheelDelta * 2)
        )
      }
    }
    
    // 距離の補間（スムーズなズーム）
    Camera.actualDistance[cameraEid] = THREE.MathUtils.lerp(
      Camera.actualDistance[cameraEid],
      Camera.targetDistance[cameraEid],
      0.1
    )
    
    if (inputEid !== null) {
      // マウス入力処理
      const deltaX = InputState.mouseDelta.x[inputEid]
      const deltaY = InputState.mouseDelta.y[inputEid]
      
      if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
        // 非線形感度カーブを適用
        const sensitiveX = applySensitivityCurve(deltaX, cameraParams.sensitivity, cameraParams.sensitivityCurvePower)
        const sensitiveY = applySensitivityCurve(deltaY, cameraParams.sensitivity, cameraParams.sensitivityCurvePower)
        
        // ベロシティに加算（慣性効果）
        Camera.velocityH[cameraEid] -= sensitiveX
        Camera.velocityV[cameraEid] -= sensitiveY
      }
      
      // カメラリセット（Rキー）
      if (InputState.reset?.[inputEid]) {
        resetCameraRotation(cameraEid)
      }
    }
    
    // 慣性の適用
    Camera.rotationH[cameraEid] += Camera.velocityH[cameraEid]
    Camera.rotationV[cameraEid] += Camera.velocityV[cameraEid]
    
    // 慣性の減衰
    Camera.velocityH[cameraEid] *= cameraParams.damping
    Camera.velocityV[cameraEid] *= cameraParams.damping
    
    // 水平回転の正規化
    Camera.rotationH[cameraEid] = Camera.rotationH[cameraEid] % (Math.PI * 2)
    
    // 垂直回転の制限
    const upLimit = (cameraParams.verticalLimitUp * Math.PI) / 180
    const downLimit = (cameraParams.verticalLimitDown * Math.PI) / 180
    Camera.rotationV[cameraEid] = Math.max(
      downLimit,
      Math.min(upLimit, Camera.rotationV[cameraEid])
    )
  }
  
  // カメラ位置計算（固定・自由モード共通）
  const distance = Camera.mode[cameraEid] === 0 ? cameraParams.distance : Camera.actualDistance[cameraEid]
  const height = cameraParams.height
  const rotH = Camera.rotationH[cameraEid]
  const rotV = Camera.rotationV[cameraEid]
  
  // Update ECS values
  Camera.distance[cameraEid] = distance
  Camera.height[cameraEid] = height
  
  // 球面座標系でのカメラ位置計算
  const cosV = Math.cos(rotV)
  const sinV = Math.sin(rotV)
  const cosH = Math.cos(rotH)
  const sinH = Math.sin(rotH)
  
  const cameraOffset = new THREE.Vector3(
    sinH * cosV * distance,  // X: 左右移動
    sinV * distance + height, // Y: 高さ + 上下回転
    cosH * cosV * distance   // Z: 前後移動
  )
  
  // 物理レイキャストによる障害物回避
  const idealPosition = new THREE.Vector3().copy(playerPos).add(cameraOffset)
  let actualCameraDistance = distance
  
  if (Camera.mode[cameraEid] === 1) {
    // プレイヤーからカメラの理想位置へのレイキャスト
    const physics = PhysicsWorld.getInstance()
    const rayStart = new THREE.Vector3(playerPos.x, playerPos.y + cameraParams.lookAtOffset, playerPos.z)
    const rayEnd = idealPosition.clone()
    
    const hitResult = physics.raycast(rayStart, rayEnd)
    
    if (hitResult && hitResult.distance > 0) {
      // 衝突した場合、衝突点の少し手前にカメラを配置
      const collisionDistance = hitResult.distance * 0.9 // 10%のマージン
      actualCameraDistance = Math.max(cameraParams.minDistance, collisionDistance)
    }
  }
  
  // 最終カメラ位置
  const directionToCamera = cameraOffset.clone().normalize()
  const finalCameraOffset = directionToCamera.multiplyScalar(actualCameraDistance)
  threeCamera.position.copy(playerPos).add(finalCameraOffset)
  
  // より自然な視線の高さ
  const lookAtY = playerPos.y + cameraParams.lookAtOffset
  threeCamera.lookAt(playerPos.x, lookAtY, playerPos.z)
  
  return world
}