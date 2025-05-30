'use client'

import { useRouter, useParams } from 'next/navigation'
import { Player } from 'narraleaf-react'
import { sampleStory } from '@/stories/sampleStory'

export default function StoryPlayPage() {
  const router = useRouter()
  const params = useParams()

  const chapterParam = Array.isArray(params.chapter) ? params.chapter[0] : params.chapter
  const episodeParam = Array.isArray(params.episode) ? params.episode[0] : params.episode

  const handleBack = () => {
    router.push('/story')
  }

  const handleGameEnd = () => {
    router.push('/story')
  }

  const handleGameReady = () => {
    console.log('Game is ready to play!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative">
      {/* 戻るボタン */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 bg-black/50 text-white px-3 py-2 rounded-lg hover:bg-black/70 transition-all"
      >
        ← 戻る
      </button>

      {/* NarraLeaf Player */}
      <Player
        story={sampleStory}
        width="100%"
        height="100vh"
        className="w-full h-screen"
        onReady={handleGameReady}
        onEnd={handleGameEnd}
        active={true}
      />
    </div>
  )
}