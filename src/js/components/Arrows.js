import { fetchAndRehydrate } from '../saves'
import CloudPoof from './CloudPoof'

export default class Arrows {
  constructor() {
    this.image = fetchAndRehydrate('arrow')
    this.launcherImage = fetchAndRehydrate('launcher')
    this.arrows = []
    this.arrowSpeed = 15
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

    await poof.createPoof(x + 25, y - 50)

    setTimeout(() => {
      if (poof) arrow.poof = poof
      this.arrows.push(arrow)

      setTimeout(() => {

        arrow.drawLauncher = () => this.launcherImage.draw(arrow.startX - 10, arrow.y - this.launcherImage.canvas.height / 4, null, 0.6)

        setTimeout(() => {
          arrow.speedX = -25

          setTimeout(() => {
            arrow.drawLauncher = () => {}
            poof.resetPoof()
          }, 500);
        }, 1000);
      }, 200);
    }, delay);


  }

  update(config, curerPos, curer) {
    const { doJump, doDuck } = config

    this.arrows.forEach((arrow) => {
      arrow.x += arrow.speedX

      //this.launcherImage.draw(arrow.startX + 500, arrow.y + 141, null, 0.6)

      //this.launcherImage.draw(arrow.startX + 40, arrow.y - this.launcherImage.canvas.height / 4, null, 0.6)
      if (arrow.drawLauncher) arrow.drawLauncher()

      if (arrow.x < curerPos.x + 200 && arrow.wasDodged === null) {
        if (arrow.type === 'jump' && doJump) {
            arrow.wasDodged = true
            curer.canJump = true
            config.speed = 0

            //setTimeout(() => {
             // if (!curer.doDuck) return curer.canDuck = false

             // curer.canJump = false
              //config.doJump = false
              //config.doJump = false
            //}, 600)

            //setTimeout(() => {
              // if (!curer.doDuck) return curer.canDuck = false

               //curer.canJump = false
               //if (!curer.canJump) config.doJump = false
            // }, 900)

        } else if (arrow.type === 'duck' && doDuck) {
          arrow.wasDodged = true
          curer.canDuck = true
          config.speed = 0

          //setTimeout(() => {
          //  if (!curer.doDuck) return curer.canDuck = false

          //  curer.canDuck = false
          //  config.doDuck = false
          //}, 500)
        } else {
          arrow.wasDodged = false
          //curer.canDuck = false
          //curer.canJump = false
          //if (!config.curerDead) curer.canDuck = true
        }
      }

      if (arrow.x < curerPos.x + 100 && !arrow.wasDodged) {
        if (!arrow.hit) {
          arrow.hit = true
          curer.deathSlideTime = curer.deathSlideTime || 50
          curer.deathSlideTime += 15
          curer.canDuck = false

          arrow.stickY = curerPos.y

          //if (doDuck) arrow.stickY -= 100

          //setTimeout(() => {
          //  config.doDuck = false
          //}, 500)
        }



        let cropX = curerPos.x + 100 - arrow.x

        if (cropX > 100) cropX = 100

         // took an arrow to the [insert wound area here]

        if (cropX === 100) {
          config.curerDead = true
          //config.doJump = false
          config.jumpDirection = 1
          config.speed = -2
          config.doDuck = false
          config.canDuck = false
        }

        //console.log('stick diff', curerPos.y, arrow.stickY, curerPos.y - arrow.stickY);

        if (arrow.drawLauncher && arrow.flipped) this.image.drawFlipped(curerPos.x + 100, arrow.y + (curerPos.y - arrow.stickY), { x: cropX })
        if (arrow.drawLauncher && !arrow.flipped) this.image.draw(curerPos.x + 100, arrow.y + (curerPos.y - arrow.stickY), { x: cropX })
      } else {
        if ( arrow.drawLauncher && arrow.flipped) this.image.drawFlipped(arrow.x, arrow.y)
        if ( arrow.drawLauncher && !arrow.flipped) this.image.drawFlipped(arrow.x, arrow.y)
      }

      if (arrow.poof) arrow.poof.updatePoof()
    })
  }
}
