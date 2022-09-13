import { rehydrate2D } from '../../Rehydrate2D'
import { fetchAndRehydrate, getLoadedJsonSize, setScale } from '../../saves'
import GameLoop from '../../libs/GameLoop'
import input from './input'
import CloudPoof from '../../components/CloudPoof'
import Waver from '../../components/Waver'
import Curer from './Curer'
import Arrows from '../../components/Arrows'


const scale = 1

const makeConfig = (add) => {
  const x = 0
  const y = 300
  const stepDistance = 0
  const currentFrame = 0
  const stepHeight = 0
  const speed = 0
  const walkSpeed = 3
  const speedY = 0
  const jumpSpeed = 3
  const doDash = false

  return { x, y, stepDistance, currentFrame, stepHeight, speed, walkSpeed, speedY, jumpSpeed, doDash, doJump: false, ...add }
}

export default async (subType = '1') => {
  rehydrate2D.setConfig({ useScaledCanvas: false })

  const { width, height } = rehydrate2D.canvas

  const entryPosition = {
    y: height - 480,
    x: -180,
    xStop: 50
  }

  const config = makeConfig({ width, height, jumpHeight: 0, jumpDirection: -1, doDeath: false, ...entryPosition, doEntry: true, stopDistance: 0 })

  const curer = new Curer()

  await curer.initialized

  const { stand } = curer.images

  setScale(scale)
  // const testLevel = await fetchAndRehydrate('test-level')
  // const testLevel = await fetchAndRehydrate('pit-level')
  const testLevel = await fetchAndRehydrate('small-pit-level')
  const backgroundColor = await fetchAndRehydrate('BackgroundColor')
  //const arrow = await fetchAndRehydrate('arrow')

  //console.log('arrow', arrow)
  // const rat = await fetchAndRehydrate('rat2')
  // const cloudWhite = await fetchAndRehydrate('cloud-white')

  console.log('json size', getLoadedJsonSize())

  console.log('test level', testLevel)
  testLevel.data.forEach((item) => {
    if (item.label === 'Hazard') {
      console.log('hazard', item)
    }
  })

  // stand.draw = rehydrate2D.rehydrate(stand.data).draw
  //walk1.draw = rehydrate2D.rehydrate(walk1.data).draw
  //walk2.draw = rehydrate2D.rehydrate(walk2.data).draw
  // testLevel.draw = rehydrate2D.rehydrate(testLevel.data).draw

  const getShapesOffset = shapesCanvas => ({
    x: config.x + (shapesCanvas.width - width) / 2 + shapesCanvas.offset.x,
    y: config.y - (height - shapesCanvas.canvas.height) / 2 - shapesCanvas.offset.y
  })

  // track left and right crop?
  //jumping.offset = { x: (stand.canvas.width - jumping.canvas.width) / 2 + 3, y: -(stand.canvas.height - jumping.canvas.height) / 2 }

  input(config)

  // console.log('jumping', jumping);

  /* const curerShapesOffset = {
    x:  config.x + (jumping.canvas.width - width ) / 2 + jumping.offset.x,
    y:  config.y - (height - jumping.canvas.height) / 2 - jumping.offset.y
  } */

  // jumping
  /* const curerShapesOffset = {
    x: (jumping.canvas.width - width ) / 2 + jumping.offset.x,
    y: -(height - jumping.canvas.height) / 2 - jumping.offset.y * 2
  } */

  const curerShapesOffset = {
    x: (stand.canvas.width - width) / 2, // + jumping.offset.x,
    y: -(height - stand.canvas.height) / 2// - jumping.offset.y
  }

  let deathTime = 0
  const shake = false

  const curerShapesOffsets = (x, y) => stand.data.map(() => ({ x: curerShapesOffset.x + x, y: curerShapesOffset.y + y, speedX: -2 + Math.random() * 4, speedY: -2 + Math.random() * 4 }))

  const cloudPoof = new CloudPoof()
  const waver = new Waver()

  //await cloudPoof.createPoof(700, 300)
  await waver.createPoof()


  const arrows = new Arrows()


  const arrowSpeedScale = 1.5
  const makeArrow = ({ x = 700, y = 50, type = "duck" } = {}) => (delay = 1000) => arrows.fireArrow(x, entryPosition.y + y, type, delay)

  //const makeDuckArrow = ({ x = 700, y = 50, type = "duck" } = {}) => (delay = 1000) => arrows.fireArrow(x, entryPosition.y + y, type, delay)

  const arrow1 = makeArrow()
  const arrow2 = makeArrow({ y: 210, x: 850, type: 'jump' })
  const arrow3 = (x = 700, y = 190, delay = 4000) => arrows.fireArrow(x, entryPosition.y + y, 'jump', delay)
  const arrow4 = (x = 700, y = 70, delay = 4000) => arrows.fireArrow(x, entryPosition.y + y, 'duck', delay)

  if (subType === '1') {
    arrow1()
  }

  if (subType === '2') {
    arrow2()
  }

  if (subType === '3') {
    arrow1()

    arrow2(2000)
  }

  if (subType === '4') {
    arrow3()

    arrow4()
  }

  if (subType === '5') {
    arrow1()

    arrow2()
    arrow3()
  }

  if (subType === '6') {
    arrow1()

    arrow2()
    arrow3()

    arrow4()
  }

  const gameLoop = new GameLoop(update)

  /*let arrowX = 2500
  let arrowY = entryPosition.y + 200
  let jumpedArrow = null
  let arrow1 = true

  let arrowX2 = 2000
  let arrowY2 = entryPosition.y + 50
  let jumpedArrow2 = null
  let arrow2 = true*/

  function update() {
    const { delta } = this
    const { doDash, doJump, doDeath, doFall, doEntry, doDuck, x, y } = config

    deathTime += 1

    rehydrate2D.clear()

    // zoomTo(zoomLevel, x, y + 120)

    // if (zoomLevel > 1) zoomLevel -= 0.01

    // console.log(x);

    backgroundColor.draw(0, 0)

    waver.updatePoof()
    //cloudPoof.updatePoof()
    testLevel.draw(0, 0)





    // Shake
    if (shake || x > 700) {
      // console.log('shake');

      // const test = getShapesOffset(stand.canvas)

      // console.log('test', stand.canvas, test);

      // curer.walk(config, stand, walk1, walk2)

      const offsets = curerShapesOffsets(config.x, config.y)

      offsets.forEach((offset) => {
        // if (offset.y > 200) return
        offset.x += -7 + Math.random() * 14// + config.x - width / 2 + 60 //offset.speedX * 20
        offset.y += -7 + Math.random() * 14// + config.y - height / 2 + 160//- deathTime //offset.speedY * 20
      })

      rehydrate2D.drawFromShapesConfigs(stand.data, offsets)
      rehydrate2D.drawFromShapesConfigs(curer.images.eyesDead.data, offsets)

      return
    }

    const curerPos = curer.update(config, entryPosition, width, height)

    arrows.update(config, curerPos, curer)

    if (doFall) {
      waver.updatePoof()
      testLevel.draw(0, 0)
    }
  }

  return gameLoop
}
