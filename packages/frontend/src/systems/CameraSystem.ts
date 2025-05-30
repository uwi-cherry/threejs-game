import * as THREE from 'three'

export type CameraMode = 'fixed' | 'free'

export interface CameraSystemConfig {
  // 固定カメラ設定
  fixed: {
    distance: number
    height: number
    followZ: boolean
  }
  // 自由カメラ設定
  free: {
    distance: number
    height: number
    minVerticalAngle: number
    maxVerticalAngle: number
    sensitivity: number
  }
}

export class CameraSystem {
  private camera: THREE.PerspectiveCamera
  private target: THREE.Object3D
  private mode: CameraMode = 'fixed'
  private config: CameraSystemConfig
  private rotation = { horizontal: 0, vertical: 0 }

  constructor(
    camera: THREE.PerspectiveCamera,
    target: THREE.Object3D,
    config: Partial<CameraSystemConfig> = {}
  ) {
    this.camera = camera
    this.target = target
    this.config = {
      fixed: {
        distance: 15,
        height: 8,
        followZ: true,
        ...config.fixed
      },
      free: {
        distance: 12,
        height: 6,
        minVerticalAngle: -Math.PI / 3,
        maxVerticalAngle: Math.PI / 3,
        sensitivity: 0.005,
        ...config.free
      }
    }
  }

  public setMode(mode: CameraMode, resetRotation = false) {
    this.mode = mode
    if (resetRotation) {
      this.rotation.horizontal = 0
      this.rotation.vertical = 0
    }
  }

  public getMode(): CameraMode {
    return this.mode
  }

  public handleMouseMove(delta: THREE.Vector2) {
    if (this.mode === 'free') {
      this.rotation.horizontal -= delta.x * this.config.free.sensitivity
      this.rotation.vertical += delta.y * this.config.free.sensitivity

      // 垂直回転を制限
      this.rotation.vertical = Math.max(
        this.config.free.minVerticalAngle,
        Math.min(this.config.free.maxVerticalAngle, this.rotation.vertical)
      )
    }
  }

  public update() {
    if (this.mode === 'fixed') {
      this.updateFixedCamera()
    } else {
      this.updateFreeCamera()
    }
  }

  private updateFixedCamera() {
    const { distance, height, followZ } = this.config.fixed
    const targetPosition = this.target.position

    // 固定カメラ（横スクロール風）
    this.camera.position.x = targetPosition.x
    this.camera.position.y = height
    
    if (followZ) {
      // プレイヤーのZ座標を追従
      this.camera.position.z = targetPosition.z + distance
      this.camera.lookAt(
        targetPosition.x,
        targetPosition.y,
        targetPosition.z
      )
    } else {
      // Z座標は固定
      this.camera.position.z = distance
      this.camera.lookAt(targetPosition.x, targetPosition.y, 0)
    }
  }

  private updateFreeCamera() {
    const { distance, height } = this.config.free
    const targetPosition = this.target.position

    // 3人称カメラ（プレイヤーの後ろ）
    const cameraOffset = new THREE.Vector3(
      Math.sin(this.rotation.horizontal) * distance,
      height + Math.sin(this.rotation.vertical) * 8,
      Math.cos(this.rotation.horizontal) * distance
    )

    this.camera.position.copy(targetPosition).add(cameraOffset)
    this.camera.lookAt(targetPosition)
  }

  public getRotation() {
    return { ...this.rotation }
  }

  public setRotation(horizontal: number, vertical: number) {
    this.rotation.horizontal = horizontal
    this.rotation.vertical = Math.max(
      this.config.free.minVerticalAngle,
      Math.min(this.config.free.maxVerticalAngle, vertical)
    )
  }

  public getConfig(): CameraSystemConfig {
    return { ...this.config }
  }

  public updateConfig(config: Partial<CameraSystemConfig>) {
    this.config = {
      fixed: { ...this.config.fixed, ...config.fixed },
      free: { ...this.config.free, ...config.free }
    }
  }
}