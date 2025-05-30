import { Character, Menu, Scene, Story, c, b } from "narraleaf-react";

// キャラクターを定義
const narrator = new Character("ナレーター");
const lina = new Character("リナ", { 
  avatar: "👩‍🦰",
  color: "#ff6b6b" 
});
const player = new Character("あなた", { 
  avatar: "🧙‍♂️",
  color: "#4ecdc4" 
});

// シーン1: 出会い
const scene1 = new Scene("出会い", {
  background: "/images/tavern.jpg" // 酒場の背景
});

scene1.action([
  narrator`小さな街の酒場で、あなたは一人の冒険者と出会った。`,
  
  lina`はじめまして！私は${b("リナ")}です。`,
  lina`あなたも冒険者の方ですか？`,
  
  player`そうです。これから冒険を始めようと思っています。`,
  
  lina`それでしたら、一緒に行きませんか？`,
  lina`一人より二人の方が${c("安全", "#00ff00")}ですし！`,
  
  Menu.prompt("どうしますか？")
    .choose("一緒に行こう", [
      player`ぜひお願いします！`,
      lina`やった！それじゃあ早速出発しましょう！`,
      scene1.jumpTo(scene2)
    ])
    .choose("一人で行きたい", [
      player`ありがとうございますが、一人で行きます。`,
      lina`そうですか...でも何かあったら街に戻ってきてくださいね。`,
      scene1.jumpTo(scene3)
    ])
]);

// シーン2: 一緒に冒険
const scene2 = new Scene("初めての冒険", {
  background: "/images/forest.jpg" // 森の背景
});

scene2.action([
  narrator`リナと一緒に街を出発し、近くの森へ向かった。`,
  
  lina`この森には${b("スライム")}がいるって聞いたことがあります。`,
  lina`初心者にはちょうどいい相手ですね！`,
  
  player`頼もしいパートナーがいて心強いです。`,
  
  narrator`二人は森の奥へと進んでいった...`,
  narrator`${c("【第1章 完了】", "#ffd700")}`,
  
  Menu.prompt("次のエピソードに進みますか？")
    .choose("続ける", [
      narrator`ストーリーが続きます...`
    ])
    .choose("一旦終了", [
      narrator`お疲れ様でした！`
    ])
]);

// シーン3: 一人で冒険
const scene3 = new Scene("一人の道", {
  background: "/images/path.jpg" // 一人の道
});

scene3.action([
  narrator`あなたは一人で街を出発した。`,
  
  player`(一人だと少し不安だけど、自分の力を試してみよう)`,
  
  narrator`静かな道を歩いていると、遠くから何かの鳴き声が聞こえた...`,
  narrator`${c("【第1章 完了】", "#ffd700")}`,
  
  Menu.prompt("次のエピソードに進みますか？")
    .choose("続ける", [
      narrator`ストーリーが続きます...`
    ])
    .choose("一旦終了", [
      narrator`お疲れ様でした！`
    ])
]);

// ストーリーを作成
export const sampleStory = new Story("第1章：始まりの街");

// シーンを登録
sampleStory.registerScene(scene1);
sampleStory.registerScene(scene2); 
sampleStory.registerScene(scene3);

// エントリーポイントを設定
sampleStory.entry(scene1);