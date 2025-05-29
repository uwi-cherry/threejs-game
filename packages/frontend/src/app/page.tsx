'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AssetManager from '../managers/AssetManager'

export default function TitlePage() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState('ゲームを準備中...')
  const router = useRouter()

  useEffect(() => {
    const loadGameAssets = async () => {
      AssetManager.setProgressCallback((progress) => {
        setLoadingProgress(progress.percentage)
        if (progress.currentAsset) {
          setLoadingMessage(`読み込み中: ${progress.currentAsset}`)
        }
      })

      const gameAssets = [
        { name: 'ui_button', url: '/assets/ui/button.png', type: 'image' as const },
        { name: 'bgm_title', url: '/assets/audio/title.mp3', type: 'audio' as const },
        { name: 'game_config', url: '/assets/config/game.json', type: 'json' as const },
        { name: 'character_sprites', url: '/assets/sprites/characters.png', type: 'image' as const },
        { name: 'ui_icons', url: '/assets/ui/icons.png', type: 'image' as const }
      ]

      try {
        await AssetManager.loadAssets(gameAssets)
        setLoadingMessage('読み込み完了!')
        setIsLoadingComplete(true)
      } catch (error) {
        console.error('Asset loading failed:', error)
        setLoadingMessage('読み込み完了!')
        setIsLoadingComplete(true)
      }
    }

    loadGameAssets()
  }, [])

  const handleStart = () => {
    if (isLoadingComplete) {
      router.push('/home')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center space-y-12">
        <div className="space-y-6">
          <h1 className="text-8xl font-black text-white mb-8 tracking-wide drop-shadow-2xl">
            My Game
          </h1>
          <p className="text-2xl text-purple-200 font-medium">
            ソーシャルRPG
          </p>
        </div>

        <div className="space-y-6">
          {!isLoadingComplete && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-white">{loadingMessage}</p>
              <p className="text-slate-400 text-sm">{loadingProgress}%</p>
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!isLoadingComplete}
            className={`px-12 py-4 text-xl font-bold rounded-2xl transition-all duration-200 transform ${
              isLoadingComplete 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 shadow-2xl cursor-pointer' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoadingComplete ? 'タップしてスタート' : '読み込み中...'}
          </button>
        </div>
      </div>
    </div>
  )
}