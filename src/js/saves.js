import { rehydrate2D } from './Rehydrate2D'
//import { Pane } from 'tweakpane'

let loadedJsonSize = 0
let loadedJsonFiles = {}
const cache = {}

let scale = 1

export const getLoadedJsonSize = () => loadedJsonSize
export const getLoadedJsonFiles = () => loadedJsonFiles

const getJson = async (uri) => {
  const response = await fetch(uri)

  return response.json()
}

const getSaves = async () => {
  return getJson('http://localhost:3333/death-cure-saves')
}

const getSaveVersions = async (saveName) => {
  return getJson(`http://localhost:3333/death-cure-save-versions?saveName=${saveName}`)
}

/*const getSave = async (saveName, version) => {
  return getJson(`http://localhost:3333/death-cure-save?saveName=${saveName}&version=${version}`)
}*/

// Get the most recently saved version
export const getSave = async (saveName) => {
  const versions = await getSaveVersions(saveName)

  console.log('getsave', versions);

  if (!versions.length) return {}

  let newestVersion = versions[0].split('-')

  newestVersion = newestVersion.pop()
  //newestVersion = newestVersion.replace('.json', '')

  console.log('newest version', newestVersion)

  const json = getJson(`http://localhost:3333/death-cure-save?saveName=${saveName}&version=${newestVersion}`)

  return json.then((json) => {
    console.log(json);
    loadedJsonSize += JSON.stringify(json).length
    json.fullSaveName = `${saveName.replace('.json', '')}/${saveName}-${newestVersion}`

    loadedJsonFiles[saveName] = json.fullSaveName
    return json
  })
}

export const fetchAndRehydrate = async (saveName, scaleParam) => {
  scale = scaleParam || scale

  const scaledSaveName = `${saveName}-${scale}`

    if (cache[scaledSaveName]) return cache[scaledSaveName]

    const save = await getSave(saveName, true, false)

    console.log('fetched save', save)

    const saveData = save.shapesConfigs || save.data

    const { draw, canvas, drawFlipped } = rehydrate2D.rehydrate(saveData, true, true, scale)

    save.draw = draw
    save.canvas = canvas
    save.drawFlipped = drawFlipped
    //save.saveData = saveData

    cache[scaledSaveName] = save

    return save
}

export const setScale = (value) => {
  scale = value
}

const debugUi = async () => {
  console.log('debug ui!')


  const saves = await getSaves()

  console.log('saves', saves)

  const pane = new Pane()

  const config = {
    loadedSave: ''
  }

  const saveOptions = saves.reduce((prev, curr) => {
    prev[curr] = curr

    return prev
  }, {})

  pane.addInput(config, 'loadedSave', {
    options: {
      none: '',
      ...saveOptions
    }
  }).on('change', async (event) => {
    console.log('selected', event)

    const saveName = event.value

    const save = await getSave(saveName, true, false)

    console.log('fetched save', save)

    const saveData = save.shapesConfigs || save.data

    const { draw } = rehydrate2D.rehydrate(saveData)

    draw(300, 300)
  })
}

//debugUi()
