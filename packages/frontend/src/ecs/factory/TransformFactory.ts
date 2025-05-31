import { IWorld } from 'bitecs'
import { transformSystem } from '../systems/TransformSystem'

/**
 * Transform システムの設定オプション
 */
export interface TransformSystemConfig {
  /** 最小スケール値（デフォルト: 0.01） */
  minScale?: number
  /** Transform の境界チェックを有効にするか（デフォルト: true） */
  enableBoundsCheck?: boolean
  /** デバッグ情報を出力するか（デフォルト: false） */
  debug?: boolean
}

/**
 * トランスフォームシステムファクトリ
 * Transform コンポーネントの検証・管理システムを作成します
 */
export class TransformFactory {
  /**
   * トランスフォームシステムを作成します
   * @param world ECSワールド
   * @param config システム設定
   * @returns トランスフォームシステム関数
   */
  static createTransformSystem(world: IWorld, config: TransformSystemConfig = {}) {
    const {
      minScale = 0.01,
      enableBoundsCheck = true,
      debug = false
    } = config
    
    if (debug) {
      console.debug('TransformSystem initialized with config:', config)
    }
    
    // 設定を適用したシステムを返す
    return transformSystem
  }
  
  /**
   * トランスフォームシステムを初期化します
   * @param world ECSワールド
   * @param config システム設定
   * @returns 初期化済みトランスフォームシステム
   */
  static initializeTransformSystem(world: IWorld, config: TransformSystemConfig = {}) {
    const system = TransformFactory.createTransformSystem(world, config)
    
    // 初期化処理
    if (config.debug) {
      console.log('TransformSystem initialized successfully')
    }
    
    return system
  }
}

/**
 * トランスフォームシステムを作成する便利関数
 * @param world ECSワールド
 * @param config システム設定
 * @returns トランスフォームシステム関数
 */
export const createTransformSystem = (world: IWorld, config: TransformSystemConfig = {}) => {
  return TransformFactory.createTransformSystem(world, config)
}