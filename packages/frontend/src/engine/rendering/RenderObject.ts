import { defineComponent } from 'bitecs'
import * as THREE from 'three'

export const RenderObject = defineComponent()

// Three.js Object Storage (outside ECS for performance)
export const threeObjects = new Map<number, THREE.Object3D>()

export const setThreeObject = (eid: number, object: THREE.Object3D) => {
  threeObjects.set(eid, object)
}

export const getThreeObject = (eid: number): THREE.Object3D | undefined => {
  return threeObjects.get(eid)
}

export const removeThreeObject = (eid: number) => {
  threeObjects.delete(eid)
}