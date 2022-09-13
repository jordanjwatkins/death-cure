const savedCanvases = {}
const savedScaledCanvases = {}

let useScaledCanvas = false

export default class Rehydrate2D {
  fadeComplete = false

  constructor({ width = 1024, height = 768 } = {}) {
    this.canvas = document.createElement('canvas')

    this.canvas.width = width
    this.canvas.height = height

    this.context = this.canvas.getContext('2d')

    this.canvas.style.backgroundColor = 'rgba(255, 255, 255, 1)'

    this.setBackgroundColor('rgba(255, 255, 255, 1)')

    const bgAlpha = 1

    /* const rehydrateLoop = setInterval(() => {
      bgAlpha -= 0.01

      this.canvas.style.backgroundColor = `rgba(255,255, 255, ${bgAlpha})`

      if (bgAlpha <= 0) {
        console.log('fade complete');
        this.fadeComplete = true
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.rehydrate(this.currentConfig)
        clearInterval(rehydrateLoop)
      }
    }, 100) */

    //document.body.querySelector('#app-container').appendChild(this.canvas)

    this.canvasOut = document.createElement('canvas')
    this.canvasSmall = document.createElement('canvas')

    this.canvasOut.context = this.canvasOut.getContext('2d')

    this.canvasOut.width = 512
    this.canvasOut.height = 384

    this.canvasSmall.width = 512
    this.canvasSmall.height = 384

    document.body.querySelector('#app-container').appendChild(this.canvas)

    Object.assign(this.canvasOut.style, {
      maxWidth: '100%',
      maxHeight: '100%',
       //maxWidth: '1024px',
       //maxHeight: '100%',
      // height: '768px',
      width: '1024px',
      //height: '768px',
      //aspectRatio: 1024 / 768,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
      // bottom: 0,
      // right: 0,
      // overflow: 'auto'
    })

    Object.assign(this.canvas.style, {
      //width: '300px',
     // height: '768px',
     maxWidth: '100%',
     maxHeight: '100%',
     //aspectRatio: 1024 / 768,
     position: 'absolute',
     top: '50%',
     left: '50%',
     transform: 'translate(-50%, -50%)'
     // bottom: 0,
     // right: 0,
     // overflow: 'auto'
   })

    //this.darken()

    const radius = 20
    const repeatCount = 3
    const repeatingHeight = 100
    const repeatOffset = { x: 10, y: 0 }

    /*this.drawRepeatingLine2({
      //position: { x: -(20 * 3), y: -50 }, // 3 x radius  and half length (height)
      //position: { x: -(radius + radius * (repeatCount) + repeatOffset.x * (repeatCount)) / 2, y: -(repeatingHeight / 2) }, // 3 x radius  and half length (height)
      position: { x: 0, y: 0 },
      color: '#FFF',
      radius,*/
      /*points: [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
      ],*/
     /* points: [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
        { x: 0, y: 100 },
      ],
      repeatCount,
      repeatOffset
    })*/
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
    this.context.resetTransform()

    if (this.backgroundColor && !forceTransparent) {
      this.context.fillStyle = this.backgroundColor
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    } else {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  clearRenderer(forceTransparent = false) {
    const { context, canvas } = this.getRenderer()

    context.resetTransform()

    if (this.backgroundColor && !forceTransparent) {
      context.fillStyle = this.backgroundColor
      context.fillRect(0, 0, canvas.width, canvas.height)
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height)
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

    /*if (this.savedImage && this.useSavedImage) {
      this.context.drawImage(this.savedImage, 0, this.y)

      this.y += 1

      return
    }*/

    // console.log('rehydrate', shapesConfigs)

    const config = shapesConfigs[0]

    // console.log('first', config)

    // this.drawCircleArc(config)
    // this.drawCappedLineCircle(config)

    for (let i = 0; i < 1; i++) {
      shapesConfigs.forEach((shapeConfig) => {
        // shapeConfig.position.x += 20
        // this.drawCircleArc({ ...shapeConfig, position: { ...shapeConfig.position, x: shapeConfig.position.x + 2 * i } })
        // this.drawCappedLineCircle(shapeConfig)
        this.drawCappedLine(shapeConfig)
      })
    }

    // console.log('canvas out', trimCanvas(this.canvas).toDataURL())
    // this.context.clearRect(0,0,this.canvas.width, this.canvas.height)

    const savedImage = this.trimCanvas(this.canvas, null, scale)

    this.savedImage = savedImage

    const flipCopy = this.trimCanvas(this.canvas, null, scale)

    flipCopy.context = flipCopy.getContext('2d')

    flipCopy.context.clearRect(0, 0, 1000, 1000)
    flipCopy.context.scale(-1, 1)
    flipCopy.context.drawImage(savedImage, -flipCopy.width, 0)

    //console.log('save', savedImage)

    //this.darken()

    const draw = (x = 0, y = 0, crop, scale = 1) => {
     // this.context.save()
      const context = (useScaledCanvas) ? this.canvasOut.context : this.context

      context.scale(scale, scale)
      context.drawImage(savedImage, x / scale, y / scale)
      context.scale(1 / scale, 1 / scale)
      //this.context.restore()
    }

    const drawFlipped = (x = 0, y = 0, crop, scale = 1) => {
      const context = (useScaledCanvas) ? this.canvasOut.context : this.context

      if (crop) {

        const cropX = crop.x || 100
        context.drawImage(flipCopy, cropX, 0, flipCopy.width - cropX, flipCopy.height, x, y, flipCopy.width - cropX, flipCopy.height)
      } else {

        context.scale(scale, scale)
        context.drawImage(flipCopy, x / scale, y / scale)
        context.scale(1 / scale, 1 / scale)
      }
    }

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

  drawFromShapesConfigs(shapesConfigs, positionOffsets = [], renderer) {
    shapesConfigs.forEach((shapeConfig, i) => {
      // shapeConfig.position.x += 20
      // this.drawCircleArc({ ...shapeConfig, position: { ...shapeConfig.position, x: shapeConfig.position.x + 2 * i } })
      // this.drawCappedLineCircle(shapeConfig)
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
      //console.log(frame)
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

      return this.rehydrate(frame)
    })



    const loop = setInterval(() => {
      const frame = cachedFrames[frameIndex]

      //console.log('loop', frameIndex);

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      //console.log('frame canvas', frame);
      this.context.drawImage(frame, 0, 0)

      frameIndex += 1

      if (frameIndex === frames.length) frameIndex = 0

      if (false) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.rehydrate(this.currentConfig)

        clearInterval(loop)
      }
    }, 200)
  }

  drawCircleArc(config, scale = 2.5) {
    console.log('draw circle arc')
    const { color, radius, position } = config
    const { x, y } = position
    // const scale = 1024 / 300

    // console.log('xy', x, y)

    this.context.beginPath()

    this.context.fillStyle = color || '#000'

    const centeredX = x * scale + 1024 / 2
    const centeredY = y * scale + 768 / 2

    this.context.arc(centeredX, centeredY, radius * scale, 0, 360)
    this.context.closePath()
    this.context.fill()
    // this.context.stroke()
  }

  drawCircle(config) {
    console.log('draw circlw', config)
    const { color, radius, position } = config
    const { x, y } = position
    // const scale = 1024 / 300

    // console.log('xy', x, y)

    this.context.beginPath()

    this.context.fillStyle = color || '#000'

    // const centeredX = x * scale + 1024 / 2
    // const centeredY = y * scale + 768 / 2

    this.context.arc(x, y, radius, 0, 360)
    this.context.closePath()
    this.context.fill()
    // this.context.stroke()
  }

  drawCappedLine(config, positionOffset = { x: 0, y: 0 }, renderer = {}) {
    const { color, radius, position, lineCap, lineJoin, alpha, scale = 1 } = config
    const { x: px, y: py } = position

    let context = renderer.context || this.context
    let canvas = renderer.canvas || this.canvas

    // console.log('xy', x, y)

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

    //console.log('draw capped line')

    //this.context.strokeStyle = 'rgba(255, 100, 100, 0.4)'

    if (false && this.fadeComplete) {
      console.log('gade fomplete')
      this.context.shadowBlur = 15
      this.context.shadowColor = 'red'
      this.context.strokeStyle = 'rgba(255, 0, 0, 0.5)'
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

      // this.drawCircleArc({ position: { x: x + px, y: y + py }, color, radius: radius / 2 })
    })

    // this.context.closePath()
    // this.context.fill()
    //if (positionOffset.x) this.context.globalAlpha = 0.3

    if (alpha !== undefined && alpha < 1) context.globalAlpha = alpha

    context.stroke()

    context.globalAlpha = 1.0
    context.shadowBlur = 0

    // this.context.stroke()

    /* adjustedPoints.forEach((point, index) => {
      this.drawCircle({ position: { x: point.x, y: point.y }, color, radius: radius / 2 })
    }) */
  }

  drawCappedLineCircle(config) {
    const { color, radius, position, points } = config
    const { x: px, y: py } = position
    const scale = 1024 / 300

    // console.log('xy', x, y)

    const x = px + 1024 / 2
    const y = py + 768 / 2

    this.context.fillStyle = color || '#000'
    this.context.lineWidth = radius// radius
    this.context.lineCap = 'round'
    this.context.lineJoin = 'round'

    this.context.beginPath()

    const adjustedPoints = []

    points.forEach((point, index) => {
      adjustedPoints.push({ x: x + point.x, y: y + point.y })
    })

    adjustedPoints.forEach((point, index) => {
      const { x, y } = point

      if (!index) {
        this.context.moveTo(x, y)
      } else {
        this.context.lineTo(x, y)
      }

      // this.drawCircleArc({ position: { x: x + px, y: y + py }, color, radius: radius / 2 })
    })

    this.context.stroke()

    this.context.closePath()

    adjustedPoints.forEach((point, index) => {
      this.drawCircleArc({ position: { x: point.x, y: point.y }, color, radius: radius / 2 })
    })
    /* this.context.lineTo(x - 100, y + 100)
    this.context.lineTo(x - 200, y)
    // this.context.arc(x + 1024 / 2, y + 768 / 2, radius, 0, 360)
    this.context.stroke()
    // this.context.fill() // fill does not apply line caps
    this.context.closePath() */

    // this.drawCappedLineHeart(x, y)
  }

  drawCappedLineHeart(x, y) {
    const strokePoints = () => {
      this.context.beginPath()
      this.context.moveTo(x, y)
      this.context.lineTo(x - 100, y + 100)
      this.context.lineTo(x - 200, y)
      // this.context.arc(x + 1024 / 2, y + 768 / 2, radius, 0, 360)
      this.context.stroke()
      this.context.closePath()
    }

    let color = '#000'
    let lineWidth = 220

    for (let i = 0; i < 2; i++) {
      this.context.lineWidth = lineWidth
      this.context.strokeStyle = color

      strokePoints()

      if (color === '#FFF') {
        color = '#000'
      } else {
        color = '#FFF'
      }

      lineWidth -= 210
    }

    /* strokePoints()

    this.context.lineWidth = 200
    this.context.strokeStyle = '#FFF'

    strokePoints()

    this.context.lineWidth = 180
    this.context.strokeStyle = '#000'

    strokePoints()

    this.context.lineWidth = 160
    this.context.strokeStyle = '#FFF'

    strokePoints()

    this.context.lineWidth = 140
    this.context.strokeStyle = '#000'

    strokePoints() */
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
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //this.context.translate(-x, -y);
      } else {
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    return {
      draw,
      canvas: trimmed
    }
  }
}

export const rehydrate2D = new Rehydrate2D()
