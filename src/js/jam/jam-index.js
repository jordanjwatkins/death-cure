//import GameLoop from '../libs/GameLoop'
import { rehydrate2D } from './Rehydrate2D'
import { imagesReady } from './entities/images'
import Curer from './entities/curer'
import input from './input'
//import legCure from './levels/leg-cure'
import breakThrough from './levels/break-through'
//import oneArrowLevel from './levels/one-arrow'
import title from './levels/title'
import legCure from './levels/leg-cure'
import cureFind from './levels/cure-find'
import oneArrowLevel from './levels/one-arrow'
//import cureFind from './levels/cure-find'

export default async () => {
  console.log('death cure: jam version!', rehydrate2D)

  const config = {
    x: 300, y: 280, stepDistance: 0, currentFrame: 0, stepHeight: 0, speed: 0, walkSpeed: 3, jumpHeight: 0, jumpDirection: -1
  }

  input(config)

  const curer = new Curer(1)

 /* const bgs = [images.testLevelBackground, images.darkLevel]
  const fgs = [images.darkLevel]*/

  await imagesReady

  //curer.canJump = true
  //curer.canDuck = true
  curer.legHealed = false

  /*function update() {
    rehydrate2D.clearRenderer()

    bgs.forEach((image) => {
      image.draw(0, 0)
    })

    curer.update(config)

    fgs.forEach((image) => {
      image.draw(0, 0)
    })
  }

  new GameLoop(update)*/

  //legCure(config, curer)
  //breakThrough(config, curer, legCure, breakThrough)
  //oneArrowLevel(config, curer)
  title(config, curer)

  //cureFind(config, curer)
}
