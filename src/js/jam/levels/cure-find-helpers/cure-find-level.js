import { rehydrate2D } from '../../Rehydrate2D'
import input, { setInputEnabled } from '../../input'
import { gameLoop } from '../../../libs/GameLoop'
import * as draw from './draw'
import { makeCeilingSprout, makeGroundSprout, makeGroundSprouts, makeHalfPinwheel, makePinwheelPoints, makeSproutPoint } from './sprouts'

const scale = 1
// const scale = 0.5

export default async function cureFindLevel(config, curer) {
  const { width, height } = rehydrate2D.canvas

  rehydrate2D.setBackgroundColor('#FFF')

  config.doEntry = true

  draw.clearCanvases()

  const entryPosition = {
    y: height - 488,
    x: -200,
    xStop: 50
  }

  Object.assign(config, entryPosition)

  curer.canJump = true
  curer.speedMod = 1
  config.legHealed = true
  curer.legHealed = true
  curer.finalForm = true

  input(config)

  /**
   *  Setup Level
   */

  const pinwheelPoints = makePinwheelPoints(300, 300, false)

  const sproutPoints = makeGroundSprouts(100, 650)
  const sproutPointsBack = makeGroundSprouts(100, 570)
  const walkSproutPoints = makeGroundSprouts(70, 600)
  const walkSproutPointsBack = makeGroundSprouts(70, 600)
  const sproutPointsMid = []

  //console.log('quick sprout', draw.quickSprout(makeGroundSprout(500, 100)))

  const hornSymbols = [
    makeHalfPinwheel(width / 2, 180, false, 'rgba(255,255,0,0.1)', false),
    makeHalfPinwheel(width / 2, 188, true, 'rgba(255,255,0,0.1)', false),
    makeHalfPinwheel(width / 2 - 200, 250, false, 'rgba(255,255,0,0.1)', true),
    makeHalfPinwheel(width / 2 + 200, 250, true, 'rgba(255,255,0,0.1)', true),
    //makeHalfPinwheel(width / 2, 180, false, 'rgba(255,255,0,0.1)', false, true, false),
    //makeHalfPinwheel(width / 2, 180, true, 'rgba(255,255,0,0.1)', false, true, false),
    makeHalfPinwheel(width / 2 - 400, 350, false, 'rgba(255,255,0,0.1)', true, true, false),
    makeHalfPinwheel(width / 2 + 400, 350, true, 'rgba(255,255,0,0.1)', true, true, false)
  ]

  const hornSymbols2 = [

    makeHalfPinwheel(width / 2 - 200, 250, false, 'rgba(255,255,0,0.6)', true),
    makeHalfPinwheel(width / 2 + 200, 250, true, 'rgba(255,255,0,0.6)', true),
  ]

  const hornSymbols3 = [
    //makeHalfPinwheel(width / 2, 180, false, 'rgba(255,255,0,0.6)', false, true, false),
    makeHalfPinwheel(width / 2 - 400, 350, false, 'rgba(255,255,0,0.6)', true, true, false),
    makeHalfPinwheel(width / 2 + 400, 350, true, 'rgba(255,255,0,0.6)', true, true, false)
  ]

  const hornSymbols4 = [
    makeHalfPinwheel(width / 2, 180, false, 'rgba(255,255,12,0.6)', false),
    makeHalfPinwheel(width / 2, 188, true, 'rgba(255,255,12,0.6)', false)
  ]

  hornSymbols.forEach((points) => {
    points.forEach(point => draw.quickSprout(point, false))
  })

  for (let i = 0; i < 25; i++) {
    draw.quickSprout(makeCeilingSprout(-20 + (width / 25) * i, -10 + 60 * Math.random(), null, { color: '#39290f', curl: {} }), false, 14)
  }

  for (let i = 0; i < 25; i++) {
    draw.quickSprout(makeCeilingSprout(-20 + (width / 25) * i, -10 + 30 * Math.random(), null, { color: `#${Math.floor(Math.random() * 3)}6230d`, curl: {} }), true, 4 + Math.random() * 10)
  }

  for (let i = 0; i < 55; i++) {
    //draw.quickSprout(makeGroundSprout(400 + Math.random() * 200, 570, null, { color: 'green', lineWidth: 5, curl: { delay: 20 + 300 * Math.random() } }), true, 5)
  }

  let maxSproutHeight = 310
  let startEndSprouts = false
  let exitTextAlpha = 0
  let showEndText = false

  const greens = ['green', 'darkgreen', '#004f11']
  const fc = ['red', 'blue', 'yellow', 'purple']
  const randomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)]
  }

  let levelDone = false

  /**
   *  Update
   */

  gameLoop.updateFn = update
  gameLoop.paused = false

  function update() {
    if (!config.doEntry) curer.speedMod = 0.25

    draw.backgroundColor()

    walkSproutPointsBack.forEach((point) => {
      if (config.x > point.x - 90 && !point.added) {
        point.added = true

        const r = Math.random()
        const flower = makeHalfPinwheel(config.x + 900 * r, 400 - r * 430, false, 'rgba(255,255,0,0.5)')

        sproutPointsBack.push(point)
        //sproutPointsBack.push(...flower)
      }
    })

    if (sproutPointsBack) sproutPointsBack.forEach(point => draw.sprout(point))

    draw.sprouts()

    draw.darkenBlack(0.3)

    draw.floor(0, width)
    draw.ceiling(0, -480)

    const curerPos = curer.update(config, entryPosition, width, height)

    if (Math.random() > 0.9 && startEndSprouts) {
      maxSproutHeight += 10
      sproutPointsMid.push(makeGroundSprout(400 + Math.random() * 200, 570, null, { color: randomItem(greens), lineWidth: 5, curl: { delay: 20 + maxSproutHeight * Math.random() } }))
    }

    // Start the end!
    if (curerPos.x >= width / 2 - 80) {
      config.speed = 0
      setInputEnabled(false)

      if (!hornSymbols2[0][0].added) {
        console.log('add horn symbols',)

        hornSymbols2.forEach((points) => {
          points.forEach((point) => {
            point.added = true
            point.speed = 1
            point.lineWidth = 3
            sproutPointsBack.push(point)
          })
        })

        setTimeout(() => {
          hornSymbols3.forEach((points) => {
            points.forEach((point) => {
              point.added = true
              point.speed = 1
              point.lineWidth = 3
              sproutPointsBack.push(point)
            })
          })

          setTimeout(() => {
            hornSymbols4.forEach((points) => {
              points.forEach((point) => {
                point.added = true
                point.speed = 1
                point.lineWidth = 3
                sproutPointsBack.push(point)
              })
            })

            setTimeout(() => {
              startEndSprouts = true

              setTimeout(() => {
                showEndText = true
              }, 5000);
            }, 2000);
          }, 2000);
        }, 2000);
      }

    }

    draw.rack()

    walkSproutPoints.forEach((point) => {
      if (curerPos.x > point.x - 90 && !point.added) {
        point.added = true
        sproutPoints.push(point)
      }
    })


    if (sproutPoints) sproutPoints.forEach(point => draw.sprout(point, true))

    draw.glow()

    if (sproutPointsMid) sproutPointsMid.forEach(point => draw.sprout(point, false, true))

    draw.sprouts(false, true)
    draw.sprouts(true)

    if (startEndSprouts) {
      if (exitTextAlpha <= 1 - 0.01 && showEndText) exitTextAlpha += 0.01
      rehydrate2D.context.textAlign = 'center'
      rehydrate2D.context.font = '34px sans-serif'

      rehydrate2D.context.shadowColor="black";
      rehydrate2D.context.shadowBlur=7;

      rehydrate2D.context.fillStyle = `rgba(255, 255, 255, ${exitTextAlpha})`
      rehydrate2D.context.fillText('Created by Jordan J Watkins for the js13k 2022 game jam', width / 2, height - 40);
      rehydrate2D.context.shadowBlur = 0
    }

    draw.vignette()

    if (levelDone) return

    // Win/Lose
    if (config.nextLevel) {
      levelDone = true

      console.log('level done')

      setTimeout(() => {
        console.log('level passed')
        gameLoop.paused = true
        config.nextLevel = false

        draw.clearCanvases()

        cureFindLevel(config, curer)
      }, 500)
    } else if (config.restart) {
      levelDone = true

      const delay = (config.restart) ? 500 : 2000

      setTimeout(() => {
        console.log('level failed!')


        config.restart = false

        gameLoop.paused = true

        curer.revive(config)

        draw.clearCanvases()

        cureFindLevel(config, curer)
      }, delay)
    }
  }

  return {
    stop: () => gameLoop.stop()
  }
}
