import { rehydrate2D } from '../../Rehydrate2D'
import { fetchAndRehydrate } from '../../saves'
import GameLoop from '../../libs/GameLoop'
import input from '../test-level/input'
import Curer from '../test-level/Curer'
import Arrows from '../../components/Arrows'

const makeConfig = (add) => {
  const x = 0
  const y = 300
  const stepDistance = 0
  const currentFrame = 0
  const stepHeight = 0
  const speed = 0
  const walkSpeed = 3
  const speedY = 0
  const jumpSpeed = 3
  const doDash = false

  return { x, y, stepDistance, currentFrame, stepHeight, speed, walkSpeed, speedY, jumpSpeed, doDash, doJump: false, ...add }
}

//let variant = false

export const setOneArrowVariant = (value) => {
  //variant = value
}

export default async (winFn, loseFn, variant = false) => {
  const { width, height } = rehydrate2D.canvas

  const entryPosition = {
    y: height - 480,
    x: -180,
    xStop: 50
  }

  const config = makeConfig({ width, height, jumpHeight: 0, jumpDirection: -1, doDeath: false, ...entryPosition, doEntry: true })

  const curer = new Curer()

  await curer.initialized

  console.log('one arrow, variant?', variant);

  if (variant) {
    curer.legHealed = true
  } else {
    // Dead Leg

    curer.canJump = false
    config.walkSpeed /= 2
  }


  const testLevel = await fetchAndRehydrate('test-level-foreground')
  const backgroundColor = await fetchAndRehydrate('test-level-background')

  input(config)

  const arrows = new Arrows()

  const arrowSpeedScale = 1.5

  const makeArrow = ({ x = 700, y = 50, type = 'duck' } = {}) => (delay = 1000) => arrows.fireArrow(x, entryPosition.y + y, type, delay)

  const arrow = makeArrow({ x: 800 })
  const arrowJump = makeArrow({ x: 800, type: 'jump', y: 180 })

  let arrow1
  let arrow2

  const gameLoop = new GameLoop(update)

  let levelDone = false

  function update() {
    rehydrate2D.clear()

    backgroundColor.draw(0, 0)

    testLevel.draw(0, 0)

    const curerPos = curer.updateOneArrow(config, entryPosition, width, height)

    if (curerPos.x > 150 && !arrow1) arrow1 = arrow()
    if (curerPos.x > 150 && !arrow2 && variant) arrow2 = arrowJump(2000)

    arrows.update(config, curerPos, curer)

    testLevel.draw(0, 0)

    if (curerPos.x > width + 50) {
      if (levelDone) return
      console.log('level passed')

      if (winFn) winFn()

      levelDone = true
    } else if (config.curerDead) {
      setTimeout(() => {
        if (levelDone) return
        console.log('level failed!');


        if (loseFn) loseFn()

        levelDone = true
      }, 4000);

    }
  }

  return {
    stop: () => gameLoop.stop()
  }
}
