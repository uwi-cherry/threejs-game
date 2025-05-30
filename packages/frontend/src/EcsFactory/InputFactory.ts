import { addEntity, addComponent } from 'bitecs'
import { world } from '../EcsSystem/world'
import { InputState } from '../EcsSystem/input/InputState'

/**
 * 入力関連のエンティティを作成するファクトリ関数
 * @returns 作成されたエンティティのID
 */
export const createInputEntity = (): number => {
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