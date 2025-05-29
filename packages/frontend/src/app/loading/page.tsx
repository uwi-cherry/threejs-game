'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface LoadProgress {
  loaded: number
  total: number
  percentage: number
  currentAsset?: string
}

export default function LoadingPage() {
  const [progress, setProgress] = useState<LoadProgress>({ loaded: 0, total: 0, percentage: 0 })
  const [loadingMessage, setLoadingMessage] = useState('ゲームを準備中...')
  const router = useRouter()

  useEffect(() => {
    // シンプルなローディング（後でアセット管理を追加）
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setProgress({ loaded: progress, total: 100, percentage: progress })
      
      if (progress >= 100) {
        clearInterval(interval)
        setLoadingMessage('初期化完了!')
        setTimeout(() => {
          router.push('/home')
        }, 500)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md w-full px-4">
        {/* ゲームロゴ */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">My Game</h1>
          <p className="text-slate-300">ソーシャルRPG</p>
        </div>

        {/* プログレスバー */}
        <div className="space-y-4">
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-slate-400">
            <span>{progress.loaded} / {progress.total}</span>
            <span>{progress.percentage}%</span>
          </div>
        </div>

        {/* ローディングメッセージ */}
        <div className="space-y-2">
          <p className="text-white">{loadingMessage}</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Tips */}
        <div className="text-xs text-slate-500 space-y-1">
          <p>💡 Tip: フレンドと一緒に冒険しよう！</p>
        </div>
      </div>
    </div>
  )
}