import { rehydrate2D } from '../../Rehydrate2D'
import { fetchAndRehydrate, setScale } from '../../saves'
import GameLoop from '../../libs/GameLoop'
import input, { setInputEnabled } from '../test-level/input'
import Curer from '../test-level/Curer'
import Waver from '../../components/Waver'
import CloudPoof from '../../components/CloudPoof'

// const scale = 1
const scale = 0.5

const makeConfig = (add) => {
  const x = 0
  const y = 300
  const stepDistance = 0
  const currentFrame = 0
  const stepHeight = 0
  const speed = 0
  const walkSpeed = 3 * scale / 4 // Dead leg
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
    y: -800 * scale,
    x: width / 2 - 10 * scale,
    yStop: height - 520 * scale
  }

  const config = makeConfig({ width, height, jumpHeight: 0, jumpDirection: -1, doDeath: false, ...entryPosition, doEntry: true })

  const curer = new Curer({ scale })

  curer.legHealed = true
  config.legHealed = true

  await curer.initialized

  setScale(scale)

  curer.canJump = false

  const testLevel = await fetchAndRehydrate('dark-level')
  const backgroundColor = await fetchAndRehydrate('test-level-background')

  // const waver = new Waver()

  // await waver.createPoof(180, (height - 100) / scale, { scale })

  const poof = new CloudPoof()

  await poof.createPoof(500 * scale, 500 * scale, { count: 30, fullFadeTime: 20, startAlpha: 0.7, scale: 1 })

  input(config)

  const threadY = 85

  const threads = []

  for (let i = 0; i < 20; i++) {
    const threadX =  -40 - 8 * i - 25 * Math.random()

    const thread = {
      position: { x: threadX, y: 0 },
      color: '#FFF',
      radius: 3,
      fade: 0,
      points: [
        { x: 0, y: threadY },
        { x: -2 + 4 * Math.random(), y: threadY + 2 + 2 * Math.random() }
      ]
    }



    thread.poof = new CloudPoof(scale)

    thread.poof.createPoof(500 * scale + threadX, 555 * scale, { count: 30, fullFadeTime: 140, startAlpha: 0.7, scale: 0.05, speed: 0.2 })

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
            if (Math.random() > 0.9) flash = true
            if (Math.random() > 0.99) bigFlash = true

            thread.poof.updatePoof()
            return
          }
          thread.fade -= 1
          flash = true
          return
        } else {
          //flash = false
        }
        //console.log('config.x', 512 /2 - curerPos.x, -thread.position.x);
        if (512 /2 - curerPos.x - 20 > -thread.position.x) {
          //console.log('thREADAD!');

          thread.fade = 10
        }
      })
    }
  })

  const thing = makeThing(500 * scale, 558 * scale)



  let levelDone = false
  let wakeTimer = 1
  let legHealed = false

  const healLeg = (soft = false) => {
      legHealed = true
      curer.legHealed = true

      setTimeout(() => {
        if (!soft) {
          wakeTimer = 300
          config.x += 300

        }
        config.walkSpeed = 3 * scale
      }, 100);
    }

  setTimeout(() => {
    flash = true
    setTimeout(() => {
      flash = false
    }, 100)
  }, 2000)

  //healLeg()

  setTimeout(() => {
    //healLeg(true)
  }, 3000);

  function update() {
    rehydrate2D.clear()

    backgroundColor.draw(0, 0)

    testLevel.draw(0, 0)

    // waver.updatePoof()

    //if (!legHealed) healLeg()

    if (curer.legHealed && !config.curerKO) {
      curer.canJump = true
      curer.canDuck = true
      curer.canDash = true
    } else {
      curer.canJump = false
      curer.canDuck = false
      curer.canDash = true
      //curer.canDash = false
    }

    const curerPos = curer.updateOneArrow(config, entryPosition, width, height)

    if (curerPos.x > 150 * scale && !thing.armed) thing.armed = 1

    if (curerPos.x < 30 * scale) {
      config.speed = 0
      config.x += config.walkSpeed
    }

    if (curerPos.x > width - 100) {
      if (legHealed && config.doJump) {
        /*if (config.jumpHeight > 40 * scale && config.jumpDirection === 1) {
          config.jumpHeight = 0
          console.log('healed jump!');
        }*/
      } else if (curerPos.y >= entryPosition.yStop) {
        config.speed = 0
        config.x -= config.walkSpeed
      }
    }

    if (curerPos.x > width - 110) {
      if (legHealed && config.doJump) {
        if (config.jumpHeight > 40 * scale && config.jumpDirection === 1) {
          config.jumpHeight = 0
          console.log('healed jump!');
          config.speed = config.walkSpeed
          setInputEnabled(false)
        }
      }
    }

    if (curerPos.x < 30 * scale && !legHealed) {
      healLeg()
      /*legHealed = true
      curer.legHealed = true

      setTimeout(() => {
        wakeTimer = 300
        config.x += 300
        config.walkSpeed = 3 * scale
      }, 100);*/
    }



    if (!config.doFall)  {
      if (wakeTimer > 0) {
        config.curerKO = true
      } else {
        config.curerKO = false
      }

      poof.updatePoof()
    } else { wakeTimer = 200 }

    wakeTimer -= 1

    testLevel.draw(0, 0)

    if (!config.doFall)  {
      //poof2.updatePoof()
    }

    if (flash && !legHealed) {
      curer.deadLeg(curerPos, 0.51, true)
      rehydrate2D.getRenderer().context.globalAlpha = 0.2
      curer.images.splits.draw(config.x - 20 + 40 * Math.random(), config.y - 20 + 40 * Math.random())
      rehydrate2D.getRenderer().context.globalAlpha = 1
    }

    thing.update(config, curerPos, curer)

    if ((bigFlash && !legHealed) || (legHealed && wakeTimer > 180)) {
      rehydrate2D.clearRenderer()
    }

    if (curerPos.x > width + 50 * scale) {
      if (levelDone) return
      console.log('level passed')

      if (winFn) winFn()

      levelDone = true
    } else if (config.curerDead) {
      setTimeout(() => {
        if (levelDone) return
        console.log('level failed!')

        if (loseFn) loseFn()

        levelDone = true
      }, 4000)
    }
  }

  const gameLoop = new GameLoop(update)

  return {
    stop: () => gameLoop.stop()
  }
}
