// ビジュアルノベル用の型定義

export interface Character {
  id: string
  name: string
  color?: string
  avatar?: string
}

export interface DialogueAction {
  type: 'dialogue'
  character: Character
  text: string
  voice?: string
}

export interface NarrativeAction {
  type: 'narrative'
  text: string
}

export interface ChoiceOption {
  id: string
  text: string
  nextScene?: string
  condition?: () => boolean
}

export interface ChoiceAction {
  type: 'choice'
  prompt: string
  options: ChoiceOption[]
}

export interface BackgroundAction {
  type: 'background'
  image: string
  transition?: 'fade' | 'slide' | 'instant'
}

export interface MusicAction {
  type: 'music'
  file: string
  loop?: boolean
  fadeIn?: number
}

export interface SoundAction {
  type: 'sound'
  file: string
  volume?: number
}

export interface SceneTransitionAction {
  type: 'sceneTransition'
  targetScene: string
  transition?: 'fade' | 'slide' | 'instant'
}

export type StoryAction = 
  | DialogueAction 
  | NarrativeAction 
  | ChoiceAction 
  | BackgroundAction 
  | MusicAction 
  | SoundAction 
  | SceneTransitionAction

export interface Scene {
  id: string
  title: string
  background?: string
  music?: string
  actions: StoryAction[]
}

export interface Story {
  id: string
  title: string
  description: string
  entryScene: string
  scenes: Scene[]
  characters: Character[]
}

export interface GameState {
  currentScene: string
  currentActionIndex: number
  variables: Record<string, any>
  choices: Record<string, string>
  flags: Record<string, boolean>
  inventory: string[]
}