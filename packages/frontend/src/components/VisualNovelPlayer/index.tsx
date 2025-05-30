'use client'

import { useState, useEffect, useCallback } from 'react'
import { Story, Scene, StoryAction, GameState } from '@/types/visualNovel'
import DialogueBox from './DialogueBox'
import ChoiceMenu from './ChoiceMenu'
import BackgroundDisplay from './BackgroundDisplay'

interface VisualNovelPlayerProps {
  story: Story
  onEnd?: () => void
  onSave?: (gameState: GameState) => void
  initialGameState?: Partial<GameState>
  className?: string
}

export default function VisualNovelPlayer({ 
  story, 
  onEnd, 
  onSave,
  initialGameState,
  className = '' 
}: VisualNovelPlayerProps) {
  console.log('VisualNovelPlayer mounted with story:', story)
  
  const [gameState, setGameState] = useState<GameState>(() => ({
    currentScene: story.entryScene,
    currentActionIndex: 0,
    variables: {},
    choices: {},
    flags: {},
    inventory: [],
    ...initialGameState
  }))

  console.log('Game state:', gameState)

  const [currentBackground, setCurrentBackground] = useState<string>('')
  const [isChoiceMode, setIsChoiceMode] = useState(false)
  const [currentAction, setCurrentAction] = useState<StoryAction | null>(null)

  // 現在のシーンを取得
  const getCurrentScene = useCallback((): Scene | null => {
    const scene = story.scenes.find(scene => scene.id === gameState.currentScene) || null
    console.log('getCurrentScene:', gameState.currentScene, 'found:', scene)
    return scene
  }, [story.scenes, gameState.currentScene])

  // 次のアクションに進む
  const nextAction = useCallback(() => {
    const scene = getCurrentScene()
    if (!scene) return

    const nextIndex = gameState.currentActionIndex + 1
    
    if (nextIndex >= scene.actions.length) {
      // シーン終了
      onEnd?.()
      return
    }

    setGameState(prev => ({
      ...prev,
      currentActionIndex: nextIndex
    }))
  }, [gameState.currentActionIndex, getCurrentScene, onEnd])

  // 選択肢を選択
  const handleChoice = useCallback((choiceId: string, nextScene?: string) => {
    setGameState(prev => ({
      ...prev,
      choices: {
        ...prev.choices,
        [gameState.currentScene]: choiceId
      }
    }))

    setIsChoiceMode(false)

    if (nextScene) {
      // 新しいシーンに移動
      setGameState(prev => ({
        ...prev,
        currentScene: nextScene,
        currentActionIndex: 0
      }))
    } else {
      // 同じシーン内で次のアクションに進む
      nextAction()
    }
  }, [gameState.currentScene, nextAction])

  // 現在のアクションを実行
  useEffect(() => {
    console.log('useEffect triggered - currentScene:', gameState.currentScene, 'actionIndex:', gameState.currentActionIndex)
    const scene = getCurrentScene()
    console.log('Scene found:', scene)
    
    if (!scene || gameState.currentActionIndex >= scene.actions.length) {
      console.log('No scene or action index out of bounds')
      return
    }

    const action = scene.actions[gameState.currentActionIndex]
    console.log('Current action:', action)
    setCurrentAction(action)

    switch (action.type) {
      case 'background':
        setCurrentBackground(action.image)
        // 背景設定後、自動的に次のアクションに進む
        setTimeout(() => nextAction(), 100)
        break
      
      case 'choice':
        setIsChoiceMode(true)
        break
      
      case 'sceneTransition':
        setGameState(prev => ({
          ...prev,
          currentScene: action.targetScene,
          currentActionIndex: 0
        }))
        break
      
      case 'music':
        // TODO: 音楽再生処理
        // 音楽設定後、自動的に次のアクションに進む
        setTimeout(() => nextAction(), 100)
        break
      
      case 'sound':
        // TODO: 効果音再生処理
        // 効果音再生後、自動的に次のアクションに進む
        setTimeout(() => nextAction(), 100)
        break
    }
  }, [gameState.currentScene, gameState.currentActionIndex, getCurrentScene])

  // ゲーム状態の保存
  useEffect(() => {
    onSave?.(gameState)
  }, [gameState, onSave])

  console.log('Render - isChoiceMode:', isChoiceMode, 'currentAction:', currentAction)

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 背景 */}
      <BackgroundDisplay 
        image={currentBackground}
        className="absolute inset-0"
      />

      {/* メインコンテンツ */}
      <div className="relative z-10 w-full h-full">
        {/* デバッグ表示 */}
        <div className="absolute top-16 left-4 bg-black/80 text-white p-4 rounded text-sm z-50">
          <div>Scene: {gameState.currentScene}</div>
          <div>Action Index: {gameState.currentActionIndex}</div>
          <div>Choice Mode: {isChoiceMode.toString()}</div>
          <div>Current Action: {currentAction?.type || 'null'}</div>
          <div>Background: {currentBackground}</div>
        </div>

        {/* 選択肢表示 */}
        {isChoiceMode && currentAction?.type === 'choice' && (
          <ChoiceMenu
            prompt={currentAction.prompt}
            options={currentAction.options}
            onChoice={handleChoice}
            className="absolute inset-x-4 top-1/2 transform -translate-y-1/2"
          />
        )}

        {/* ダイアログ表示 */}
        {!isChoiceMode && currentAction && (
          <DialogueBox
            action={currentAction}
            onNext={nextAction}
            className="absolute bottom-0 left-0 right-0"
          />
        )}
      </div>
    </div>
  )
}