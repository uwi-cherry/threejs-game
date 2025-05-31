import { IWorld } from 'bitecs'
import { PhysicsWorld } from '../systems/PhysicsWorld'
import * as THREE from 'three'

/**
 * 物理システムの設定オプション
 */
export interface PhysicsSystemConfig {
  /** 重力設定（デフォルト: { x: 0, y: -9.82, z: 0 }） */
  gravity?: { x: number, y: number, z: number }
  /** ソルバーの反復回数（デフォルト: 10） */
  solverIterations?: number
  /** デバッグ情報を出力するか（デフォルト: false） */
  debug?: boolean
  /** 地面を自動作成するか（デフォルト: true） */
  createGround?: boolean
}

/**
 * 物理システムファクトリ
 * CANNON.js物理エンジンを使用した物理システムを作成・管理します
 */
export class PhysicsFactory {
  private static physicsWorldInstance: PhysicsWorld | null = null
  
  /**
   * 物理ワールドのインスタンスを取得します
   * @param config 物理システム設定
   * @returns PhysicsWorld インスタンス
   */
  static getPhysicsWorld(config: PhysicsSystemConfig = {}): PhysicsWorld {
    if (!PhysicsFactory.physicsWorldInstance) {
      PhysicsFactory.physicsWorldInstance = PhysicsWorld.getInstance()
      
      if (config.debug) {
        console.debug('PhysicsWorld initialized with config:', config)
      }
    }
    
    return PhysicsFactory.physicsWorldInstance
  }
  
  /**
   * 物理システムを作成します
   * @param world ECSワールド
   * @param config 物理システム設定
   * @returns 物理システム更新関数
   */
  static createPhysicsSystem(world: IWorld, config: PhysicsSystemConfig = {}) {
    const physicsWorld = PhysicsFactory.getPhysicsWorld(config)
    
    // 物理システム更新関数を返す
    return (deltaTime: number) => {
      // 最大30FPS相当でクランプ
      const clampedDelta = Math.min(deltaTime, 1/30)
      physicsWorld.step(clampedDelta)
      return world
    }
  }
  
  /**
   * 物理システムを初期化します
   * @param world ECSワールド
   * @param config 物理システム設定
   * @returns 初期化済み物理システム
   */
  static initializePhysicsSystem(world: IWorld, config: PhysicsSystemConfig = {}) {
    const physicsSystem = PhysicsFactory.createPhysicsSystem(world, config)
    
    if (config.debug) {
      console.log('PhysicsSystem initialized successfully')
    }
    
    return physicsSystem
  }
  
  /**
   * 環境用の物理ボディを追加します
   * @param position 位置
   * @param size サイズ
   * @returns 作成された物理ボディ
   */
  static addEnvironmentBox(position: THREE.Vector3, size: THREE.Vector3) {
    const physicsWorld = PhysicsFactory.getPhysicsWorld()
    return physicsWorld.addBox(position, size)
  }
  
  /**
   * 物理システムをリセットします（主にテスト用）
   */
  static reset() {
    PhysicsFactory.physicsWorldInstance = null
  }
}

/**
 * 物理システムを作成する便利関数
 * @param world ECSワールド
 * @param config 物理システム設定
 * @returns 物理システム更新関数
 */
export const createPhysicsSystem = (world: IWorld, config: PhysicsSystemConfig = {}) => {
  return PhysicsFactory.createPhysicsSystem(world, config)
}

/**
 * 物理ワールドのインスタンスを取得する便利関数
 * @param config 物理システム設定
 * @returns PhysicsWorld インスタンス
 */
export const getPhysicsWorld = (config: PhysicsSystemConfig = {}) => {
  return PhysicsFactory.getPhysicsWorld(config)
}