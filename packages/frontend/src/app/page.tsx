'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AssetManager from '../managers/AssetManager'
import AuthService from '../services/AuthService'

export default function TitlePage() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState('ゲームを準備中...')
  const [authMessage, setAuthMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    // タイトル画面表示時はアセットプリロードのみ実行
    const loadAssets = async () => {
      AssetManager.setProgressCallback((progress) => {
        setLoadingProgress(progress.percentage)
        if (progress.currentAsset) {
          setLoadingMessage(`アセット読み込み中: ${progress.currentAsset}`)
        }
      })

      try {
        await AssetManager.preloadGameAssets()
        setLoadingMessage('読み込み完了!')
        setIsLoadingComplete(true)
      } catch (error) {
        console.error('Asset loading failed:', error)
        setLoadingMessage('読み込み完了!')
        setIsLoadingComplete(true) // エラーでも続行
      }
    }

    loadAssets()
  }, [])

  const handleStart = async () => {
    if (!isLoadingComplete || isAuthenticating) return

    setIsAuthenticating(true)
    setAuthMessage('認証中...')

    try {
      const result = await AuthService.autoLogin()
      if (result.success) {
        setAuthMessage('認証完了!')
        // 少し待ってからホーム画面に遷移
        setTimeout(() => {
          router.push('/home')
        }, 500)
      } else {
        setAuthMessage('認証に失敗しました')
        setIsAuthenticating(false)
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      setAuthMessage('認証に失敗しました')
      setIsAuthenticating(false)
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
          {/* アセット読み込み進捗（読み込み完了まで表示） */}
          {!isLoadingComplete && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-white text-sm">{loadingMessage}</p>
              <p className="text-slate-400 text-xs">{loadingProgress}%</p>
            </div>
          )}

          {/* 認証中の表示 */}
          {isAuthenticating && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-white text-sm">{authMessage}</p>
            </div>
          )}

          {/* スタートボタン */}
          <button
            onClick={handleStart}
            disabled={!isLoadingComplete || isAuthenticating}
            className={`px-12 py-4 text-xl font-bold rounded-2xl transition-all duration-200 transform ${
              isLoadingComplete && !isAuthenticating
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 shadow-2xl cursor-pointer' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAuthenticating ? '認証中...' : 
             !isLoadingComplete ? '読み込み中...' : 
             'タップしてスタート'}
          </button>
        </div>
      </div>
    </div>
  )
}