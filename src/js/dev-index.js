
//import knote from './libs/knote'
// import Rehydrate2D from './Rehydrate2D'
import title from './scenes/title'
import testLevel from './scenes/test-level/test-level'
import oneArrow from './scenes/test-levels/one-arrow'
import oneFloorTrap from './scenes/test-levels/one-floor-trap'
import breakThrough from './scenes/test-levels/break-through'
import breakUp from './scenes/test-levels/break-up'
import { rehydrate2D } from './Rehydrate2D'
import legCure from './scenes/test-levels/leg-cure'

import { getLoadedJsonFiles } from './saves'
// import f0 from './entities/saves/death/death-1.json';import f1 from './entities/saves/curer/curer-1661712577823.json';import f2 from './entities/saves/curer-walk1/curer-walk1-1661712603857.json';import f3 from './entities/saves/curer-walk2/curer-walk2-1661712664354.json';import f4 from './entities/saves/small-pit-level/small-pit-level-1661735217159.json';import f5 from './entities/saves/curer-dash/curer-dash-1661716540155.json';import f6 from './entities/saves/curer-jump/curer-jump-1661719719699.json';
// console.log(f0,  f1,  f2,  f3,  f4,  f5,  f6 )

console.log('Death Cure!')



//title()

export default () => {

  runLevelSequence()

  function runLevelSequence() {
    // let level = testLevel()
    const startLevel = oneFloorTrap
    const nextLevel = breakUp
    //const nextLevel = testLevel
    //oneFloorTrap,

    const oneArrowVariant = (winFn, loseFn) => oneArrow(winFn, loseFn, true)

    let aLevelSequence = [oneArrow, breakThrough, legCure, oneArrowVariant].reverse();

    //(aLevelSequence = [breakThrough, breakUp].reverse());

    //(aLevelSequence = [(winFn, loseFn) => oneArrow(winFn, loseFn, true), legCure, oneArrow].reverse())

    //(aLevelSequence = [legCure].reverse());

    let levelSequence = [...aLevelSequence]

    let level // = oneArrow()

    const doLevel = async (aLevel) => {
      rehydrate2D.setConfig()

      return aLevel(async () => {
        level = await level
        console.log('win!!!')
        level.stop()
        console.log('loaded fiels', getLoadedJsonFiles());

        if (!levelSequence.length) {
          console.log('Game Completed!!!')

          return
        }

        level = await doLevel(levelSequence.pop())
      }, async () => {
        level = await level
        console.log('lose!!!')
        level.stop()
        level = await doLevel(aLevel)
      })
    }


    //level = doLevel(oneArrow, testLevel)
    //level = doLevel(startLevel, nextLevel)
    level = doLevel(levelSequence.pop())


    document.body.addEventListener('keydown', async (event) => {
      console.log('event', event.key)
      if (event.key === 'Shift') {
        level = await level

        level.stop()

        levelSequence = [...aLevelSequence]

        level = doLevel(levelSequence.pop())

        return
      }

      if ('1234567890'.includes(event.key)) {
        level = await level
        level.stop()
        level = await testLevel(event.key)
      }

      // if (event.key === '1') {
      // console.log('pressed 1');

      // }
    })
  }

  // testLevel2()

  /* setTimeout(() => {
    //console.log('death1', death1, curer);

    console.log('json files', getLoadedJsonFiles())

    const loadedFiles = getLoadedJsonFiles();

    const out = loadedFiles.map((file, index) => {
     return `import f${index} from './entities/saves/${file}';`
    }).join('')

    const out2 = loadedFiles.map((file, index) => {
      return `f${index}, `
     }).join(' ')

    console.log(`console.log(${out2})`);

    console.log(out)
  }, 5000); */
}
