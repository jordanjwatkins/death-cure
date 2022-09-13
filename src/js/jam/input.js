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

  initted = true

  const onKeydown = (event) => {


    console.log('event', event);

    const { keyCode, code, key } = event

    //if (code === 'Space') config.nextLevel = true
    //else if (key === 'Shift') config.restart = true

    if (!enabled) return

    if (keyCode === 40 || key === 's') config.doDuck = true

    if (keyCode === 39 || key === 'd') { // right
      config.speed = config.walkSpeed
    } else if (keyCode === 37 || key === 'a') { // left
      config.speed = -config.walkSpeed
    }

    if (keyCode === 38 || key === 'w') {
      config.doJump = true

      config.stepHeight = 0
      //config.stepDistance = 0
    }

    config.stepHeight = 0
  }

  document.body.addEventListener('keydown', onKeydown)

  const onTap = (event) => {
    if (!enabled) return

    if (event.clientY > (window.innerHeight / 3) * 2) {
      config.doDuck = true
    } else if (event.clientY < window.innerHeight / 3) {
      config.doJump = true

      config.stepHeight = 0

    } else if (event.clientX < window.innerWidth / 2) {
      config.speed = -config.walkSpeed
    } else {
      config.speed = config.walkSpeed
    }
  }

  document.body.addEventListener('touchstart', onTap)
  document.body.addEventListener('mousedown', onTap)
}
