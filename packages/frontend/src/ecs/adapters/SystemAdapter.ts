import { IWorld } from 'bitecs'
import { System } from '../world/types'

/**
 * 関数型システムをSystemインターフェースに適応させるアダプター
 */
export class SystemAdapter implements System {
  constructor(
    private systemFunction: (world: IWorld) => IWorld,
    private name: string = 'UnnamedSystem'
  ) {}

  update(world: IWorld, deltaTime: number): void {
    // デルタタイムをワールドに設定
    (world as any).time = {
      ...(world as any).time,
      delta: deltaTime * 1000, // ミリ秒に変換
      deltaTime: deltaTime
    }
    
    this.systemFunction(world)
  }

  dispose?(): void {
    // 関数型システムは通常クリーンアップが不要
    console.debug(`${this.name} disposed`)
  }
}

/**
 * 物理システム用の特別なアダプター
 */
export class PhysicsSystemAdapter implements System {
  constructor(
    private physicsUpdateFunction: (deltaTime: number) => IWorld,
    private name: string = 'PhysicsSystem'
  ) {}

  update(world: IWorld, deltaTime: number): void {
    this.physicsUpdateFunction(deltaTime)
  }

  dispose?(): void {
    console.debug(`${this.name} disposed`)
  }
}

/**
 * 入力システム用の特別なアダプター
 */
export class InputSystemAdapter implements System {
  constructor(
    private inputUpdateFunction: (world: IWorld) => IWorld,
    private name: string = 'InputSystem'
  ) {}

  update(world: IWorld, deltaTime: number): void {
    this.inputUpdateFunction(world)
  }

  dispose?(): void {
    console.debug(`${this.name} disposed`)
  }
}

/**
 * 関数型システムをSystemインターフェースに変換する便利関数
 */
export const createSystemAdapter = (
  systemFunction: (world: IWorld) => IWorld,
  name?: string
): System => {
  return new SystemAdapter(systemFunction, name)
}

/**
 * 物理システムをSystemインターフェースに変換する便利関数
 */
export const createPhysicsSystemAdapter = (
  physicsUpdateFunction: (deltaTime: number) => IWorld,
  name?: string
): System => {
  return new PhysicsSystemAdapter(physicsUpdateFunction, name)
}

/**
 * 入力システムをSystemインターフェースに変換する便利関数
 */
export const createInputSystemAdapter = (
  inputUpdateFunction: (world: IWorld) => IWorld,
  name?: string
): System => {
  return new InputSystemAdapter(inputUpdateFunction, name)
}