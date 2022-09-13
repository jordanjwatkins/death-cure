let initted = false
let config
let enabled = true

export const setInputEnabled = (value) => {
  enabled = value
}

export const getInputEnabled = () => enabled

export default (newConfig) => {
  config = newConfig

  enabled = true

  if (initted) return
  console.log('init input');

  initted = true

  let { x, y, stepDistance, currentFrame, stepHeight, speed, walkSpeed, speedY, jumpSpeed, doDash } = config
  let justDown = true
  let justDown2 = true
  let quickRights = 0
  let quickLefts = 0

  const onKeydown = (event) => {
    if (!enabled) return

    const { key } = event

    setTimeout(() => {
      quickRights -= 1
      quickLefts -= 1

      if (quickRights < 0) quickRights = 0
      if (quickLefts < 0) quickLefts = 0
    }, 300)

    /* if (!justDown) {
    justDown2 = false

    doDash = true

    setTimeout(() => {
      doDash = false
    }, 500);

    return
  } */

    if (!justDown) return

    justDown = false

    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
      return
    }

    if (config.curerDead) return

    if (key === 'ArrowRight')  {
      quickRights += 1
      quickLefts = 0
    }

    if (key === 'ArrowLeft') {
      quickLefts += 1
      quickRights = 0
    }

    if (quickRights === 2 || doDash) {
      config.doDash = true

      setTimeout(() => {
        config.doDash = false

      // speed = walkSpeed
      }, 500)

      return
    }

    if (key === 'ArrowDown') {
      config.doDuck = true
    }
    // if (key === 'ArrowDown') move.y += moveSpeed
    if (key === 'ArrowRight')  {
      config.speed = config.walkSpeed
    }
    else if (key === 'ArrowLeft') config.speed = -config.walkSpeed

    if (key === 'ArrowUp') {
      config.doJump = true

      //setTimeout(() => {
       // config.doJump = false

      // speed = walkSpeed
      //}, 500)
    }

    config.stepHeight = 0
    config.stepDistance = 0
    // if (key === 'ArrowLeft') move.x -= moveSpeed

    if (key === 'ArrowRight' && config.stopDistance < 20) {
      config.stopDistance = 175
    }
  }

  const onKeyup = (event) => {
    if (!enabled) return

    const { key } = event

    if (justDown) {
      justDown2 = true

      config.doDash = false
    }

    justDown = true

    //console.log('key up', key === 'ArrowRight', config.stopDistance < 20);
    /*if (key === 'ArrowRight' && config.stopDistance < 0) {
      config.stopDistance = 175
    }*/
  }

  document.body.addEventListener('keydown', onKeydown)
  document.body.addEventListener('keyup', onKeyup)
}
