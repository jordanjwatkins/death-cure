//import { Pane } from 'tweakpane'
import { rehydrate2D } from '../../Rehydrate2D'
import images from '../../entities/images'

const { width, height } = rehydrate2D.canvas
const floorHeight = 200

const debug = false

let debugConfig

if (debug) {
  const pane = new Pane()

  debugConfig = { color1: '#f8694d', color2: '#ffefd7' }

  // rehydrate2D.context.fillStyle = debugConfig.color1

  pane.addInput(debugConfig, 'color1')
  pane.addInput(debugConfig, 'color2')
}

const makeOffCanvas = () => {
  const canvas = document.createElement('canvas')

  canvas.width = rehydrate2D.canvas.width
  canvas.height = rehydrate2D.canvas.height
  canvas.context = canvas.getContext('2d')

  return canvas
}

export const darkenBlack = (opacity = 0.9, offset = 0) => {
  rehydrate2D.context.fillStyle = `rgba(0,0,0,${opacity})`
  rehydrate2D.context.fillRect(offset, 0, width * 2, height * 2)
}

export const backgroundColor = () => {
  rehydrate2D.context.fillStyle = '#161c15'
  rehydrate2D.context.fillRect(0, 0, width, height)

  const config = { color: 'darkgreen', radius: 260, points: [{x: 0, y: 0},{x: 0, y: 1}], position: {x:0, y:20}, alpha: 0.1}

  config.radius = 860
  config.color = 'darkgreen'
  config.alpha = 0.1


  rehydrate2D.drawCappedLine(config)

  /*config.radius = 460
  config.color = 'darkgreen'
  config.alpha = 0.1

  rehydrate2D.drawCappedLine(config)*/

  config.radius = 260
  config.color = 'darkgreen'
  config.alpha = 0.1

  rehydrate2D.drawCappedLine(config)
}

export const glow = () => {
  const config = { color: 'white', radius: 220, points: [{x: 0, y: 0},{x: 0, y: 1}], position: {x:0, y:-20}, alpha: 0.4}

  config.radius -= Math.sin(Date.now() / 800) * 10

  rehydrate2D.drawCappedLine(config)


  config.radius = 400 - Math.sin(Date.now() / 800) * 20
  config.alpha = 0.1

  rehydrate2D.drawCappedLine(config)
}

export const floor = (x = -100, w = 300) => {
  rehydrate2D.context.fillStyle = '#214c25'
  rehydrate2D.context.fillRect(x, height - floorHeight, w, floorHeight)
}

export const ceiling = (x, y) => {
  const config = { color: '#291815', radius: 260, points: [{x: 0, y: 0},{x: 0, y: 1}], position: {x, y}, alpha: 1}

  rehydrate2D.drawCappedLine(config, {x: 500, y: 70 })
  rehydrate2D.drawCappedLine(config, {x: 350, y: 55 })
  darkenBlack(0.1)
  rehydrate2D.drawCappedLine(config, {x: 200, y: 30 })
  rehydrate2D.drawCappedLine(config, {x: 10, y: 40 })
  rehydrate2D.drawCappedLine(config, {x: -500, y: 70 })
  darkenBlack(0.1)
  rehydrate2D.drawCappedLine(config, {x: -394, y: 60 })
  rehydrate2D.drawCappedLine(config, {x: -200, y: 30 })
  //darkenBlack(0.1)
}

export const rack = (x = 0, y = 0) => {
  const scale = 0.7

  images.cureRack.draw(width / 2 - images.cureRack.canvas.width / 2 * scale, height - 190 - images.cureRack.canvas.height * scale, null, scale)
}

let offCanvasS

export const curerSilhouette = () => {
  if (!offCanvasS) {
    // offCanvas = rehydrate2D.trimCanvas(rehydrate2D.canvas)

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    offCanvasS = canvas

    canvas.width = images.curer.canvas.width
    canvas.height = images.curer.canvas.height

    // Fill with gradient
    context.fillStyle = '#000'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.globalCompositeOperation = 'destination-atop'

    context.drawImage(images.curer.canvas, 0, 0)
  }

  const canvas = offCanvasS

  // rehydrate2D.context.drawImage(canvas, 0, 0, canvas.width, canvas.height, -80, 0, rehydrate2D.canvas.width + 160, rehydrate2D.canvas.height)
  rehydrate2D.context.drawImage(canvas, 0, 0)
}

let offCanvas

export const vignette = () => {
  if (!offCanvas) {
    // offCanvas = rehydrate2D.trimCanvas(rehydrate2D.canvas)

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    offCanvas = canvas

    // Create gradient
    const gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0.000, canvas.width / 2, canvas.height / 2, canvas.width / 2)

    // Add colors
    gradient.addColorStop(0.460, 'rgba(0, 0, 0, 0.000)')
    gradient.addColorStop(1.000, 'rgba(0, 0, 0, 0.567)')

    // Fill with gradient
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const canvas = offCanvas

  rehydrate2D.context.drawImage(canvas, 0, 0, canvas.width, canvas.height, -80, 0, rehydrate2D.canvas.width + 160, rehydrate2D.canvas.height)
}
// { segLength: 0, maxSegLength: 40, direction: Math.random() > 0.5 }

let sproutCanvas
let sproutCanvas2

const updateSproutPoint = (point, context) => {
  const { curl } = point
  const speed = point.speed || 3
  const lineWidth = point.lineWidth || speed

  if (!point.started) context.fillRect(point.x, point.y, speed, speed)

  if (curl.maxSegLength > lineWidth * 2) {
    point.x += point.direction.x * Math.min(speed, lineWidth)
    point.y += point.direction.y * Math.min(speed, lineWidth)

    const dist = Math.max(Math.abs(point.direction.x), Math.abs(point.direction.y)) * speed

    if (curl.delay && curl.delay > 0) {
      if (curl.delay < 20) {
        point.direction.y = -1
        point.direction.x = 0
      } else {
        if (point.jaunt) {
          point.jaunt -= 1
        } else if (Math.random() > 0.95) {
          point.direction.x = Math.random() > 0.5 ? 1 : -1
          point.direction.y = 0
          point.jaunt = 30
        } else {
          point.direction.y = -1
          point.direction.x = 0
        }
      }

      curl.delay -= dist
    } else {
      curl.segLength += dist
    }

    if (curl.segLength >= curl.maxSegLength) {
      curl.segLength = 0
      curl.maxSegLength /= 1.3

      // console.log('turn right',point.direction.x, point.direction.y);

      ;(curl.direction) ?
        turnRight(point.direction) :
        turnLeft(point.direction)

      // console.log('turn right2', point.direction.x, point.direction.y);
    }

    // rt.batchDrawFrame('__WHITE', 0, point.x, point.y, point.alpha, point.tint)
    context.fillStyle = point.color || '#13a52e' // '#214c25' #13a52e


    if (lineWidth === speed) {
      context.fillRect(point.x, point.y, lineWidth, lineWidth)
      context.fillRect(point.x, point.y, lineWidth, lineWidth)
    } else {
      context.fillRect(point.x - lineWidth / 2,point.y - lineWidth / 2, lineWidth, lineWidth)
      context.fillRect(point.x - lineWidth / 2, point.y - lineWidth / 2, lineWidth, lineWidth)
    }


    //context.fillRect(point.x - point.direction.x * 2, point.y, speed, speed)
    //context.fillRect(point.x + point.direction.x * 2, point.y, speed, speed)
  }

  point.started = true
}

export const quickSprout = (point, front = false, lineWidth = 3) => {
  //console.log('quick sprout')

  if (!sproutCanvas) {
    sproutCanvas = makeOffCanvas()
    sproutCanvas2 = makeOffCanvas()
  }

  const { curl } = point
  const speed = 3

  const context = (front) ? sproutCanvas.context : sproutCanvas2.context

  const turnPoints = [{ x: point.x, y: point.y}]

  while (curl.maxSegLength > lineWidth * 2) {
    point.x += point.direction.x * speed
    point.y += point.direction.y * speed

    const dist = Math.max(Math.abs(point.direction.x), Math.abs(point.direction.y)) * speed

    if (curl.delay && curl.delay > 0) {
      if (curl.delay < 20) {
        point.direction.y = -1
        point.direction.x = 0
      } else {
        if (Math.random() > 0.7) {
          point.direction.x = Math.round(-1 + 2 * Math.random())
          point.direction.y = 0
        } else {
          point.direction.y = -1
        }
      }

      curl.delay -= dist
    } else {
      curl.segLength += dist
    }

    if (curl.segLength >= curl.maxSegLength) {
      curl.segLength = 0
      curl.maxSegLength /= 1.3

      ;(curl.direction) ?
        turnRight(point.direction) :
        turnLeft(point.direction)

      turnPoints.push({ x: point.x, y: point.y})
    }
  }

  context.strokeStyle = point.color
  context.lineWidth = lineWidth

  context.beginPath()

  turnPoints.forEach((turnPoint, i) => {
    const { x, y } = turnPoint

    if (!i) context.moveTo(x, y)
    else context.lineTo(x, y)
  })

  context.stroke()

  context.lineWidth = 3
}
let sproutCanvas3

export const sprout = (point, front = false, mid = false) => {
  if (!sproutCanvas) sproutCanvas = makeOffCanvas()
  if (!sproutCanvas2) sproutCanvas2 = makeOffCanvas()
  if (!sproutCanvas3) sproutCanvas3 = makeOffCanvas()

  if (front) {
    updateSproutPoint(point, sproutCanvas.context)
    //rehydrate2D.context.drawImage(sproutCanvas, 0, 0)
  } else if (mid) {
    updateSproutPoint(point, sproutCanvas3.context)
  } else {
    updateSproutPoint(point, sproutCanvas2.context)
    //rehydrate2D.context.drawImage(sproutCanvas2, 0, 0)
  }
}

function turnLeft(direction) {
  // console.log('turn left');
  let { x, y } = direction

  if (y === 0 && x === -1) {
    y = 1
    x = 0
  } else if (y === 1 && x === 0) {
    y = 0
    x = 1
  } else if (y === 0 && x === 1) {
    y = -1
    x = 0
  } else if (y === -1 && x === 0) {
    y = 0
    x = -1
  }

  Object.assign(direction, { x, y })
}

function turnRight(direction) {
  // console.log('turn right');
  let { x, y } = direction

  if (y === 0 && x === -1) {
    y = -1
    x = 0
  } else if (y === -1 && x === 0) {
    y = 0
    x = 1
  } else if (y === 0 && x === 1) {
    y = 1
    x = 0
  } else if (y === 1 && x === 0) {
    y = 0
    x = -1
  }

  Object.assign(direction, { x, y })
}

export const sprouts = (front = false, mid = false) => {
  if (front) rehydrate2D.context.drawImage(sproutCanvas, 0, 0)
  else if (mid) rehydrate2D.context.drawImage(sproutCanvas3, 0, 0)
  else rehydrate2D.context.drawImage(sproutCanvas2, 0, 0)
}

export function clearCanvases() {
  if (!sproutCanvas || !sproutCanvas2) return

  sproutCanvas.context.clearRect(0, 0, sproutCanvas.width, sproutCanvas.height)
  sproutCanvas2.context.clearRect(0, 0, sproutCanvas2.width, sproutCanvas2.height)
}

if (module.hot) {
  module.hot.dispose(() =>{
    sproutCanvas.context.clearRect(0, 0, sproutCanvas.width, sproutCanvas.height)
    sproutCanvas2.context.clearRect(0, 0, sproutCanvas2.width, sproutCanvas2.height)
  })
}
