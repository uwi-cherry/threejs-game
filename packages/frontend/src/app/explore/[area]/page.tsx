'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import * as THREE from 'three'

export default function ExploreAreaPage() {
  const router = useRouter()
  const params = useParams()
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const playerRef = useRef<THREE.Mesh | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [gameState, setGameState] = useState({
    health: 100,
    energy: 80,
    score: 0,
    enemies: 3
  })
  
  const keysRef = useRef<{ [key: string]: boolean }>({})
  const [cameraMode, setCameraMode] = useState<'fixed' | 'free'>('fixed')
  
  // 原神風カメラ制御用
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })
  const cameraRotationRef = useRef({ horizontal: 0, vertical: 0 })
  const [isFlying, setIsFlying] = useState(false)
  const prevCameraModeRef = useRef<'fixed' | 'free'>('fixed')
  
  // クリック移動用
  const targetPositionRef = useRef<THREE.Vector3 | null>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mousePositionRef = useRef(new THREE.Vector2())

  const areaParam = Array.isArray(params.area) ? params.area[0] : params.area

  useEffect(() => {
    if (!mountRef.current) return

    // シーン設定
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87ceeb) // 空色
    sceneRef.current = scene

    // カメラ設定（原神風3人称視点）
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 8, 12)
    camera.lookAt(0, 2, 0)
    cameraRef.current = camera

    // レンダラー設定
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // ライト設定
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 50, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // 地面作成
    const groundGeometry = new THREE.PlaneGeometry(200, 20)
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3a5f3a })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // プレイヤー作成（美少女キャラクターの仮表現）
    const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.5)
    const playerMaterial = new THREE.MeshLambertMaterial({ color: 0xff69b4 })
    const player = new THREE.Mesh(playerGeometry, playerMaterial)
    player.position.set(0, 2, 0)
    player.castShadow = true
    playerRef.current = player
    scene.add(player)

    // エリア別の環境作成
    createEnvironment(scene, areaParam)

    // 敵キャラクター作成
    createEnemies(scene)

    // 背景オブジェクト作成
    createBackground(scene, areaParam)

    // キーボード入力処理
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      keysRef.current[event.code] = true
      
      // スペースキーで飛行切り替え
      if (event.code === 'Space') {
        setIsFlying(prev => !prev)
      }
    }
    
    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault()
      keysRef.current[event.code] = false
    }
    
    // マウス操作処理
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // 左クリック
        mouseRef.current.isDown = true
        mouseRef.current.x = event.clientX
        mouseRef.current.y = event.clientY
        renderer.domElement.style.cursor = 'grabbing'
      }
    }
    
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        mouseRef.current.isDown = false
        renderer.domElement.style.cursor = 'grab'
      }
    }
    
    const handleMouseMove = (event: MouseEvent) => {
      // 安置エリア以外でのみ視点回転
      if (mouseRef.current.isDown && cameraMode === 'free') {
        const deltaX = event.clientX - mouseRef.current.x
        const deltaY = event.clientY - mouseRef.current.y
        
        cameraRotationRef.current.horizontal -= deltaX * 0.005
        cameraRotationRef.current.vertical += deltaY * 0.005
        
        // 垂直回転を制限
        cameraRotationRef.current.vertical = Math.max(
          -Math.PI / 3, 
          Math.min(Math.PI / 3, cameraRotationRef.current.vertical)
        )
        
        mouseRef.current.x = event.clientX
        mouseRef.current.y = event.clientY
      }
    }
    
    // クリック移動処理（継続移動）
    const handleClick = (event: MouseEvent) => {
      if (mouseRef.current.isDown) return // ドラッグ中は移動しない
      
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
        console.log('Moving towards:', intersection)
      }
    }
    
    // 右クリックで移動停止
    const handleRightClick = (event: MouseEvent) => {
      event.preventDefault()
      targetPositionRef.current = null
      console.log('Movement stopped')
    }
    
    // フォーカスを確実にレンダラーに設定
    renderer.domElement.tabIndex = 0
    renderer.domElement.focus()
    renderer.domElement.style.cursor = 'grab'
    
    renderer.domElement.addEventListener('keydown', handleKeyDown)
    renderer.domElement.addEventListener('keyup', handleKeyUp)
    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    renderer.domElement.addEventListener('mouseup', handleMouseUp)
    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    renderer.domElement.addEventListener('click', handleClick)
    renderer.domElement.addEventListener('contextmenu', handleRightClick)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    setIsLoading(false)

    // アニメーションループ
    const animate = () => {
      requestAnimationFrame(animate)
      
      // プレイヤー移動処理（原神風）
      if (playerRef.current && cameraRef.current) {
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
        
        // カメラの向きに基づいた移動方向計算（WASD移動）
        const forward = new THREE.Vector3()
        const right = new THREE.Vector3()
        
        // カメラの回転を基準に方向ベクトルを計算
        forward.set(
          -Math.sin(cameraRotationRef.current.horizontal),
          0,
          -Math.cos(cameraRotationRef.current.horizontal)
        ).normalize()
        
        right.set(
          Math.cos(cameraRotationRef.current.horizontal),
          0,
          -Math.sin(cameraRotationRef.current.horizontal)
        ).normalize()
        
        // WASD移動（クリック移動をキャンセル）
        const movement = new THREE.Vector3()
        
        if (keysRef.current['KeyW']) {
          movement.add(forward)
          moved = true
          targetPositionRef.current = null // WASD移動時はクリック移動をキャンセル
        }
        if (keysRef.current['KeyS']) {
          movement.sub(forward)
          moved = true
          targetPositionRef.current = null
        }
        if (keysRef.current['KeyA']) {
          movement.sub(right)
          moved = true
          targetPositionRef.current = null
        }
        if (keysRef.current['KeyD']) {
          movement.add(right)
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
        
        // 安置エリア判定とカメラモード切り替え
        const inSafeZone = playerRef.current.position.z > -10
        if (inSafeZone && cameraMode !== 'fixed') {
          setCameraMode('fixed')
          // 固定モードに切り替え時にカメラ回転をリセット
          cameraRotationRef.current.horizontal = 0
          cameraRotationRef.current.vertical = 0
          console.log('🛡️ 安置エリアに入りました - カメラ固定', {
            playerZ: playerRef.current.position.z,
            inSafeZone,
            newMode: 'fixed'
          })
        } else if (!inSafeZone && cameraMode !== 'free') {
          setCameraMode('free')
          console.log('🎮 自由エリアに入りました - カメラ自由', {
            playerZ: playerRef.current.position.z,
            inSafeZone,
            newMode: 'free'
          })
        }
        
        // 境界制限
        playerRef.current.position.x = Math.max(-80, Math.min(80, playerRef.current.position.x))
        playerRef.current.position.z = Math.max(-80, Math.min(80, playerRef.current.position.z))
        playerRef.current.position.y = Math.max(0.5, Math.min(50, playerRef.current.position.y))
        
      }
      
      // カメラ制御
      if (playerRef.current && cameraRef.current) {
        if (cameraMode === 'fixed') {
          // 安置エリア - 固定カメラ（横スクロール風）
          // プレイヤーのZ座標を追従しつつ、後ろから見る
          cameraRef.current.position.x = playerRef.current.position.x
          cameraRef.current.position.y = 8
          cameraRef.current.position.z = playerRef.current.position.z + 15
          cameraRef.current.lookAt(
            playerRef.current.position.x, 
            playerRef.current.position.y, 
            playerRef.current.position.z
          )
        } else {
          // 自由エリア - 原神風3人称カメラ
          const cameraDistance = 12
          const cameraHeight = 6
          
          // カメラ位置計算（プレイヤーの後ろ）
          const cameraOffset = new THREE.Vector3(
            Math.sin(cameraRotationRef.current.horizontal) * cameraDistance,
            cameraHeight + Math.sin(cameraRotationRef.current.vertical) * 8,
            Math.cos(cameraRotationRef.current.horizontal) * cameraDistance
          )
          
          cameraRef.current.position.copy(playerRef.current.position).add(cameraOffset)
          cameraRef.current.lookAt(playerRef.current.position)
        }
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // リサイズ対応
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    // クリーンアップ
    return () => {
      renderer.domElement.removeEventListener('keydown', handleKeyDown)
      renderer.domElement.removeEventListener('keyup', handleKeyUp)
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      renderer.domElement.removeEventListener('mouseup', handleMouseUp)
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('click', handleClick)
      renderer.domElement.removeEventListener('contextmenu', handleRightClick)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('resize', handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [areaParam])

  // エリア別環境作成
  const createEnvironment = (scene: THREE.Scene, area: string) => {
    switch (area) {
      case 'forest':
        // 森の木々
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
        // 洞窟の岩
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
        // 火山の溶岩
        scene.background = new THREE.Color(0x8b0000)
        break
    }
  }

  // 敵キャラクター作成
  const createEnemies = (scene: THREE.Scene) => {
    for (let i = 0; i < 5; i++) {
      const enemyGeometry = new THREE.BoxGeometry(1, 1, 1)
      const enemyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })
      const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial)
      enemy.position.set(
        Math.random() * 80 - 10,
        0.5,
        Math.random() * 6 - 3
      )
      enemy.castShadow = true
      scene.add(enemy)
    }
  }

  // 背景オブジェクト作成
  const createBackground = (scene: THREE.Scene, area: string) => {
    // 遠景の山々
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

  // プレイヤー移動
  const movePlayer = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!playerRef.current) return

    const moveSpeed = 1
    switch (direction) {
      case 'left':
        playerRef.current.position.x -= moveSpeed
        break
      case 'right':
        playerRef.current.position.x += moveSpeed
        break
      case 'up':
        playerRef.current.position.z -= moveSpeed
        break
      case 'down':
        playerRef.current.position.z += moveSpeed
        break
    }

    // 境界制限
    playerRef.current.position.x = Math.max(-50, Math.min(50, playerRef.current.position.x))
    playerRef.current.position.z = Math.max(-8, Math.min(8, playerRef.current.position.z))
  }

  const handleBack = () => {
    router.push('/explore')
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Three.js Canvas */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* UI オーバーレイ */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 上部UI */}
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

        {/* ステータス表示 */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white pointer-events-auto">
          <div className="flex space-x-4 text-sm">
            <div>❤️ {gameState.health}/100</div>
            <div>⚡ {gameState.energy}/100</div>
            <div>🏆 {gameState.score}</div>
            <div>👹 {gameState.enemies}</div>
            <div className={`px-2 py-1 rounded ${isFlying ? 'bg-blue-500/50 text-blue-200' : 'bg-green-500/50 text-green-200'}`}>
              {isFlying ? '🪶 飛行中' : '🚶 徒歩'}
            </div>
            <div className={`px-2 py-1 rounded ${cameraMode === 'fixed' ? 'bg-orange-500/50 text-orange-200' : 'bg-purple-500/50 text-purple-200'}`}>
              {cameraMode === 'fixed' ? '🛡️ 安置エリア' : '🎮 自由エリア'}
            </div>
            <div className="text-xs text-white/60">
              Z: {Math.round(playerRef.current?.position.z || 0)}
            </div>
          </div>
        </div>

        {/* 操作ガイド */}
        <div className="absolute bottom-8 right-8 pointer-events-auto bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
          <h4 className="text-sm font-bold mb-2">🎮 操作方法</h4>
          <div className="space-y-1 text-xs">
            <div>左クリック: 継続移動</div>
            <div>右クリック: 移動停止</div>
            <div>WASD: 手動移動</div>
            <div>マウス: 視点回転（自由エリア）</div>
            <div>Space: ジャンプ/飛行切替</div>
            <div>Shift: 降下（飛行時）</div>
          </div>
          <button
            onClick={() => setIsFlying(prev => !prev)}
            className={`mt-3 px-3 py-1 rounded-lg text-xs transition-all ${
              isFlying 
                ? 'bg-blue-500/50 text-blue-200 hover:bg-blue-500/70' 
                : 'bg-green-500/50 text-green-200 hover:bg-green-500/70'
            }`}
          >
            {isFlying ? '🚶 徒歩モード' : '🪶 飛行モード'}
          </button>
        </div>

        {/* ローディング画面 */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-4xl mb-4">🎮</div>
              <div className="text-xl">探索エリアを読み込み中...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}