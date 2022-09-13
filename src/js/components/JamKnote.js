window.AudioContext = window.AudioContext || window.webkitAudioContext

let audioContext = false

if (window.AudioContext) {
  audioContext = new window.AudioContext()
}

const semitoneMap = {
  C: 3,
  D: 5,
  E: 7,
  F: 8,
  G: 10,
  A: 12,
  B: 14
}

function isAudioApiSupported() {
  return !!audioContext
}

function toInt(value) {
  return parseInt(value, 10)
}

function makeBrownNoiseNode(audioContext) {
  const bufferSize = 4096

  let lastOut = 0.0
  const node = audioContext.createScriptProcessor(bufferSize, 1, 1)

  node.onaudioprocess = (e) => {
    const output = e.outputBuffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1

      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i]
      output[i] *= 3.5 // (roughly) compensate for gain
    }
  }

  return node
}

export default class JamKnote {
  constructor(audioContextIn) {
    if (isAudioApiSupported()) this.init(audioContextIn)
  }

  init(audioContextIn) {
    if (!isAudioApiSupported()) return

    this.initted = true

    this.audioContext = audioContextIn || audioContext

    audioContext = this.audioContext

    this.mainGain = audioContext.createGain()
    this.mainCompressor = audioContext.createDynamicsCompressor()

    this.mainGain.connect(this.mainCompressor)
    this.mainCompressor.connect(audioContext.destination)

    this.mainGain.gain.value = 0.03

    // this.oscillators = this.makeOscillators()

    // this.playNote({ frequency: 440 })

    // this.setOscillatorsFrequency(400)
    // this.startOscillators()

    /*console.log('make notes C5', this.makeNote('C6'))
    console.log('make notes B5', this.makeNote('B5'))
    console.log('make notes A5', this.makeNote('A5'))
    console.log('make notes G5', this.makeNote('G5'))
    console.log('make notes B4', this.makeNote('B4'))
    console.log('make notes A4', this.makeNote('A4'))
    console.log('make notes G4', this.makeNote('G4'))
    console.log('make notes b3', this.makeNote('b3'))*/

    this.brownNoiseNode = makeBrownNoiseNode(this.audioContext)
    this.noiseGain = audioContext.createGain(this.mainGain)

    this.noiseGain.gain.value = 0

    this.brownNoiseNode.connect(this.noiseGain)
    this.noiseGain.connect(this.mainGain)
  }

  fireNoise() {
    this.noiseGain.gain.exponentialRampToValueAtTime(1, this.audioContext.currentTime + 0.1)
    this.noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.2)
  }

  makeOscillators() {
    return [
      this.makeOscillator(),
      this.makeOscillator({ waveType: 'sawtooth' }),
      this.makeOscillator({ waveType: 'sawtooth', detune: 1.01, detune2: 1.0017 })
    ]
  }

  makeOscillator(options = {}) {
    const config = options || {}
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    const gain = 0.2 // (typeof config.gain === 'number') ? config.gain : 0.2

    oscillator.type = config.waveType || 'sine'
    oscillator.detune1 = options.detune1 || 1
    oscillator.detune2 = options.detune2 || 1

    oscillator.gainNode = gainNode

    gainNode.gain.value = gain

    oscillator.connect(gainNode)
    gainNode.connect(this.mainGain)

    return oscillator
  }

  startOscillators(startTime = 0, oscillators) {
    oscillators = oscillators || this.oscillators
    oscillators.forEach(osc => osc.start(startTime))
  }

  setOscillatorsFrequency(f, oscillators) {
    oscillators = oscillators || this.oscillators
    oscillators.forEach(osc => osc.frequency.value = f * osc.detune1 * osc.detune2)
  }

  setOscillatorsGain(g, oscillators) {
    oscillators = oscillators || this.oscillators
    oscillators.forEach(osc => osc.gainNode.gain.value = g)
  }

  stopOscillators(stopTime = 0, oscillators) {
    oscillators = oscillators || this.oscillators
    oscillators.forEach(osc => osc.stop(stopTime))
  }

  makeNote(noteName) {
    if (!isAudioApiSupported()) return

    const note = {}
    const octaveIndex = (noteName.length === 3) ? 2 : 1

    note.letter = noteName[0]
    note.octave = toInt(noteName[octaveIndex])

    if (octaveIndex === 2) {
      note.accidental = noteName[1]
      note.accidentalOffset = (note.accidental === 'b') ? -1 : 1
    }

    note.frequency = this.calculateNoteFrequency(note)

    note.name = noteName

    return note
  }

  playNote(note, options) {
    if (!isAudioApiSupported()) return

    if (this.oscillators && this.oscillators.length) this.stopOscillators()

    const oscillators = this.makeOscillators()

    this.setOscillatorsFrequency(note.frequency, oscillators)

    const gain = options.gain || 0.2

    this.setOscillatorsGain(gain, oscillators)

    const delay = options.delay || 0

    this.startOscillators(audioContext.currentTime + delay, oscillators)

    const duration = options.duration || 0.25

    this.stopOscillators(audioContext.currentTime + delay + duration, oscillators)
  }

  calculateNoteFrequency(note) {
    const defaultOctaveSemitones = 5 * 12

    let semitoneOffset = semitoneMap[note.letter]

    semitoneOffset += (note.accidentalOffset) ? note.accidentalOffset : 0

    semitoneOffset += (note.octave * 12) - defaultOctaveSemitones

    const frequency = this.frequencyByOffset(440, semitoneOffset)

    return (Number.isNaN(frequency)) ? 0 : frequency
  }

  frequencyByOffset(baseFrequency, semitoneOffset) {
    return baseFrequency * (2 ** (semitoneOffset / 12))
  }
}

export const knote = new JamKnote()
