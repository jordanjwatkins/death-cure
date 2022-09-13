import Rehydrate2D from '../Rehydrate2D'
import { getSave } from '../saves'
//import death from '../entities/saves/death.json'

export default async () => {
  const rehydrate2D = new Rehydrate2D()

  const death = await getSave('death')

  const center = (child, asObject = false/* , parent */) => {
    const parent = rehydrate2D.canvas

    const xY = [
      parent.width / 2 - child.width / 2,
      parent.height / 2 - child.height / 2
    ]

    const { x, y } = xY

    return (asObject) ?
      { x, y } :
      xY
  }

  const radius = 70
  const repeatCount = 2
  const repeatingHeight = 100
  const repeatOffset = { x: 40, y: 0 }

  const { width, height } = rehydrate2D.canvas

  //rehydrate2D.canvas.style.backgroundColor = '#333'
  rehydrate2D.setBackgroundColor('#333')

  const { draw: drawLines } = rehydrate2D.drawRepeatingLine2({
    position: { x: 0, y: -height / 2 },
    color: '#3F3F3F',
    radius,
    points: [
      { x: 0, y: -100 },
      { x: 0, y: height + 200 }
    ],
    repeatCount,
    repeatOffset,
    patternOffset: { x: 0, y: 0 },
    crop: { top: 0, bottom: 0, right: 50, left: 50 },
    shadowBlur: 25,
    shadowColor: 'rgba(0, 0, 0, 0.6)'
  })

  const saveData = death.shapesConfigs || death.saveData

  saveData.forEach((item) => {
    item.shadowBlur = 40
    item.shadowColor = 'rgba(255, 0, 0, 0.9)'
  })

  const { draw: drawText, canvas: textCanvas } = rehydrate2D.rehydrate(saveData)

  saveData.forEach((item) => {
    item.color = '#222222DD'
    item.shadowBlur = 20
    item.shadowColor = '#000'
  })

  const { draw: drawText2, canvas: textCanvas2 } = rehydrate2D.rehydrate(saveData)

  const zoomTo = (scale) => {
    const zcx = rehydrate2D.canvas.width / 2
    const zcy = rehydrate2D.canvas.height / 2

    rehydrate2D.context.setTransform(1, 0, 0, 1, 0, 0);

    rehydrate2D.context.translate(zcx, zcy);
    rehydrate2D.context.scale(scale, scale)
    rehydrate2D.context.translate(-zcx, -zcy);
  }

  let zoomLevel = 0.5
  let lightsOn = false

  zoomTo(zoomLevel)
 /* let zoomingOut = true
  const zcx = rehydrate2D.canvas.width / 2
  const zcy = rehydrate2D.canvas.height / 2

  rehydrate2D.context.translate(zcx, zcy);
  rehydrate2D.context.scale(zoom, zoom)
  rehydrate2D.context.translate(-zcx, -zcy);*/

  /* Render */

  const render = () => {
    rehydrate2D.clear()

    zoomTo(zoomLevel)

    drawLines()

    if (lightsOn) {
      const [cx, cy] = center(textCanvas)

      drawText(cx, cy - 100)
    } else {
      const [cx, cy] = center(textCanvas2)

      drawText2(cx, cy - 100) // width / 2 - textCanvas.width / 2, height / 2 - textCanvas.height
    }
  }

  render()

  setTimeout(() => {
    lightsOn = true

    setTimeout(() => {
      lightsOn = false
      setTimeout(() => {
        lightsOn = true
      }, 20);
    }, 10);
  }, 1000);

  setInterval(() => {
    zoomLevel = 1

    render()
  }, 10);

}
