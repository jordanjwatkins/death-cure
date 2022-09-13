import cureFindLevel from './cure-find-helpers/cure-find-level'

const persisted = {}

export default async function cureFind(config, curer) {
  persisted.config = config
  persisted.curer = curer
  persisted.gameLoop = await cureFindLevel(config, curer)

  return persisted.gameLoop
}

if (module.hot) {
  module.hot.accept('./cure-find-helpers/cure-find-level.js', () => {
    const { config, curer, gameLoop } = persisted

    config.restart = false

    gameLoop.paused = true

    curer.revive(config)
    config.doFall = false
    curer.speedMod = 1
    config.curerKO = false

    cureFind(config, curer)
  })
}
