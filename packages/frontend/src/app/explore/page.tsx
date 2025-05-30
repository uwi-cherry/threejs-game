'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ExploreArea {
  id: string
  name: string
  description: string
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert'
  enemyLevel: string
  rewards: string[]
  energyCost: number
  isUnlocked: boolean
  background: string
  icon: string
}

const exploreAreas: ExploreArea[] = [
  {
    id: 'forest',
    name: '緑の森',
    description: '初心者向けの平和な森。スライムやゴブリンが生息している。',
    difficulty: 'Easy',
    enemyLevel: 'Lv.1-5',
    rewards: ['コイン', '経験値', '薬草'],
    energyCost: 10,
    isUnlocked: true,
    background: '🌲',
    icon: '🌿'
  },
  {
    id: 'cave',
    name: '洞窟の奥',
    description: '薄暗い洞窟。コウモリやスケルトンが潜んでいる。',
    difficulty: 'Normal',
    enemyLevel: 'Lv.6-12',
    rewards: ['コイン', '経験値', '鉱石', 'レア装備'],
    energyCost: 20,
    isUnlocked: true,
    background: '🕳️',
    icon: '⛏️'
  },
  {
    id: 'volcano',
    name: '火山の麓',
    description: '灼熱の火山地帯。強力なファイアドレイクが住処にしている。',
    difficulty: 'Hard',
    enemyLevel: 'Lv.13-20',
    rewards: ['大量コイン', '高経験値', '火属性装備'],
    energyCost: 30,
    isUnlocked: false,
    background: '🌋',
    icon: '🔥'
  }
]

export default function ExplorePage() {
  const router = useRouter()
  const [selectedArea, setSelectedArea] = useState<ExploreArea | null>(null)

  const handleBack = () => {
    router.push('/home')
  }

  const handleExplore = (area: ExploreArea) => {
    if (!area.isUnlocked) return
    router.push(`/explore/${area.id}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20'
      case 'Normal': return 'text-yellow-400 bg-yellow-400/20'
      case 'Hard': return 'text-red-400 bg-red-400/20'
      case 'Expert': return 'text-purple-400 bg-purple-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleBack}
              className="text-white/60 hover:text-white"
            >
              ← 戻る
            </button>
            <h1 className="text-white font-bold text-lg">🗺️ 探索エリア選択</h1>
          </div>
        </div>
      </div>

      {/* エリア選択 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exploreAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => handleExplore(area)}
              disabled={!area.isUnlocked}
              className={`
                relative p-6 rounded-2xl text-left transition-all transform
                ${area.isUnlocked 
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:scale-105 cursor-pointer' 
                  : 'bg-white/5 border border-white/10 opacity-50 cursor-not-allowed'
                }
              `}
            >
              {/* 背景装飾 */}
              <div className="absolute top-4 right-4 text-4xl opacity-30">
                {area.background}
              </div>

              {/* エリア情報 */}
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{area.icon}</span>
                  <h3 className="text-white font-bold text-lg">{area.name}</h3>
                </div>

                <p className="text-white/70 text-sm mb-4">{area.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">難易度</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(area.difficulty)}`}>
                      {area.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">敵レベル</span>
                    <span className="text-white text-xs">{area.enemyLevel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">消費エネルギー</span>
                    <span className="text-yellow-400 text-xs">⚡ {area.energyCost}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-white/60 text-xs">報酬:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {area.rewards.map((reward, index) => (
                      <span key={index} className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded">
                        {reward}
                      </span>
                    ))}
                  </div>
                </div>

                {!area.isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🔒</div>
                      <span className="text-white text-sm">未開放</span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 探索のヒント */}
        <div className="mt-8 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl p-6 border border-green-400/30">
          <h3 className="text-white font-bold text-lg mb-3">💡 探索のコツ</h3>
          <div className="space-y-2 text-sm text-white/80">
            <p>• 難易度に応じて報酬が変わります</p>
            <p>• エネルギーを消費して探索を行います</p>
            <p>• レベルアップして上位エリアを解放しよう</p>
          </div>
        </div>
      </div>
    </div>
  )
}