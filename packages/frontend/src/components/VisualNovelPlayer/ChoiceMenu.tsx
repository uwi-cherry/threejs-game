'use client'

import { useState } from 'react'
import { ChoiceOption } from '@/types/visualNovel'

interface ChoiceMenuProps {
  prompt: string
  options: ChoiceOption[]
  onChoice: (choiceId: string, nextScene?: string) => void
  className?: string
}

export default function ChoiceMenu({ prompt, options, onChoice, className = '' }: ChoiceMenuProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleChoice = (option: ChoiceOption) => {
    setSelectedOption(option.id)
    
    // 少し遅延してから選択を実行（視覚的フィードバック）
    setTimeout(() => {
      onChoice(option.id, option.nextScene)
    }, 200)
  }

  return (
    <div className={`bg-black/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 ${className}`}>
      {/* プロンプト */}
      <div className="text-center mb-6">
        <h3 className="text-white text-xl font-bold mb-2">{prompt}</h3>
        <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full" />
      </div>

      {/* 選択肢 */}
      <div className="space-y-4 max-w-md mx-auto">
        {options.map((option, index) => {
          const isSelected = selectedOption === option.id
          const isDisabled = option.condition && !option.condition()
          
          return (
            <button
              key={option.id}
              onClick={() => !isDisabled && handleChoice(option)}
              disabled={isDisabled}
              className={`
                w-full p-4 rounded-xl text-left transition-all duration-200 transform
                ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600/60 to-blue-600/60 border-purple-400/60 scale-95'
                    : isDisabled
                    ? 'bg-gray-600/20 border-gray-500/30 opacity-50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-400/30 hover:from-purple-600/40 hover:to-blue-600/40 hover:border-purple-400/50 hover:scale-105'
                }
                border
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${
                    isSelected
                      ? 'bg-purple-500 text-white'
                      : isDisabled
                      ? 'bg-gray-500 text-gray-300'
                      : 'bg-purple-600/50 text-white'
                  }
                `}>
                  {index + 1}
                </div>
                <span className={`
                  font-medium
                  ${
                    isDisabled ? 'text-gray-400' : 'text-white'
                  }
                `}>
                  {option.text}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* 指示テキスト */}
      <div className="text-center mt-6">
        <span className="text-white/60 text-sm">
          選択肢をクリックしてください
        </span>
      </div>
    </div>
  )
}