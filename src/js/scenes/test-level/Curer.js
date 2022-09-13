import { rehydrate2D } from '../../Rehydrate2D'
import { fetchAndRehydrate, getSave } from '../../saves'

export default class Curer {
  constructor(config = {}) {
    this.scale = config.scale || 1

    this.initialized = this.init()
  }

  async init() {
    const { scale } = this

    console.log('curer scale', scale);
    //const scale = 0.5

    const stand = await fetchAndRehydrate('curer', scale)
    const splits = await fetchAndRehydrate('curer-splits', scale)
    const walk1 = await fetchAndRehydrate('curer-walk1', scale)
    const walk2 = await fetchAndRehydrate('curer-walk2', scale)
    const dashing = await fetchAndRehydrate('curer-dash', scale)
    const jumping = await fetchAndRehydrate('curer-jump', scale)
    const eyes = await fetchAndRehydrate('CurerEyes', scale)
    const eyesDead = await fetchAndRehydrate('CurerEyesDead', scale)
    const eyesClosed = await fetchAndRehydrate('CurerEyesClosed', scale)
    const ducking = await fetchAndRehydrate('curer-duck', scale)
    const mark = await fetchAndRehydrate('curer-mark', scale)
    const deadLeg = await fetchAndRehydrate('dead-leg', scale)
    const deadLegFlash = await fetchAndRehydrate('dead-leg-flash', scale)
    const horns = await fetchAndRehydrate('curer-horns', scale)
    const hornsCorrupted = await fetchAndRehydrate('curer-horns-corrupted', scale)

    jumping.offset = {
      x: (stand.canvas.width - jumping.canvas.width) / 2 + 3 * scale,
      y: -(stand.canvas.height - jumping.canvas.height) / 2
    }

    ducking.offset = {
      x: (stand.canvas.width - ducking.canvas.width) / 2 + 3,
      y: -(stand.canvas.height - ducking.canvas.height) / 2
    }

    this.images = {
      stand,
      walk1,
      walk2,
      dashing,
      jumping,
      eyes,
      eyesDead,
      splits,
      ducking,
      mark,
      deadLeg,
      deadLegFlash,
      horns,
      hornsCorrupted,
      eyesClosed
    }

    this.canDuck = true
    this.canJump = true

    const { canvas, context } = rehydrate2D.getRenderer()

    this.canvas = canvas
    this.context = context
  }

  walk(config) {
    const { scale } = this
    const { x, y, stepDistance, currentFrame, stepHeight, speed, walkSpeed } = config
    const { stand, walk1, walk2 } = this.images

    if (config.speed === 0) {
      stand.draw(x, y)

      return { x, y }
    }

    if (config.stopDistance) {
      config.stopDistance -= walkSpeed
      // console.log('stop disance',config.stopDistance);
      if (config.stopDistance < 0) {
        config.speed = 0
        // config.stopDistance = 0
      }
    }

    config.x += speed
    config.stepDistance += speed

    // console.log(stepDistance);

    if (stepDistance > 30 * scale || stepDistance < -30 * scale) {
      if (currentFrame) config.currentFrame = 0
      else config.currentFrame = 1

      config.stepDistance = 0
    }

    if (stepDistance > 0) {
      if (stepDistance > 15 * scale) {
        config.stepHeight -= 0.5  * scale
      } else {
        config.stepHeight += 0.5  * scale
      }
    } else if (stepDistance < -15 * scale ) {
      config.stepHeight -= 0.5  * scale
    } else {
      config.stepHeight += 0.5  * scale
    }

    if (currentFrame) {
      // walk2.draw(x,y + stepDistance/5)
      walk2.draw(x, y - stepHeight)
    } else {
      walk1.draw(x, y - stepHeight)
    }

    return { x, y: y - stepHeight }
  }

  dash(config) {
    const { dashing, stand } = this.images
    const { x, y, walkSpeed } = config

    if (this.legHealed) {
      config.speed = walkSpeed * 3

      config.x += config.speed

      dashing.draw(x, y)
    } else {
      console.log('broke dash');
      config.x += config.speed * 3

      stand.draw(x, y)
    }


  }

  jump(config) {
    const { scale } = this
    const { jumping } = this.images
    const { x, y, walkSpeed, jumpDirection, jumpHeight } = config

    if (jumpHeight >= 50 * scale && jumpDirection === -1) {
      config.jumpDirection = 1
    } else if (jumpDirection === -1) {
      config.y -= walkSpeed * 4
      config.jumpHeight += walkSpeed * 2
    } else if (jumpHeight > 0) {
      // console.log('falling');
      config.y += walkSpeed * 4
      config.jumpHeight -= walkSpeed * 2
    } else {
      config.doJump = false
      //config.canJump = false
      config.jumpDirection = -1
    }

    if (Math.abs(config.speed) === walkSpeed) { config.x += config.speed * 2 } else { config.x += config.speed }

    // config.x += walkSpeed

    // jumping.draw(config.x + jumping.offset.x, config.y + jumping.offset.y)

    jumping.draw(config.x + jumping.offset.x, config.y)

    return {
      x: config.x + jumping.offset.x, y: config.y + jumping.offset.y
    }
  }

  duck(config) {
    const { ducking } = this.images

    if (this.duckTime >= 0) {
      this.duckTime -= 1
    } else {
      this.duckTime = 15
    }

    if (this.duckTime === 0) {
      config.doDuck = false
    }

    //const { x, y } = config.x + ducking.offset.x

    const pos =  {
      x: config.x,
      y: config.y + ducking.offset.y + ducking.canvas.height / 1.2
    }

    ducking.draw(pos.x + ducking.offset.x, pos.y)

    return pos
  }

  die(config) {
    const { jumping } = this.images

    config.y -= 10

    rehydrate2D.context.globalAlpha = 0.3
    jumping.draw(config.x + jumping.offset.x, config.y + jumping.offset.y)
    rehydrate2D.context.globalAlpha = 1

    //this.eyesDead({ x: config.x, y: config.y- 20 })
  }

  fall(config) {
    const { jumping } = this.images

    config.y += 10
    config.x += config.speed

    jumping.draw(config.x + jumping.offset.x, config.y + jumping.offset.y)
  }

  shake(config) {
    const { scale } = this

    if (!this.canShake) return

    this.shaking = true

    const { stand, eyesDead } = this.images
    const { height, width } = config

    const curerShapesOffset = {
      x: (stand.canvas.width - width) / 2, // + jumping.offset.x,
      y: -(height - stand.canvas.height) / 2// - jumping.offset.y
    }

    const curerShapesOffsets = (x, y) => stand.data.map(() => ({ x: curerShapesOffset.x + x, y: curerShapesOffset.y + y, speedX: -2 + Math.random() * 4, speedY: -2 + Math.random() * 4 }))

    const offsets = curerShapesOffsets(config.x, config.y)

    offsets.forEach((offset) => {
      // if (offset.y > 200) return
      offset.x += -7  * scale + Math.random() * 14  * scale// + config.x - width / 2 + 60 //offset.speedX * 20
      offset.y += -7  * scale + Math.random() * 14  * scale// + config.y - height / 2 + 160//- deathTime //offset.speedY * 20
    })

    rehydrate2D.drawFromShapesConfigs(stand.data, offsets)
    rehydrate2D.drawFromShapesConfigs(eyesDead.data, offsets)
  }

  updateOneArrow(config) {
    const { scale } = this
    const { doDash, doJump, doDeath, doFall, doEntry, doDuck, x, y } = config

    if (this.legHealed) {
      config.walkSpeed = 3 * scale
    } else {
      config.walkSpeed = (3 * scale) / 4
    }

    if (doEntry && x < config.xStop) {
      config.speed = config.walkSpeed
    } else if (doEntry && y < config.yStop){
      config.doFall = true
    } else if (doEntry) {
      config.doFall = false
      config.doEntry = false
      config.speed = 0
    }

    let altXy

    let drewEyes = false

    if (doDeath) {
      // console.log('die');
      this.die(config)
      //drewEyes = true
    } else if (doFall) {
      this.fall(config)
    } else if (doJump && this.canJump) {
      this.jump(config)
    } else if (doDash && this.canDash) {
      this.dash(config)
    } else if (doDuck && this.canDuck) {
      altXy = this.duck(config)
    } else if (this.shaking) {
      config.x += config.speed / 3
      return { x: config.x, y: config.y }
    } else {
      if (!doEntry && (config.curerDead || config.curerKO)) {
        //if (config.x > entryPosition.xStop) config.x -= config.walkSpeed / 2
        if (!this.deathSlideTime && this.deathSlideTime !== 0) this.deathSlideTime = 50

        this.deathSlideTime -= 1

        if (this.deathSlideTime > 0) config.x -= config.walkSpeed * this.deathSlideTime / 50

        altXy = { x: config.x - 10 * scale, y: config.y + 30  * scale}
        this.images.splits.draw(altXy.x - 20  * scale, altXy.y)
      } else altXy = this.walk(config)
    }

    const out = (altXy) || { x: config.x, y: config.y }

    this.images.mark.draw(out.x + 40 * scale, out.y + 40 * scale)

    if (config.curerDead) {
      this.eyesDead(out)
      drewEyes = true
    }

    if (config.curerKO) {
      this.eyesClosed(out)
      drewEyes = true
    }

    if (!drewEyes) this.eyes(out)

    //this.deadLeg( { x: config.x, y: config.y })

    if (!this.legHealed) this.deadLeg(out)

    this.horns(out)

    return out
  }

  update(config, entryPosition, width, height) {
    const { doDash, doJump, doDeath, doFall, doEntry, doDuck, x, y } = config

    const { canvas, context } = rehydrate2D.getRenderer()

    if (doEntry && x < config.xStop) {
      config.speed = config.walkSpeed
    } else if (doEntry) {
      config.doEntry = false
      config.speed = 0
    }

    if (x > 400 && config.jumpHeight < 1 && x < 410) {
      // console.log('falls');
      config.doFall = true
      config.speed = 0
    }

    if (y > height) {
      // config.doFall = false
      config.doDeath = true
    }

    if (y < -900) {
      // config.doFall = false
      config.doDeath = false
      config.doFall = false
      config.x = entryPosition.x
      config.y = entryPosition.y
      config.doEntry = true
    }

    let altXy

    let drewEyes = false

    if (doDeath) {
      // console.log('die');
      this.die(config)
      //drewEyes = true
    } else if (doFall) {
      this.fall(config)
    } else if (doJump && this.canJump) {
      this.jump(config)
    } else if (doDash) {
      this.dash(config)
    } else if (doDuck && this.canDuck) {
      altXy = this.duck(config)
    } else if (this.shaking) {
      return { x: config.x, y: config.y }
    } else {
      if (!doEntry && config.curerDead) {
        //if (config.x > entryPosition.xStop) config.x -= config.walkSpeed / 2
        if (!this.deathSlideTime && this.deathSlideTime !== 0) this.deathSlideTime = 50

        this.deathSlideTime -= 1

        if (this.deathSlideTime > 0) config.x -= config.walkSpeed * this.deathSlideTime / 50

        altXy = { x: config.x - 10, y: config.y + 20 }
        this.images.splits.draw(altXy.x - 20, altXy.y)
      } else altXy = this.walk(config)
    }

    const out = (altXy) || { x: config.x, y: config.y }

    this.images.mark.draw(out.x + 40, out.y + 40)

    if (config.curerDead) {
      this.eyesDead(out)
      drewEyes = true
    }

    if (!drewEyes) this.eyes(out)

    return out
  }

  eyes({ x, y }, alpha = 1) {
    const { canvas, context } = rehydrate2D.getRenderer()
    const { scale } = this

    if (alpha !== 1) context.globalAlpha = alpha

    this.images.eyes.draw(x + 48 * scale, y + 20 * scale)

    if (alpha !== 1) rehydrate2D.context.globalAlpha = 1
  }

  eyesClosed({ x, y }, alpha = 1) {
    const { context } = rehydrate2D.getRenderer()
    const { scale } = this

    if (alpha !== 1) context.globalAlpha = alpha

    this.images.eyesClosed.draw(x + 48 * scale, y + 40 * scale)

    if (alpha !== 1) context.globalAlpha = 1
  }

  eyesDead({ x, y }, alpha = 1) {
    const { scale } = this

    if (alpha !== 1) rehydrate2D.context.globalAlpha = alpha

    this.images.eyesDead.draw(x + 34 * scale, y + 20 * scale)

    if (alpha !== 1) rehydrate2D.context.globalAlpha = 1
  }

  deadLeg({ x, y }, alpha = 1, flash = false) {
    const { context } = rehydrate2D.getRenderer()
    const { scale } = this

    if (alpha !== 1) context.globalAlpha = alpha

    if (flash) {
      this.images.deadLegFlash.draw(x + 34 * scale, y + this.images.stand.canvas.height - this.images.deadLeg.canvas.height + 5)
    } else {
      this.images.deadLeg.draw(x + 34 * scale, y + this.images.stand.canvas.height - this.images.deadLeg.canvas.height + 5)

    }

    if (alpha !== 1) context.globalAlpha = 1
  }

  horns({ x, y }) {
    const { scale } = this

    //this.images.horns.draw(x - 80 * scale, y - 10)
    //this.images.horns.drawFlipped(x + 120 * scale, y - 10)

    this.images.hornsCorrupted.draw(x - 28 * scale, y)
    this.images.hornsCorrupted.drawFlipped(x + 120 * scale, y)
  }
}
