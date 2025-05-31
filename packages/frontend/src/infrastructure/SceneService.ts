import * as THREE from 'three'

/**
 * Three.jsシーン管理サービス
 * ECSとThree.jsの境界を明確に分離します
 */
export class SceneService {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private isInitialized: boolean = false

  constructor() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera()
    this.renderer = new THREE.WebGLRenderer()
  }

  /**
   * シーンを初期化します
   */
  async initialize(container: HTMLElement): Promise<void> {
    if (this.isInitialized) {
      console.warn('Scene is already initialized')
      return
    }

    // シーンの基本設定
    this.scene.background = new THREE.Color(0x87ceeb)

    // カメラの設定
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    )
    this.camera.position.set(0, 8, 12)
    this.camera.lookAt(0, 2, 0)

    // レンダラーの設定
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    // DOMに追加
    container.appendChild(this.renderer.domElement)
    // 入力を受け付けるためtabIndexとfocusを設定
    this.renderer.domElement.tabIndex = 0
    this.renderer.domElement.focus()

    // ライティングの設定
    this.setupLighting()

    // 地面の作成
    this.createGround()

    this.isInitialized = true
    console.log('Scene initialized')
  }

  /**
   * ライティングを設定します
   */
  private setupLighting(): void {
    // 環境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambientLight)

    // 指向性ライト
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 50, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)
  }

  /**
   * 地面を作成します
   */
  private createGround(): void {
    const groundGeometry = new THREE.PlaneGeometry(200, 20)
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3a5f3a })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)
  }

  /**
   * レンダリングを実行します
   */
  render(): void {
    if (!this.isInitialized) {
      console.warn('Scene is not initialized')
      return
    }
    
    this.renderer.render(this.scene, this.camera)
  }

  /**
   * ウィンドウリサイズに対応します
   */
  onWindowResize(): void {
    const width = window.innerWidth
    const height = window.innerHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  /**
   * シーンにオブジェクトを追加します
   */
  addToScene(object: THREE.Object3D): void {
    this.scene.add(object)
  }

  /**
   * シーンからオブジェクトを削除します
   */
  removeFromScene(object: THREE.Object3D): void {
    this.scene.remove(object)
  }

  /**
   * シーンのゲッター
   */
  getScene(): THREE.Scene {
    return this.scene
  }

  /**
   * カメラのゲッター
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  /**
   * レンダラーのゲッター
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }

  /**
   * レンダラーのDOMエレメントを取得
   */
  getDomElement(): HTMLCanvasElement {
    return this.renderer.domElement
  }

  /**
   * リソースを解放します
   */
  dispose(): void {
    if (!this.isInitialized) return

    // シーン内のオブジェクトを破棄
    this.scene.traverse((object: any) => {
      if (object.dispose) object.dispose()
      if (object.geometry) object.geometry.dispose()
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat: any) => mat.dispose())
        } else {
          object.material.dispose()
        }
      }
    })

    // レンダラーを破棄
    this.renderer.dispose()

    this.isInitialized = false
    console.log('Scene disposed')
  }
}