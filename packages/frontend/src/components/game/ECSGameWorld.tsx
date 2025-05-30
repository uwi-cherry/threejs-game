import { useRef, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import * as THREE from 'three'
import { world } from '../../EcsSystem/world'
import { renderSystem } from '../../EcsSystem/rendering/RenderSystem'
import { InputSystemManager } from '../../EcsSystem/input/InputSystem'
import { ResizeHandler } from '../../infrastructure/ResizeHandler'
import { PhysicsWorld } from '../../EcsSystem/physics/PhysicsWorld'
import { 
  createPlayerEntity, 
  createPlayerMesh,
  playerMovementSystem,
  type PlayerParams
} from '../../EcsFactory/PlayerFactory'
import { GameInputHandler } from '../../EcsFactory/InputFactory'
import { 
  createCameraEntity,
  Camera,
  cameraSystem,
  setCameraReference,
  type CameraParams
} from '../../EcsFactory/CameraFactory'
import { createSystemPipeline } from './SystemPipeline'
import { EnvironmentCreator } from './EnvironmentCreator'
import { cameraDebugger } from '@/debug/CameraDebugger'

export interface ECSGameWorldProps {
  className?: string
}

export default function ECSGameWorld({ className = '' }: ECSGameWorldProps) {
  const router = useRouter()
  const params = useParams()
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const inputManagerRef = useRef<InputSystemManager | null>(null)
  const resizeHandlerRef = useRef<ResizeHandler | null>(null)
  
  // ECS Entity IDs
  const playerEntityRef = useRef<number | null>(null)
  const cameraEntityRef = useRef<number | null>(null)
  const gameInputHandlerRef = useRef<GameInputHandler | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [gameState] = useState({
    health: 100,
    energy: 80,
    score: 0,
    enemies: 3
  })
  const [cameraMode, setCameraMode] = useState<'fixed' | 'free'>('fixed')
  
  // Debug parameters state
  const [playerParams] = useState<PlayerParams>({
    moveSpeed: 0.25,
    jumpHeight: 0.8
  })
  
  const [cameraParams] = useState<CameraParams>({
    distance: 15,
    height: 8,
    sensitivity: 0.001,
    verticalLimitUp: 60,
    verticalLimitDown: -20,
    damping: 0.92,
    minDistance: 3,
    maxDistance: 25,
    lookAtOffset: 1.0,
    sensitivityCurvePower: 0.8
  })

  const areaParam = Array.isArray(params.area) ? params.area[0] : params.area

  useEffect(() => {
    if (!mountRef.current) return

    // Create Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87ceeb)
    sceneRef.current = scene

    // Create Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 8, 12)
    camera.lookAt(0, 2, 0)
    setCameraReference(camera)

    // Create Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)

    // Setup Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 50, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Create Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 20)
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3a5f3a })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Create ECS Entities
    
    // Player Entity
    const playerEid = createPlayerEntity()
    playerEntityRef.current = playerEid
    
    createPlayerMesh(playerEid, scene)

    // Camera Entity
    const cameraEid = createCameraEntity()
    cameraEntityRef.current = cameraEid
    
    // Initialize debug GUI
    cameraDebugger.initializeGUI()
    cameraDebugger.setCameraEntity(cameraEid)

    // Initialize Physics World
    const physics = PhysicsWorld.getInstance()
    
    // Create Environment
    EnvironmentCreator.createEnvironment(scene, areaParam || 'forest')
    EnvironmentCreator.createEnemies(scene)
    EnvironmentCreator.createBackground(scene)
    
    // Add physics bodies for environment (簡易的に壁を追加)
    physics.addBox(new THREE.Vector3(0, 5, -50), new THREE.Vector3(100, 10, 1)) // 奥の壁
    physics.addBox(new THREE.Vector3(-50, 5, 0), new THREE.Vector3(1, 10, 50)) // 左の壁
    physics.addBox(new THREE.Vector3(50, 5, 0), new THREE.Vector3(1, 10, 50))  // 右の壁

    // Initialize Infrastructure
    inputManagerRef.current = new InputSystemManager(renderer.domElement)
    gameInputHandlerRef.current = GameInputHandler.getInstance()
    gameInputHandlerRef.current.setF1Handler(() => cameraDebugger.toggle())
    resizeHandlerRef.current = new ResizeHandler(camera, renderer)

    // Create System Pipeline
    const systemPipeline = createSystemPipeline(
      (world) => inputManagerRef.current?.updateInput(world) || world,
      (world) => playerMovementSystem(world, playerParams),
      (world) => cameraSystem(world, playerEid, cameraParams),
      renderSystem
    )

    setIsLoading(false)

    // Animation Loop
    const animate = (time: number) => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      // Update world time
      const previousTime = (world as any).time.elapsed || time
      ;(world as any).time.elapsed = time
      const deltaTime = (time - previousTime) / 1000 // 秒に変換
      ;(world as any).time.delta = deltaTime
      
      // Update physics
      physics.step(Math.min(deltaTime, 1/30)) // 最大30FPS相当でクランプ
      
      // Run ECS systems
      systemPipeline(world)
      
      // Update React state based on ECS state
      updateReactState()
      
      // Render
      renderer.render(scene, camera)
    }
    animate(0)

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      inputManagerRef.current?.destroy()
      gameInputHandlerRef.current?.destroy()
      resizeHandlerRef.current?.destroy()
      cameraDebugger.destroy()
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [areaParam])

  // Update React state based on ECS components
  const updateReactState = () => {
    if (cameraEntityRef.current !== null) {
      const cameraEid = cameraEntityRef.current
      
      // Update camera mode
      const mode = Camera.mode[cameraEid] === 0 ? 'fixed' : 'free'
      if (mode !== cameraMode) {
        setCameraMode(mode)
      }
    }
  }



  const handleBack = () => {
    router.push('/explore')
  }

  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      {/* Three.js Canvas */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top UI */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
          <button
            onClick={handleBack}
            className="bg-black/50 text-white px-3 py-2 rounded-lg hover:bg-black/70 transition-all"
          >
            ← 戻る
          </button>
          
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
            <div className="text-sm">エリア: {areaParam}</div>
          </div>
        </div>

        {/* Status Display */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white pointer-events-auto">
          <div className="flex space-x-4 text-sm">
            <div>❤️ {gameState.health}/100</div>
            <div>⚡ {gameState.energy}/100</div>
            <div>🏆 {gameState.score}</div>
            <div>👹 {gameState.enemies}</div>
            <div className={`px-2 py-1 rounded ${cameraMode === 'fixed' ? 'bg-orange-500/50 text-orange-200' : 'bg-purple-500/50 text-purple-200'}`}>
              {cameraMode === 'fixed' ? '🛡️ 安置エリア' : '🎮 自由エリア'}
            </div>
          </div>
        </div>

        {/* Control Guide */}
        <div className="absolute bottom-8 right-8 pointer-events-auto bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
          <h4 className="text-sm font-bold mb-2">🎮 ECS Game Controls</h4>
          <div className="space-y-1 text-xs">
            <div>左クリック: 継続移動</div>
            <div>右クリック: 移動停止</div>
            <div>WASD: 手動移動</div>
            <div>マウス: 視点回転（自由エリア）</div>
            <div>ホイール: ズーム（自由エリア）</div>
            <div>Space: ジャンプ</div>
            <div>R: カメラリセット（自由エリア）</div>
            <div className="mt-2 pt-2 border-t border-white/20">
              <div className="text-yellow-300">F1: Debug Panel</div>
            </div>
          </div>
        </div>

        {/* Loading Screen */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-4xl mb-4">🎮</div>
              <div className="text-xl">ECS World Loading...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}