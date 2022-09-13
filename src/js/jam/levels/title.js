import { knote } from '../../components/JamKnote'
import images from '../entities/images'
import { rehydrate2D } from '../Rehydrate2D'
import oneArrowLevel from './one-arrow'

let clicked = false

export default async function titleScreen(config, curer, skipIntro = false) {
  config.knote = knote

  document.body.addEventListener('click', () => {
    if (!knote.initted) knote.init(new window.AudioContext())

    if (!knote.initted) return

    clicked = true

    const now = knote.audioContext.currentTime

    const bassLoop = (startTime) => {
      const now = knote.audioContext.currentTime

      if (now > startTime - 2) {
        knote.playNote(knote.makeNote('Ab1'), { duration: 2, delay: startTime - now + 0.1 })
        knote.playNote(knote.makeNote('Fb1'), { duration: 2, delay: startTime - now + 2 + 0.1 })
        knote.playNote(knote.makeNote('B1'), { duration: 2, delay: startTime - now + 4 + 0.1 })
        knote.playNote(knote.makeNote('Ab1'), { duration: 2, delay: startTime - now + 6 + 0.1 })

        setTimeout(() => {
          bassLoop(startTime + 8)
        }, 1000)

      } else {
        setTimeout(() => {
          bassLoop(startTime)
        }, 1000)
      }

      return true
    }

    if (!config.bassLoop) config.bassLoop = bassLoop(now)

    let section = 0

    const midLoop = (startTime) => {
      const now = knote.audioContext.currentTime

      if (now > startTime - 2) {
        knote.playNote(knote.makeNote('Ab3'), { duration: 1.2, delay: startTime - now, gain: 0.1 })
        knote.playNote(knote.makeNote('B3'), { duration: 1.2, delay: startTime - now + 0.75, gain: 0.1 })
        knote.playNote(knote.makeNote('Fb3'), { duration: 2.25, delay: startTime - now + 1.5, gain: 0.1 })

        if (section === 0) {
          knote.playNote(knote.makeNote('Ab3'), { duration: 0.25, delay: startTime - now + 3.75, gain: 0.1 })
          knote.playNote(knote.makeNote('Ab3'), { duration: 0.25, delay: startTime - now + 4, gain: 0.1 })
          knote.playNote(knote.makeNote('B3'), { duration: 0.5, delay: startTime - now + 4.25, gain: 0.1 })
          knote.playNote(knote.makeNote('B3'), { duration: 0.25, delay: startTime - now + 4.75, gain: 0.1 })
          knote.playNote(knote.makeNote('B3'), { duration: 0.25, delay: startTime - now + 5.25, gain: 0.1 })
          knote.playNote(knote.makeNote('Ab3'), { duration: 0.25, delay: startTime - now + 5.50, gain: 0.1 })
          knote.playNote(knote.makeNote('B3'), { duration: 0.75, delay: startTime - now + 5.75, gain: 0.1 })
          knote.playNote(knote.makeNote('Ab3'), { duration: 2, delay: startTime - now + 6.5, gain: 0.1 })

          section = 1
        } else if (section === 1 || section === 2) {
          knote.playNote(knote.makeNote('B3'), { duration: 0.25, delay: startTime - now + 3.75, gain: 0.1 })
          knote.playNote(knote.makeNote('B3'), { duration: 0.25, delay: startTime - now + 4, gain: 0.1 })
          knote.playNote(knote.makeNote('Ab3'), { duration: 0.5, delay: startTime - now + 4.25, gain: 0.1 })
          knote.playNote(knote.makeNote('Ab3'), { duration: 0.25, delay: startTime - now + 4.75, gain: 0.1 })
          knote.playNote(knote.makeNote('Ab3'), { duration: 0.25, delay: startTime - now + 5.25, gain: 0.1 })
          knote.playNote(knote.makeNote('B3'), { duration: 0.25, delay: startTime - now + 5.50, gain: 0.1 })
        }


        if (section === 1) {
          knote.playNote(knote.makeNote('Ab3'), { duration: 0.75, delay: startTime - now + 5.75, gain: 0.1 })
          knote.playNote(knote.makeNote('B3'), { duration: 2, delay: startTime - now + 6.5, gain: 0.1 })

          section = 2
        } else if (section === 2) {
          knote.playNote(knote.makeNote('Ab3'), { duration: 0.25, delay: startTime - now + 5.75, gain: 0.1 })
          knote.playNote(knote.makeNote('Ab3'), { duration: 2, delay: startTime - now + 6, gain: 0.1 })

          section = 0
        }

        setTimeout(() => {
          midLoop(startTime + 8)
        }, 1000);

      } else {
        setTimeout(() => {
          midLoop(startTime)
        }, 1000);
      }

      return true
    }

    if (!config.midLoop) config.midLoop = midLoop(now + 8)

    let hiSection = 0

    const hiLoop = (startTime) => {
      const now = knote.audioContext.currentTime

      if (now > startTime - 0.5) {
        knote.playNote(knote.makeNote('Gb5'), { duration: 0.2, delay: startTime - now, gain: 0.05 })
        knote.playNote(knote.makeNote('Ab5'), { duration: 0.1, delay: startTime - now + 0.25, gain: 0.05 })
        knote.playNote(knote.makeNote('Fb6'), { duration: 0.1, delay: startTime - now + 0.5, gain: 0.05 })
        knote.playNote(knote.makeNote('B5'), { duration: 0.1, delay: startTime - now + 0.75, gain: 0.05 })

        knote.playNote(knote.makeNote('Ab5'), { duration: 0.6, delay: startTime - now + 3, gain: 0.08 })

        setTimeout(() => {
          hiLoop(startTime + 4)
        }, 250);
      } else {
        setTimeout(() => {
          hiLoop(startTime)
        }, 250);
      }

      return true
    }

    if (!config.hiLoop) config.hiLoop = hiLoop(now + 19)
  })

  const radius = 70
  const repeatCount = 2
  const repeatOffset = { x: 40, y: 0 }

  const { width, height } = rehydrate2D.canvas

  rehydrate2D.setBackgroundColor('#333')

  const { draw: drawLines } = rehydrate2D.drawRepeatingLine2({
    position: { x: 0, y: -height / 2 },
    color: '#3F3F3F',
    radius,
    points: [
      { x: 0, y: -100 },
      { x: 0, y: height + 200 }
    ],
    repeatCount,
    repeatOffset,
    patternOffset: { x: 0, y: 0 },
    crop: { top: 0, bottom: 0, right: 50, left: 50 },
    shadowBlur: 25,
    shadowColor: 'rgba(0, 0, 0, 0.6)'
  })

  const zoomTo = (scale, x = 0, y = 0) => {
    const zcx = rehydrate2D.canvas.width / 2
    const zcy = rehydrate2D.canvas.height / 2

    rehydrate2D.context.setTransform(1, 0, 0, 1, 0, 0)

    rehydrate2D.context.translate(zcx, zcy)
    rehydrate2D.context.scale(scale, scale)
    rehydrate2D.context.translate(-zcx, -zcy)

    rehydrate2D.context.translate(x, y)
  }

  let zoomLevel = 0.5
  let lightsOn = false

  zoomTo(zoomLevel)

  const darken = (opacity = 0.9) => {
    rehydrate2D.context.fillStyle = `rgba(0,0,0,${opacity})`
    rehydrate2D.context.fillRect(0, 0, width * 2, height * 2)
  }

  /* Render */

  let x = 20
  let y = 0
  let fastIn = false
  let globalDark = 1
  let stop = false

  rehydrate2D.setBackgroundColor('#000')

  rehydrate2D.context.textAlign = 'center'
    rehydrate2D.context.font = '40px sans-serif'


    rehydrate2D.context.fillStyle = `rgba(255, 255, 255, 1)`
    rehydrate2D.context.fillText('Click / Tap To Start', 500, 400);
    rehydrate2D.context.shadowBlur = 0


  const render = () => {
    if (!clicked) return
    if (x === 20) rehydrate2D.setBackgroundColor('#333')

    rehydrate2D.clear()

    if (fastIn) {
      y -= 2
      x -= 0.4
      zoomLevel += 0.01
    }

    if (x > -170) {
      x -= 0.2
    }

    zoomTo(zoomLevel, x, y)

    drawLines()

    rehydrate2D.context.fillStyle = 'rgba(0,0,0,1)'
    rehydrate2D.context.fillRect(width / 2 - 150, height - 100, 700, 800)

    const deathX = 450
    const deathY = 240

    const cureY = 350
    const cureX = 80

    if (lightsOn) darken(0.6)
    else darken(0.7)

    if (lightsOn) {
      images.death.draw(deathX - 20, deathY - 110, null, 0.67)
      images.cure.draw(cureX + 335, cureY - 20, null, 0.7)
    } else {
      images.death2.draw(deathX, deathY - 95, null, 0.68)
      images.cure2.draw(cureX + 350, cureY + 2, null, 0.68)
    }

    images.ona.draw(deathX - 385, deathY - 90, null, 0.7)
    images.ani.draw(cureX - 45, cureY + 2, null, 0.7)
    images.amp.draw(cureX + 945, cureY + 2, null, 0.7)

    if (!lightsOn) darken(0.4)

    if (x < -165 && !stop) {
      stop = true
      lightsOn = true

      setTimeout(() => {
        lightsOn = false

        setTimeout(() => {
          lightsOn = true

          setTimeout(() => {
            fastIn = true
          }, 2000)
        }, 30)
      }, 30)
    }

    if (globalDark > 0) {
      darken(globalDark)
      globalDark -= 0.002
    }
  }

  render()



  const loop = setInterval(() => {
    if (skipIntro) return transition();

    if (!fastIn) zoomLevel = 1.2
    // zoomLevel += 0.001

    render()

    if (zoomLevel > 5) {
      transition()
    }
  }, 10)

  function transition() {
    clearInterval(loop)
    rehydrate2D.context.setTransform(1, 0, 0, 1, 0, 0)
    oneArrowLevel(config, curer)
  }
}
