import { IWorld } from 'bitecs'
import { System, WorldState } from './types'

/**
 * システムの登録と実行を管理するクラス
 */
export class SystemManager {
  private systems: System[] = []
  private systemExecutionOrder: string[] = []
  private systemMap: Map<string, System> = new Map()

  constructor(private world: IWorld, private state: WorldState) {}

  /**
   * システムを登録
   * @param name システム名（デバッグ用）
   * @param system システムインスタンス
   * @param priority 実行優先度（小さい方が先に実行される）
   */
  add(name: string, system: System, priority: number = this.systems.length): void {
    if (this.systemMap.has(name)) {
      console.warn(`System '${name}' is already registered`)
      return
    }

    this.systems.splice(priority, 0, system)
    this.systemMap.set(name, system)
    this.systemExecutionOrder.splice(priority, 0, name)
  }

  /**
   * システムを削除
   */
  remove(name: string): boolean {
    const system = this.systemMap.get(name)
    if (!system) return false

    const index = this.systems.indexOf(system)
    if (index !== -1) {
      this.systems.splice(index, 1)
      this.systemExecutionOrder.splice(index, 1)
      this.systemMap.delete(name)
      
      // リソースの解放
      if (system.dispose) {
        system.dispose()
      }
      
      return true
    }
    return false
  }

  /**
   * すべてのシステムを更新
   */
  update(deltaTime: number): void {
    if (this.state.isPaused) {
      deltaTime = 0
    } else {
      deltaTime *= this.state.timeScale
    }

    for (let i = 0; i < this.systems.length; i++) {
      const system = this.systems[i]
      system.update(this.world, deltaTime)
    }
  }

  /**
   * システムを取得
   */
  get<T extends System>(name: string): T | undefined {
    return this.systemMap.get(name) as T | undefined
  }

  /**
   * 登録済みのシステム名を取得
   */
  getSystemNames(): string[] {
    return [...this.systemExecutionOrder]
  }

  /**
   * リソースの解放
   */
  dispose(): void {
    // すべてのシステムを破棄
    for (const system of this.systems) {
      if (system.dispose) {
        system.dispose()
      }
    }
    
    this.systems = []
    this.systemMap.clear()
    this.systemExecutionOrder = []
  }
}
