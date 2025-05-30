import { useRef, useCallback } from 'react'
import * as THREE from 'three'

interface UsePlayerMovementProps {
  playerRef: React.RefObject<THREE.Mesh>
  isFlying: boolean
  onMoveToTarget: (target: THREE.Vector3) => void
}

export function usePlayerMovement({ playerRef, isFlying, onMoveToTarget }: UsePlayerMovementProps) {
  const keysRef = useRef<{ [key: string]: boolean }>({})
  const targetPositionRef = useRef<THREE.Vector3 | null>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mousePositionRef = useRef(new THREE.Vector2())

  // キーボード入力処理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    event.preventDefault()
    keysRef.current[event.code] = true
  }, [])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    event.preventDefault()
    keysRef.current[event.code] = false
  }, [])

  // クリック移動処理（継続移動）
  const handleClick = useCallback((event: MouseEvent, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => {
    // マウス座標を正規化
    const rect = renderer.domElement.getBoundingClientRect()
    mousePositionRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mousePositionRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // レイキャスト
    raycasterRef.current.setFromCamera(mousePositionRef.current, camera)

    // 地面との交点を計算
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersection = new THREE.Vector3()
    raycasterRef.current.ray.intersectPlane(groundPlane, intersection)

    if (intersection) {
      // 移動方向を設定（継続移動）
      intersection.y = playerRef.current?.position.y || 2
      targetPositionRef.current = intersection.clone()
      onMoveToTarget(intersection)
      console.log('Moving towards:', intersection)
    }
  }, [playerRef, onMoveToTarget])

  // 右クリックで移動停止
  const handleRightClick = useCallback((event: MouseEvent) => {
    event.preventDefault()
    targetPositionRef.current = null
    console.log('Movement stopped')
  }, [])

  // プレイヤー移動処理
  const updateMovement = useCallback(() => {
    if (!playerRef.current) return false

    const moveSpeed = isFlying ? 0.3 : 0.15
    const jumpSpeed = 0.2
    let moved = false

    // クリック移動処理（継続移動）
    if (targetPositionRef.current) {
      const direction = new THREE.Vector3()
        .subVectors(targetPositionRef.current, playerRef.current.position)
        .normalize()
        .multiplyScalar(moveSpeed * 1.5)

      playerRef.current.position.add(direction)
      moved = true
    }

    // WASD移動（クリック移動をキャンセル）
    const movement = new THREE.Vector3()

    if (keysRef.current['KeyW']) {
      movement.z -= 1
      moved = true
      targetPositionRef.current = null
    }
    if (keysRef.current['KeyS']) {
      movement.z += 1
      moved = true
      targetPositionRef.current = null
    }
    if (keysRef.current['KeyA']) {
      movement.x -= 1
      moved = true
      targetPositionRef.current = null
    }
    if (keysRef.current['KeyD']) {
      movement.x += 1
      moved = true
      targetPositionRef.current = null
    }

    // 移動量正規化
    if (movement.length() > 0) {
      movement.normalize().multiplyScalar(moveSpeed)
      playerRef.current.position.add(movement)
    }

    // 飛行モード
    if (isFlying) {
      if (keysRef.current['Space']) {
        playerRef.current.position.y += jumpSpeed
        moved = true
      }
      if (keysRef.current['ShiftLeft'] || keysRef.current['ShiftRight']) {
        playerRef.current.position.y -= jumpSpeed
        moved = true
      }
    } else {
      // 地上モード - 重力
      if (playerRef.current.position.y > 2) {
        playerRef.current.position.y -= 0.1
      } else {
        playerRef.current.position.y = 2
      }

      // ジャンプ
      if (keysRef.current['Space'] && playerRef.current.position.y <= 2.1) {
        playerRef.current.position.y += jumpSpeed * 3
        moved = true
      }
    }

    // 境界制限
    playerRef.current.position.x = Math.max(-80, Math.min(80, playerRef.current.position.x))
    playerRef.current.position.z = Math.max(-80, Math.min(80, playerRef.current.position.z))
    playerRef.current.position.y = Math.max(0.5, Math.min(50, playerRef.current.position.y))

    return moved
  }, [playerRef, isFlying])

  // 移動停止
  const stopMovement = useCallback(() => {
    targetPositionRef.current = null
  }, [])

  // 現在の移動目標を取得
  const getCurrentTarget = useCallback(() => {
    return targetPositionRef.current
  }, [])

  return {
    handleKeyDown,
    handleKeyUp,
    handleClick,
    handleRightClick,
    updateMovement,
    stopMovement,
    getCurrentTarget,
    keysRef
  }
}