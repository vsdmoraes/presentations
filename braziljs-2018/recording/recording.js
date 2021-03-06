const audioContext = new AudioContext()

const analyser = new modules.Analyser(audioContext, document.getElementById('analyser').getContext('2d'))
const audioUtils = new modules.AudioUtils(audioContext)

const RECORDED1 = []
const RECORDED2 = []

let source
// let delay
let filter
let recorder1 = new Recorder(audioContext) // eslint-disable-line
let recorder2 = new Recorder(audioContext) // eslint-disable-line

audioUtils
  .loadSound('../assets/musics/sound-and-vision.mp3', audioContext)
  .then((buffer) => {
    source = audioContext.createBufferSource()
    filter = audioContext.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1000

    source.buffer = buffer
    source.looping = false
    // delay.delayTime.setValueAtTime(0.01, audioContext.currentTime)

    recorder1.onAudioProcess((data) => {
      RECORDED1.push(...data)
    })

    recorder2.onAudioProcess((data) => {
      RECORDED2.push(...data)
    })

    source.connect(filter)
    source.connect(recorder1.node)
    source.connect(analyser.node)
    recorder1.node.connect(audioContext.destination)

    filter.connect(recorder2.node)
    recorder2.node.connect(audioContext.destination)

    analyser.start()

    // starts song on 75 seconds
    source.start(audioContext.currentTime, 75)

    source.onended = onEnded

    // stops song 1 second after starts, this will trigger 'onended' callback
    source.stop(audioContext.currentTime + 1)
  })

const onEnded = () => {
  recorder1.node.disconnect()
  recorder2.node.disconnect()
  source.disconnect()
  analyser.node.disconnect()
  // delay.disconnect()

  const recordedToPlot = RECORDED1.slice(0, 600)

  const axis = []

  recordedToPlot.forEach((v, i) => axis.push(i))

  plotGraph({
    signals: [
      recordedToPlot,
      RECORDED2.slice(0, 600)
    ],
    axis,
    context: document.getElementById('comparison').getContext('2d'),
    suggestedMin: -1,
    suggestedMax: 1,
    colors: ['orange', 'white']
  })
}
