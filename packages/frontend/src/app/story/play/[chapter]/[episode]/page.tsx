'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface DialogueData {
  character: string
  text: string
  avatar?: string
  background?: string
}

interface StoryScenario {
  id: string
  title: string
  dialogues: DialogueData[]
  choices?: {
    text: string
    nextScene?: string
  }[]
}

// 仮のストーリーデータ
const mockScenarios: Record<string, StoryScenario> = {
  'chapter1-ep1-1': {
    id: 'chapter1-ep1-1',
    title: '出会い',
    dialogues: [
      {
        character: 'ナレーター',
        text: '小さな街の酒場で、あなたは一人の冒険者と出会った。',
        background: '🏪'
      },
      {
        character: 'リナ',
        text: 'はじめまして！私はリナです。あなたも冒険者の方ですか？',
        avatar: '👩‍🦰'
      },
      {
        character: 'あなた',
        text: 'そうです。これから冒険を始めようと思っています。',
        avatar: '🧙‍♂️'
      },
      {
        character: 'リナ',
        text: 'それでしたら、一緒に行きませんか？一人より二人の方が安全ですし！',
        avatar: '👩‍🦰'
      }
    ],
    choices: [
      { text: '一緒に行こう', nextScene: 'accept' },
      { text: '一人で行きたい', nextScene: 'decline' }
    ]
  }
}

export default function StoryPlayPage() {
  const router = useRouter()
  const params = useParams()
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
  const [showChoices, setShowChoices] = useState(false)
  const [currentScenario, setCurrentScenario] = useState<StoryScenario | null>(null)
  const [isTextVisible, setIsTextVisible] = useState(false)

  const chapterParam = Array.isArray(params.chapter) ? params.chapter[0] : params.chapter
  const episodeParam = Array.isArray(params.episode) ? params.episode[0] : params.episode
  const scenarioId = `${chapterParam}-${episodeParam}`

  useEffect(() => {
    const scenario = mockScenarios[scenarioId]
    if (scenario) {
      setCurrentScenario(scenario)
      setIsTextVisible(true)
    }
  }, [scenarioId])

  const handleNext = () => {
    if (!currentScenario) return

    if (currentDialogueIndex < currentScenario.dialogues.length - 1) {
      setIsTextVisible(false)
      setTimeout(() => {
        setCurrentDialogueIndex(prev => prev + 1)
        setIsTextVisible(true)
      }, 150)
    } else if (currentScenario.choices) {
      setShowChoices(true)
    } else {
      handleComplete()
    }
  }

  const handleChoice = (choice: { text: string; nextScene?: string }) => {
    // 選択肢の処理（今回は簡単に完了とする）
    handleComplete()
  }

  const handleComplete = () => {
    // ストーリー完了処理
    router.push('/story')
  }

  const handleBack = () => {
    router.push('/story')
  }

  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">ストーリーを読み込み中...</div>
      </div>
    )
  }

  const currentDialogue = currentScenario.dialogues[currentDialogueIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* 背景 */}
      {currentDialogue.background && (
        <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-20">
          {currentDialogue.background}
        </div>
      )}

      {/* 戻るボタン */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 bg-black/50 text-white px-3 py-2 rounded-lg hover:bg-black/70 transition-all"
      >
        ← 戻る
      </button>

      {/* キャラクターアバター */}
      {currentDialogue.avatar && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-8xl opacity-80">
          {currentDialogue.avatar}
        </div>
      )}

      {/* テキストボックス */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/20">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* キャラクター名 */}
          <div className="mb-3">
            <span className="bg-purple-600/80 text-white px-4 py-2 rounded-full text-sm font-bold">
              {currentDialogue.character}
            </span>
          </div>

          {/* メッセージテキスト */}
          <div 
            className={`text-white text-lg leading-relaxed transition-all duration-300 ${
              isTextVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
            }`}
          >
            {currentDialogue.text}
          </div>

          {/* 選択肢 */}
          {showChoices && currentScenario.choices && (
            <div className="mt-6 space-y-3">
              {currentScenario.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoice(choice)}
                  className="w-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 text-white p-4 rounded-xl hover:from-purple-600/40 hover:to-blue-600/40 transition-all text-left"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}

          {/* 進行ボタン */}
          {!showChoices && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all"
              >
                {currentDialogueIndex < currentScenario.dialogues.length - 1 ? '次へ' : '完了'}
              </button>
            </div>
          )}

          {/* プログレス */}
          <div className="mt-4 flex items-center justify-between text-sm text-white/60">
            <span>{currentDialogueIndex + 1} / {currentScenario.dialogues.length}</span>
            <div className="flex-1 mx-4 bg-white/20 rounded-full h-1">
              <div 
                className="bg-purple-400 h-1 rounded-full transition-all duration-300"
                style={{ width: `${((currentDialogueIndex + 1) / currentScenario.dialogues.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* タップエリア（画面全体をタップで進む） */}
      {!showChoices && (
        <div 
          className="absolute inset-0 cursor-pointer z-10"
          onClick={handleNext}
        />
      )}
    </div>
  )
}