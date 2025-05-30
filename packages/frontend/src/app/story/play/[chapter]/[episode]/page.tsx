'use client'

import { useRouter, useParams } from 'next/navigation'
import VisualNovelPlayer from '@/components/VisualNovelPlayer'
import { sampleStory } from '@/data/sampleStory'

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

  const handleSave = (gameState: any) => {
    // TODO: ゲーム状態をローカルストレージに保存
    console.log('Game state saved:', gameState)
  }

  console.log('Story data:', sampleStory)
  console.log('Chapter:', chapterParam, 'Episode:', episodeParam)

  return (
    <div className="min-h-screen relative">
      {/* 戻るボタン */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 bg-black/50 text-white px-3 py-2 rounded-lg hover:bg-black/70 transition-all"
      >
        ← 戻る
      </button>

      {/* ビジュアルノベルプレイヤー */}
      <VisualNovelPlayer
        story={sampleStory}
        onEnd={handleGameEnd}
        onSave={handleSave}
        className="w-full h-screen"
      />
    </div>
  )
}