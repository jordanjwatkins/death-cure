
import { gameLoop } from '../../libs/GameLoop'
import images from '../entities/images'
import input from '../input'
import Arrows from '../entities/Arrows'
import { rehydrate2D } from '../Rehydrate2D'
import breakThroughLevel from './break-through'

const scale = 1

export default async function oneArrowLevel(config, curer, variant = false) {
  const { width, height } = rehydrate2D.canvas

  const entryPosition = {
    y: height - 485,
    x: -180,
    xStop: 50
  }

  Object.assign(config, entryPosition)

  config.doEntry = true

  if (variant) {
    curer.legHealed = true
  } else {
    // Dead Leg

    curer.canJump = false
    //config.walkSpeed /= 2
  }

  input(config)

  const arrows = new Arrows()

  const arrowSpeedScale = 1.5

  const makeArrow = ({ x = 700, y = 50, type = 'duck' } = {}) => (delay = 1000, flipped) => arrows.fireArrow(x, entryPosition.y + y, type, delay, flipped)

  const arrow = makeArrow({ x: 800 })
  const arrowTwo = makeArrow({ x: 100 })
  const arrowJump = makeArrow({ x: 800, type: 'jump', y: 180 })

  let arrow1
  let arrow2


  let levelDone = false

  const fogs = []

  const fogCount = 10
  let scale = 1
  for (let i = 0; i < fogCount; i++) {
    scale =  0.8 + 0.5 * Math.random()
    fogs.push({ x: -150 + i * (520 + 140 * Math.random()) / fogCount, y: 470 - Math.random() * 180 * scale, direction: (Math.random() > 0.5) ? -1 : 1, scale: scale, speed: 0.5 * 3 * Math.random() * scale, seed: Math.random() })
  }

  const darken = (opacity = 0.9, offset = 0) => {
    rehydrate2D.context.fillStyle = `rgba(255,0,0,${opacity})`
    rehydrate2D.context.fillRect(offset, 0, width * 2, height * 2)
  }

  const darkenBlack = (opacity = 0.9, offset = 0) => {
    rehydrate2D.context.fillStyle = `rgba(0,0,0,${opacity})`
    rehydrate2D.context.fillRect(offset, 0, width * 2, height * 2)
  }

  const drawFloor = (opacity = 0.5) => {
    rehydrate2D.context.fillStyle = `rgba(0,0,0,${opacity})`
    rehydrate2D.context.fillRect(0, height - 200, width, 200)
  }

  gameLoop.updateFn = update
  gameLoop.paused = false

  function update() {
    images.testLevelBackground.draw(0, 0)

    images.testLevelForeground.draw(0, 0)

    rehydrate2D.context.globalCompositeOperation = 'color'
    darken( 0.1 + Math.sin(Date.now() / 1000) - 1.5)
    rehydrate2D.context.globalCompositeOperation = 'source-atop'

    //darken(0.9)

    const curerPos = curer.update(config, entryPosition, width, height)


    if (!config.doEntry && curerPos.x < 50 && !config.curerDead) {
      console.log('not entering', curerPos.x);
      config.x += config.walkSpeed
      config.speed = 0
    }

    drawFloor()

    if (curerPos.x > 150 && !arrow1) arrow1 = arrow()
    if (curerPos.x > 450 && !arrow2 && !variant) arrow2 = arrowTwo(500, false)
    if (curerPos.x > 150 && !arrow2 && variant) arrow2 = arrowJump(2000)

    arrows.update(config, curerPos, curer)

    fogs.forEach((fog) => {
      fog.x += 0.13 * fog.direction

      images.fog.draw(fog.x, fog.y + images.fog.canvas.height / 2 / fog.scale, null, fog.scale, 1 + Math.sin((Date.now() + fog.seed * 100000) / 10000))

      if (fog.direction < 0 && fog.x <= -100) {
        fog.direction = 1
        fog.x = -99
      } else if (fog.direction > 0 && fog.x >= width + 100) {
        fog.direction = -1
        fog.x = width + 99
      }

      if (Math.random() > 0.99) fog.direction = -fog.direction
    })

    images.testLevelForeground.draw(0, 0)

    rehydrate2D.context.globalCompositeOperation = 'color'
    darken(0.2)
    rehydrate2D.context.globalCompositeOperation = 'source-atop'

    darkenBlack(0.6)

    rehydrate2D.context.globalCompositeOperation = 'color'
    //darken(0.1 + Math.sin(Date.now() / 1000 + 10000) - 0.9)
    darken(0.2)
    rehydrate2D.context.globalCompositeOperation = 'source-atop'

    rehydrate2D.context.globalCompositeOperation = 'color'
    darken(Math.sin(Date.now() / 1000 + 10000) - 0.3, -400)
    rehydrate2D.context.globalCompositeOperation = 'source-atop'

    if (levelDone) return

    // Win / Lose
    if (curerPos.x > width + 50 || config.nextLevel) {

      levelDone = true

      console.log('level passed')

      config.nextLevel = false

      setTimeout(() => {
        gameLoop.paused = true

        breakThroughLevel(config, curer)
      }, 500)

      levelDone = true
    } else if (config.curerDead || config.restart) {
      if (levelDone) return

      levelDone = true

      const delay = (config.restart) ? 500 : 2000

      setTimeout(() => {
        console.log('level failed!')

        config.restart = false

        gameLoop.paused = true

        curer.revive(config)

        oneArrowLevel(config, curer)
      }, delay)
    }
  }

  return {
    stop: () => gameLoop.paused = true
  }
}
