import { IWorld, createWorld } from 'bitecs'
import { EntityManager } from './EntityManager'
import { SystemManager } from './SystemManager'
import { WorldState, WorldStats } from './types'

/**
 * ゲームワールドの中心的な管理クラス
 */
export class WorldManager {
  public readonly world: IWorld
  public readonly state: WorldState
  public readonly entities: EntityManager
  public readonly systems: SystemManager

  private lastTime: number = 0
  private isInitialized: boolean = false

  constructor() {
    // ECSワールドの初期化
    this.world = createWorld()
    
    // ワールド状態の初期化
    this.state = {
      isPaused: false,
      timeScale: 1.0,
      elapsedTime: 0,
      deltaTime: 0
    }

    // マネージャーの初期化
    this.entities = new EntityManager(this.world, this.state)
    this.systems = new SystemManager(this.world, this.state)
  }

  /**
   * ワールドの初期化
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('World is already initialized')
      return
    }

    // 初期化フラグを設定
    this.isInitialized = true
    this.lastTime = performance.now() / 1000
    
    // ワールド固有の初期化処理をここに記述
    console.log('World initialized')
  }

  /**
   * ワールドの更新
   */
  update(): void {
    if (!this.isInitialized) {
      console.warn('World is not initialized')
      return
    }

    // デルタタイムの計算
    const currentTime = performance.now() / 1000
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    // 状態を更新
    this.state.deltaTime = deltaTime
    this.state.elapsedTime += deltaTime * this.state.timeScale

    // システムの更新
    this.systems.update(deltaTime)
  }

  /**
   * ワールドの一時停止/再開
   */
  setPaused(paused: boolean): void {
    this.state.isPaused = paused
  }

  /**
   * ゲーム時間のスケールを設定（スローモーションなど）
   */
  setTimeScale(scale: number): void {
    this.state.timeScale = Math.max(0, scale)
  }

  /**
   * ワールドの統計情報を取得
   */
  getStats(): WorldStats {
    return {
      entityCount: this.entities.getAll().length,
      componentCounts: this.getComponentCounts(),
      systemCount: this.systems.getSystemNames().length
    }
  }

  /**
   * コンポーネントの統計情報を取得
   */
  private getComponentCounts(): Record<string, number> {
    const counts: Record<string, number> = {}
    
    // ワールドからコンポーネントの情報を収集
    // 注意: これは bitecs の内部実装に依存する可能性があります
    const components = (this.world as any).components || {}
    
    for (const [name, component] of Object.entries(components)) {
      // @ts-ignore
      counts[name] = component.pool?.length || 0
    }
    
    return counts
  }

  /**
   * リソースの解放
   */
  dispose(): void {
    if (!this.isInitialized) return
    
    // システムの破棄
    this.systems.dispose()
    
    // エンティティの破棄
    this.entities.dispose()
    
    // ワールドの破棄
    // 注意: bitecs の World に dispose メソッドが無いため、ガベージコレクションに任せる
    
    this.isInitialized = false
    console.log('World disposed')
  }
}
