import { rehydrate2D } from '../../Rehydrate2D'
import { gameLoop } from '../../../libs/GameLoop'
import input from '../../input'
import CloudPoof from '../../entities/CloudPoof'
import images from '../../entities/images'
import legCure from '../leg-cure'
import Arrows from '../../entities/Arrows'
import * as draw from './draw'
import { knote } from '../../../components/JamKnote'
//import oneArrow from './one-arrow'

const scale = 1

let persisted = {}

export default async function breakThroughLevelInner(config, curer) {
  console.log('breakthrou level!!');
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
          knote.fireNoise()

          return
        }

        // Shake floor
        const sx = 2 * ((Math.sin(Date.now() / 30) > 0.5) ? 1 : 0)

        //images.crackedFloor.draw(x + sx, y)

        draw.floor(195 + sx, 215)
        images.floorCracks.draw(200 + sx, 560, null, 1, 1.3)
        draw.floorCheckers(200 + sx, 250)

        return
      }

      // Static floor
      //images.crackedFloor.draw(x, y)

      draw.floor(200, 210)
      images.floorCracks.draw(200, 560, null, 1, 1)
      draw.floorCheckers(200, 250)
    }
  })

  const thing = makeThing(200, 568)

  let levelDone = false
  let fallCount = 0

  gameLoop.updateFn = update
  gameLoop.paused = false

  persisted.gameLoop = gameLoop

  function update() {
    rehydrate2D.clear()

    //images.testLevelBackground.draw(0, 0)

    //images.breakthroughLevel.draw(0, 0)




    draw.walls()
    images.floorCracks.draw(220, 540, null, 1, 0.7)

    images.floorCracks.draw(600, 540, null, 1, 0.3)

    if (config.doFall)  {
      poof.updatePoof()

      if (fallCount % 10 === 0) {
        poof.resetPoof(0, fallCount * 10)
        knote.fireNoise()
      }

      fallCount += 1
    }


    images.closet.draw(420, 150)

    const curerPos = curer.update(config, entryPosition, width, height)

    if (curerPos.x > 150 && !thing.armed) thing.armed = 1

    if (curerPos.x > 50 && !arrow1) arrow1 = arrow(1500)
    if (curerPos.x > 50 && !arrow2) arrow2 = arrowJump(1500)

    arrows.update(config, curerPos, curer)

    draw.floor()
    draw.floor(408, width)



    thing.update(config, curerPos, curer)

    draw.floorCheckers(-100, 300)
    draw.floorCheckers(410, 650)

    //images.floorCracks.draw(200, 545, null, 1, 0.3)
    //images.floorCracks.draw(200, 565, null, 1, 0.8)


    images.breakthroughLevel.draw(0, 0)

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

        breakThroughLevelInner(config, curer)
      }, delay)
    }
  }

  return {
    stop: () => gameLoop.paused = true
  }
}

if (module.hot) {
  module.hot.dispose(() => {
    persisted.gameLoop.paused = true
  })
}
