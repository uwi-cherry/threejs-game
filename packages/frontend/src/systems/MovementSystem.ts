import * as THREE from 'three'

export interface MovementConfig {
  walkSpeed: number
  flySpeed: number
  jumpSpeed: number
  gravity: number
  groundLevel: number
  bounds: {
    minX: number
    maxX: number
    minZ: number
    maxZ: number
    minY: number
    maxY: number
  }
}

export class MovementSystem {
  private target: THREE.Object3D
  private config: MovementConfig
  private targetPosition: THREE.Vector3 | null = null
  private isFlying = false
  private raycaster = new THREE.Raycaster()

  constructor(target: THREE.Object3D, config: Partial<MovementConfig> = {}) {
    this.target = target
    this.config = {
      walkSpeed: 0.15,
      flySpeed: 0.3,
      jumpSpeed: 0.2,
      gravity: 0.1,
      groundLevel: 2,
      bounds: {
        minX: -80,
        maxX: 80,
        minZ: -80,
        maxZ: 80,
        minY: 0.5,
        maxY: 50
      },
      ...config
    }
  }

  public setFlying(flying: boolean) {
    this.isFlying = flying
  }

  public isCurrentlyFlying(): boolean {
    return this.isFlying
  }

  public setTargetPosition(position: THREE.Vector3 | null) {
    this.targetPosition = position
  }

  public getTargetPosition(): THREE.Vector3 | null {
    return this.targetPosition
  }

  public moveToWorldPosition(camera: THREE.Camera, screenPosition: THREE.Vector2): boolean {
    // レイキャスティングで地面との交点を計算
    this.raycaster.setFromCamera(screenPosition, camera)

    // 地面平面との交点を計算
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -this.config.groundLevel)
    const intersection = new THREE.Vector3()
    
    if (this.raycaster.ray.intersectPlane(groundPlane, intersection)) {
      this.targetPosition = intersection.clone()
      this.targetPosition.y = this.target.position.y
      return true
    }
    
    return false
  }

  public stopMovement() {
    this.targetPosition = null
  }

  public updateManualMovement(movementVector: THREE.Vector2, cameraRotation?: { horizontal: number }): boolean {
    if (movementVector.length() === 0) return false

    const speed = this.isFlying ? this.config.flySpeed : this.config.walkSpeed
    let moved = false

    // カメラの向きに基づいた移動（自由カメラモード時）
    if (cameraRotation) {
      const forward = new THREE.Vector3(
        -Math.sin(cameraRotation.horizontal),
        0,
        -Math.cos(cameraRotation.horizontal)
      ).normalize()

      const right = new THREE.Vector3(
        Math.cos(cameraRotation.horizontal),
        0,
        -Math.sin(cameraRotation.horizontal)
      ).normalize()

      const movement = new THREE.Vector3()
      movement.addScaledVector(forward, movementVector.y)
      movement.addScaledVector(right, movementVector.x)
      movement.normalize().multiplyScalar(speed)

      this.target.position.add(movement)
      moved = true
    } else {
      // 絶対座標での移動（固定カメラモード時）
      const movement = new THREE.Vector3(
        movementVector.x * speed,
        0,
        movementVector.y * speed
      )
      this.target.position.add(movement)
      moved = true
    }

    // 手動移動時は自動移動をキャンセル
    this.targetPosition = null
    return moved
  }

  public updateAutoMovement(): boolean {
    if (!this.targetPosition) return false

    const speed = this.isFlying ? this.config.flySpeed : this.config.walkSpeed
    const direction = new THREE.Vector3()
      .subVectors(this.targetPosition, this.target.position)
      .normalize()
      .multiplyScalar(speed * 1.5)

    this.target.position.add(direction)
    return true
  }

  public updateVerticalMovement(jump: boolean, descend: boolean): boolean {
    let moved = false

    if (this.isFlying) {
      // 飛行モード
      if (jump) {
        this.target.position.y += this.config.jumpSpeed
        moved = true
      }
      if (descend) {
        this.target.position.y -= this.config.jumpSpeed
        moved = true
      }
    } else {
      // 地上モード - 重力
      if (this.target.position.y > this.config.groundLevel) {
        this.target.position.y -= this.config.gravity
        moved = true
      } else {
        this.target.position.y = this.config.groundLevel
      }

      // ジャンプ
      if (jump && this.target.position.y <= this.config.groundLevel + 0.1) {
        this.target.position.y += this.config.jumpSpeed * 3
        moved = true
      }
    }

    return moved
  }

  public applyBounds(): boolean {
    const pos = this.target.position
    const bounds = this.config.bounds
    let changed = false

    if (pos.x < bounds.minX) { pos.x = bounds.minX; changed = true }
    if (pos.x > bounds.maxX) { pos.x = bounds.maxX; changed = true }
    if (pos.z < bounds.minZ) { pos.z = bounds.minZ; changed = true }
    if (pos.z > bounds.maxZ) { pos.z = bounds.maxZ; changed = true }
    if (pos.y < bounds.minY) { pos.y = bounds.minY; changed = true }
    if (pos.y > bounds.maxY) { pos.y = bounds.maxY; changed = true }

    return changed
  }

  public update(
    movementInput: THREE.Vector2,
    verticalInput: { jump: boolean; descend: boolean },
    cameraRotation?: { horizontal: number }
  ): boolean {
    let moved = false

    // 自動移動（クリック移動）
    if (this.updateAutoMovement()) {
      moved = true
    }

    // 手動移動（WASD）
    if (this.updateManualMovement(movementInput, cameraRotation)) {
      moved = true
    }

    // 垂直移動（ジャンプ/飛行）
    if (this.updateVerticalMovement(verticalInput.jump, verticalInput.descend)) {
      moved = true
    }

    // 境界制限
    this.applyBounds()

    return moved
  }

  public getConfig(): MovementConfig {
    return { ...this.config }
  }

  public updateConfig(config: Partial<MovementConfig>) {
    this.config = { ...this.config, ...config }
  }
}