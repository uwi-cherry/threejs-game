import * as THREE from 'three'

export class ResizeHandler {
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private handleResize: () => void

  constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.camera = camera
    this.renderer = renderer
    this.handleResize = this.onResize.bind(this)
    this.setupEventListener()
  }

  private setupEventListener() {
    window.addEventListener('resize', this.handleResize)
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  public destroy() {
    window.removeEventListener('resize', this.handleResize)
  }
}