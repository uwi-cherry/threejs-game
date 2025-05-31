import { IWorld, addEntity, removeEntity } from 'bitecs'
import { WorldState } from './types'

/**
 * エンティティのライフサイクルを管理するクラス
 */
export class EntityManager {
  private entities: Set<number> = new Set()
  private componentCallbacks: Map<string, (eid: number) => void> = new Map()

  constructor(private world: IWorld, private state: WorldState) {}

  /**
   * 新しいエンティティを作成
   */
  create(): number {
    const eid = addEntity(this.world)
    this.entities.add(eid)
    return eid
  }

  /**
   * エンティティを削除
   */
  remove(eid: number): void {
    if (this.entities.has(eid)) {
      // コンポーネントのクリーンアップコールバックを実行
      this.componentCallbacks.forEach(callback => callback(eid))
      
      // エンティティを削除
      removeEntity(this.world, eid)
      this.entities.delete(eid)
    }
  }

  /**
   * すべてのエンティティを削除
   */
  clear(): void {
    this.entities.forEach(eid => this.remove(eid))
    this.entities.clear()
  }

  /**
   * コンポーネント削除時のコールバックを登録
   */
  onComponentRemove(componentName: string, callback: (eid: number) => void): void {
    this.componentCallbacks.set(componentName, callback)
  }

  /**
   * エンティティが存在するか確認
   */
  has(eid: number): boolean {
    return this.entities.has(eid)
  }

  /**
   * すべてのエンティティを取得
   */
  getAll(): number[] {
    return Array.from(this.entities)
  }

  /**
   * リソースの解放
   */
  dispose(): void {
    this.clear()
    this.componentCallbacks.clear()
  }
}
