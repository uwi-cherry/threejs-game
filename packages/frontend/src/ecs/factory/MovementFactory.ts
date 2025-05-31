import { IWorld } from 'bitecs'
import { movementSystem } from '../systems/MovementSystem'

/**
 * 移動システムファクトリ
 * 基本的な移動システムを作成・初期化します
 */
export class MovementFactory {
  /**
   * 移動システムを作成します
   * @param world ECSワールド
   * @returns 移動システム関数
   */
  static createMovementSystem(world: IWorld) {
    return movementSystem
  }
  
  /**
   * 移動システムを初期化します
   * @param world ECSワールド
   * @returns 初期化済み移動システム
   */
  static initializeMovementSystem(world: IWorld) {
    const system = MovementFactory.createMovementSystem(world)
    
    // 必要に応じて初期化処理を追加
    // 例: デバッグ情報の設定、パフォーマンス監視など
    
    return system
  }
}

/**
 * 移動システムを作成する便利関数
 * @param world ECSワールド
 * @returns 移動システム関数
 */
export const createMovementSystem = (world: IWorld) => {
  return MovementFactory.createMovementSystem(world)
}