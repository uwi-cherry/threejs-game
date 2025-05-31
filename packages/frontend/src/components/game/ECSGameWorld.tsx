import { useRef, useEffect } from 'react'
import { GameWorld, GameWorldConfig } from '../../ecs/world'

export default function ECSGameWorld() {
  const mountRef = useRef<HTMLDivElement>(null)
  
  // Game World Reference
  const gameWorldRef = useRef<GameWorld | null>(null)

  const areaParam = 'default'

  useEffect(() => {
    if (!mountRef.current) return

    const initializeGameWorld = async () => {
      try {
        const config: GameWorldConfig = {
          areaParam,
          debug: process.env.NODE_ENV === 'development',
          enablePhysics: true,
          playerPosition: { x: 0, y: 0, z: 0 }
        }

        const gameWorld = new GameWorld(config)
        await gameWorld.initialize(mountRef.current!)
        gameWorld.start()
        
        gameWorldRef.current = gameWorld
        
        console.log('Game world initialized successfully')
      } catch (error) {
        console.error('Failed to initialize game world:', error)
      }
    }

    initializeGameWorld()

    // GameWorldが内部でアニメーションループを管理するため、ここでは不要

    // Cleanup
    return () => {
      if (gameWorldRef.current) {
        gameWorldRef.current.dispose()
        gameWorldRef.current = null
      }
      
      // Clear DOM
      if (mountRef.current) {
        mountRef.current.innerHTML = ''
      }
    }
  }, [areaParam])

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  )
}