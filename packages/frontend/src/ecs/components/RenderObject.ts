import { defineComponent } from 'bitecs'
import * as THREE from 'three'

/**
 * レンダリング対象のエンティティにアタッチされるタグコンポーネント
 * 実際の3Dオブジェクトは threeObjects マップで管理される
 */
export const RenderObject = defineComponent()

/**
 * Three.js オブジェクトを格納するためのマップ
 * パフォーマンス上の理由から、ECSの外部で管理する
 * 
 * キー: エンティティID
 * 値: Three.js の3Dオブジェクト
 */
export const threeObjects = new Map<number, THREE.Object3D>()

/**
 * エンティティにThree.jsオブジェクトを関連付ける
 * @param eid エンティティID
 * @param object 関連付けるThree.jsオブジェクト
 */
export const setThreeObject = (eid: number, object: THREE.Object3D) => {
  threeObjects.set(eid, object)
}

/**
 * エンティティに関連付けられたThree.jsオブジェクトを取得する
 * @param eid エンティティID
 * @returns 関連付けられたThree.jsオブジェクト（存在しない場合はundefined）
 */
export const getThreeObject = (eid: number): THREE.Object3D | undefined => {
  return threeObjects.get(eid)
}

/**
 * エンティティに関連付けられたThree.jsオブジェクトを削除する
 * @param eid エンティティID
 */
export const removeThreeObject = (eid: number) => {
  const obj = threeObjects.get(eid)
  if (obj) {
    // シーンからオブジェクトを削除
    obj.parent?.remove(obj)
    // マップから削除
    threeObjects.delete(eid)
  }
}