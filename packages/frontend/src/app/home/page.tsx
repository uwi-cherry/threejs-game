'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PlayerStats {
  name: string
  level: number
  coins: number
  gems: number
}

export default function HomePage() {
  const [player] = useState<PlayerStats>({
    name: '冒険者',
    level: 25,
    coins: 15420,
    gems: 127
  })
  const router = useRouter()

  const handleLogout = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* シンプルヘッダー */}
      <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg">
                🧙‍♂️
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{player.name}</h2>
                <p className="text-xs text-purple-300">Lv.{player.level}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                <span className="text-yellow-400">🪙</span>
                <span className="text-white font-bold text-sm">{player.coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-500/20 px-3 py-1 rounded-full">
                <span className="text-blue-400">💎</span>
                <span className="text-white font-bold text-sm">{player.gems}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-white/60 hover:text-white text-sm"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ - フルスクリーン左右分割 */}
      <div className="flex h-screen p-4 gap-8 overflow-hidden">
        
        {/* 左側: バナー、お知らせ、デイリー */}
        <div className="flex flex-col gap-4 w-80">
          {/* イベントバナー */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-4 shadow-xl">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">LIMITED</span>
                <span className="text-white/80 text-xs">残り 2日</span>
              </div>
              <h2 className="text-white font-bold text-base mb-1">🎉 新春ガチャフェス</h2>
              <p className="text-white/90 text-sm">SSRキャラ確定！</p>
            </div>
            <div className="absolute -right-3 -bottom-3 text-4xl opacity-30">✨</div>
          </div>

          {/* 新着情報 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h3 className="text-white font-bold mb-3 text-sm">📢 お知らせ</h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <span className="bg-red-500 text-white text-xs px-1 rounded mt-1">新</span>
                <div>
                  <div className="text-white text-xs">バレンタインイベント開始！</div>
                  <div className="text-white/60 text-xs">2024.02.14</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-500 text-white text-xs px-1 rounded mt-1">更新</span>
                <div>
                  <div className="text-white text-xs">メンテナンス終了のお知らせ</div>
                  <div className="text-white/60 text-xs">2024.02.13</div>
                </div>
              </div>
            </div>
          </div>

          {/* デイリーミッション */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold text-sm">📋 デイリーミッション</h3>
              <span className="text-green-400 text-xs">2/3</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white text-xs">ログインボーナス</span>
                </div>
                <span className="text-green-400 text-xs">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white text-xs">冒険1回クリア</span>
                </div>
                <span className="text-green-400 text-xs">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-white/70 text-xs">ガチャ1回</span>
                </div>
                <span className="text-yellow-400 text-xs">💎 50</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右側: ストーリーと探索 */}
        <div className="flex flex-col gap-4 w-80 ml-auto">
          {/* ストーリー（大きく） */}
          <button 
            onClick={() => router.push('/story')}
            className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-8 text-white font-bold text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex-1"
          >
            <div className="text-6xl mb-4">📖</div>
            <div className="text-2xl mb-3">ストーリー</div>
            <div className="text-base opacity-80 mb-4">第1章 進行中</div>
            <div className="bg-white/20 rounded-full h-3 mb-2">
              <div className="bg-white h-3 rounded-full w-1/3"></div>
            </div>
            <div className="text-sm opacity-70">進行度 33%</div>
          </button>
          
          {/* 探索 */}
          <button className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white font-bold text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <div className="text-3xl mb-2">🗺️</div>
            <div className="text-lg mb-1">探索</div>
            <div className="text-sm opacity-80">新エリア発見</div>
          </button>

          {/* 追加機能 */}
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center hover:bg-white/20 transition-all">
              <div className="text-xl mb-1">⚔️</div>
              <div className="text-white font-bold text-xs">バトル</div>
            </button>
            
            <button className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center hover:bg-white/20 transition-all">
              <div className="text-xl mb-1">🎁</div>
              <div className="text-white font-bold text-xs">ガチャ</div>
            </button>
          </div>
        </div>

      </div>

      {/* ボトムナビゲーション */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/20">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="grid grid-cols-3 gap-1">
            {[
              { icon: '🏠', label: 'ホーム', active: true },
              { icon: '🚪', label: '個室', active: false },
              { icon: '👤', label: 'キャラ', active: false }
            ].map((item, index) => (
              <button
                key={index}
                className={`py-2 px-1 text-center transition-all ${
                  item.active ? 'text-purple-400' : 'text-white/60'
                }`}
              >
                <div className="text-lg">{item.icon}</div>
                <div className="text-xs">{item.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}