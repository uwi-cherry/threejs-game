'use client'

import { useState, useEffect } from 'react'
import { StoryAction } from '@/types/visualNovel'

interface DialogueBoxProps {
  action: StoryAction
  onNext: () => void
  className?: string
}

export default function DialogueBox({ action, onNext, className = '' }: DialogueBoxProps) {
  console.log('DialogueBox rendered with action:', action)
  
  const [displayedText, setDisplayedText] = useState('')
  const [isTextComplete, setIsTextComplete] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const getText = () => {
    switch (action.type) {
      case 'dialogue':
        return action.text
      case 'narrative':
        return action.text
      default:
        return ''
    }
  }

  const getCharacterName = () => {
    if (action.type === 'dialogue') {
      return action.character.name
    }
    return null
  }

  const getCharacterColor = () => {
    if (action.type === 'dialogue') {
      return action.character.color || '#8b5cf6'
    }
    return '#8b5cf6'
  }

  const getCharacterAvatar = () => {
    if (action.type === 'dialogue') {
      return action.character.avatar
    }
    return null
  }

  // テキストのタイプライター効果
  useEffect(() => {
    const text = getText()
    if (!text) return

    setIsVisible(true)
    setDisplayedText('')
    setIsTextComplete(false)

    let index = 0
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index))
        index++
      } else {
        setIsTextComplete(true)
        clearInterval(timer)
      }
    }, 30) // 30msごとに1文字追加

    return () => clearInterval(timer)
  }, [action])

  const handleClick = () => {
    if (!isTextComplete) {
      // テキスト表示を完了
      setDisplayedText(getText())
      setIsTextComplete(true)
    } else {
      // 次のアクションに進む
      onNext()
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className={`bg-black/80 backdrop-blur-xl border-t border-white/20 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* キャラクター名とアバター */}
        {getCharacterName() && (
          <div className="mb-3 flex items-center space-x-3">
            {getCharacterAvatar() && (
              <span className="text-2xl">{getCharacterAvatar()}</span>
            )}
            <span 
              className="text-white px-4 py-2 rounded-full text-sm font-bold"
              style={{ backgroundColor: getCharacterColor() }}
            >
              {getCharacterName()}
            </span>
          </div>
        )}

        {/* メッセージテキスト */}
        <div 
          className={`text-white text-lg leading-relaxed transition-all duration-300 ${
            isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}
        >
          {displayedText}
          {!isTextComplete && (
            <span className="inline-block w-2 h-5 bg-white ml-1 animate-pulse" />
          )}
        </div>

        {/* 進行ボタン */}
        {isTextComplete && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all"
            >
              次へ
            </button>
          </div>
        )}

        {/* タップ指示 */}
        <div className="mt-4 text-center">
          <span className="text-white/60 text-sm">
            {!isTextComplete ? 'クリックで完了' : 'クリックで次へ'}
          </span>
        </div>
      </div>
    </div>
  )
}