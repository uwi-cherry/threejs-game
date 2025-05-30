import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { world } from '../../EcsSystem/world'
import { renderSystem } from '../../EcsSystem/rendering/RenderSystem'
import { InputSystemManager } from '../../EcsSystem/input/InputSystem'
import { ResizeHandler } from '../../infrastructure/ResizeHandler'
import { PhysicsWorld } from '../../EcsSystem/physics/PhysicsWorld'
import { 
  createPlayerEntity, 
  createPlayerMesh,
  createPlayerMovementSystem,
  DEFAULT_PLAYER_PARAMS
} from '../../EcsFactory/PlayerFactory'

import { createCameraEntity, createCameraSystem } from '../../EcsFactory/CameraFactory'
import { setCameraReference } from '../../EcsSystem/camera/CameraFollowSystem'
import { createSystemPipeline } from './SystemPipeline'
import { EnvironmentCreator } from './EnvironmentCreator'

export default function ECSGameWorld() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const inputManagerRef = useRef<InputSystemManager | null>(null)
  const resizeHandlerRef = useRef<ResizeHandler | null>(null)
  
  // ECS Entity IDs
  const playerEntityRef = useRef<number | null>(null)
  const cameraEntityRef = useRef<number | null>(null)
  // InputSystemManagerが入力処理を担当するため、GameInputHandlerは不要になりました

  // プレイヤーの移動システムを作成
  const playerMovementSystem = createPlayerMovementSystem(DEFAULT_PLAYER_PARAMS)

  const areaParam = 'default'

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

    // Create camera entity and system
    const cameraEntity = createCameraEntity({
      camera: camera,
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
    cameraEntityRef.current = cameraEntity.eid
    
    // Store camera system params
    const cameraSystem = createCameraSystem(world, playerEid, cameraEntity.systemParams)
    
    // Initialize camera reference
    setCameraReference(camera)

    // Initialize Physics World
    const physics = PhysicsWorld.getInstance()
    
    // Create Environment
    EnvironmentCreator.createEnvironment(scene, areaParam || 'forest')
    EnvironmentCreator.createEnemies(scene)
    EnvironmentCreator.createBackground(scene)
    
    // Add physics bodies for environment
    physics.addBox(new THREE.Vector3(0, 5, -50), new THREE.Vector3(100, 10, 1)) // Back wall
    physics.addBox(new THREE.Vector3(-50, 5, 0), new THREE.Vector3(1, 10, 50))  // Left wall
    physics.addBox(new THREE.Vector3(50, 5, 0), new THREE.Vector3(1, 10, 50))   // Right wall

    // Initialize input and resize handlers
    inputManagerRef.current = new InputSystemManager(renderer.domElement)
    // F1キーのハンドラーを設定
    if (inputManagerRef.current) {
      inputManagerRef.current.setF1Handler(() => {
        console.log('F1 pressed - toggle debug info')
        // デバッグ情報の表示/非表示を切り替えるなどの処理をここに追加
      })
    }

    resizeHandlerRef.current = new ResizeHandler(camera, renderer)


    
    // Create System Pipeline
    const systemPipeline = createSystemPipeline(
      (world) => inputManagerRef.current?.updateInput(world) || world,
      playerMovementSystem,
      cameraSystem,
      renderSystem
    )

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
      
      // Render
      renderer.render(scene, camera)
    }
    animate(0)

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      // F1キーハンドラーのクリーンアップ
      if (inputManagerRef.current) {
        inputManagerRef.current.setF1Handler(() => {})
      }
      
      if (resizeHandlerRef.current) {
        // ResizeHandler doesn't have a dispose method
        resizeHandlerRef.current = null
      }
      
      if (inputManagerRef.current) {
        // InputSystemManager doesn't have a dispose method
        inputManagerRef.current = null
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((object: any) => {
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
      }
      
      if (mountRef.current) {
        mountRef.current.innerHTML = ''
      }
      
      // Clear world entities
      // In a real app, you'd want to properly clean up all entities
      // This is a simplified approach to clear the world
      const worldObj = world as unknown as Record<string, any>
      Object.values(worldObj).forEach(value => {
        if (Array.isArray(value)) {
          value.length = 0
        }
      })
    }
  }, [areaParam])

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  )
}