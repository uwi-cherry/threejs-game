import { IWorld } from 'bitecs'

export interface System {
  /**
   * システムの更新処理
   * @param world ECSワールド
   * @param deltaTime 前回の更新からの経過時間（秒）
   */
  update(world: IWorld, deltaTime: number): void
  
  /**
   * リソースの解放など、クリーンアップ処理
   */
  dispose?(): void
}

export interface WorldState {
  /** ゲームの一時停止状態 */
  isPaused: boolean
  
  /** ゲーム時間のスケール（スローモーションなどに使用） */
  timeScale: number
  
  /** ゲーム開始からの経過時間（秒） */
  elapsedTime: number
  
  /** 前回の更新からの経過時間（秒） */
  deltaTime: number
}

export interface WorldStats {
  /** エンティティ数 */
  entityCount: number
  
  /** コンポーネントの種類ごとの数 */
  componentCounts: Record<string, number>
  
  /** 登録済みシステム数 */
  systemCount: number
}
