import { WorldManager } from '../world/WorldManager'
import { SceneService } from '../services/SceneService'
import { createSystemAdapter, createPhysicsSystemAdapter, createInputSystemAdapter } from '../adapters/SystemAdapter'
import { createMovementSystem } from './MovementFactory'
import { createRenderSystem } from './RenderFactory'
import { createTransformSystem } from './TransformFactory'
import { createPhysicsSystem } from './PhysicsFactory'
import { createPlayerEntity, createPlayerMesh } from './PlayerFactory'
import { createCameraEntity, createCameraSystem } from './CameraFactory'
import { InputFactory, InputSystemConfig } from './InputFactory'
import { setCameraReference } from '../systems/CameraFollowSystem'
import { ResizeHandler } from '../../infrastructure/ResizeHandler'
import { EnvironmentCreator } from '../../components/game/EnvironmentCreator'
import * as THREE from 'three'

/**
 * ゲームワールド初期化の設定オプション
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
 * ゲームワールドファクトリ
 * ECSワールドとThree.jsシーンを統合して初期化します
 */
export class GameWorldFactory {
  /**
   * 完全なゲームワールドを作成・初期化します
   */
  static async createGameWorld(
    container: HTMLElement,
    config: GameWorldConfig = {}
  ): Promise<{
    worldManager: WorldManager
    sceneService: SceneService
    inputSystem: ReturnType<typeof InputFactory.initializeInputSystem>
    resizeHandler: ResizeHandler
    playerEntityId: number
    cameraEntityId: number
    cleanup: () => void
  }> {
    const {
      areaParam = 'default',
      debug = false,
      enablePhysics = true,
      playerPosition = { x: 0, y: 0, z: 0 }
    } = config

    // WorldManagerの作成・初期化
    const worldManager = new WorldManager()
    await worldManager.initialize()

    // SceneServiceの作成・初期化
    const sceneService = new SceneService()
    await sceneService.initialize(container)

    // システムの作成と登録
    await GameWorldFactory.setupSystems(worldManager, sceneService, enablePhysics, debug)

    // エンティティの作成
    const { playerEntityId, cameraEntityId } = await GameWorldFactory.setupEntities(
      worldManager,
      sceneService,
      playerPosition
    )

    // 入力・リサイズハンドラーの設定
    const inputConfig: InputSystemConfig = {
      f1Handler: () => {
        console.log('F1 pressed - toggle debug info')
        // デバッグ情報の表示/非表示を切り替え
      },
      debug
    }
    const inputSystem = InputFactory.initializeInputSystem(worldManager.world, sceneService.getDomElement(), inputConfig)
    const resizeHandler = new ResizeHandler(sceneService.getCamera(), sceneService.getRenderer())

    // 環境の作成
    GameWorldFactory.setupEnvironment(sceneService.getScene(), areaParam, enablePhysics)

    // カメラ参照の設定
    setCameraReference(sceneService.getCamera())

    // クリーンアップ関数
    const cleanup = () => {
      inputSystem.dispose()
      worldManager.dispose()
      sceneService.dispose()
    }

    if (debug) {
      console.log('GameWorld created successfully:', {
        playerEntityId,
        cameraEntityId,
        systems: worldManager.systems.getSystemNames(),
        stats: worldManager.getStats()
      })
    }

    return {
      worldManager,
      sceneService,
      inputSystem,
      resizeHandler,
      playerEntityId,
      cameraEntityId,
      cleanup
    }
  }

  /**
   * システムをセットアップします
   */
  private static async setupSystems(
    worldManager: WorldManager,
    sceneService: SceneService,
    enablePhysics: boolean,
    debug: boolean
  ): Promise<void> {
    const { world, systems } = worldManager

    // 基本システムの追加
    systems.add('Transform', createSystemAdapter(createTransformSystem(world), 'TransformSystem'), 0)
    systems.add('Movement', createSystemAdapter(createMovementSystem(world), 'MovementSystem'), 1)
    systems.add('Render', createSystemAdapter(createRenderSystem(world, sceneService.getScene()), 'RenderSystem'), 10)

    // 物理システムの追加（オプション）
    if (enablePhysics) {
      const physicsSystem = createPhysicsSystem(world, { debug })
      systems.add('Physics', createPhysicsSystemAdapter(physicsSystem, 'PhysicsSystem'), 2)
    }

    if (debug) {
      console.log('Systems initialized:', systems.getSystemNames())
    }
  }

  /**
   * エンティティをセットアップします
   */
  private static async setupEntities(
    worldManager: WorldManager,
    sceneService: SceneService,
    playerPosition: { x: number, y: number, z: number }
  ): Promise<{ playerEntityId: number, cameraEntityId: number }> {
    const { world } = worldManager

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
  private static setupEnvironment(scene: THREE.Scene, areaParam: string, enablePhysics: boolean): void {
    // 環境の作成
    EnvironmentCreator.createEnvironment(scene, areaParam || 'forest')
    EnvironmentCreator.createEnemies(scene)
    EnvironmentCreator.createBackground(scene)

    // 物理ボディの追加（物理システムが有効な場合）
    if (enablePhysics) {
      const { getPhysicsWorld } = require('./PhysicsFactory')
      const physics = getPhysicsWorld()
      
      physics.addBox(new THREE.Vector3(0, 5, -50), new THREE.Vector3(100, 10, 1)) // Back wall
      physics.addBox(new THREE.Vector3(-50, 5, 0), new THREE.Vector3(1, 10, 50))  // Left wall
      physics.addBox(new THREE.Vector3(50, 5, 0), new THREE.Vector3(1, 10, 50))   // Right wall
    }
  }
}