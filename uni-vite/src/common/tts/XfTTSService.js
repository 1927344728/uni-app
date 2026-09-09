import { TTSBaseService } from './base.js'
import XfTTS from './XfTTS.js'

export class XfTTSService extends TTSBaseService {
  constructor(config = {}) {
    super(config)
    this.xfTTS = null
    this.audio = null
    this.currentAudioUrl = ''
    console.log('XfTTSService')
  }

  speak (text, options = {}) {
    return this.play(text, options)
  }

  async play (text, options = {}) {
    const content = this.validateText(text)
    const audioUrl = await this.createAudioUrl(content, options)
    return this.playAudioUrl(audioUrl, options)
  }

  async createAudioUrl (text, options = {}) {
    this.setState({ loading: true })
    const tts = this.getXfTTS()
    return tts.createAudioUrl(text, this.toXfOptions(options))
  }

  getXfTTS () {
    if (!this.xfTTS) {
      this.xfTTS = new XfTTS(this.config)
    }
    return this.xfTTS
  }

  toXfOptions (options = {}) {
    const xfOptions = {}
    if (options.vcn) xfOptions.vcn = options.vcn
    if (options.rate) xfOptions.speed = options.rate * 100
    if (options.volume !== undefined) xfOptions.volume = options.volume
    return xfOptions
  }

  playAudioUrl (audioUrl, options = {}) {
    return new Promise((resolve, reject) => {
      this.releaseAudio()

      const audio = uni.createInnerAudioContext()
      this.audio = audio
      this.currentAudioUrl = audioUrl

      audio.src = audioUrl
      audio.autoplay = options.autoplay !== false
      if (options.volume !== undefined) {
        audio.volume = options.volume
      }

      audio.onPlay(() => {
        this.setState({ speaking: true })
        this.callOption(options, 'onPlay')
      })

      audio.onEnded(() => {
        this.setState()
        this.callOption(options, 'onEnded')
        this.releaseAudio()
        resolve()
      })

      audio.onError((error) => {
        this.setState()
        this.callOption(options, 'onError', error)
        this.releaseAudio()
        reject(error)
      })

      this.setState({ speaking: true })
      audio.play()
    })
  }

  stop () {
    this.releaseAudio()
    this.setState()
  }

  pause () {
    // 各端 InnerAudioContext 的 paused 属性并不都可靠，以服务自身状态为准
    if (!this.audio || this.isPaused) return
    this.audio.pause()
    this.setState({ paused: true })
  }

  resume () {
    if (!this.audio || !this.isPaused) return
    this.audio.play()
    this.setState({ speaking: true })
  }

  destroy () {
    this.stop()
    this.xfTTS = null
  }

  releaseAudio () {
    if (this.audio) {
      try {
        this.audio.stop()
        this.audio.destroy()
      } catch (e) {}
      this.audio = null
    }
    this.revokeObjectUrl(this.currentAudioUrl)
    this.currentAudioUrl = ''
  }

  revokeObjectUrl (audioUrl) {
    // #ifdef H5
    if (audioUrl && audioUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(audioUrl)
      } catch (e) {}
    }
    // #endif
  }
}
