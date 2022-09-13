import { rehydrate2D } from '../Rehydrate2D'
import GameLoop from '../../libs/GameLoop'
import input from '../input'
import CloudPoof from '../entities/CloudPoof'
import images from '../entities/images'
import legCure from './leg-cure'
import Arrows from '../entities/Arrows'
//import * as draw from './break-through-helpers/draw'
import breakThroughLevelInner from './break-through-helpers/break-through-level'
//import oneArrow from './one-arrow'

const scale = 1

let persisted = {}

export async function breakThroughLevel1(config, curer) {
  console.log('breakthrou level!');
  persisted = { config, curer }

  const { width, height } = rehydrate2D.canvas

  config.doEntry = true

  const entryPosition = {
    y: height - 488,
    x: -180,
    xStop: 50
  }

  Object.assign(config, entryPosition)

  const poof = new CloudPoof()

  await poof.createPoof(250, 500, { count: 20, fullFadeTime: 20, startAlpha: 0.1 })

  input(config)

  const arrows = new Arrows()
  const makeArrow = ({ x = 700, y = 50, type = 'duck' } = {}) => (delay = 1000) => arrows.fireArrow(x, entryPosition.y + y, type, delay)

  const arrow = makeArrow({ x: 800 })
  const arrowJump = makeArrow({ x: 800, type: 'jump', y: 180 })

  let arrow1
  let arrow2

  let lastDoJump

  // Crack floor
  const makeThing = (x, y) => ({
    armed: 0,
    update(_config, curerPos) {
      if (curerPos.x > x - 50) {
        if (curerPos.x > x + 50) {
          this.armed = 4
          config.speed = 0
          config.doFall = true

          return
        }

        // Shake floor
        images.crackedFloor.draw(x + 2 * ((Math.sin(Date.now() / 30) > 0.5) ? 1 : 0), y)

        return
      }

      // Static floor
      images.crackedFloor.draw(x, y)
    }
  })

  const thing = makeThing(200, 557)

  let levelDone = false
  let fallCount = 0

  const gameLoop = new GameLoop(update)

  persisted.gameLoop = gameLoop

  function update() {
    //rehydrate2D.clear()

    //images.testLevelBackground.draw(0, 0)

    //images.breakthroughLevel.draw(0, 0)
    images.floorCracks.draw(600, 540, null, 1, 0.3)

    if (config.doFall)  {
      poof.updatePoof()

      if (fallCount % 10 === 0) poof.resetPoof(0, fallCount * 10)

      fallCount += 1
    }

    images.closet.draw(400, 150)

    const curerPos = curer.update(config, entryPosition, width, height)

    if (curerPos.x > 150 && !thing.armed) thing.armed = 1

    thing.update(config, curerPos, curer)

    if (curerPos.x > 50 && !arrow1) arrow1 = arrow(2000)
    if (curerPos.x > 50 && !arrow2) arrow2 = arrowJump(2000)

    arrows.update(config, curerPos, curer)


    images.breakthroughLevel.draw(0, 0)

    draw.floor()

    images.floorCracks.draw(700, 560, null, 1, 0.3)

    images.breakthroughLevelShadows.draw(0, 0)

    //darkenBlack(0.7)

    if (levelDone) return

    // Win/Lose
    if (curerPos.y > height + 50 || config.nextLevel) {
      levelDone = true

      console.log('level done')

      setTimeout(() => {
        console.log('level passed')

        gameLoop.paused = true
        config.nextLevel = false

        legCure(config, curer)
      }, 500)
    } else if (config.curerDead || config.restart) {
      levelDone = true

      const delay = (config.restart) ? 500 : 2000

      setTimeout(() => {
        console.log('level failed!')

        config.restart = false

        gameLoop.paused = true

        curer.revive(config)

        breakThroughLevel(config, curer)
      }, delay)
    }
  }

  return {
    stop: () => gameLoop.paused = true
  }
}

export default async function breakThroughLevel(config, curer) {
  persisted.config = config
  persisted.curer = curer
  persisted.gameLoop = await breakThroughLevelInner(config, curer)

  return persisted.gameLoop
}

if (module.hot) {
  module.hot.accept('./break-through-helpers/break-through-level.js', () => {
    console.log('draw helper update accepted!!!!!!!')

    const { config, curer, gameLoop } = persisted

    config.restart = false

    gameLoop.paused = true

    curer.revive(config)
    config.doFall = false
    curer.speedMod = 1
    config.curerKO = false

    breakThroughLevel(config, curer)
  })

  /*module.hot.dispose((data) => {
    console.log('disposed');

    data.config = persisted.config
    data.curer = persisted.curer
    data.gameLoop = persisted.gameLoop


  })*/
}
