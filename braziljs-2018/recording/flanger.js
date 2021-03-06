const audioContext = new AudioContext()
const analyser = new modules.Analyser(audioContext, document.getElementById('analyser').getContext('2d'))
const SAMPLE_RATE = audioContext.sampleRate

const duration = 0.5
const increment = 1 / SAMPLE_RATE
const RECORDED1 = []
const RECORDED2 = []

let recorder1 = new Recorder(audioContext, { channels: 1, makeSound: true }) // eslint-disable-line
let recorder2 = new Recorder(audioContext, { channels: 1, makeSound: true }) // eslint-disable-line
const source = audioContext.createBufferSource()

const init = () => {
  const signal = []

  for (let t = 0; t < (duration - increment); t += increment) {
    if (t < 0.00665) {
      signal.push(0.95 * Math.sin(2 * 3.14 * 300 * t))
    } else {
      signal.push(0)
    }
  }

  const buffer = audioContext.createBuffer(1, signal.length, audioContext.sampleRate)
  const data1 = buffer.getChannelData(0)

  for (let i = 0; i < signal.length; i += 1) {
    data1[i] = signal[i]
  }

  const flanger = new Flanger({ audioContext, delayTime: 0.00005, feedbackValue: 0.5, speedValue: 0.3, gainValue: 0.1 })

  source.buffer = buffer
  source.looping = false

  recorder1.onAudioProcess((data) => {
    RECORDED1.push(...data)
  })

  recorder2.onAudioProcess((data) => {
    RECORDED2.push(...data)
  })

  // source.connect(flanger.inputGain)
  flanger.setInput(source)
  source.connect(recorder1.node)
  flanger.node.connect(analyser.node)
  recorder1.node.connect(audioContext.destination)

  flanger.node.connect(recorder2.node)
  recorder2.node.connect(audioContext.destination)

  analyser.start()

  source.start(audioContext.currentTime)

  source.onended = onEnded

  // stops song 1 second after starts, this will trigger 'onended' callback
  source.stop(audioContext.currentTime + 1)
}

const onEnded = () => {
  recorder1.node.disconnect()
  recorder2.node.disconnect()
  source.disconnect()
  analyser.node.disconnect()

  console.log('pew')
  // window.localStorage.setItem('recorded', RECORDED2)
  const recorded = window.localStorage.getItem('recorded').split(',').slice(0, 1500)

  plotGraph({
    signals: [
      RECORDED1.slice(0, 1500),
      RECORDED2.slice(0, 1500),
      recorded
    ],
    context: document.getElementById('comparison').getContext('2d'),
    suggestedMin: -1,
    suggestedMax: 1,
    colors: ['orange', 'white', 'yellow']
  })
}

init()
