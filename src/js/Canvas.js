// import images from './images'
import ImageFx from './libs/ImageFx'

class MainCanvas {
  constructor({ width = 200, height = 200 } = {}) {
    this.canvas = document.createElement('canvas')

    this.canvas.width = width
    this.canvas.height = height

    Object.assign(this.canvas.style, {
      width: '300px',
      // height: '768px',
      aspectRatio: 1024 / 768,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      display:'none'
    })

    this.context = this.canvas.getContext('2d')

    // this.canvas.style.backgroundColor = '#639bff'

    //this.canvas.style.backgroundColor = '#1d0b15'

    this.context.imageSmoothingEnabled = false

    this.imageFx = new ImageFx(this.canvas, this.context)
  }

  get scaleInDom() {
    return this.canvas.clientWidth / this.canvas.width
  }

  get width() {
    return this.canvas.width
  }

  get height() {
    return this.canvas.height
  }

  get boundingRect() {
    const boundingRect = this.canvas.getBoundingClientRect()

    // Support for Edge
    if (Number.isFinite(boundingRect.left)) {
      const { left, top, width, height } = boundingRect

      return {
        x: left,
        y: top,
        width,
        height
      }
    }

    return boundingRect
  }

  set opacity(value) {
    if (value < 0) value = 0
    if (value > 1) value = 1

    this.context.globalAlpha = value
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /*
    wombat
  testRect(color) {
    this.context.fillStyle = color || '#000'

    this.context.fillRect(0, 0, 40, 20)
  }

  transform(thing) {
    this.context.translate(thing.x, thing.y + (thing.height / 2))

    if (thing.scaleX) this.flipX(thing)
    if (thing.rotation) this.rotateThing(thing)

    this.context.translate(-thing.x, -thing.y - (thing.height / 2))
  }

  flipX(thing) {
    this.context.scale(thing.scaleX, 1)
  }

  rotateThing(thing) {
    this.context.rotateThing(thing.rotation * (Math.PI / 180))
  } */

  drawRect({ x, y, color, width = 30, height = 60 }) {
    this.context.fillStyle = color || '#000'

    this.context.fillRect(x, y, width, height)
  }

  drawThing(thing, frame = 0) {
    if (thing.spriteName) return// wombat thing.sprite = images[thing.spriteName]

    if (!thing.sprite) return

    const spriteX = thing.x - (thing.width / 2)
    const spriteY = thing.y - (thing.height / 2)

    this.context.drawImage(
      thing.sprite,

      // sprite frame box
      frame * thing.frameWidth + thing.frameOffset, 0, thing.frameWidth, thing.frameHeight,

      // position in world
      spriteX, spriteY,

      // dimensions in world
      thing.width, thing.height,
    )
  }

  drawVignette() {
    this.imageFx.vignette()
  }

  drawNoise() {
    this.noiseCount = this.noiseCount || 1
    this.noiseSpeed = 5 // # of renders per noise update

    // don't update the noise every frame
    if (this.noiseCount > this.noiseSpeed) {
      // randomize render offset to make one frame of noise seem like several
      this.noiseOffsetX = Math.round(Math.random() * 30)
      this.noiseOffsetY = Math.round(Math.random() * 30)

      this.noiseCount = 0
    }

    this.imageFx.noise(this.noiseOffsetX, this.noiseOffsetY)

    this.noiseCount += 1
  }

  isClickHit(event, clickRect, scale = 1) {
    const canvasRect = this.boundingRect

    // console.log('bounding',this.boundingRect, this.boundingRect.y);

    // console.log('lick hit y1', event.pageY, canvasRect.y + clickRect.y + clickRect.height, event.pageY < canvasRect.y + clickRect.y + clickRect.height);
    // console.log('lick hit y2', event.pageY, canvasRect.y + clickRect.y, event.pageY > canvasRect.y + clickRect.y);

    // console.log(event.pageY, canvasRect.y, clickRect.y, scale);

    return (
      event.pageY < canvasRect.y + clickRect.y * scale + clickRect.height * scale &&
      event.pageY > canvasRect.y + clickRect.y * scale &&
      event.pageX < canvasRect.x + clickRect.x * scale + clickRect.width * scale &&
      event.pageX > canvasRect.x + clickRect.x * scale
    )
  }

  clickCoords = (event) => {
    const canvasRect = this.boundingRect

    return (this.debug) ?
      {
        x: Math.round(event.pageX - canvasRect.x),
        y: Math.round(event.pageY - canvasRect.y),
        unscaledX: Math.round((event.pageX - canvasRect.x) / this.scaleInDom),
        unscaledY: Math.round((event.pageY - canvasRect.y) / this.scaleInDom)
      } :
      {
        x: event.pageX - canvasRect.x,
        y: event.pageY - canvasRect.y,
        unscaledX: (event.pageX - canvasRect.x) / this.scaleInDom,
        unscaledY: (event.pageY - canvasRect.y) / this.scaleInDom
      }
  }

  clickAreaDebug(clickRect, offset = 2) {
    return () => {
      this.context.setTransform(1, 0, 0, 1, 0, 0)

      const { x, y, width, height } = clickRect

      this.drawRect({
        x: x - offset,
        y: y - offset,
        width: width + offset * 2,
        height: height + offset * 2,
        color: 'red'
      })
    }
  }

  drawSelectedRect(srcRect, offset, lineWidth, color, lineDashOffset) {
    this.imageFx.drawSelectedRect(srcRect, offset, lineWidth, color, lineDashOffset)
  }

  drawSelectedRect2(srcRect, offset, lineWidth, color, lineDashOffset) {
    this.imageFx.drawSelectedRect2(srcRect, offset, lineWidth, color, lineDashOffset)
  }

  makeScanlines(vh, vw) {
    const lines = []
    let y = 0

    while (y < vh * 2) {
      const line = {
        start: [0, y],
        end: [vw * 2, y],
        width: 3
      }

      y += 7

      lines.push(line)
    }

    return lines
  }

  drawRollingLineReversed() {
    const { canvas, context } = this

    const vh = canvas.height
    const vw = canvas.width

    const m = context.moveTo.bind(context)
    const l = context.lineTo.bind(context)
    const bp = context.beginPath.bind(context)
    const cp = context.closePath.bind(context)

    context.save()

    context.globalAlpha = 0.05

    context.lineWidth = vh / 8
    context.strokeStyle = '#FFF'

    if (this.rollY2 === undefined) this.rollY2 = vh + 200

    if (this.rollY2 < -200) this.rollY2 = vh + 200

    this.rollY2 -= 10

    const y = this.rollY2

    bp()
    m(0, y)
    l(vw, y)
    m(0, y + vh / 4)
    l(vw, y + vh / 4)
    cp()

    context.stroke()

    context.restore()
  }

  drawScanlines() {
    if (this.scanlinesCanvas) {
      this.context.drawImage(this.scanlinesCanvas, 0, 0)

      return
    }

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = this.canvas.width
    canvas.height = this.canvas.height

    const vh = canvas.height
    const vw = canvas.width

    const m = context.moveTo.bind(context)
    const l = context.lineTo.bind(context)
    const bp = context.beginPath.bind(context)
    const cp = context.closePath.bind(context)

    context.save()

    context.setTransform(1, 0, 0, 1, 0, 0)
    context.scale(0.5, 0.5)

    context.globalAlpha = 0.2

    context.lineWidth = '0.1'
    context.strokeStyle = '#000'

    this.scanlines = this.scanlines || this.makeScanlines(vh, vw)

    this.scanlines.forEach((line) => {
      context.lineWidth = line.width

      bp()

      m(line.start[0], line.start[1])
      l(line.end[0], line.end[1])
      cp()

      context.stroke()
    })

    context.restore()

    this.scanlinesCanvas = canvas
  }

  drawTriangleFromPoints(points, scale, flip = false) {
    const { context } = this

    this.colorPrimary = this.colorPrimary || '#FFF'

    this.globalAlpha = this.globalAlpha || 0.2

    if (Math.random() > 0.2) this.globalAlpha = '0.2'
    if (Math.random() > 0.9) this.globalAlpha = '0.25'
    if (Math.random() > 0.9) this.globalAlpha = '0.3'

    context.save()

    context.globalAlpha = this.globalAlpha

    const [{ x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 }] = points

    // context.translate(x1, y1)

    if (flip) context.scale(1, -1)

    context.lineWidth = 3
    context.strokeStyle = this.colorPrimary
    context.fillStyle = this.colorPrimary

    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.lineTo(x3, y3)
    context.closePath()

    // context.stroke()
    context.fill()

    context.restore()
  }
}

export default MainCanvas
