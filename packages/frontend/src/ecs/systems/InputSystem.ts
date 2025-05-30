import { IWorld } from 'bitecs'
import { Input, inputQuery } from '../World'
import * as THREE from 'three'

export class InputSystemManager {
  private element: HTMLElement
  private keys: Set<string> = new Set()
  private mouseDown = false
  private mousePosition = new THREE.Vector2()
  private mouseDelta = new THREE.Vector2()
  private lastMousePosition = new THREE.Vector2()
  private leftClick = false
  private rightClick = false
  
  constructor(element: HTMLElement) {
    this.element = element
    this.setupEventListeners()
  }
  
  private setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))
    
    // Mouse events
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this))
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.element.addEventListener('click', this.handleClick.bind(this))
    this.element.addEventListener('contextmenu', this.handleContextMenu.bind(this))
    
    // Focus
    this.element.tabIndex = 0
    this.element.focus()
    this.element.style.cursor = 'grab'
  }
  
  private handleKeyDown(event: KeyboardEvent) {
    event.preventDefault()
    this.keys.add(event.code)
  }
  
  private handleKeyUp(event: KeyboardEvent) {
    event.preventDefault()
    this.keys.delete(event.code)
  }
  
  private handleMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      this.mouseDown = true
      this.element.style.cursor = 'grabbing'
    }
  }
  
  private handleMouseUp(event: MouseEvent) {
    if (event.button === 0) {
      this.mouseDown = false
      this.element.style.cursor = 'grab'
    }
  }
  
  private handleMouseMove(event: MouseEvent) {
    const rect = this.element.getBoundingClientRect()
    this.mousePosition.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
    
    if (this.mouseDown) {
      this.mouseDelta.set(
        event.movementX || 0,
        event.movementY || 0
      )
    } else {
      this.mouseDelta.set(0, 0)
    }
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
      
      Input.movementX[inputEid] = movementX
      Input.movementY[inputEid] = movementY
      
      // Jump/Descend
      Input.jump[inputEid] = this.keys.has('Space') ? 1 : 0
      Input.descend[inputEid] = (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) ? 1 : 0
      
      // Mouse input
      Input.mouseX[inputEid] = this.mousePosition.x
      Input.mouseY[inputEid] = this.mousePosition.y
      Input.mouseDelta.x[inputEid] = this.mouseDelta.x
      Input.mouseDelta.y[inputEid] = this.mouseDelta.y
      
      // Click input
      Input.leftClick[inputEid] = this.leftClick ? 1 : 0
      Input.rightClick[inputEid] = this.rightClick ? 1 : 0
      
      // Reset click flags
      this.leftClick = false
      this.rightClick = false
    }
    
    return world
  }
  
  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this))
    window.removeEventListener('keyup', this.handleKeyUp.bind(this))
    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this))
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this))
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this))
    this.element.removeEventListener('click', this.handleClick.bind(this))
    this.element.removeEventListener('contextmenu', this.handleContextMenu.bind(this))
  }
}