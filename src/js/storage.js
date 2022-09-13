const initialState = () => ({
  currentLevel: 'oneLineTwoSimple',
  levels: {
    oneLineTwoSimple: {},
  },
})

class Storage {
  constructor(namespace) {
    this.namespace = namespace

    // try to load saved state for namespace
    this.load()

    // else save initial state
    if (!this.state) {
      this.state = initialState()

      this.save()
    }
  }

  initLevel(levelName) {
    this.state.levels[levelName] = this.state.levels[levelName] || {}

    this.save()
  }

  save() {
    try {
      window.localStorage.setItem(this.namespace, JSON.stringify(this.state))
    } catch (e) {}
  }

  load() {
    try {
      this.state = JSON.parse(window.localStorage.getItem(this.namespace))
    } catch (e) {}
  }
}

export default Storage
