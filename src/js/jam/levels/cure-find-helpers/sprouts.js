import { rehydrate2D } from '../../Rehydrate2D'

const { width, height } = rehydrate2D.canvas

export const makeSproutPoint = (x, y, color, direction = { x: 0, y: -1 }, cDirection = null, maxSegLength, config = { curl: {} }) => ({
  x,
  y,
  direction,
  color: color || '#fff',
  ...config,
  curl: { direction: (cDirection !== null) ? cDirection : Math.random() > 0.5, segLength: 0, maxSegLength: maxSegLength || 20 + 60 * Math.random(), ...((config.curl) ? config.curl : {}) }
})

const fc = ['#b24834', '#7c75c5', '#c5bc43', '#c575b4']
  const randomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)]
  }

export const makeGroundSprout = (x, y, cDirection = null, config) => makeSproutPoint(x, y, randomItem(fc), { x: 0, y: -1 }, cDirection, null, config)
export const makeCeilingSprout = (x, y, cDirection = null, config) => makeSproutPoint(x, y, null, { x: 0, y: 1 }, cDirection, null, config)

export const makePinwheelPoints = (x, y, cDirection = true, color = 'red', added = false) => ([
  makeSproutPoint(x, y, color, { x: 0, y: -1 }, cDirection),
  makeSproutPoint(x, y, color, { x: 0, y: 1 }, cDirection),
  makeSproutPoint(x, y, color, { x: 1, y: 0 }, cDirection),
  makeSproutPoint(x, y, color, { x: -1, y: 0 }, cDirection)
].map((point) => {
  point.added = added
  point.curl.maxSegLength = 60

  return point
}))

export const makeHalfPinwheel = (x, y, cDirection = true, color = 'green', vertical = true, added = false, variant = true) => {
  let points

  if (vertical) {
    points = [
      makeSproutPoint(x, y, color, { x: 0, y: -1 }, cDirection),
      makeSproutPoint(x, y, color, { x: 0, y: 1 }, (variant) ? !cDirection : cDirection)
      // makeSproutPoint(x, y, color, { x: 1, y: 0 }, cDirection),
      // makeSproutPoint(x, y, color, { x: -1, y: 0 }, cDirection),
    ]
  } else {
    points = [
      // makeSproutPoint(x, y, color, { x: 0, y: -1 }, cDirection),
      // makeSproutPoint(x, y, color, { x: 0, y: 1 }, cDirection),
      makeSproutPoint(x, y, color, { x: 1, y: 0 }, cDirection),
      makeSproutPoint(x, y, color, { x: -1, y: 0 }, (variant) ? !cDirection : cDirection)
    ]
  }

  return points.map((point) => {
    point.added = added
    point.curl.maxSegLength = 60

    return point
  })
}

export const makeGroundSprouts = (x, y) => {
  const points = []
  const count = 10
  const y2 = y + 30 * Math.random()

  for (let i = 0; i < count; i++) {
    points.push(makeGroundSprout(x + i * (width / count), y2 ))

    setTimeout(() => {
      points.push(makeGroundSprout(x + i * (width / 5), y2 - 20))
    }, 1000 + 3000 * Math.random())
  }

  return points
}
