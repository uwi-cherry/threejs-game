import { addEntity, addComponent } from 'bitecs'
import { world } from '../EcsSystem/world'
import { InputState } from '../EcsSystem/input/InputState'
import { cameraDebugger } from '../debug/CameraDebugger'

export const createInputEntity = () => {
  const eid = addEntity(world)
  addComponent(world, InputState, eid)
  
  // Initialize input state
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

// Game-specific input handling
export class GameInputHandler {
  private static instance: GameInputHandler | null = null
  
  static getInstance(): GameInputHandler {
    if (!GameInputHandler.instance) {
      GameInputHandler.instance = new GameInputHandler()
    }
    return GameInputHandler.instance
  }
  
  private constructor() {
    this.setupEventListeners()
  }
  
  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
  }
  
  private handleKeyDown(event: KeyboardEvent) {
    // Game-specific key handling
    if (event.key === 'F1') {
      event.preventDefault()
      cameraDebugger.toggle()
    }
  }
  
  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this))
    GameInputHandler.instance = null
  }
}