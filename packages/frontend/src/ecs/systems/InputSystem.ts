import { IWorld, defineQuery } from 'bitecs'
import { InputState } from '../components/InputState'
import * as THREE from 'three'

const inputQuery = defineQuery([InputState])

export class InputSystemManager {
  private element: HTMLElement
  private keys: Set<string> = new Set()
  private mouseDown = false
  private mousePosition = new THREE.Vector2()
  private mouseDelta = new THREE.Vector2()
  private leftClick = false
  private rightClick = false
  private mouseWheel = 0
  private resetPressed = false
  private onF1Callback: (() => void) = () => {}
  
  // バインドしたイベントハンドラーの参照を保持
  private boundHandleKeyDown: (event: KeyboardEvent) => void
  private boundHandleKeyUp: (event: KeyboardEvent) => void
  private boundHandleMouseDown: (event: MouseEvent) => void
  private boundHandleMouseUp: (event: MouseEvent) => void
  private boundHandleMouseMove: (event: MouseEvent) => void
  private boundHandleClick: (event: MouseEvent) => void
  private boundHandleContextMenu: (event: MouseEvent) => void
  private boundHandleWheel: (event: WheelEvent) => void
  
  constructor(element: HTMLElement) {
    this.element = element
    
    // イベントハンドラーをバインドして参照を保持
    this.boundHandleKeyDown = this.handleKeyDown.bind(this)
    this.boundHandleKeyUp = this.handleKeyUp.bind(this)
    this.boundHandleMouseDown = this.handleMouseDown.bind(this)
    this.boundHandleMouseUp = this.handleMouseUp.bind(this)
    this.boundHandleMouseMove = this.handleMouseMove.bind(this)
    this.boundHandleClick = this.handleClick.bind(this)
    this.boundHandleContextMenu = this.handleContextMenu.bind(this)
    this.boundHandleWheel = this.handleWheel.bind(this)
    
    this.setupEventListeners()
  }
  
  private setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', this.boundHandleKeyDown)
    window.addEventListener('keyup', this.boundHandleKeyUp)
    
    // Mouse events
    this.element.addEventListener('mousedown', this.boundHandleMouseDown)
    this.element.addEventListener('mouseup', this.boundHandleMouseUp)
    this.element.addEventListener('mousemove', this.boundHandleMouseMove)
    this.element.addEventListener('click', this.boundHandleClick)
    this.element.addEventListener('contextmenu', this.boundHandleContextMenu)
    this.element.addEventListener('wheel', this.boundHandleWheel)
    
    // Focus
    this.element.tabIndex = 0
    this.element.focus()
    this.element.style.cursor = 'grab'
  }
  
  private handleKeyDown(event: KeyboardEvent) {
    event.preventDefault()
    this.keys.add(event.code)
    console.log('[InputSystemManager] handleKeyDown:', event.code)
    
    // Rキーでカメラリセット
    if (event.code === 'KeyR') {
      this.resetPressed = true
    }
    
    // F1キーの処理
    if (event.code === 'F1' && this.onF1Callback) {
      event.preventDefault()
      this.onF1Callback()
    }
  }
  
  private handleKeyUp(event: KeyboardEvent) {
    event.preventDefault()
    this.keys.delete(event.code)
    console.log('[InputSystemManager] handleKeyUp:', event.code)
  }
  
  private handleMouseDown(event: MouseEvent) {
    console.log('[InputSystemManager] handleMouseDown:', event.button)
    if (event.button === 0) {
      this.mouseDown = true
      this.element.style.cursor = 'grabbing'
    }
  }
  
  private handleMouseUp(event: MouseEvent) {
    console.log('[InputSystemManager] handleMouseUp:', event.button)
    if (event.button === 0) {
      this.mouseDown = false
      this.element.style.cursor = 'grab'
    }
  }
  
  private handleMouseMove(event: MouseEvent) {
    console.log('[InputSystemManager] handleMouseMove:', event.clientX, event.clientY)
    const rect = this.element.getBoundingClientRect()
    this.mousePosition.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
    
    // Always track mouse delta for camera rotation
    this.mouseDelta.set(
      event.movementX || 0,
      event.movementY || 0
    )
  }
  
  private handleClick(event: MouseEvent) {
    if (event.button === 0) {
      this.leftClick = true
    }
  }
  
  private handleContextMenu(event: MouseEvent) {
    event.preventDefault()
    this.rightClick = true
  }
  
  private handleWheel(event: WheelEvent) {
    event.preventDefault()
    this.mouseWheel = -event.deltaY * 0.01 // 正規化
  }
  
  public updateInput(world: IWorld) {
    const inputs = inputQuery(world)
    
    if (inputs.length > 0) {
      const inputEid = inputs[0]
      // Movement input (WASD)
      let movementX = 0
      let movementY = 0
      
      if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) movementX -= 1
      if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) movementX += 1
      if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) movementY += 1
      if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) movementY -= 1
      
      InputState.movementX[inputEid] = movementX
      InputState.movementY[inputEid] = movementY
      
      // Jump/Descend
      InputState.jump[inputEid] = this.keys.has('Space') ? 1 : 0
      InputState.descend[inputEid] = (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) ? 1 : 0
      
      // Mouse input
      InputState.mouseX[inputEid] = this.mousePosition.x
      InputState.mouseY[inputEid] = this.mousePosition.y
      InputState.mouseDelta.x[inputEid] = this.mouseDelta.x
      InputState.mouseDelta.y[inputEid] = this.mouseDelta.y
      
      // Click input
      InputState.leftClick[inputEid] = this.leftClick ? 1 : 0
      InputState.rightClick[inputEid] = this.rightClick ? 1 : 0
      
      // Wheel and reset input
      InputState.mouseWheel[inputEid] = this.mouseWheel
      InputState.reset[inputEid] = this.resetPressed ? 1 : 0
      
      // Reset flags
      this.leftClick = false
      this.rightClick = false
      this.mouseWheel = 0
      this.resetPressed = false
    }
    
    return world
  }
  
  public isResetPressed(): boolean {
    const pressed = this.resetPressed
    this.resetPressed = false
    return pressed
  }
  
  /**
   * F1キーが押されたときのコールバックを設定
   * @param callback コールバック関数
   */
  public setF1Handler(callback: () => void): void {
    this.onF1Callback = callback
  }
  
  public destroy() {
    // イベントリスナーの削除（bindしたものは参照を保持する必要がある）
    window.removeEventListener('keydown', this.boundHandleKeyDown)
    window.removeEventListener('keyup', this.boundHandleKeyUp)
    this.element.removeEventListener('mousedown', this.boundHandleMouseDown)
    this.element.removeEventListener('mouseup', this.boundHandleMouseUp)
    this.element.removeEventListener('mousemove', this.boundHandleMouseMove)
    this.element.removeEventListener('click', this.boundHandleClick)
    this.element.removeEventListener('contextmenu', this.boundHandleContextMenu)
    this.element.removeEventListener('wheel', this.boundHandleWheel)
  }
}