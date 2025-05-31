import { addEntity, addComponent, IWorld } from 'bitecs'
import { InputState } from '../components/InputState'
import { InputSystemManager } from '../systems/InputSystem'

/**
 * 入力システムの設定オプション
 */
export interface InputSystemConfig {
  /** F1キーハンドラー */
  f1Handler?: () => void
  /** デバッグモード */
  debug?: boolean
}

/**
 * 入力システムファクトリ
 * 入力システムとエンティティを管理します
 */
export class InputFactory {
  /**
   * 入力システムマネージャーを作成します
   * @param element DOM要素
   * @param config 設定オプション
   * @returns InputSystemManager インスタンス
   */
  static createInputSystemManager(element: HTMLElement, config: InputSystemConfig = {}): InputSystemManager {
    const manager = new InputSystemManager(element)
    
    if (config.f1Handler) {
      manager.setF1Handler(config.f1Handler)
    }
    
    if (config.debug) {
      console.debug('InputSystemManager created for element:', element)
    }
    
    return manager
  }
  
  /**
   * 入力エンティティを作成します
   * @param world ECS ワールド
   * @returns 作成されたエンティティID
   */
  static createInputEntity(world: IWorld): number {
    const eid = addEntity(world)
    addComponent(world, InputState, eid)
    
    // 入力状態の初期化
    InputState.movementX[eid] = 0
    InputState.movementY[eid] = 0
    InputState.jump[eid] = 0
    InputState.descend[eid] = 0
    InputState.mouseX[eid] = 0
    InputState.mouseY[eid] = 0
    InputState.mouseDelta.x[eid] = 0
    InputState.mouseDelta.y[eid] = 0
    InputState.leftClick[eid] = 0
    InputState.rightClick[eid] = 0
    
    return eid
  }
  
  /**
   * 入力システムを初期化します（エンティティ + マネージャー）
   * @param world ECSワールド
   * @param element DOM要素
   * @param config 設定オプション
   * @returns 入力システムの情報
   */
  static initializeInputSystem(world: IWorld, element: HTMLElement, config: InputSystemConfig = {}) {
    const manager = InputFactory.createInputSystemManager(element, config)
    // 既存のInputState付きエンティティ（プレイヤー）を利用する
    return {
      manager,
      updateInput: (world: IWorld) => manager.updateInput(world),
      dispose: () => manager.destroy()
    }
  }
}

/**
 * 入力エンティティを作成する便利関数（後方互換性）
 * @param world ECS ワールド
 * @returns 作成されたエンティティID
 */
export const createInputEntity = (world: IWorld) => {
  return InputFactory.createInputEntity(world)
}

/**
 * 入力システムマネージャーを作成する便利関数
 * @param element DOM要素
 * @param config 設定オプション
 * @returns InputSystemManager インスタンス
 */
export const createInputSystemManager = (element: HTMLElement, config: InputSystemConfig = {}) => {
  return InputFactory.createInputSystemManager(element, config)
}