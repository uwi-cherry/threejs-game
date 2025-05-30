import * as CANNON from 'cannon-es'
import * as THREE from 'three'

export class PhysicsWorld {
  private static instance: PhysicsWorld
  public world: CANNON.World
  
  private constructor() {
    this.world = new CANNON.World()
    this.setupWorld()
  }
  
  public static getInstance(): PhysicsWorld {
    if (!PhysicsWorld.instance) {
      PhysicsWorld.instance = new PhysicsWorld()
    }
    return PhysicsWorld.instance
  }
  
  private setupWorld() {
    // 重力設定
    this.world.gravity.set(0, -9.82, 0)
    
    // 衝突検出の最適化
    this.world.broadphase = new CANNON.NaiveBroadphase()
    this.world.solver.iterations = 10
    
    // 地面の作成
    this.createGround()
  }
  
  private createGround() {
    const groundShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({ mass: 0 })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.world.addBody(groundBody)
  }
  
  public raycast(from: THREE.Vector3, to: THREE.Vector3): CANNON.RaycastResult | null {
    const result = new CANNON.RaycastResult()
    const fromCannon = new CANNON.Vec3(from.x, from.y, from.z)
    const toCannon = new CANNON.Vec3(to.x, to.y, to.z)
    
    const hasHit = this.world.raycastClosest(fromCannon, toCannon, {}, result)
    
    return hasHit ? result : null
  }
  
  public step(deltaTime: number) {
    this.world.step(deltaTime)
  }
  
  public addBox(position: THREE.Vector3, size: THREE.Vector3): CANNON.Body {
    const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2))
    const body = new CANNON.Body({ mass: 0 }) // 静的オブジェクト
    body.addShape(shape)
    body.position.set(position.x, position.y, position.z)
    this.world.addBody(body)
    return body
  }
}