import { IWorld } from 'bitecs'
import { renderSystem } from '../systems/RenderSystem'
import * as THREE from 'three'

/**
 * レンダリングシステムファクトリ
 * Three.jsとECSを連携させるレンダリングシステムを作成・管理します
 */
export class RenderFactory {
  /**
   * レンダリングシステムを作成します
   * @param world ECSワールド
   * @param scene Three.jsシーン（オプション、デバッグ用）
   * @returns レンダリングシステム関数
   */
  static createRenderSystem(world: IWorld, scene?: THREE.Scene) {
    // デバッグ情報やパフォーマンス監視が必要な場合はここで設定
    if (scene && process.env.NODE_ENV === 'development') {
      // 開発環境でのデバッグ情報
      console.debug('RenderSystem initialized with scene:', scene.uuid)
    }
    
    return renderSystem
  }
  
  /**
   * レンダリングシステムを初期化します
   * @param world ECSワールド
   * @param scene Three.jsシーン
   * @returns 初期化済みレンダリングシステム
   */
  static initializeRenderSystem(world: IWorld, scene: THREE.Scene) {
    const system = RenderFactory.createRenderSystem(world, scene)
    
    // 必要に応じて初期化処理を追加
    // 例: シーンの参照保存、レンダリング統計の初期化など
    
    return system
  }
}

/**
 * レンダリングシステムを作成する便利関数
 * @param world ECSワールド
 * @param scene Three.jsシーン（オプション）
 * @returns レンダリングシステム関数
 */
export const createRenderSystem = (world: IWorld, scene?: THREE.Scene) => {
  return RenderFactory.createRenderSystem(world, scene)
}