import { rehydrate2D } from '../Rehydrate2D'
import images from './images'

const clone = (array) => JSON.parse(JSON.stringify(array));

export default class CloudPoof {
  constructor() {
    this.cloudWhite = images.cloudWhite
  }

  async createPoof(x, y, config = {}) {
    const { fullFadeTime, count, startAlpha } = config

    this.draw = (...args) => this.cloudWhite.draw(...args)

    this.scale = config.scale || 1

    //console.log('cloudwhite', this.cloudWhite);

    this.cloudPoints = []
    this.speed = config.speed || 13
    this.fullFadeTime = fullFadeTime || 30
    this.fadeTime = this.fullFadeTime
    this.count = count || 30
    this.startAlpha = startAlpha || 1
    this.offsetX = 0
    this.offsetY = 0

    const { cloudPoints, speed } = this

    for (let i = 0; i < this.count; i++) {
      cloudPoints.push({
        x: x + i * this.scale,
        y: y + i * this.scale,
        speedX: -(speed / 2) + Math.random() * speed,
        speedY: -(speed / 2) + Math.random() * speed
      })
    }

    this.pointsCopy = clone(cloudPoints);

    if (this.scale === 1) {
      this.targetCanvas = rehydrate2D
    } else {
      this.targetCanvas = {
        canvas: rehydrate2D.canvasOut,
        context: rehydrate2D.canvasOut.context
      }
    }
  }

  async resetPoof(offsetX = 0, offsetY = 0) {
    this.cloudPoints = clone(this.pointsCopy)
    this.fadeTime = this.fullFadeTime
    this.offsetX = offsetX
    this.offsetY = offsetY
  }

  async updatePoof() {
    //console.log('update poof');
    const bobble = 35

    const { cloudPoints, fadeTime, fullFadeTime, startAlpha, offsetX, offsetY } = this

    if (fadeTime > 0) {
      const alpha = startAlpha - (startAlpha * (fullFadeTime - fadeTime) / fullFadeTime)

      //console.log('alpha', alpha);
      //this.targetCanvas.context.globalAlpha = 1

      cloudPoints.forEach((point) => {
        //point.x += point.speedX + -(bobble / 2) + (Math.random() * bobble)
        //point.y += point.speedY + -(bobble / 2) + (Math.random() * bobble)

        point.x += point.speedX
        point.y += point.speedY


        //console.log('draw clod');
        this.draw(point.x + offsetX, point.y + offsetY, null, this.scale, alpha)
      })

      //this.targetCanvas.context.globalAlpha = 1.0

      this.fadeTime -= 1
    }
  }
}
