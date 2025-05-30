import { useRef, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import * as THREE from 'three'
import { pipe } from 'bitecs'
import { world } from '../../../engine/world'
import { renderSystem } from '../../../engine/rendering/RenderSystem'
import { InputSystemManager } from '../../../engine/input/InputSystem'
import { 
  createPlayerEntity, 
  createPlayerMesh,
  Player
} from '../../../EcsFactory/player/PlayerFactory'
import { 
  createEnemyEntity,
  createEnemyMesh
} from '../../../EcsFactory/enemy/EnemyFactory'
import { 
  createCameraEntity,
  Camera
} from '../../../EcsFactory/exploration/CameraFactory'
import { 
  playerMovementSystem,
  cameraSystem, 
  setCameraReference,
  createSystemPipeline
} from '../../../EcsFactory/exploration/ExplorationSystems'
import { cameraDebugger } from '../../../engine/debug/CameraDebugger'

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
  
  // ECS Entity IDs
  const playerEntityRef = useRef<number | null>(null)
  const cameraEntityRef = useRef<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [gameState, setGameState] = useState({
    health: 100,
    energy: 80,
    score: 0,
    enemies: 3
  })
  const [cameraMode, setCameraMode] = useState<'fixed' | 'free'>('fixed')

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

    // Create Environment
    createEnvironment(scene, areaParam || 'forest')
    createEnemies(scene)
    createBackground(scene)

    // Initialize Input System
    inputManagerRef.current = new InputSystemManager(renderer.domElement)

    // Create System Pipeline
    const systemPipeline = createSystemPipeline(
      (world) => inputManagerRef.current?.updateInput(world) || world,
      playerMovementSystem,
      cameraSystem,
      renderSystem
    )

    setIsLoading(false)

    // Animation Loop
    const animate = (time: number) => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      // Update world time
      ;(world as any).time.elapsed = time
      ;(world as any).time.delta = time - ((world as any).time.delta || time)
      
      // Run ECS systems
      systemPipeline(world)
      
      // Update React state based on ECS state
      updateReactState()
      
      // Render
      renderer.render(scene, camera)
    }
    animate(0)

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    
    // Debug GUI toggle (F1 key)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault()
        cameraDebugger.toggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      inputManagerRef.current?.destroy()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
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


  // Environment Creation Functions
  const createEnvironment = (scene: THREE.Scene, area: string) => {
    switch (area) {
      case 'forest':
        for (let i = 0; i < 20; i++) {
          const treeGeometry = new THREE.ConeGeometry(1, 4)
          const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 })
          const tree = new THREE.Mesh(treeGeometry, treeMaterial)
          tree.position.set(
            Math.random() * 100 - 50,
            2,
            Math.random() * 10 - 5
          )
          tree.castShadow = true
          scene.add(tree)
        }
        break
      
      case 'cave':
        scene.background = new THREE.Color(0x2f2f2f)
        for (let i = 0; i < 15; i++) {
          const rockGeometry = new THREE.BoxGeometry(2, 3, 2)
          const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 })
          const rock = new THREE.Mesh(rockGeometry, rockMaterial)
          rock.position.set(
            Math.random() * 100 - 50,
            1.5,
            Math.random() * 10 - 5
          )
          rock.castShadow = true
          scene.add(rock)
        }
        break
      
      case 'volcano':
        scene.background = new THREE.Color(0x8b0000)
        break
    }
  }

  const createEnemies = (scene: THREE.Scene) => {
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 80 - 10
      const y = 0.5
      const z = Math.random() * 6 - 3
      
      const enemyEid = createEnemyEntity(x, y, z)
      createEnemyMesh(enemyEid, scene)
    }
  }

  const createBackground = (scene: THREE.Scene) => {
    for (let i = 0; i < 10; i++) {
      const mountainGeometry = new THREE.ConeGeometry(5, 15)
      const mountainMaterial = new THREE.MeshLambertMaterial({ color: 0x8fbc8f })
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial)
      mountain.position.set(
        Math.random() * 200 - 100,
        7,
        -30 - Math.random() * 20
      )
      scene.add(mountain)
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
            <div>Space: ジャンプ</div>
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