import { rehydrate2D } from '../Rehydrate2D'
import images from './images'

const baseSpeed = 5

export default class Curer {
  constructor(scale = 1) {
    this.scale = scale
    this.duckCooldown = 0
    this.maxDuckCooldown = 35

    images.jumping.offset = {
      x: (images.curer.canvas.width - images.jumping.canvas.width) / 2 + 3 * scale,
      y: -(images.curer.canvas.height - images.jumping.canvas.height) / 2
    }

    images.ducking.offset = {
      x: (images.curer.canvas.width - images.ducking.canvas.width) / 2 + 3,
      y: -(images.curer.canvas.height - images.ducking.canvas.height) / 2
    }
  }

  walk(config) {
    const { scale } = this
    const { x, y, stepDistance, currentFrame, stepHeight, speed } = config
    const { curer, walk1, walk2 } = images

    if (config.speed === 0) {
      // config.stepHeight = -40
      curer.draw(x, y)

      return { x, y }
    }

    // console.log('speed', speed);
    config.x += speed
    config.stepDistance += Math.abs(speed)

    // Step bounce
    if (this.legHealed) {
      if (stepDistance > 15 * scale) {
        config.stepHeight -= 0.5 * scale
      } else {
        config.stepHeight += 0.5 * scale
      }
    } else if (stepDistance > 20 * scale) {
      config.stepHeight -= 0.3 * scale
    } else {
      config.stepHeight = 0
    }

    // Swap walking frames
    if (stepDistance > 30 * scale || stepDistance < -30 * scale) {
      if (currentFrame) config.currentFrame = 0
      else config.currentFrame = 1

      config.stepDistance = 0
    }

    (currentFrame) ?
      walk2.draw(x, y - stepHeight) :
      walk1.draw(x, y - stepHeight)

    return { x, y: y - stepHeight }
  }

  jump(config) {
    console.log('jump')
    const { scale } = this
    const { jumping } = images
    const { x, y, walkSpeed, jumpDirection, jumpHeight } = config

    if (jumpHeight >= 50 * scale && jumpDirection === -1) {
      // Peak
      config.jumpDirection = 1
    } else if (jumpDirection === -1) {
      // Rise
      config.y -= walkSpeed * 4
      config.jumpHeight += walkSpeed * 2
    } else if (jumpHeight > 0) {
      // Fall
      config.y += walkSpeed * 4
      config.jumpHeight -= walkSpeed * 2
    } else {
      // Land
      config.doJump = false
      config.jumpDirection = -1
    }

    // if (Math.abs(config.speed) === walkSpeed) { config.x += config.speed * 2 } else { config.x += config.speed }

    jumping.draw(config.x + jumping.offset.x, config.y)

    return {
      x: config.x + jumping.offset.x, y: config.y + jumping.offset.y
    }
  }

  duck(config) {
    const { ducking } = images

    if (this.duckTime >= 0) {
      this.duckTime -= 1
    } else {
      this.duckTime = 20
    }

    if (this.duckTime === 0) {
      config.doDuck = false
      this.duckCooldown = this.maxDuckCooldown
    }

    const pos = {
      x: config.x,
      y: config.y + ducking.offset.y + ducking.canvas.height / 1.2
    }

    ducking.draw(pos.x + ducking.offset.x, pos.y)

    return pos
  }

  fall(config) {
    const { jumping } = images

    config.y += 10
    config.x += config.speed

    jumping.draw(config.x + jumping.offset.x, config.y + jumping.offset.y)

    return { x: config.x, y: config.y + jumping.offset.y }
  }

  update(config) {
    const { scale } = this
    const { doDash, doJump, doDeath, doFall, doEntry, doDuck, x, y } = config

    if (this.legHealed) {
      config.walkSpeed = baseSpeed * scale
    } else {
      config.walkSpeed = (baseSpeed * scale) / 3
    }

    if (this.speedMod) config.walkSpeed *= this.speedMod

    if (doEntry && config.xStop && x < config.xStop) {
      config.speed = config.walkSpeed
      this.canDuck = false
      this.canJump = false
    } else if (doEntry && y < config.yStop) {
      config.doFall = true
      config.speed = 0
    } else if (doEntry) {
      config.doFall = false
      config.doEntry = false
      config.speed = 0
      this.canDuck = true
      console.log('entry done')
      if (this.legHealed) this.canJump = true
    }

    if (this.duckCooldown > 0) {
      this.duckCooldown -= 1
      config.doDuck = false
    }

    let altXy

    let drewEyes = false

    if (doDeath) {
      // console.log('die');
      this.die(config)
      // drewEyes = true
    } else if (doFall) {
      altXy = this.fall(config)
    } else if (doJump && this.canJump) {
      this.jump(config)
    } else if (doDash && this.canDash) {
      this.dash(config)
    } else if (doDuck && this.canDuck && this.duckCooldown <= 0) {
      altXy = this.duck(config)
    } else if (this.shaking) {
      config.x += config.speed / 3

      return { x: config.x, y: config.y }
    } else if (!doEntry && (config.curerDead || config.curerKO)) {
      // if (config.x > entryPosition.xStop) config.x -= config.walkSpeed / 2
      if (!this.deathSlideTime && this.deathSlideTime !== 0) this.deathSlideTime = 50

      this.deathSlideTime -= 1

      if (this.deathSlideTime > 0) config.x += config.speed * this.deathSlideTime / 50

      altXy = { x: config.x - 10 * scale, y: config.y + 30 * scale }
      images.splits.draw(altXy.x - 20 * scale, altXy.y)
      if (!this.legHealed) images.splitsDeadLeg.draw(altXy.x - 26 * scale, altXy.y + 232)
    } else altXy = this.walk(config)

    const out = (altXy) || { x: config.x, y: config.y }

    if (!this.finalForm) images.mark.draw(out.x + 40 * scale, out.y + 40 * scale)

    if (config.curerDead) {
      this.eyesDead(out)
      drewEyes = true
    }

    if (config.curerKO) {
      this.eyesClosed(out)
      drewEyes = true
    }

    this.mouth(out)

    if (!drewEyes) this.eyes(out)

    if (!this.legHealed && !config.curerDead && !config.curerKO) this.deadLeg(out)

    this.horns(out)

    return out
  }

  revive(config) {
    this.deathSlideTime = 0
    config.curerDead = false
    config.curerKO = false
  }

  eyes({ x, y }, alpha = 1) {
    const { canvas, context } = rehydrate2D.getRenderer()
    const { scale } = this

    if (alpha !== 1) context.globalAlpha = alpha

    images.eyes.draw(x + 48 * scale, y + 20 * scale)

    if (alpha !== 1) rehydrate2D.context.globalAlpha = 1
  }

  mouth({ x, y }, alpha = 1) {
    const { canvas, context } = rehydrate2D.getRenderer()
    const { scale } = this

    if (alpha !== 1) context.globalAlpha = alpha

    images.curerMouth.draw(x + 55 * scale, y + 70 * scale)

    if (alpha !== 1) rehydrate2D.context.globalAlpha = 1
  }

  eyesClosed({ x, y }, alpha = 1) {
    const { context } = rehydrate2D.getRenderer()
    const { scale } = this

    if (alpha !== 1) context.globalAlpha = alpha

    images.eyesClosed.draw(x + 48 * scale, y + 40 * scale)

    if (alpha !== 1) context.globalAlpha = 1
  }

  eyesDead({ x, y }, alpha = 1) {
    const { scale } = this

    if (alpha !== 1) rehydrate2D.context.globalAlpha = alpha

    images.eyesDead.draw(x + 34 * scale, y + 20 * scale)

    if (alpha !== 1) rehydrate2D.context.globalAlpha = 1
  }

  deadLeg({ x, y }, alpha = 1, flash = false) {
    const { context } = rehydrate2D.getRenderer()
    const { scale } = this

    if (alpha !== 1) context.globalAlpha = alpha

    if (flash) {
      images.deadLegFlash.draw(x + 34 * scale, y + images.curer.canvas.height - images.deadLeg.canvas.height)
    } else {
      images.deadLeg.draw(x + 34 * scale, y + images.curer.canvas.height - images.deadLeg.canvas.height)
    }

    if (alpha !== 1) context.globalAlpha = 1
  }

  horns({ x, y }) {
    const { scale } = this

    if (this.finalForm) {
      images.horns.draw(x - 84 * scale, y - 10)
      images.horns.drawFlipped(x + 123 * scale, y - 10)
    } else {
      images.hornsCorrupted.draw(x - 28 * scale, y)
      images.hornsCorrupted.drawFlipped(x + 120 * scale, y)
    }
  }
}
