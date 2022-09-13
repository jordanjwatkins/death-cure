import { rehydrate2D } from '../../Rehydrate2D'
import { fetchAndRehydrate } from '../../saves'
import GameLoop from '../../libs/GameLoop'
import input from '../test-level/input'
import Curer from '../test-level/Curer'
import CloudPoof from '../../components/CloudPoof'

const scale = 0.5

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

export default async (winFn, loseFn) => {
  const { width, height } = rehydrate2D.canvas

  const entryPosition = {
    y: height - 480,
    x: -180,
    xStop: 50
  }

  const config = makeConfig({ width, height, jumpHeight: 0, jumpDirection: -1, doDeath: false, ...entryPosition, doEntry: true })

  const curer = new Curer()

  await curer.initialized

  const testLevel = await fetchAndRehydrate('breakthrough-level')
  const backgroundColor = await fetchAndRehydrate('test-level-background')
  const crackedFloor = await fetchAndRehydrate('cracked-floor')

  const poof = new CloudPoof()

  await poof.createPoof(450, 500, { count: 10, fullFadeTime: 10, startAlpha: 0.1 })

  input(config)

  let lastDoJump

  const makeThing = (x, y) => ({
    armed: 0,
    update(_config, curerPos) {
      if (curerPos.x > 300 && curerPos.x < 580) {
        if (curerPos.x > 410 && curerPos.x < 450) {
          this.armed = 4
          config.speed = 0
          config.doFall = true
          return

          if (config.doJump) {
            config.speed = 0
          } else if (lastDoJump && this.armed <= 3) {
            this.armed += 1
            poof.resetPoof()
          }
          // console.log('stop', curerPos.x);

          if (this.armed > 3) {
            config.doFall = true

            return
          }
        }

        lastDoJump = config.doJump

        crackedFloor.draw(x + 2 * ((Math.sin(Date.now() / 30) > 0.5) ? 1 : 0), y)

        return
      }

      if (this.armed) {
        // crackedFloor.draw(x, y)
      } else {
        // crackedFloor.draw(x + 5, y)
      }

      crackedFloor.draw(x, y)
    }
  })

  const thing = makeThing(200, 557)

  const gameLoop = new GameLoop(update)

  let levelDone = false
  let fallCount = 0

  function update() {
    rehydrate2D.clear()

    backgroundColor.draw(0, 0)

    testLevel.draw(0, 0)

    const curerPos = curer.updateOneArrow(config, entryPosition, width, height)

    if (curerPos.x > 150 && !thing.armed) thing.armed = 1

    thing.update(config, curerPos, curer)

    testLevel.draw(0, 0)

    if (config.doFall)  {
      poof.updatePoof()

      if (fallCount % 20 === 0) poof.resetPoof(0, fallCount * 3)

      fallCount += 1
    }

    if (levelDone) return

    if (curerPos.y > height + 50) {
      console.log('level done')
      setTimeout(() => {
        console.log('level passed')

        if (winFn) winFn()
      }, 500)

      levelDone = true
    } else if (config.curerDead) {
      setTimeout(() => {
        console.log('level failed!')

        // gameLoop.stop()

        if (loseFn) loseFn()
      }, 4000)

      levelDone = true
    }
  }

  return {
    stop: () => gameLoop.stop()
  }
}
