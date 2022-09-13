import { rehydrate2D } from '../../Rehydrate2D'
//import { Pane } from 'tweakpane'

const { width, height } = rehydrate2D.canvas
const floorHeight = 200

const debug = false

if (debug) {
  const pane = new Pane()

  const debugConfig = { color1: '#f8694d', color2: '#ffefd7' }

  // rehydrate2D.context.fillStyle = debugConfig.color1

  pane.addInput(debugConfig, 'color1')
  pane.addInput(debugConfig, 'color2')
}

export const darkenBlack = (opacity = 0.9, offset = 0) => {

  rehydrate2D.context.fillStyle = `rgba(0,0,0,${opacity})`
  rehydrate2D.context.fillRect(offset, 0, width * 2, height * 2)
}

export const floor = (x = -100, w = 300) => {
  rehydrate2D.context.fillStyle = `#927777`
  rehydrate2D.context.fillRect(x, height - floorHeight, w, floorHeight)
}

export const walls = (x = 0, y = 0) => {
  const tw = 50
  const th = 50

  for (let i = 0; i < Math.ceil(width / tw); i++) {
    for (let j = 0; j < Math.ceil(height / th); j++) {
      const tx = x + i * tw
      const ty = y + j * th

      rehydrate2D.context.fillStyle = (j % 2 && !(i % 2) || !(j % 2) && (i % 2)) ? '#f8694d' : '#ffefd7'
      //rehydrate2D.context.fillStyle = (j % 2 && !(i % 2) || !(j % 2) && (i % 2)) ? debugConfig.color1 : debugConfig.color2


      rehydrate2D.context.fillRect(tx, ty, tw, th)
    }
  }
}

export const floorCheckers = (x = -100, w = 300) => {
  const tw = 50
  const th = 14

  for (let i = 0; i < Math.ceil(w / tw); i++) {
    const tx = x + i * 50

    rehydrate2D.context.fillStyle = (i % 2) ? `rgba(255,255,255,1)` : `rgba(0,0,0,1)`
    rehydrate2D.context.fillRect(tx, height - floorHeight, tw, th)
  }
}
