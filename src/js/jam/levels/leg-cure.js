
import GameLoop, { gameLoop } from '../../libs/GameLoop'
// import Curer from '../test-level/Curer'
// import CloudPoof from '../../components/CloudPoof'
import input, { setInputEnabled } from '../input'
import images from '../entities/images'
import { rehydrate2D } from '../Rehydrate2D'
import CloudPoof from '../entities/CloudPoof'
import cureFind from './cure-find'
import { knote } from '../../components/JamKnote'

const scale = 1
// const scale = 0.5

export default async function legCure(config, curer) {
  const { width, height } = rehydrate2D.canvas

  rehydrate2D.setBackgroundColor('#FFF')

  config.doEntry = true

  const entryPosition = {
    y: -800 * scale,
    x: width / 2 - 10 * scale,
    yStop: height - 500 * scale,
    xStop: null
  }

  Object.assign(config, entryPosition)

  curer.canJump = false
  curer.speedMod = 0.5
  config.legHealed = false
  curer.legHealed = false

  const poof = new CloudPoof()

  await poof.createPoof(500 * scale, 500 * scale, { count: 30, fullFadeTime: 20, startAlpha: 0.7, scale: 1 })

  input(config)

  const threadY = 170 * scale

  const threads = []

  for (let i = 0; i < 20; i++) {
    const threadX = -80 * scale - 16 * scale * i - 50 * scale * Math.random()

    const thread = {
      position: { x: threadX, y: 0 },
      color: '#FFF',
      radius: 6,
      fade: 0,
      points: [
        { x: 0, y: threadY },
        { x: -4 * scale + 8 * scale * Math.random(), y: threadY + 4 * scale + 4 * scale * Math.random() }
      ]
    }

    thread.poof = new CloudPoof(scale)

    thread.poof.createPoof(500 * scale + threadX, 555 * scale, { count: 30, fullFadeTime: 140, startAlpha: 0.7, scale: 0.15, speed: 0.4 })

    threads.push(thread)
  }

  let flash = false
  let bigFlash = false

  const makeThing = (x, y) => ({
    armed: 0,
    threads,
    update(config, curerPos) {
      rehydrate2D.drawFromShapesConfigs(this.threads.filter(thread => !thread.fade), [], rehydrate2D.getRenderer())

      flash = false
      bigFlash = false

      this.threads.forEach(async (thread) => {
        if (thread.fade > 0) {
          if (thread.fade === 1) {
            if (Math.random() > 0.94) flash = true
            if (Math.random() > 0.99) bigFlash = true

            thread.poof.updatePoof()

            return
          }
          thread.fade -= 1
          flash = true

          return
        }
        // flash = false

        // console.log('config.x', 512 /2 - curerPos.x, -thread.position.x);
        if (width / 2 - curerPos.x - 20 * scale > -thread.position.x) {
          // console.log('thREADAD!');

          thread.fade = 10
        }
      })
    }
  })

  const thing = makeThing(500 * scale, 558 * scale)

  let levelDone = false
  let wakeTimer = 1



  setTimeout(() => {
    flash = true
    setTimeout(() => {
      flash = false
    }, 100)
  }, 2000)

  // healLeg()

  setTimeout(() => {
    // healLeg(true)
  }, 3000)

  const zoomTo = (scale, x = 0, y = 0) => {
    const zcx = rehydrate2D.canvas.width / 2
    const zcy = rehydrate2D.canvas.height / 2

    rehydrate2D.context.setTransform(1, 0, 0, 1, 0, 0)

    rehydrate2D.context.translate(zcx, zcy)
    rehydrate2D.context.scale(scale, scale)
    rehydrate2D.context.translate(-zcx, -zcy)

    rehydrate2D.context.translate(x, y)
  }

  let zoomLevel = 2.5

  //zoomTo(zoomLevel, -130, -40)

  const healLeg = (soft = false) => {
    config.legHealed = true
    curer.legHealed = true
    curer.speedMod = 1

    setTimeout(() => {
      if (!soft) {
        wakeTimer = 300
        config.x += 600 * scale
        zoomLevel = 2.5
      }
      // config.walkSpeed = 3 * scale
    }, 100)
  }

  /* Update */

  //const gameLoop = new GameLoop(update)

  gameLoop.updateFn = update
  gameLoop.paused = false

  function update() {
    const { legHealed } = curer

    images.testLevelBackground.draw(0, 0)

    images.darkLevel.draw(0, 0)

    if (curer.legHealed && !config.doEntry && !config.curerKO) {
      curer.canJump = true
      curer.canDuck = true
    } else {
      curer.canJump = false
      curer.canDuck = false
    }

    const curerPos = curer.update(config, entryPosition, width, height)

    if (curerPos.x > 150 * scale && !thing.armed) thing.armed = 1

    if (curerPos.x < 30 * scale) {
      config.speed = 0
      config.x += config.walkSpeed
    }

    if (curerPos.x > width - 200 * scale) {
      if (!config.doJump && curerPos.y >= entryPosition.yStop) {
        config.speed = 0
        config.x -= config.walkSpeed
      }
    }

    if (curerPos.x > width - 220 * scale) {
      if (legHealed && config.doJump) {
        if (config.jumpHeight > 40 * scale && config.jumpDirection === 1) {
          config.jumpHeight = 0
          console.log('healed jump!')
          config.speed = config.walkSpeed
          setInputEnabled(false)
        }
      }
    }

    if (curerPos.x < 30 * scale && !legHealed) {
      healLeg()
    }

    if (legHealed) {
      if (wakeTimer < 1) zoomLevel -= 0.003

      if (zoomLevel < 1) zoomLevel = 1
      zoomTo(zoomLevel, -130 * (zoomLevel - 1), -40 * (zoomLevel - 1))
    }

    if (!config.doFall) {
      if (wakeTimer > 0) {
        if (!config.curerKO) knote.fireNoise()
        config.curerKO = true
      } else {
        config.curerKO = false
      }

      poof.updatePoof()
    } else { wakeTimer = 200 }

    wakeTimer -= 1

    images.darkLevel.draw(0, 0)

    if (!config.doFall) {
      // poof2.updatePoof()
    }

    if (flash && !legHealed) {
      knote.fireNoise()
      curer.deadLeg(curerPos, 0.51, true)
      rehydrate2D.getRenderer().context.globalAlpha = 0.2
      images.splits.draw(config.x - 20 + 40 * Math.random(), config.y - 20 + 40 * Math.random())
      rehydrate2D.getRenderer().context.globalAlpha = 1
    }

    thing.update(config, curerPos, curer)

    if ((bigFlash && !legHealed) || (legHealed && wakeTimer > 180)) {
      rehydrate2D.clearRenderer()
    }

    if (levelDone) return

    if (curerPos.x > width + 50 * scale || config.nextLevel) {
      levelDone = true

      setTimeout(() => {
        console.log('level passed', config.speed, config.walkSpeed)

        gameLoop.paused = true

        config.nextLevel = false
        cureFind(config, curer)
      }, 500)
    } else if (config.curerDead || config.restart) {
      levelDone = true

      const delay = (config.restart) ? 500 : 2000

      setTimeout(() => {
        console.log('level failed!')

        config.restart = false

        gameLoop.paused = true

        curer.revive(config)

        legCure(config, curer)
      }, delay)
    }
  }

  return {
    stop: () => gameLoop.paused = true
  }
}
