import * as THREE from 'three'
import { EnvironmentCreator } from '../../components/game/EnvironmentCreator'
import { ResizeHandler } from '../../infrastructure/ResizeHandler'
import { SceneService } from '../../infrastructure/SceneService'
import { createPhysicsSystemAdapter, createSystemAdapter } from '../adapters/SystemAdapter'
import { createPlayerMovementSystem } from '../systems/PlayerMovementSystem'
import { createCameraEntity, createCameraSystem } from '../factory/CameraFactory'
import { InputFactory, InputSystemConfig } from '../factory/InputFactory'
import { createMovementSystem } from '../factory/MovementFactory'
import { createPhysicsSystem } from '../factory/PhysicsFactory'
import { createPlayerEntity, createPlayerMesh } from '../factory/PlayerFactory'
import { createRenderSystem } from '../factory/RenderFactory'
import { createTransformSystem } from '../factory/TransformFactory'
import { setCameraReference } from '../systems/CameraFollowSystem'
import { WorldManager } from './WorldManager'

/**
 * ゲームワールドの設定オプション
 */
export interface GameWorldConfig {
  /** エリアパラメータ（デフォルト: 'default'） */
  areaParam?: string
  /** デバッグモードの有効化（デフォルト: false） */
  debug?: boolean
  /** 物理システムの有効化（デフォルト: true） */
  enablePhysics?: boolean
  /** プレイヤーの初期位置 */
  playerPosition?: { x: number, y: number, z: number }
}

/**
 * ゲームワールドの状態
 */
export interface GameWorldState {
  worldManager: WorldManager
  sceneService: SceneService
  inputSystem: ReturnType<typeof InputFactory.initializeInputSystem>
  resizeHandler: ResizeHandler
  playerEntityId: number
  cameraEntityId: number
  isRunning: boolean
}

/**
 * 統合ゲームワールド管理クラス
 * ECS・Three.js・入力システムを統合管理します
 */
export class GameWorld {
  private state: GameWorldState | null = null
  private animationId: number | null = null
  private config: GameWorldConfig

  constructor(config: GameWorldConfig = {}) {
    this.config = {
      areaParam: 'default',
      debug: false,
      enablePhysics: true,
      playerPosition: { x: 0, y: 0, z: 0 },
      ...config
    }
  }

  /**
   * ゲームワールドを初期化します
   */
  async initialize(container: HTMLElement): Promise<void> {
    if (this.state) {
      console.warn('GameWorld is already initialized')
      return
    }

    try {
      // WorldManagerの作成・初期化
      const worldManager = new WorldManager()
      await worldManager.initialize()

      // SceneServiceの作成・初期化
      const sceneService = new SceneService()
      await sceneService.initialize(container)

      // システムの作成と登録
      await this.setupSystems(worldManager, sceneService)

      // エンティティの作成
      const { playerEntityId, cameraEntityId } = await this.setupEntities(
        worldManager,
        sceneService
      )

      // 入力・リサイズハンドラーの設定
      const inputConfig: InputSystemConfig = {
        f1Handler: () => {
          console.log('F1 pressed - toggle debug info')
          // デバッグ情報の表示/非表示を切り替え
        },
        debug: this.config.debug
      }
      const inputSystem = InputFactory.initializeInputSystem(
        worldManager.world, 
        sceneService.getDomElement(), 
        inputConfig
      )
      const resizeHandler = new ResizeHandler(sceneService.getCamera(), sceneService.getRenderer())

      // 環境の作成
      this.setupEnvironment(sceneService.getScene())

      // カメラ参照の設定
      setCameraReference(sceneService.getCamera())

      // 状態を保存
      this.state = {
        worldManager,
        sceneService,
        inputSystem,
        resizeHandler,
        playerEntityId,
        cameraEntityId,
        isRunning: false
      }

      if (this.config.debug) {
        console.log('GameWorld initialized successfully:', {
          playerEntityId,
          cameraEntityId,
          systems: worldManager.systems.getSystemNames(),
          stats: worldManager.getStats()
        })
      }

    } catch (error) {
      console.error('Failed to initialize GameWorld:', error)
      throw error
    }
  }

  /**
   * ゲームループを開始します
   */
  start(): void {
    if (!this.state) {
      throw new Error('GameWorld is not initialized')
    }

    if (this.state.isRunning) {
      console.warn('GameWorld is already running')
      return
    }

    this.state.isRunning = true
    this.gameLoop()
  }

  /**
   * ゲームループを停止します
   */
  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }

    if (this.state) {
      this.state.isRunning = false
    }
  }

  /**
   * ゲームを一時停止/再開します
   */
  setPaused(paused: boolean): void {
    if (this.state) {
      this.state.worldManager.setPaused(paused)
    }
  }

  /**
   * ゲーム時間のスケールを設定します
   */
  setTimeScale(scale: number): void {
    if (this.state) {
      this.state.worldManager.setTimeScale(scale)
    }
  }

  /**
   * ゲームワールドの統計情報を取得します
   */
  getStats() {
    if (!this.state) return null
    return this.state.worldManager.getStats()
  }

  /**
   * リソースを解放します
   */
  dispose(): void {
    this.stop()

    if (this.state) {
      this.state.inputSystem.dispose()
      this.state.worldManager.dispose()
      this.state.sceneService.dispose()
      this.state = null
    }
  }

  /**
   * ゲームループ
   */
  private gameLoop = (): void => {
    if (!this.state || !this.state.isRunning) return

    this.animationId = requestAnimationFrame(this.gameLoop)

    // 入力更新
    this.state.inputSystem.updateInput(this.state.worldManager.world)

    // ECSワールド更新
    this.state.worldManager.update()

    // レンダリング
    this.state.sceneService.render()
  }

  /**
   * システムをセットアップします
   */
  private async setupSystems(
    worldManager: WorldManager,
    sceneService: SceneService
  ): Promise<void> {
    const { world, systems } = worldManager

    // 基本システムの追加
    systems.add('Transform', createSystemAdapter(createTransformSystem(world), 'TransformSystem'), 0)
    systems.add('Movement', createSystemAdapter(createMovementSystem(world), 'MovementSystem'), 1)
    systems.add('PlayerMovement', createSystemAdapter(createPlayerMovementSystem({ moveSpeed: 0.1, jumpHeight: 0.5 }), 'PlayerMovementSystem'), 2)
    systems.add('Render', createSystemAdapter(createRenderSystem(world, sceneService.getScene()), 'RenderSystem'), 10)

    // 物理システムの追加（オプション）
    if (this.config.enablePhysics) {
      const physicsSystem = createPhysicsSystem(world, { debug: this.config.debug })
      systems.add('Physics', createPhysicsSystemAdapter(physicsSystem, 'PhysicsSystem'), 3)
    }

    if (this.config.debug) {
      console.log('Systems initialized:', systems.getSystemNames())
    }
  }

  /**
   * エンティティをセットアップします
   */
  private async setupEntities(
    worldManager: WorldManager,
    sceneService: SceneService
  ): Promise<{ playerEntityId: number, cameraEntityId: number }> {
    const { world } = worldManager
    const playerPosition = this.config.playerPosition!

    // プレイヤーエンティティの作成
    const playerEntityId = createPlayerEntity(world, playerPosition)
    createPlayerMesh(playerEntityId, sceneService.getScene())

    // カメラエンティティの作成
    const cameraEntity = createCameraEntity({
      camera: sceneService.getCamera(),
      initialPosition: { x: 0, y: 8, z: 12 },
      distance: 15,
      height: 8,
      minDistance: 3,
      maxDistance: 25,
      lookAtOffset: 1.0,
      lookPlayDistance: 0,
      cameraPlayDistance: 0,
      followSmooth: 1.0,
      leaveSmooth: 1.0,
      sensitivity: 0.001,
      verticalLimitUp: 60,
      verticalLimitDown: -20
    })

    // カメラシステムの追加
    const cameraSystem = createCameraSystem(world, playerEntityId, cameraEntity.systemParams)
    worldManager.systems.add('Camera', createSystemAdapter(cameraSystem, 'CameraSystem'), 9)

    return {
      playerEntityId,
      cameraEntityId: cameraEntity.eid
    }
  }

  /**
   * 環境をセットアップします
   */
  private setupEnvironment(scene: THREE.Scene): void {
    if (!this.state) return
    
    const { areaParam, enablePhysics } = this.config

    // 環境の作成
    EnvironmentCreator.createEnvironment(scene, areaParam || 'forest')
    EnvironmentCreator.createEnemies(scene, this.state.worldManager.world)
    EnvironmentCreator.createBackground(scene)

    // 物理ボディの追加（物理システムが有効な場合）
    if (enablePhysics) {
      const { getPhysicsWorld } = require('../factory/PhysicsFactory')
      const physics = getPhysicsWorld()
      
      physics.addBox(new THREE.Vector3(0, 5, -50), new THREE.Vector3(100, 10, 1)) // Back wall
      physics.addBox(new THREE.Vector3(-50, 5, 0), new THREE.Vector3(1, 10, 50))  // Left wall
      physics.addBox(new THREE.Vector3(50, 5, 0), new THREE.Vector3(1, 10, 50))   // Right wall
    }
  }
}