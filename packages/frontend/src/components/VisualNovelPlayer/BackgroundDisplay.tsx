'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface BackgroundDisplayProps {
  image: string
  transition?: 'fade' | 'slide' | 'instant'
  className?: string
}

export default function BackgroundDisplay({ 
  image, 
  transition = 'fade', 
  className = '' 
}: BackgroundDisplayProps) {
  const [currentImage, setCurrentImage] = useState(image)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (image === currentImage) return

    if (transition === 'instant') {
      setCurrentImage(image)
      setImageError(false)
      return
    }

    // フェードトランジション
    setIsTransitioning(true)
    
    const timer = setTimeout(() => {
      setCurrentImage(image)
      setImageError(false)
      setIsTransitioning(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [image, currentImage, transition])

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* デフォルト背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900" />
      
      {/* 背景画像 */}
      {currentImage && !imageError && (
        <div className={`
          absolute inset-0 transition-opacity duration-300
          ${isTransitioning ? 'opacity-0' : 'opacity-100'}
        `}>
          <Image
            src={currentImage}
            alt="Background"
            fill
            className="object-cover"
            onError={handleImageError}
            priority
          />
          {/* オーバーレイ（テキストの可読性向上） */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* 画像読み込みエラー時の代替表示 */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/50 text-center">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-sm">背景画像を読み込めませんでした</p>
          </div>
        </div>
      )}

      {/* トランジション効果用のオーバーレイ */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" />
      )}
    </div>
  )
}