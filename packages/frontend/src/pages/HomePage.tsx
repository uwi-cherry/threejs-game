import React, { useState } from 'react'
import { CubeScene } from '../threejs/CubeScene'

export const HomePage: React.FC = () => {
  const [showThreeJS, setShowThreeJS] = useState(false)
  if (showThreeJS) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <button 
          onClick={() => setShowThreeJS(false)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ホームに戻る
        </button>
        <CubeScene />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* ヘッダー */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">🏰 My Game</h1>
            </div>
            
            <button 
              onClick={() => setShowThreeJS(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              3D サンプル
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-8">ホーム画面</h2>
          <p className="text-white/80 text-lg">3Dサンプルボタンをクリックしてください</p>
        </div>
      </div>
    </div>
  )
}