type AssetType = 'image' | 'audio' | 'video' | 'json' | 'text'

interface Asset {
  url: string
  type: AssetType
  loaded: boolean
  data?: any
  error?: string
}

interface LoadProgress {
  loaded: number
  total: number
  percentage: number
  currentAsset?: string
}

class AssetManager {
  private static instance: AssetManager
  private assets: Map<string, Asset> = new Map()
  private loadingPromises: Map<string, Promise<any>> = new Map()
  private onProgressCallback?: (progress: LoadProgress) => void

  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager()
    }
    return AssetManager.instance
  }

  setProgressCallback(callback: (progress: LoadProgress) => void) {
    this.onProgressCallback = callback
  }

  async loadAsset(name: string, url: string, type: AssetType): Promise<any> {
    if (this.assets.has(name)) {
      const asset = this.assets.get(name)!
      if (asset.loaded) {
        return asset.data
      }
      if (asset.error) {
        throw new Error(`Asset ${name} failed to load: ${asset.error}`)
      }
    }

    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)
    }

    const asset: Asset = { url, type, loaded: false }
    this.assets.set(name, asset)

    const loadPromise = this.loadAssetData(asset, name)
    this.loadingPromises.set(name, loadPromise)

    try {
      const data = await loadPromise
      asset.data = data
      asset.loaded = true
      this.loadingPromises.delete(name)
      return data
    } catch (error) {
      asset.error = error instanceof Error ? error.message : 'Unknown error'
      this.loadingPromises.delete(name)
      throw error
    }
  }

  async loadAssets(assetList: Array<{ name: string; url: string; type: AssetType }>): Promise<void> {
    const totalAssets = assetList.length
    let loadedAssets = 0

    const updateProgress = (currentAsset?: string) => {
      const progress: LoadProgress = {
        loaded: loadedAssets,
        total: totalAssets,
        percentage: Math.round((loadedAssets / totalAssets) * 100),
        currentAsset
      }
      this.onProgressCallback?.(progress)
    }

    updateProgress()

    const loadPromises = assetList.map(async ({ name, url, type }) => {
      try {
        updateProgress(name)
        await this.loadAsset(name, url, type)
        loadedAssets++
        updateProgress()
      } catch (error) {
        console.error(`Failed to load asset ${name}:`, error)
        loadedAssets++
        updateProgress()
      }
    })

    await Promise.all(loadPromises)
  }

  private async loadAssetData(asset: Asset, name: string): Promise<any> {
    switch (asset.type) {
      case 'image':
        return this.loadImage(asset.url)
      case 'audio':
        return this.loadAudio(asset.url)
      case 'video':
        return this.loadVideo(asset.url)
      case 'json':
        return this.loadJson(asset.url)
      case 'text':
        return this.loadText(asset.url)
      default:
        throw new Error(`Unsupported asset type: ${asset.type}`)
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  }

  private loadAudio(url: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.oncanplaythrough = () => resolve(audio)
      audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`))
      audio.src = url
    })
  }

  private loadVideo(url: string): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.oncanplaythrough = () => resolve(video)
      video.onerror = () => reject(new Error(`Failed to load video: ${url}`))
      video.src = url
    })
  }

  private async loadJson(url: string): Promise<any> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${url}`)
    }
    return response.json()
  }

  private async loadText(url: string): Promise<string> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to load text: ${url}`)
    }
    return response.text()
  }

  getAsset(name: string): any {
    const asset = this.assets.get(name)
    if (!asset || !asset.loaded) {
      console.warn(`Asset ${name} is not loaded`)
      return null
    }
    return asset.data
  }

  isLoaded(name: string): boolean {
    const asset = this.assets.get(name)
    return asset ? asset.loaded : false
  }

  unloadAsset(name: string): void {
    this.assets.delete(name)
    this.loadingPromises.delete(name)
  }

  unloadAll(): void {
    this.assets.clear()
    this.loadingPromises.clear()
  }

  getLoadedAssets(): string[] {
    return Array.from(this.assets.entries())
      .filter(([_, asset]) => asset.loaded)
      .map(([name, _]) => name)
  }
}

export default AssetManager.getInstance()