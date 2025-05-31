import * as THREE from 'three'
import { createEnemyEntity, createEnemyMesh } from '../../ecs/factory/EnemyFactory'

export class EnvironmentCreator {
  
  static createEnvironment(scene: THREE.Scene, area: string) {
    switch (area) {
      case 'forest':
        for (let i = 0; i < 20; i++) {
          const treeGeometry = new THREE.ConeGeometry(1, 4)
          const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 })
          const tree = new THREE.Mesh(treeGeometry, treeMaterial)
          tree.position.set(
            Math.random() * 100 - 50,
            2,
            Math.random() * 10 - 5
          )
          tree.castShadow = true
          scene.add(tree)
        }
        break
      
      case 'cave':
        scene.background = new THREE.Color(0x2f2f2f)
        for (let i = 0; i < 15; i++) {
          const rockGeometry = new THREE.BoxGeometry(2, 3, 2)
          const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 })
          const rock = new THREE.Mesh(rockGeometry, rockMaterial)
          rock.position.set(
            Math.random() * 100 - 50,
            1.5,
            Math.random() * 10 - 5
          )
          rock.castShadow = true
          scene.add(rock)
        }
        break
      
      case 'volcano':
        scene.background = new THREE.Color(0x8b0000)
        break
    }
  }

  static createEnemies(scene: THREE.Scene, world: any) {
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 80 - 10
      const y = 0.5
      const z = Math.random() * 6 - 3
      
      const enemyEid = createEnemyEntity(world, { x, y, z })
      createEnemyMesh(enemyEid, scene)
    }
  }

  static createBackground(scene: THREE.Scene) {
    for (let i = 0; i < 10; i++) {
      const mountainGeometry = new THREE.ConeGeometry(5, 15)
      const mountainMaterial = new THREE.MeshLambertMaterial({ color: 0x8fbc8f })
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial)
      mountain.position.set(
        Math.random() * 200 - 100,
        7,
        -30 - Math.random() * 20
      )
      scene.add(mountain)
    }
  }
}