const savedCanvases = {}
const savedScaledCanvases = {}

let useScaledCanvas = false

export default class Rehydrate2D {
  constructor({ width = 1024, height = 768 } = {}) {
    this.canvas = document.createElement('canvas')

    this.canvas.width = width
    this.canvas.height = height
    this.context = this.canvas.getContext('2d')

    //this.canvas.style.backgroundColor = 'rgba(255, 255, 255, 1)'

    this.setBackgroundColor('rgba(255, 255, 255, 1)')

    this.canvasOut = document.createElement('canvas')
    this.canvasSmall = document.createElement('canvas')

    this.canvasOut.context = this.canvasOut.getContext('2d')

    this.canvasOut.width = 512
    this.canvasOut.height = 384

    document.body.querySelector('#app-container').appendChild(this.canvas)

    const style = {
      maxWidth: '100%',
      maxHeight: '100%',
      // width: '1024px',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }

    if (window.innerWidth > width && window.innerHeight > height) style.width = `${width}px`

    Object.assign(this.canvasOut.style, style)
    Object.assign(this.canvas.style, style)
  }

  setConfig(config = {}) {
    useScaledCanvas = config.useScaledCanvas

    const elContainer = document.body.querySelector('#app-container')

    if (useScaledCanvas) {
      if (elContainer.contains(this.canvas)) elContainer.removeChild(this.canvas)
      elContainer.appendChild(this.canvasOut)
    } else {
      if (elContainer.contains(this.canvasOut)) elContainer.removeChild(this.canvasOut)
      elContainer.appendChild(this.canvas)
    }
  }

  getRenderer() {
    return (useScaledCanvas) ? { canvas: this.canvasOut, context: this.canvasOut.context } : this
  }

  clear(forceTransparent = false) {
    const { canvas } = this

    this.context.resetTransform()

    if (this.backgroundColor && !forceTransparent) {
      this.context.fillStyle = this.backgroundColor
      this.context.fillRect(-10, -10, canvas.width + 20, canvas.height + 20)
    } else {
      this.context.clearRect(-10, -10, canvas.width + 20, canvas.height + 20)
    }
  }

  clearRenderer(forceTransparent = false) {
    const { context, canvas } = this.getRenderer()

    context.resetTransform()

    if (this.backgroundColor && !forceTransparent) {
      context.fillStyle = this.backgroundColor
      context.fillRect(-10, -10, canvas.width + 20, canvas.height + 20)
    } else {
      context.clearRect(-10, -10, canvas.width + 20, canvas.height + 20)
    }
  }

  setBackgroundColor(color) {
    this.backgroundColor = color
    this.clear()
  }

  border() {
    this.context.strokeStyle = '#fff'

    this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }

  darken() {
    this.context.fillStyle = 'rgba(0, 0, 0, 0.8)'

    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  rehydrate(shapesConfigs, clear = true, clearAfter = true, scale = 1) {
    this.currentConfig = shapesConfigs
    if (clear) this.clear(true)

    this.y = this.y || 0

    for (let i = 0; i < 1; i++) {
      shapesConfigs.forEach((shapeConfig) => {
        this.drawCappedLine(shapeConfig)
      })
    }

    const savedImage = this.trimCanvas(this.canvas, null, scale)
    const flipCopy = this.trimCanvas(this.canvas, null, scale)

    flipCopy.context = flipCopy.getContext('2d')

    flipCopy.context.clearRect(0, 0, 1000, 1000)
    flipCopy.context.scale(-1, 1)
    flipCopy.context.drawImage(savedImage, -flipCopy.width, 0)

    const draw = (...args) => this.draw(savedImage, ...args)
    const drawFlipped = (...args) => this.draw(flipCopy, ...args)

    if (clearAfter) {
      this.clear()
    }

    return {
      draw,
      drawFlipped,
      canvas: savedImage,
      offset: {
        x: 0,
        y: 0
      }
    }
  }

  draw(canvas, x = 0, y = 0, crop, scale = 1, alpha = 1) {
    const context = (useScaledCanvas) ? this.canvasOut.context : this.context

    if (alpha !== 1 || context.globalAlpha !== 1) context.globalAlpha = alpha

    if (crop) {
      const cropX = crop.x || 100

      if (cropX >= 0) {
        context.drawImage(canvas, cropX, 0, canvas.width - cropX, canvas.height, x, y, canvas.width - cropX, canvas.height)
      } else {
        context.drawImage(canvas, 0, 0, canvas.width + cropX, canvas.height, x, y, canvas.width + cropX, canvas.height)
      }

    } else if (scale !== 1) {
      context.scale(scale, scale)
      context.drawImage(canvas, x / scale, y / scale)
      context.scale(1 / scale, 1 / scale)
    } else {
      context.drawImage(canvas, x, y)
    }

    if (alpha !== 1) context.globalAlpha = 1.0
  }

  drawFromShapesConfigs(shapesConfigs, positionOffsets = [], renderer) {
    shapesConfigs.forEach((shapeConfig, i) => {
      this.drawCappedLine(shapeConfig, positionOffsets[i], renderer)
    })
  }

  trimCanvas(canvas, crop, scale = 1) {
    if (!canvas.width || !canvas.height) return canvas
    function rowBlank(imageData, width, y) {
      for (let x = 0; x < width; ++x) {
        if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false
      }

      return true
    }

    function columnBlank(imageData, width, x, top, bottom) {
      for (let y = top; y < bottom; ++y) {
        if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false
      }

      return true
    }

    const ctx = canvas.getContext('2d')
    const { width } = canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    const trim = true
    const trimSoft = false

    let top = 0; let bottom = imageData.height; let left = 0; let
      right = imageData.width

    if (trim) {
      while (top < bottom && rowBlank(imageData, width, top)) ++top
      while (bottom - 1 > top && rowBlank(imageData, width, bottom - 1)) --bottom
      while (left < right && columnBlank(imageData, width, left, top, bottom)) ++left
      while (right - 1 > left && columnBlank(imageData, width, right - 1, top, bottom)) --right
    }

    if (crop) {
      top += crop.top
      bottom += crop.bottom
      left += crop.left
      right -= crop.right
    }

    if (!trimSoft) {
      let trimmed

      try {
        trimmed = ctx.getImageData(left, top, right - left, bottom - top)
      } catch (e) {}

      if (!trimmed) trimmed = imageData

      const copy = canvas.ownerDocument.createElement('canvas')
      const copyCtx = copy.getContext('2d')

      const tempCanvas = canvas.ownerDocument.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')

      tempCanvas.width = trimmed.width
      tempCanvas.height = trimmed.height

      copy.width = trimmed.width * scale
      copy.height = trimmed.height * scale

      tempCtx.putImageData(trimmed, 0, 0)

      copyCtx.drawImage(tempCanvas, 0, 0, copy.width, copy.height)

      const uuid = Date.now()

      copy.uuid = uuid
      tempCanvas.uui = uuid

      savedCanvases[copy.uuid] = tempCanvas
      savedScaledCanvases[copy.uuid] = copy

      return (scale !== 1) ? copy : tempCanvas
    }
  }

  reyhdrateAnimation(frames) {
    let frameIndex = 0
    const cachedFrames = frames.map((frame) => {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

      return this.rehydrate(frame)
    })



    const loop = setInterval(() => {
      const frame = cachedFrames[frameIndex]

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.context.drawImage(frame, 0, 0)

      frameIndex += 1

      if (frameIndex === frames.length) frameIndex = 0
    }, 200)
  }

  drawCappedLine(config, positionOffset = { x: 0, y: 0 }, renderer = {}) {
    const { color, radius, position, lineCap, lineJoin, alpha, scale = 1 } = config
    const { x: px, y: py } = position

    let context = renderer.context || this.context
    let canvas = renderer.canvas || this.canvas

    const x = px + canvas.width / 2
    const y = py + canvas.height / 2

    context.fillStyle = color || '#000'
    context.strokeStyle = color || '#000'
    context.lineWidth = radius * scale

    if (lineCap) {
      context.lineCap = lineCap
      context.lineJoint = lineJoin
    } else {
      context.lineCap = 'round'
      context.lineJoin = 'round'
    }

    if (config.shadowBlur && config.shadowColor) {
      context.shadowBlur = config.shadowBlur
      context.shadowColor = config.shadowColor
    }

    context.beginPath()

    const adjustedPoints = []

    const points = config.points || [{ ...position }, { ...position }]

    points.forEach((point, index) => {
      adjustedPoints.push({ x: (x + point.x + positionOffset.x) * scale, y: (y + point.y + positionOffset.y) * scale })
    })

    adjustedPoints.forEach((point, index) => {
      const { x, y } = point

      if (!index) {
        context.moveTo(x, y)
      } else {
        context.lineTo(x, y)
      }
    })

    if (alpha !== undefined && alpha < 1) context.globalAlpha = alpha

    context.stroke()

    context.globalAlpha = 1.0
    context.shadowBlur = 0
  }

  drawRepeatingLine(config) {
    const { repeatCount = 3, repeatDirection = -1, repeatOffset = { x: 0, y: 0 }, radius } = config

    for (let i = 0; i < repeatCount; i++) {
      const points = config.points.map((point) => {
        return { x: point.x + repeatOffset * i + radius, y: point.y }
      })

      const lineConfig = { ...config, points }

      this.drawCappedLine(lineConfig)
    }
  }

  drawRepeatingLine2(config) {
    const { repeatCount = 3, repeatDirection = -1, repeatOffset = { x: 0, y: 0 }, radius, patternOffset, crop } = config
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    for (let i = 0; i < repeatCount; i++) {
      config.position.x += radius * 2 + repeatOffset.x

      this.drawCappedLine(config)
    }

    const trimmed = this.trimCanvas(this.canvas, crop)

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    console.dir(trimmed, trimmed.width, trimmed.height);

    const pattern = this.context.createPattern(trimmed, 'repeat')

    const draw = () => {
      this.context.fillStyle = pattern

      if (patternOffset) {
        const { x, y } = patternOffset
        //const x = 0
        //const y = 0

        //this.context.translate(x, y);

        //this.context.fillRect(x, y, this.canvas.width + x, this.canvas.height + y);
        //this.context.fillRect(-x, -y, this.canvas.width + x, this.canvas.height + y);
        this.context.fillRect(0, 0, this.canvas.width * 2, this.canvas.height * 2);

        //this.context.translate(-x, -y);
      } else {
        this.context.fillRect(0, 0, this.canvas.width * 2, this.canvas.height * 2);
      }
    }

    return {
      draw,
      canvas: trimmed
    }
  }
}

export const rehydrate2D = new Rehydrate2D()
