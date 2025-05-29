'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthService from '@/services/AuthService'

interface PlayerStats {
  name: string
  level: number
  exp: number
  maxExp: number
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  coins: number
  gems: number
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home')
  const [player, setPlayer] = useState<PlayerStats>({
    name: '冒険者',
    level: 25,
    exp: 2840,
    maxExp: 3500,
    hp: 1250,
    maxHp: 1250,
    mp: 420,
    maxMp: 520,
    coins: 15420,
    gems: 127
  })
  const router = useRouter()

  useEffect(() => {
    // 認証チェック
    if (!AuthService.isAuthenticated()) {
      router.push('/')
      return
    }

    // プレイヤー情報を取得
    const user = AuthService.getUser()
    if (user) {
      setPlayer(prev => ({ ...prev, name: user.username, level: user.level }))
    }
  }, [router])

  const handleLogout = () => {
    AuthService.logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                ⚡ My Game
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-yellow-500/20 px-3 py-1 rounded-full">
                <span className="text-yellow-400">🪙</span>
                <span className="text-white font-bold">{player.coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-3 bg-blue-500/20 px-3 py-1 rounded-full">
                <span className="text-blue-400">💎</span>
                <span className="text-white font-bold">{player.gems}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-105"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* プレイヤー情報バー */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                  🧙‍♂️
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{player.name}</h2>
                  <p className="text-purple-300">Lv.{player.level}</p>
                </div>
              </div>
              
              <div className="hidden md:flex space-x-6">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-red-300">HP</span>
                    <span className="text-white">{player.hp}/{player.maxHp}</span>
                  </div>
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-red-400" style={{width: `${(player.hp / player.maxHp) * 100}%`}}></div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-300">MP</span>
                    <span className="text-white">{player.mp}/{player.maxMp}</span>
                  </div>
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400" style={{width: `${(player.mp / player.maxMp) * 100}%`}}></div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-300">EXP</span>
                    <span className="text-white">{player.exp}/{player.maxExp}</span>
                  </div>
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400" style={{width: `${(player.exp / player.maxExp) * 100}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーションタブ */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {[
              { id: 'home', label: 'ホーム', icon: '🏠' },
              { id: 'quest', label: 'クエスト', icon: '⚔️' },
              { id: 'party', label: 'パーティ', icon: '👥' },
              { id: 'guild', label: 'ギルド', icon: '🏰' },
              { id: 'shop', label: 'ショップ', icon: '🛒' },
              { id: 'gacha', label: 'ガチャ', icon: '🎲' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-white bg-purple-600/50 border-b-2 border-purple-400'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メインコンテンツエリア */}
          <div className="lg:col-span-2 space-y-6">
            {/* 今日のクエスト */}
            <div className="bg-gradient-to-br from-purple-800/40 to-blue-800/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📋</span>
                今日のクエスト
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'ゴブリンを5体倒せ', reward: '500 EXP', status: '進行中' },
                  { name: 'レアアイテムを3個集めよ', reward: '1000 Gold', status: '未開始' },
                  { name: 'ダンジョンをクリアせよ', reward: '💎 5個', status: '完了' }
                ].map((quest, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{quest.name}</p>
                      <p className="text-green-400 text-sm">{quest.reward}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      quest.status === '完了' ? 'bg-green-500 text-white' :
                      quest.status === '進行中' ? 'bg-yellow-500 text-black' :
                      'bg-gray-500 text-white'
                    }`}>
                      {quest.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* フレンド */}
            <div className="bg-gradient-to-br from-green-800/40 to-teal-800/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="mr-2">👥</span>
                オンラインフレンド
              </h3>
              <div className="space-y-3">
                {['⚔️ 勇者タロウ', '🏹 魔法少女サクラ', '🛡️ ナイトジロウ'].map((friend, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white/10 rounded-lg p-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm">
                      {friend.split(' ')[0]}
                    </div>
                    <span className="text-white text-sm">{friend.split(' ')[1]}</span>
                    <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}