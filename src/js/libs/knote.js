window.AudioContext = window.AudioContext || window.webkitAudioContext;

let audioContext = false;

if (window.AudioContext) {
  audioContext = new window.AudioContext();
}

/*const semitoneMap = {
  C: 3,
  D: 5,
  E: 7,
  F: 8,
  G: 10,
  A: 12,
  B: 14
};*/

function isAudioApiSupported() {
  return !!audioContext;
}

let globalGainNode;
let globalCompressor;

if (isAudioApiSupported()) {
  globalGainNode = audioContext.createGain();
  globalCompressor = audioContext.createDynamicsCompressor();

  globalGainNode.connect(globalCompressor);
  globalCompressor.connect(audioContext.destination);

  globalGainNode.gain.value = 0.3;
}

/*function playNote(note, options) {
  if (!isAudioApiSupported()) return;

  const config = options || {};
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  const gain = (typeof config.gain === 'number') ? config.gain : 0.2;
  const waveType = config.waveType || 'sine';

  const duration = config.duration || 0.25;
  const startTime = (config.startTime && config.startTime > 0) ? config.startTime : audioContext.currentTime;
  const stopTime = startTime + duration;
  const truncate = config.truncate || 0;

  oscillator.connect(gainNode);
  gainNode.connect(globalGainNode);

  gainNode.gain.value = 0;

  // fade in just after start time to prevent pops
  gainNode.gain.setTargetAtTime(gain, startTime + 0.01, 0.01);

  // fade just before stop time to prevent pops
  gainNode.gain.setTargetAtTime(0, (stopTime - 0.06) - truncate, 0.01);

  oscillator.frequency.value = note.frequency;
  oscillator.type = waveType;

  oscillator.start(startTime);
  oscillator.stop(stopTime);

  return oscillator;
}

function makeNote(noteName) {
  if (!isAudioApiSupported()) return;

  const note = {};
  const octaveIndex = (noteName.length === 3) ? 2 : 1;

  note.letter = noteName[0];
  note.octave = toInt(noteName[octaveIndex]);

  if (octaveIndex === 2) {
    note.accidental = noteName[1];
    note.accidentalOffset = (note.accidental === 'b') ? -1 : 1;
  }

  note.frequency = calculateNoteFrequency(note);

  note.name = noteName;

  return note;
}

function calculateNoteFrequency(note) {
  const defaultOctaveSemitones = 5 * 12;

  let semitoneOffset = semitoneMap[note.letter];

  semitoneOffset += (note.accidentalOffset) ? note.accidentalOffset : 0;

  semitoneOffset += (note.octave * 12) - defaultOctaveSemitones;

  const frequency = frequencyByOffset(440, semitoneOffset);

  return (isNaN(frequency)) ? 0 : frequency;
}

function frequencyByOffset(baseFrequency, semitoneOffset) {
  return baseFrequency * Math.pow(2, (semitoneOffset / 12));
}*/
/*
function noteRange(firstNote, count, accidentals) {
  const notes = [];
  let note = makeNote(firstNote);

  notes.push(note);

  count--;

  for (let i = 0; i < count; i++) {
    note = nextNote(note, accidentals);
    notes.push(note);
  }

  return notes;
}

function noteNameRange(firstNote, count, accidentals) {
  const noteNames = [];
  let note = makeNote(firstNote);

  noteNames.push(note.name);

  for (let i = 0; i < count - 1; i++) {
    note = nextNote(note, accidentals);
    noteNames.push(note.name);
  }

  return noteNames;
}

function nextNote(note, accidentals) {
  const noteLetters = 'ABCDEFG'.split('');
  const letterIndex = noteLetters.indexOf(note.letter);
  let octave = note.octave;
  let letter;

  if (canHaveAccidental(note)) {
    letter = `${note.letter  }#`;
  } else {
    letter = nextLetter(letterIndex);

    if (letter === 'C') {
      octave++;
    }
  }

  return makeNote(letter + octave);

  function nextLetter(currentIndex) {
    const index = currentIndex + 1;

    return (noteLetters[index]) ? noteLetters[index] : noteLetters[0];
  }

  function canHaveAccidental() {
    if (!accidentals) {
      return false;
    }

    if (note.accidental) {
      return false;
    }

    return !((note.letter === 'B' || note.letter === 'E'));
  }
}

function prevNote(note, accidentals) {
  const noteLetters = 'ABCDEFG'.split('');
  const letterIndex = noteLetters.indexOf(note.letter);
  let octave = note.octave;
  let letter;

  if (note.accidental && accidentals) {
    letter = note.letter;
  } else {
    letter = prevLetter(letterIndex);

    if (letter === 'B') {
      octave--;
    }
  }

  return makeNote(letter + octave);

  function prevLetter(currentIndex) {
    const index = currentIndex - 1;

    return (noteLetters[index]) ? noteLetters[index] : noteLetters[noteLetters.length - 1];
  }
} */

/*function toInt(value) {
  return parseInt(value, 10);
}

function playSequenceNote(note, startTime, duration, gain) {
  return playNote(note, { startTime, duration, gain });
}

function songNote(noteName, eighthNoteInBar, eighthNotesOfDuration, gain = 0.2) {
  if (!isAudioApiSupported()) return;

  const eighthNoteTime = 0.20;
  const time = audioContext.currentTime;
  const note = makeNote(noteName);
  const start = time + eighthNoteTime * (eighthNoteInBar - 1);

  const oscillator = playSequenceNote(note, start, eighthNoteTime * eighthNotesOfDuration, gain);

  return () => oscillator.stop();
}

function songNoise(eighthNoteInBar, eighthNotesOfDuration) {
  if (!isAudioApiSupported()) return;

  const eighthNoteTime = 0.15;
  const start = eighthNoteTime * (eighthNoteInBar - 1);
  const duration = (eighthNoteTime * eighthNotesOfDuration) * 1000;

  return brownNoise(start, duration);
}

const brownNoiseNode = (() => {
  if (!isAudioApiSupported()) return;

  const bufferSize = 4096;

  let lastOut = 0.0;
  const node = audioContext.createScriptProcessor(bufferSize, 1, 1);

  node.onaudioprocess = (e) => {
    const output = e.outputBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // (roughly) compensate for gain
    }
  };

  return node;
})();*/

const createBrownNoiseNode = () => {
  if (!isAudioApiSupported()) return;

  const bufferSize = 4096;

  let lastOut = 0.0;
  const node = audioContext.createScriptProcessor(bufferSize, 1, 1);

  node.onaudioprocess = (e) => {
    const output = e.outputBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // (roughly) compensate for gain
    }
  };

  return node;
};

function makeBrownNoiseNode(audioContext) {
  const bufferSize = 4096;

  let lastOut = 0.0;
  const node = audioContext.createScriptProcessor(bufferSize, 1, 1);

  node.onaudioprocess = (e) => {
    const output = e.outputBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      // wombat?!
      output[i] = 1//(lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // (roughly) compensate for gain
    }
  };

  return node;
}

function brownNoise(delay, duration, gain = 0.2, noiseNode) {
  if (!isAudioApiSupported()) return;

  const gainNode = audioContext.createGain();
  const brownNoiseNode = createBrownNoiseNode();
  //const brownNoiseNode = noiseNode;

  gainNode.gain.value = gain;

  let st2;

  const st1 = setTimeout(() => {
    brownNoiseNode.connect(gainNode);
    gainNode.connect(globalGainNode);

    st2 = setTimeout(() => {
      brownNoiseNode.disconnect();
    }, duration);
  }, delay * 1000);

  return () => {
    brownNoiseNode.disconnect();
    clearTimeout(st1);
    clearTimeout(st2);
  };
}

class SimpleReverb {
  constructor(context, input, output) {
    this.context = context;
  }

  setup(reverbTime = 1) {
    this.effect = this.context.createConvolver();

    this.reverbTime = reverbTime;

    this.attack = 0.0001;
    this.decay = 0.1;
    this.release = reverbTime;

    this.wet = this.context.createGain();
    this.wet.connect(this.effect);

    this.decayTime = 0.8;
    this.wet.gain.value = 2;

    //this.renderTail();
  }

  setup2(input, output) {
    this.input = input;
    this.output = output;

    this.input.connect(this.wet);
    this.effect.connect(this.output);
  }

  renderTail() {
    const tailContext = new OfflineAudioContext(2, this.context.sampleRate * this.reverbTime, this.context.sampleRate);

    tailContext.oncomplete = (buffer) => {
      this.effect.buffer = buffer.renderedBuffer;
    };

    const tailOsc = makeBrownNoiseNode(tailContext);

    // tailOsc.init();
    tailOsc.connect(tailContext.destination);
    tailOsc.attack = this.attack;
    tailOsc.decay = this.decay;
    tailOsc.release = this.release;

    // tailOsc.on({frequency: 500, velocity: 1});
    tailContext.startRendering();
    /* setTimeout(()=>{
      tailOsc.off();
    },1); */
  }

  set decayTime(value) {
    const dc = value / 3;

    this.reverbTime = value;
    this.release = dc;

    return this.renderTail();
  }
}

let verb;

try {
  verb = new SimpleReverb(audioContext);

  verb.setup();
} catch (error) {

}


function randomSlide(startF, endF, duration, gain, waveType) {
  const startTime = audioContext.currentTime;
  const stopTime = (duration) ?
    startTime + duration :
    audioContext.currentTime + 1.5 + 1 * Math.random();
  const startFrequency = startF || 440 + 300 * Math.random();
  const endFrequency = endF || startF || 440 + 300 * Math.random();

  gain = gain || 0.2;

  // create Oscillator node
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const convolverNode = audioContext.createConvolver();

  oscillator.type = waveType || 'sine';
  oscillator.frequency.setValueAtTime(startFrequency, startTime); // value in hertz
  //console.log(audioContext.currentTime);
  oscillator.frequency.linearRampToValueAtTime(endFrequency, stopTime); // value in hertz

  // oscillator.connect(gainNode)
  if (oscillator.type === 'sine' && verb) {
    verb.setup2(oscillator, gainNode);
  } else {
    oscillator.connect(gainNode);
  }

  //const wet = audioContext.createGain();

  //oscillator.connect(wet)
  //wet.connect(convolverNode);
  //convolverNode.connect(gainNode);


  //oscillator.connect(convolverNode)
  //convolverNode.connect(gain)

  gainNode.connect(globalGainNode);

  gainNode.gain.value = 0;

  // fade in just after start time to prevent pops
  gainNode.gain.setTargetAtTime(gain, startTime + 0.01, 0.01);

  // fade just before stop time to prevent pops
  gainNode.gain.setTargetAtTime(0, (stopTime - 0.06), 0.01);

  oscillator.start(startTime || 0);
  oscillator.stop(stopTime);

  //console.log('random slide');
}

export default {
  audioContext,
  //playNote,
  // noteRange,
  // noteNameRange,
  //makeNote,
  // nextNote,
  // prevNote,
 // playSequenceNote,
 // songNote,
  //songNoise,
  randomSlide,
  brownNoise
};
