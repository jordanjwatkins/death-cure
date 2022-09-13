import { knote } from '../../components/JamKnote'
import CloudPoof from './CloudPoof'
import images from './images'

export default class Arrows {
  constructor() {
    this.arrows = []
    this.arrowSpeed = 25
  }

  async fireArrow(x, y, type, delay = 1000, flipped = true) {
    this.image = await this.image
    this.launcherImage = await this.launcherImage

    const arrow = {
      x,
      y,
      wasDodged: null,
      startX: x,
      speedX: 0,
      type,
      flipped
    }

    const poof = new CloudPoof()

    await poof.createPoof(x + 25, y - 50, { startAlpha: 1 })

    setTimeout(() => {
      if (poof) arrow.poof = poof
      this.arrows.push(arrow)

      knote.fireNoise()


      setTimeout(() => {
        arrow.drawLauncher = (flipped) ?
          () => images.launcher.draw(arrow.startX - 10, arrow.y - images.launcher.canvas.height / 4, null, 0.6) :
          () => images.launcher.drawFlipped(arrow.startX + 10, arrow.y - images.launcher.canvas.height / 4, null, 0.6)

        setTimeout(() => {
          arrow.speedX = this.arrowSpeed * ((flipped) ? -1 : 1)

          setTimeout(() => {
            poof.resetPoof()
            knote.fireNoise()


            setTimeout(() => {
              arrow.drawLauncher = () => {}
            }, 100)
          }, 500)
        }, 1000)
      }, 200)
    }, delay)
  }

  hitUpdate(config, curerPos, curer, arrow,) {
    const { doJump } = config

    if (!arrow.hit) {
      arrow.hit = true

      curer.deathSlideTime = curer.deathSlideTime || 50
      curer.deathSlideTime += 15

      curer.canDuck = false

      if (doJump) {
        arrow.stickY = curerPos.y
      } else {
        arrow.stickY = config.y
      }
    }


    let cropX

    if (arrow.flipped) {
      cropX = curerPos.x + 100 - arrow.x

      if (cropX > 100) cropX = 100

      // took an arrow to the [insert wound area here]

      if (cropX === 100) {
        config.curerDead = true
        // config.doJump = false
        config.jumpDirection = 1
        config.speed = -2
        config.doDuck = false
        config.canDuck = false
      }

      //console.log('crop x', cropX)
    } else {
      cropX = curerPos.x - 100 - 100 - arrow.x

      if (cropX < -100) cropX = -100

      //console.log('crop x', cropX)


      // took an arrow to the [insert wound area here]

      if (cropX === -100) {
        config.curerDead = true
        // config.doJump = false
        config.jumpDirection = 1
        config.speed = 2
        config.doDuck = false
        config.canDuck = false
      }
    }

    // console.log('stick diff', curerPos.y, arrow.stickY, curerPos.y - arrow.stickY);

    if (arrow.drawLauncher && arrow.flipped) images.arrow.drawFlipped(curerPos.x + 100, arrow.y + (curerPos.y - arrow.stickY), { x: cropX })
    if (arrow.drawLauncher && !arrow.flipped) images.arrow.draw(curerPos.x - 20, arrow.y + (curerPos.y - arrow.stickY), { x: cropX })
  }

  dodgeCheck(config, curerPos, curer, arrow) {
    const { doJump, doDuck } = config

    if (arrow.type === 'jump' && doJump && config.legHealed) {
      arrow.wasDodged = true
      curer.canJump = true
      config.speed = 0
      knote.fireNoise()
    } else if (arrow.type === 'duck' && (doDuck || curer.duckCooldown >= curer.maxDuckCooldown - 2 )) {
      //console.log('duck dodged')
      knote.fireNoise()
      arrow.wasDodged = true
      curer.canDuck = true
      config.speed = 0
    } else {
      //console.log('not dodged', curerPos.y, config.y)
      arrow.wasDodged = false
      curer.canDuck = false
      curer.canJump = false
    }
  }

  update(...args) {
    const [config, curerPos] = args
    const { doFall } = config

    this.arrows.forEach((arrow) => {
      arrow.x += arrow.speedX

      if (arrow.drawLauncher) arrow.drawLauncher()

      if (doFall) arrow.wasDodged = true

      if (
        (
          (arrow.flipped && arrow.x < curerPos.x + 150) ||
          (!arrow.flipped && arrow.x > curerPos.x - 150)
        ) &&
        arrow.wasDodged === null
      ) {
        this.dodgeCheck(...args, arrow)
      }

      if (((arrow.flipped && arrow.x < curerPos.x + 100) || (!arrow.flipped && arrow.x > curerPos.x - 100)) && !arrow.wasDodged) {
        this.hitUpdate(...args, arrow)
      } else {
        if (arrow.drawLauncher && arrow.flipped) images.arrow.drawFlipped(arrow.x, arrow.y)
        if (arrow.drawLauncher && !arrow.flipped) images.arrow.draw(arrow.x, arrow.y)
      }

      if (arrow.poof) arrow.poof.updatePoof()
    })
  }
}
