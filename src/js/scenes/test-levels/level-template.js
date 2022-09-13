import { rehydrate2D } from '../../Rehydrate2D'
import { fetchAndRehydrate, setScale } from '../../saves'
import GameLoop from '../../libs/GameLoop'
import input from '../test-level/input'
import Curer from '../test-level/Curer'

// const scale = 1
const scale = 0.5

const makeConfig = (add) => {
  const x = 0
  const y = 300
  const stepDistance = 0
  const currentFrame = 0
  const stepHeight = 0
  const speed = 0
  const walkSpeed = 3 * scale
  const speedY = 0
  const jumpSpeed = 3 * scale
  const doDash = false

  return { x, y, stepDistance, currentFrame, stepHeight, speed, walkSpeed, speedY, jumpSpeed, doDash, doJump: false, ...add }
}

export default async (winFn, loseFn) => {
  // rehydrate2D.setConfig({ useScaledCanvas: false })
  rehydrate2D.setConfig({ useScaledCanvas: true })

  // const { width, height } = rehydrate2D.canvas
  const { width, height } = rehydrate2D.canvasOut

  const entryPosition = {
    y: height - 480 * scale,
    x: -180 * scale,
    xStop: 50 * scale
  }

  const config = makeConfig({ width, height, jumpHeight: 0, jumpDirection: -1, doDeath: false, ...entryPosition, doEntry: true })

  const curer = new Curer({ scale })

  await curer.initialized

  setScale(scale)

  const testLevel = await fetchAndRehydrate('test-level-foreground')
  const backgroundColor = await fetchAndRehydrate('test-level-background')

  input(config)

  const makeThing = (x, y) => {
    return {
      armed: 0,
      update() {

      }
    }
  }

  let thing = makeThing(500 * scale, 558 * scale)

  const gameLoop = new GameLoop(update)

  let levelDone = false

  function update() {
    rehydrate2D.clear()

    backgroundColor.draw(0, 0)

    testLevel.draw(0, 0)

    const curerPos = curer.updateOneArrow(config, entryPosition, width, height)

    if (curerPos.x > 150 * scale && !thing.armed) thing.armed = 1

    thing.update(config, curerPos, curer)

    testLevel.draw(0, 0)

    if (curerPos.x > width + 50 * scale) {
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
