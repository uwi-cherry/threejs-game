import { Story, Character, Scene } from '@/types/visualNovel'

// キャラクター定義
const characters: Character[] = [
  {
    id: 'narrator',
    name: 'ナレーター',
    color: '#ffffff'
  },
  {
    id: 'lina',
    name: 'リナ',
    color: '#ff6b6b',
    avatar: '👩‍🦰'
  },
  {
    id: 'player',
    name: 'あなた',
    color: '#4ecdc4',
    avatar: '🧙‍♂️'
  }
]

// シーン定義
const scenes: Scene[] = [
  {
    id: 'scene1',
    title: '出会い',
    background: '/images/tavern.jpg',
    music: '/audio/tavern-bgm.mp3',
    actions: [
      {
        type: 'background',
        image: '/images/tavern.jpg',
        transition: 'fade'
      },
      {
        type: 'music',
        file: '/audio/tavern-bgm.mp3',
        loop: true,
        fadeIn: 2000
      },
      {
        type: 'narrative',
        text: '小さな街の酒場で、あなたは一人の冒険者と出会った。'
      },
      {
        type: 'dialogue',
        character: characters[1], // lina
        text: 'はじめまして！私はリナです。'
      },
      {
        type: 'dialogue',
        character: characters[1], // lina
        text: 'あなたも冒険者の方ですか？'
      },
      {
        type: 'dialogue',
        character: characters[2], // player
        text: 'そうです。これから冒険を始めようと思っています。'
      },
      {
        type: 'dialogue',
        character: characters[1], // lina
        text: 'それでしたら、一緒に行きませんか？'
      },
      {
        type: 'dialogue',
        character: characters[1], // lina
        text: '一人より二人の方が安全ですし！'
      },
      {
        type: 'choice',
        prompt: 'どうしますか？',
        options: [
          {
            id: 'together',
            text: '一緒に行こう',
            nextScene: 'scene2'
          },
          {
            id: 'alone',
            text: '一人で行きたい',
            nextScene: 'scene3'
          }
        ]
      }
    ]
  },
  {
    id: 'scene2',
    title: '初めての冒険',
    background: '/images/forest.jpg',
    music: '/audio/forest-bgm.mp3',
    actions: [
      {
        type: 'background',
        image: '/images/forest.jpg',
        transition: 'fade'
      },
      {
        type: 'music',
        file: '/audio/forest-bgm.mp3',
        loop: true,
        fadeIn: 2000
      },
      {
        type: 'narrative',
        text: 'リナと一緒に街を出発し、近くの森へ向かった。'
      },
      {
        type: 'dialogue',
        character: characters[1], // lina
        text: 'この森にはスライムがいるって聞いたことがあります。'
      },
      {
        type: 'dialogue',
        character: characters[1], // lina
        text: '初心者にはちょうどいい相手ですね！'
      },
      {
        type: 'dialogue',
        character: characters[2], // player
        text: '頼もしいパートナーがいて心強いです。'
      },
      {
        type: 'narrative',
        text: '二人は森の奥へと進んでいった...'
      },
      {
        type: 'narrative',
        text: '【第1章 完了】'
      },
      {
        type: 'choice',
        prompt: '次のエピソードに進みますか？',
        options: [
          {
            id: 'continue',
            text: '続ける',
            nextScene: 'scene_end'
          },
          {
            id: 'end',
            text: '一旦終了',
            nextScene: 'scene_end'
          }
        ]
      }
    ]
  },
  {
    id: 'scene3',
    title: '一人の道',
    background: '/images/path.jpg',
    music: '/audio/lonely-bgm.mp3',
    actions: [
      {
        type: 'background',
        image: '/images/path.jpg',
        transition: 'fade'
      },
      {
        type: 'music',
        file: '/audio/lonely-bgm.mp3',
        loop: true,
        fadeIn: 2000
      },
      {
        type: 'narrative',
        text: 'あなたは一人で街を出発した。'
      },
      {
        type: 'dialogue',
        character: characters[2], // player
        text: '(一人だと少し不安だけど、自分の力を試してみよう)'
      },
      {
        type: 'narrative',
        text: '静かな道を歩いていると、遠くから何かの鳴き声が聞こえた...'
      },
      {
        type: 'narrative',
        text: '【第1章 完了】'
      },
      {
        type: 'choice',
        prompt: '次のエピソードに進みますか？',
        options: [
          {
            id: 'continue',
            text: '続ける',
            nextScene: 'scene_end'
          },
          {
            id: 'end',
            text: '一旦終了',
            nextScene: 'scene_end'
          }
        ]
      }
    ]
  },
  {
    id: 'scene_end',
    title: '終了',
    actions: [
      {
        type: 'narrative',
        text: 'ストーリーをお楽しみいただきありがとうございました！'
      }
    ]
  }
]

// ストーリー定義
export const sampleStory: Story = {
  id: 'chapter1',
  title: '第1章：始まりの街',
  description: '冒険者として歩み始める小さな街での物語',
  entryScene: 'scene1',
  scenes,
  characters
}