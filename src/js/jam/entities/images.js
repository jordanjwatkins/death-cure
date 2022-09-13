import { rehydrate2D } from '../Rehydrate2D'
import amp from './data/amp'
import ani from './data/ani'
import arrow from './data/arrow'
import breakthroughLevel from './data/breakthroughLevel'
import breakthroughLevelShadows from './data/breakthroughLevelShadows'
import closet from './data/closet'
import cloudWhite from './data/cloudWhite'
import crackedFloor from './data/crackedFloor'
import cure from './data/cure'
import curer from './data/curer'
import cureRack from './data/cureRack'
import ducking from './data/curerDuck'
import eyes from './data/curerEyes'
import eyesClosed from './data/curerEyesClosed'
import eyesDead from './data/curerEyesDead'
import horns from './data/curerHorns'
import hornsCorrupted from './data/curerHornsCorrupted'
import jumping from './data/curerJump'
import mark from './data/curerMark'
import curerMouth from './data/curerMouth'
import splits from './data/curerSplits'
import walk1 from './data/curerWalk1'
import walk2 from './data/curerWalk2'
import darkLevel from './data/darkLevel'
import deadLeg from './data/deadLeg'
import deadLegFlash from './data/deadLegFlash'
import death from './data/death'
import floorCracks from './data/floorCracks'
import fog from './data/fog'
import launcher from './data/launcher'
import ona from './data/ona'
import splitsDeadLeg from './data/splitsDeadLeg'
import testLevelBackground from './data/testLevelBackground'
import testLevelForeground from './data/testLevelForeground'

const images = {
  curer,
  ducking,
  splits,
  jumping,
  walk1,
  walk2,
  darkLevel,
  testLevelBackground,
  testLevelForeground,
  breakthroughLevel,
  cloudWhite,
  crackedFloor,
  deadLeg,
  deadLegFlash,
  eyesClosed,
  mark,
  eyesDead,
  eyes,
  launcher,
  horns,
  hornsCorrupted,
  arrow,
  death,
  death2: JSON.parse(JSON.stringify(death)),
  cure,
  cure2: JSON.parse(JSON.stringify(cure)),
  ani,
  fog,
  ona,
  amp,
  splitsDeadLeg,
  breakthroughLevelShadows,
  floorCracks,
  closet,
  cureRack,
  curerMouth
}
images.death.forEach((item) => {
  item.shadowBlur = 40
  item.shadowColor = 'rgba(255, 0, 0, 0.9)'
})

images.death2.forEach((item) => {
  item.color = '#222222DD'
  item.shadowBlur = 20
  item.shadowColor = '#000'
})

images.cure.forEach((item) => {
  item.shadowBlur = 40
  item.shadowColor = 'rgba(255, 0, 0, 0.9)'
})

images.cure2.forEach((item) => {
  item.color = '#222222DD'
  item.shadowBlur = 20
  item.shadowColor = '#000'
})

images.ani.forEach((item) => {
  item.color = '#222222DD'
  item.shadowBlur = 20
  item.shadowColor = '#000'
})

images.ona.forEach((item) => {
  item.color = '#222222DD'
  item.shadowBlur = 20
  item.shadowColor = '#000'
})

images.amp.forEach((item) => {
  item.color = '#222222DD'
  item.shadowBlur = 20
  item.shadowColor = '#000'
})

async function init() {
  for (const key in images) {
    images[key] = rehydrate2D.rehydrate(images[key])
  }

  for (const key in images) {
    images[key] = await images[key]
  }
}

const promise = init()

export default images

export const imagesReady = promise
