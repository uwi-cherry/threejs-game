'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AssetManager from '../infrastructure/AssetManager'
import AuthService from '../infrastructure/AuthService'

export default function TitlePage() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState('ゲームを準備中...')
  const [authMessage, setAuthMessage] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
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
    setAuthMessage('認証確認中...')

    try {
      // セッション確認
      const result = await AuthService.verifyExistingSession()
      if (result.success) {
        setAuthMessage('認証済み! ホーム画面へ...')
        setTimeout(() => {
          router.push('/home')
        }, 800)
      } else {
        // セッションがない場合はログインモーダルを表示
        setIsAuthenticating(false)
        setShowLoginModal(true)
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      setIsAuthenticating(false)
      setShowLoginModal(true)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setLoginError('ユーザー名とパスワードを入力してください')
      return
    }

    setIsLoggingIn(true)
    setLoginError('')

    try {
      const result = await AuthService.login(username.trim(), password.trim())
      if (result.success) {
        setShowLoginModal(false)
        setAuthMessage('ログイン成功! ホーム画面へ...')
        setTimeout(() => {
          router.push('/home')
        }, 800)
      } else {
        setLoginError(result.error || 'ログインに失敗しました')
      }
    } catch (error) {
      setLoginError(`ログインに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoggingIn(false)
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
      
      {/* ログインモーダル */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full max-w-md border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">ログイン</h2>
              <p className="text-purple-200 text-sm">ゲームを始めるにはログインが必要です</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ユーザー名"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoggingIn}
                  required
                />
              </div>
              
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワード"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoggingIn}
                  required
                />
              </div>
              
              {loginError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{loginError}</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false)
                    setLoginError('')
                    setUsername('')
                    setPassword('')
                  }}
                  disabled={isLoggingIn}
                  className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {isLoggingIn ? 'ログイン中...' : 'ログイン'}
                </button>
              </div>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-white/60 text-xs">
                テストアカウント: admin / admin123
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}