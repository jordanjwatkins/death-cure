import { fetchAndRehydrate } from '../saves'
import { rehydrate2D } from '../Rehydrate2D'

export default class Waver {
  constructor() {
    this.cloudWhite = fetchAndRehydrate('cloud-white')
  }

  async createPoof(x = -80, y = 350, config = {}) {
    const { draw } = await this.cloudWhite
    this.scale = config.scale || 1

    this.draw = draw

    this.cloudPoints = []
    this.speed = 13
    this.fullFadeTime = 30
    this.fadeTime = this.fullFadeTime
    this.radius = 150
    this.position = { x, y }

    this.color = '#0000FF'
    this.color = '#FF0000'

    const { cloudPoints, speed } = this

    const chop = 100
    const amp = 0.5
    const slowFactor = 100
    const spread = 15

    for (let i = 0; i < 10; i++) {
      cloudPoints.push({
        x: 0 + i * spread,
        y: 0,
        update: (point) => {
          point.y += Math.sin((Date.now() + chop * i) / slowFactor) * amp
        }
      })
    }

    const firstPoint = cloudPoints[0]
    const lastPoint = cloudPoints[cloudPoints.length - 1]

    cloudPoints.push({

    })

    if (this.scale === 1) {
      this.targetCanvas = rehydrate2D
    } else {
      this.targetCanvas = {
        canvas: rehydrate2D.canvasOut,
        context: rehydrate2D.canvasOut.context
      }
    }
  }

  updatePoof() {
    const bobble = 35

    const { cloudPoints, fadeTime, fullFadeTime, cloudWhite } = this

    if (fadeTime > 0) {
      const alpha = 1 - (1 * (fullFadeTime - fadeTime) / fullFadeTime)

      //rehydrate2D.context.globalAlpha = alpha
     // console.log(Math.sin(Date.now() / 100))

      cloudPoints.forEach((point) => {
        //console.log('draw cloudwhite');
        if (point.update) point.update(point)


        //this.draw(point.x, point.y)

      })

      //console.log('update');

      rehydrate2D.drawCappedLine.bind(this.targetCanvas)({
        color: this.color, radius: this.radius, alpha: 1, position: this.position, points: cloudPoints, scale: this.scale
      })

      //rehydrate2D.context.globalAlpha = 1

      //this.fadeTime -= 1
    }
  }
}
