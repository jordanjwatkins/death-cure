import { rehydrate2D } from '../../Rehydrate2D'
import { fetchAndRehydrate } from '../../saves'
import GameLoop from '../../libs/GameLoop'
import input from '../test-level/input'
import Curer from '../test-level/Curer'

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
  rehydrate2D.setConfig({ useScaledCanvas: true })

  const { width, height } = rehydrate2D.canvasOut

  const entryPosition = {
    y: -100 * scale,
    x: width / 2 - 80 * scale,
    yStop: height - 520 * scale
  }

  const config = makeConfig({ width, height, jumpHeight: 0, jumpDirection: -1, doDeath: false, ...entryPosition, doEntry: true })

  const curer = new Curer({ scale })

  await curer.initialized

  const testLevel = await fetchAndRehydrate('small-pit-level', 0.5)
  const backgroundColor = await fetchAndRehydrate('test-level-background', 0.5)
  const crackedFloor = await fetchAndRehydrate('cracked-floor', 0.5)
  const floorCracks = await fetchAndRehydrate('floor-cracks', 0.5)

  input(config)

  let lastDoJump

  const makeThing = (x, y) => ({
    armed: 0,
    update(_config, curerPos) {
      if (curerPos.x > 300 * scale && curerPos.x < 580 * scale) {
        if (curerPos.x > 410 * scale && curerPos.x < 450 * scale) {
          if (config.doJump) {
            config.speed = 0
          } else if (lastDoJump && this.armed <= 3) {
            this.armed += 1
          }

          if (this.armed > 3) {
            config.doFall = true

            return
          }
        }

        lastDoJump = config.doJump

        crackedFloor.draw(x + 5 * scale * Math.sin(Date.now() / 100), y)
      }

      if (this.armed) {
        crackedFloor.draw(x, y)
      } else {
        crackedFloor.draw(x + 5 * scale, y)
      }
    }
  })

  const thing = makeThing(400 * scale, 557 * scale)

  const gameLoop = new GameLoop(update)

  let levelDone = false

  const ctxSmall = rehydrate2D.canvasSmall.getContext('2d')
  const ctx = rehydrate2D.canvasOut.getContext('2d')

  console.log('cotx', ctx)

  // ctx.drawImage(rehydrate2D.canvas, 0, 0)

  // const scale = 0.5

  // ctx.scale(scale, scale)
  // ctx.drawImage(rehydrate2D.canvas, 0 , 0)
  // ctx.scale(1 / scale, 1 / scale)

  // rehydrate2D.canvas.width = rehydrate2D.canvas.width / 2
  // rehydrate2D.canvas.height = rehydrate2D.canvas.height / 2

  function update() {
    // rehydrate2D.clear()

    // rehydrate2D.context.drawImage(image, 0, 0)

    // rehydrate2D.clear()

    backgroundColor.draw(0, 0, scale)

    // testLevel.draw(0, 0)

    const curerPos = curer.updateOneArrow(config, entryPosition, width, height)

    if (curerPos.x > 150 && !thing.armed) thing.armed = 1

    thing.update(config, curerPos, curer)

    testLevel.draw(0, 0, scale)

    floorCracks.draw(200 * scale, 558 * scale, scale)

    if (curerPos.y > height + 50) {
      if (levelDone) return
      console.log('level passed')

      if (winFn) winFn()

      levelDone = true
    } else if (config.curerDead) {
      setTimeout(() => {
        if (levelDone) return
        console.log('level failed!')
        gameLoop.stop()

        if (loseFn) loseFn()

        levelDone = true
      }, 4000)
    }

    // if (ctxSmall) ctxSmall.drawImage(rehydrate2D.canvas, 0, 0, rehydrate2D.canvasOut.width, rehydrate2D.canvasOut.height)
    // if (ctx) ctx.drawImage(rehydrate2D.canvas, 0, 0, rehydrate2D.canvasOut.width, rehydrate2D.canvasOut.height)
  }

  return {
    stop: () => gameLoop.stop()
  }
}

function makeImage(dataUri) {
  const image = new Image()

  // image.src = "data:image/png;base64
  image.src = dataUri

  return new Promise((resolve) => {
    image.onload = function () {
      resolve(image)
    }
  })
}
