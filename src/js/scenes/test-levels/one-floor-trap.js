import { rehydrate2D } from '../../Rehydrate2D'
import { fetchAndRehydrate } from '../../saves'
import GameLoop from '../../libs/GameLoop'
import input from '../test-level/input'
import Curer from '../test-level/Curer'

const makeConfig = (add) => {
  const x = 0
  const y = 300
  const stepDistance = 0
  const currentFrame = 0
  const stepHeight = 0
  const speed = 0
  const walkSpeed = 3//3 - dead leg
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

  const testLevel = await fetchAndRehydrate('test-level-foreground')
  const backgroundColor = await fetchAndRehydrate('test-level-background')
  const trapWarmUp = await fetchAndRehydrate('floor-trap-warmup')
  const trapActive = await fetchAndRehydrate('floor-trap-active')
  const trapBeam = await fetchAndRehydrate('floor-trap-active-beam')

  input(config)

  const makeTrap = (x, y) => {
    return {
      armed: 0,
      maxFuse: 95,
      fuse: 95,
      update() {
        //trapBeam.draw(x, y - 3 * this.armed - trapBeam.canvas.height)
        if (this.armed) {
          if (this.fuse > 0) this.fuse -= 1
          if (this.fuse < 50) {
            //console.log('trapactive');
            trapActive.draw(x, y - 3 * this.armed)
          } else {
            trapWarmUp.draw(x, y - 3 * this.armed)
          }
          if (this.fuse <= 0) {
            //console.log('trap beam');

            if (!this.active) {
              setTimeout(() => {
                if (curer.shaking) return

                console.log('disarmed');
                this.armed = 0
                this.fuse = 1999


              }, 2000);
            }
            this.active = true

            if (!config.curerDead) {
              trapBeam.draw(x - 20, y + 5 - trapBeam.canvas.height)

              if (config.x < 400 && !curer.shaking) return

              if (!curer.shaking) {
                setTimeout(() => {
                  curer.canShake = false
                  config.curerDead = true
                  curer.shaking = false

                  this.armed = 0
                  this.fuse = 1999
                }, 2000);
              }

              curer.canShake = true
              curer.shake(config)


            }
          }
        } else {
          trapWarmUp.draw(x, y - 3 * this.armed)
        }

      }
    }
  }

  let trap = makeTrap(500, 558)

  const gameLoop = new GameLoop(update)

  let levelDone = false

  function update() {
    rehydrate2D.clear()

    backgroundColor.draw(0, 0)

    testLevel.draw(0, 0)

    const curerPos = curer.updateOneArrow(config, entryPosition, width, height)

    //if (curerPos.x > 150 && !arrow1) arrow1 = arrow()

    if (curerPos.x > 150 && !trap.armed) trap.armed = 1

    if (trap) trap.update(config, curerPos, curer)

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
        gameLoop.stop()

        if (loseFn) loseFn()

        levelDone = true
      }, 4000);

    }
  }

  return {
    stop: () => gameLoop.stop()
  }
}
