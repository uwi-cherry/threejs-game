import React, { useState } from 'react'

interface TitlePageProps {
  onGameStart: (playerName: string) => void
}

export const TitlePage: React.FC<TitlePageProps> = ({ onGameStart }) => {
  const [playerName, setPlayerName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = () => {
    if (!playerName.trim()) return
    
    setIsLoading(true)
    // Simulate loading
    setTimeout(() => {
      onGameStart(playerName.trim())
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* ゲームタイトル */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🏰 Fantasy Quest
          </h1>
          <p className="text-xl text-purple-200">
            魔法の世界への冒険が始まる
          </p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/20">
          <div className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                プレイヤー名
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="名前を入力してください"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                maxLength={12}
              />
            </div>
            
            <button
              onClick={handleStart}
              disabled={!playerName.trim() || isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>ロード中...</span>
                </div>
              ) : (
                '🎮 ゲーム開始'
              )}
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="text-white/60 text-sm">
          © 2024 Fantasy Quest. All rights reserved.
        </div>
      </div>
    </div>
  )
}