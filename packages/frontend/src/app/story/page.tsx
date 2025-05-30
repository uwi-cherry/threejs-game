'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Chapter {
  id: string
  title: string
  description: string
  thumbnail: string
  isUnlocked: boolean
  episodes: Episode[]
}

interface Episode {
  id: string
  title: string
  description: string
  isUnlocked: boolean
  isCompleted: boolean
}

const mockChapters: Chapter[] = [
  {
    id: 'chapter1',
    title: '第1章：始まりの街',
    description: '冒険者として歩み始める小さな街での物語',
    thumbnail: '🏘️',
    isUnlocked: true,
    episodes: [
      {
        id: 'ep1-1',
        title: '出会い',
        description: '運命的な出会いが全ての始まり',
        isUnlocked: true,
        isCompleted: true
      },
      {
        id: 'ep1-2', 
        title: '初めての冒険',
        description: '街の外へ向かう初めての一歩',
        isUnlocked: true,
        isCompleted: false
      },
      {
        id: 'ep1-3',
        title: '謎の遺跡',
        description: '古い遺跡で発見した秘密',
        isUnlocked: false,
        isCompleted: false
      }
    ]
  },
  {
    id: 'chapter2',
    title: '第2章：森の奥へ',
    description: '深い森に隠された謎を追って',
    thumbnail: '🌲',
    isUnlocked: false,
    episodes: []
  },
  {
    id: 'chapter3',
    title: '第3章：???',
    description: '未知なる領域への挑戦',
    thumbnail: '❓',
    isUnlocked: false,
    episodes: []
  }
]

export default function StoryPage() {
  const router = useRouter()
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)

  const handleBack = () => {
    if (selectedEpisode) {
      setSelectedEpisode(null)
    } else if (selectedChapter) {
      setSelectedChapter(null)
    } else {
      router.push('/home')
    }
  }

  const handleChapterSelect = (chapter: Chapter) => {
    if (chapter.isUnlocked) {
      setSelectedChapter(chapter)
    }
  }

  const handleEpisodeSelect = (episode: Episode) => {
    if (episode.isUnlocked) {
      setSelectedEpisode(episode)
    }
  }

  const handleStartEpisode = () => {
    if (selectedEpisode && selectedChapter) {
      router.push(`/story/play/${selectedChapter.id}/${selectedEpisode.id}`)
    }
  }

  // エピソード詳細画面
  if (selectedEpisode && selectedChapter) {
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
              <h1 className="text-white font-bold text-lg">エピソード詳細</h1>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          {/* エピソード情報 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
            <div className="text-center mb-4">
              <h2 className="text-white font-bold text-xl mb-2">{selectedEpisode.title}</h2>
              <p className="text-purple-300 text-sm">{selectedChapter.title}</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-4 mb-4">
              <p className="text-white text-sm leading-relaxed">{selectedEpisode.description}</p>
            </div>

            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-white/70">進行状況</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                selectedEpisode.isCompleted 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {selectedEpisode.isCompleted ? '完了' : '未完了'}
              </span>
            </div>

            <button 
              onClick={handleStartEpisode}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
            >
              {selectedEpisode.isCompleted ? '再プレイ' : 'プレイ開始'}
            </button>
          </div>

          {/* 報酬情報（仮） */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <h3 className="text-white font-bold mb-3">🎁 クリア報酬</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">経験値</span>
                <span className="text-yellow-400 text-sm">+100 EXP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">コイン</span>
                <span className="text-yellow-400 text-sm">+500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // エピソード選択画面
  if (selectedChapter) {
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
              <h1 className="text-white font-bold text-lg">{selectedChapter.title}</h1>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          <div className="space-y-4">
            {selectedChapter.episodes.map((episode, index) => (
              <button
                key={episode.id}
                onClick={() => handleEpisodeSelect(episode)}
                disabled={!episode.isUnlocked}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  episode.isUnlocked
                    ? 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20'
                    : 'bg-white/5 border border-white/10 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold">{episode.title}</h3>
                  <div className="flex items-center space-x-2">
                    {episode.isCompleted && (
                      <span className="text-green-400 text-sm">✓</span>
                    )}
                    {!episode.isUnlocked && (
                      <span className="text-white/40 text-sm">🔒</span>
                    )}
                  </div>
                </div>
                <p className="text-white/70 text-sm">{episode.description}</p>
                <div className="mt-2 text-xs text-purple-300">
                  エピソード {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // チャプター選択画面（メイン）
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
            <h1 className="text-white font-bold text-lg">📖 ストーリー</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-4">
          {mockChapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => handleChapterSelect(chapter)}
              disabled={!chapter.isUnlocked}
              className={`w-full p-6 rounded-2xl text-left transition-all transform ${
                chapter.isUnlocked
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:scale-105'
                  : 'bg-white/5 border border-white/10 opacity-50'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{chapter.thumbnail}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-lg">{chapter.title}</h3>
                    {!chapter.isUnlocked && (
                      <span className="text-white/40">🔒</span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm mb-3">{chapter.description}</p>
                  
                  {chapter.isUnlocked && chapter.episodes.length > 0 && (
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-purple-300">
                        {chapter.episodes.filter(ep => ep.isCompleted).length}/{chapter.episodes.length} 完了
                      </span>
                      <span className="text-blue-300">
                        {chapter.episodes.filter(ep => ep.isUnlocked).length} エピソード利用可能
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}