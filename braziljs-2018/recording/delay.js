const audioContext = new AudioContext()
const analyser = new modules.Analyser(audioContext, document.getElementById('analyser').getContext('2d'))

const RECORDED1 = []
const RECORDED2 = []

let delay

const SAMPLE_RATE = audioContext.sampleRate
const duration = 0.5
const increment = 1 / SAMPLE_RATE

let recorder1 = new Recorder(audioContext, { channels: 1 }) // eslint-disable-line
let recorder2 = new Recorder(audioContext, { channels: 1 }) // eslint-disable-line
const source = audioContext.createBufferSource()

const init = () => {
  const signal = []

  for (let t = 0; t < (duration - increment); t += increment) {
    signal.push(Math.sin(2 * 3.14 * 200 * t))
  }

  const buffer = audioContext.createBuffer(1, signal.length, audioContext.sampleRate)
  const data1 = buffer.getChannelData(0)

  for (let i = 0; i < signal.length; i += 1) {
    data1[i] = signal[i]
  }

  delay = audioContext.createDelay(2)

  source.buffer = buffer
  source.looping = false
  delay.delayTime.setValueAtTime(0.001, audioContext.currentTime)

  recorder1.onAudioProcess((data) => {
    RECORDED1.push(...data)
  })

  recorder2.onAudioProcess((data) => {
    RECORDED2.push(...data)
  })

  source.connect(delay)
  source.connect(recorder1.node)
  source.connect(analyser.node)
  recorder1.node.connect(audioContext.destination)

  delay.connect(recorder2.node)
  recorder2.node.connect(audioContext.destination)

  analyser.start()

  source.start(audioContext.currentTime)

  source.onended = onEnded

  // stops song 1 second after starts, this will trigger 'onended' callback
  source.stop(audioContext.currentTime + 0.5)
}

const onEnded = () => {
  recorder1.node.disconnect()
  recorder2.node.disconnect()
  source.disconnect()
  analyser.node.disconnect()
  delay.disconnect()

  const recordedToPlot = RECORDED1.slice(0, 1000)

  const axis = []

  recordedToPlot.forEach((v, i) => axis.push(i))

  plotGraph({
    signals: [
      recordedToPlot,
      RECORDED2.slice(0, 1000)
    ],
    axis,
    context: document.getElementById('comparison').getContext('2d'),
    suggestedMin: -1,
    suggestedMax: 1,
    colors: ['red', 'orange']
  })
}

init()
