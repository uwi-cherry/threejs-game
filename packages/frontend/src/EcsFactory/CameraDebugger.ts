import { GUI } from 'lil-gui'

export interface CameraDebugParams {
  distance: number
  height: number
  sensitivity: number
  verticalLimitUp: number
  verticalLimitDown: number
  moveSpeed: number
  jumpHeight: number
  enableDebug: boolean
}

export class CameraDebugger {
  private gui: GUI | null = null
  private params: CameraDebugParams
  private cameraEntityId: number | null = null
  
  constructor() {
    this.params = {
      distance: 15,
      height: 8,
      sensitivity: 0.005,
      verticalLimitUp: 45,
      verticalLimitDown: -45,
      moveSpeed: 0.25,
      jumpHeight: 0.8,
      enableDebug: false
    }
  }
  
  public initializeGUI() {
    if (this.gui) return
    
    this.gui = new GUI({ title: 'Camera Debug Panel' })
    this.gui.close() // Start closed
    
    // Camera Settings Folder
    const cameraFolder = this.gui.addFolder('Camera Settings')
    cameraFolder.add(this.params, 'distance', 5, 30, 0.5)
      .name('Distance')
    
    cameraFolder.add(this.params, 'height', 2, 15, 0.5)
      .name('Height')
    
    cameraFolder.add(this.params, 'sensitivity', 0.001, 0.02, 0.001)
      .name('Mouse Sensitivity')
    
    // Vertical Limits Folder
    const limitsFolder = this.gui.addFolder('Vertical Limits (degrees)')
    limitsFolder.add(this.params, 'verticalLimitUp', 15, 90, 5)
      .name('Look Up Limit')
    
    limitsFolder.add(this.params, 'verticalLimitDown', -90, -15, 5)
      .name('Look Down Limit')
    
    // Player Movement Folder
    const movementFolder = this.gui.addFolder('Player Movement')
    movementFolder.add(this.params, 'moveSpeed', 0.1, 1.0, 0.05)
      .name('Move Speed')
    
    movementFolder.add(this.params, 'jumpHeight', 0.2, 2.0, 0.1)
      .name('Jump Height')
    
    // Debug Control
    this.gui.add(this.params, 'enableDebug')
      .name('Enable Debug Mode')
      .onChange((value: boolean) => {
        if (value) {
          cameraFolder.open()
          limitsFolder.open()
          movementFolder.open()
        } else {
          cameraFolder.close()
          limitsFolder.close()
          movementFolder.close()
        }
      })
    
    // Reset button
    this.gui.add({ reset: () => this.resetToDefaults() }, 'reset')
      .name('Reset to Defaults')
  }
  
  public setCameraEntity(entityId: number) {
    this.cameraEntityId = entityId
  }
  
  private resetToDefaults() {
    this.params.distance = 15
    this.params.height = 8
    this.params.sensitivity = 0.005
    this.params.verticalLimitUp = 45
    this.params.verticalLimitDown = -45
    this.params.moveSpeed = 0.25
    this.params.jumpHeight = 0.8
    
    this.gui?.updateDisplay()
  }
  
  public getParams(): CameraDebugParams {
    return this.params
  }
  
  public destroy() {
    if (this.gui) {
      this.gui.destroy()
      this.gui = null
    }
  }
  
  public show() {
    if (this.gui) {
      this.gui.show()
    }
  }
  
  public hide() {
    if (this.gui) {
      this.gui.hide()
    }
  }
  
  public toggle() {
    if (this.gui) {
      if (this.gui.domElement.style.display === 'none') {
        this.show()
      } else {
        this.hide()
      }
    }
  }
}

// Global instance for easy access
export const cameraDebugger = new CameraDebugger()