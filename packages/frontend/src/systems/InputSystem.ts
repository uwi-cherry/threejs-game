import * as THREE from 'three'

export interface InputState {
  keys: { [key: string]: boolean }
  mouse: {
    position: THREE.Vector2
    isDown: boolean
    startPosition: THREE.Vector2
    button: number | null
  }
  touch: {
    isActive: boolean
    position: THREE.Vector2
    startPosition: THREE.Vector2
  }
}

export interface InputEvents {
  onKeyDown?: (code: string, event: KeyboardEvent) => void
  onKeyUp?: (code: string, event: KeyboardEvent) => void
  onMouseDown?: (button: number, position: THREE.Vector2, event: MouseEvent) => void
  onMouseUp?: (button: number, position: THREE.Vector2, event: MouseEvent) => void
  onMouseMove?: (position: THREE.Vector2, delta: THREE.Vector2, event: MouseEvent) => void
  onClick?: (button: number, position: THREE.Vector2, event: MouseEvent) => void
  onContextMenu?: (position: THREE.Vector2, event: MouseEvent) => void
  onWheel?: (delta: number, event: WheelEvent) => void
  onTouchStart?: (position: THREE.Vector2, event: TouchEvent) => void
  onTouchEnd?: (position: THREE.Vector2, event: TouchEvent) => void
  onTouchMove?: (position: THREE.Vector2, delta: THREE.Vector2, event: TouchEvent) => void
}

export class InputSystem {
  private element: HTMLElement
  private state: InputState
  private events: InputEvents
  private boundHandlers: Map<string, (event: any) => void> = new Map()

  constructor(element: HTMLElement, events: InputEvents = {}) {
    this.element = element
    this.events = events
    this.state = {
      keys: {},
      mouse: {
        position: new THREE.Vector2(),
        isDown: false,
        startPosition: new THREE.Vector2(),
        button: null
      },
      touch: {
        isActive: false,
        position: new THREE.Vector2(),
        startPosition: new THREE.Vector2()
      }
    }

    this.setupEventListeners()
  }

  private setupEventListeners() {
    // キーボードイベント
    this.addEventHandler('keydown', this.handleKeyDown.bind(this))
    this.addEventHandler('keyup', this.handleKeyUp.bind(this))

    // マウスイベント
    this.addEventHandler('mousedown', this.handleMouseDown.bind(this))
    this.addEventHandler('mouseup', this.handleMouseUp.bind(this))
    this.addEventHandler('mousemove', this.handleMouseMove.bind(this))
    this.addEventHandler('click', this.handleClick.bind(this))
    this.addEventHandler('contextmenu', this.handleContextMenu.bind(this))
    this.addEventHandler('wheel', this.handleWheel.bind(this))

    // タッチイベント
    this.addEventHandler('touchstart', this.handleTouchStart.bind(this))
    this.addEventHandler('touchend', this.handleTouchEnd.bind(this))
    this.addEventHandler('touchmove', this.handleTouchMove.bind(this))

    // フォーカス設定
    if (this.element.tabIndex === -1) {
      this.element.tabIndex = 0
    }
    this.element.focus()
  }

  private addEventHandler(event: string, handler: (event: any) => void) {
    this.boundHandlers.set(event, handler)
    if (event.startsWith('key')) {
      window.addEventListener(event, handler)
    } else {
      this.element.addEventListener(event, handler)
    }
  }

  private removeEventHandler(event: string) {
    const handler = this.boundHandlers.get(event)
    if (handler) {
      if (event.startsWith('key')) {
        window.removeEventListener(event, handler)
      } else {
        this.element.removeEventListener(event, handler)
      }
      this.boundHandlers.delete(event)
    }
  }

  private getElementRelativePosition(clientX: number, clientY: number): THREE.Vector2 {
    const rect = this.element.getBoundingClientRect()
    return new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    )
  }

  private handleKeyDown(event: KeyboardEvent) {
    event.preventDefault()
    this.state.keys[event.code] = true
    this.events.onKeyDown?.(event.code, event)
  }

  private handleKeyUp(event: KeyboardEvent) {
    event.preventDefault()
    this.state.keys[event.code] = false
    this.events.onKeyUp?.(event.code, event)
  }

  private handleMouseDown(event: MouseEvent) {
    const position = this.getElementRelativePosition(event.clientX, event.clientY)
    this.state.mouse.isDown = true
    this.state.mouse.button = event.button
    this.state.mouse.position.copy(position)
    this.state.mouse.startPosition.copy(position)
    this.element.style.cursor = 'grabbing'
    this.events.onMouseDown?.(event.button, position, event)
  }

  private handleMouseUp(event: MouseEvent) {
    const position = this.getElementRelativePosition(event.clientX, event.clientY)
    this.state.mouse.isDown = false
    this.state.mouse.button = null
    this.element.style.cursor = 'grab'
    this.events.onMouseUp?.(event.button, position, event)
  }

  private handleMouseMove(event: MouseEvent) {
    const position = this.getElementRelativePosition(event.clientX, event.clientY)
    const delta = new THREE.Vector2().subVectors(position, this.state.mouse.position)
    this.state.mouse.position.copy(position)
    this.events.onMouseMove?.(position, delta, event)
  }

  private handleClick(event: MouseEvent) {
    const position = this.getElementRelativePosition(event.clientX, event.clientY)
    this.events.onClick?.(event.button, position, event)
  }

  private handleContextMenu(event: MouseEvent) {
    event.preventDefault()
    const position = this.getElementRelativePosition(event.clientX, event.clientY)
    this.events.onContextMenu?.(position, event)
  }

  private handleWheel(event: WheelEvent) {
    event.preventDefault()
    this.events.onWheel?.(event.deltaY, event)
  }

  private handleTouchStart(event: TouchEvent) {
    event.preventDefault()
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      const position = this.getElementRelativePosition(touch.clientX, touch.clientY)
      this.state.touch.isActive = true
      this.state.touch.position.copy(position)
      this.state.touch.startPosition.copy(position)
      this.events.onTouchStart?.(position, event)
    }
  }

  private handleTouchEnd(event: TouchEvent) {
    event.preventDefault()
    if (this.state.touch.isActive) {
      this.state.touch.isActive = false
      this.events.onTouchEnd?.(this.state.touch.position, event)
    }
  }

  private handleTouchMove(event: TouchEvent) {
    event.preventDefault()
    if (event.touches.length === 1 && this.state.touch.isActive) {
      const touch = event.touches[0]
      const position = this.getElementRelativePosition(touch.clientX, touch.clientY)
      const delta = new THREE.Vector2().subVectors(position, this.state.touch.position)
      this.state.touch.position.copy(position)
      this.events.onTouchMove?.(position, delta, event)
    }
  }

  // 公開メソッド
  public getState(): InputState {
    return this.state
  }

  public isKeyPressed(key: string): boolean {
    return this.state.keys[key] || false
  }

  public isMouseDown(): boolean {
    return this.state.mouse.isDown
  }

  public getMousePosition(): THREE.Vector2 {
    return this.state.mouse.position.clone()
  }

  public isAnyKeyPressed(keys: string[]): boolean {
    return keys.some(key => this.isKeyPressed(key))
  }

  public getMovementVector(): THREE.Vector2 {
    const movement = new THREE.Vector2()
    
    if (this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp')) movement.y += 1
    if (this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown')) movement.y -= 1
    if (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')) movement.x -= 1
    if (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')) movement.x += 1
    
    return movement.length() > 0 ? movement.normalize() : movement
  }

  public updateEvents(events: Partial<InputEvents>) {
    this.events = { ...this.events, ...events }
  }

  public destroy() {
    // すべてのイベントリスナーを削除
    for (const event of this.boundHandlers.keys()) {
      this.removeEventHandler(event)
    }
    this.boundHandlers.clear()
  }
}