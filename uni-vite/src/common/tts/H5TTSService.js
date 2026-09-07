import { TTSBaseService } from './base.js'

function getSpeechSynthesis () {
  return typeof window !== 'undefined' ? window.speechSynthesis : null
}

export class H5TTSService extends TTSBaseService {
  constructor(config = {}) {
    super(config)
    console.log('H5TTSService')
  }

  speak (text, options = {}) {
    return this.play(text, options)
  }

  async play (text, options = {}) {
    const content = this.validateText(text)
    const speechSynthesis = getSpeechSynthesis()
    if (!speechSynthesis) {
      throw new Error('浏览器不支持Web Speech API')
    }

    this.stop()
    this.setState({ loading: true })

    const utterance = this.createUtterance(content, {
      ...this.config,
      ...options
    })

    return new Promise((resolve, reject) => {
      utterance.onstart = () => {
        this.setState({ speaking: true })
        this.callOption(options, 'onPlay')
      }

      utterance.onend = () => {
        this.setState()
        this.callOption(options, 'onEnded')
        resolve()
      }

      utterance.onerror = (event) => {
        this.setState()
        const error = event && event.error ? event.error : new Error('TTS播放失败')
        this.callOption(options, 'onError', error)
        if (error !== 'interrupted') {
          uni.showToast({
            title: error && error.message ? error.message : 'TTS播放失败',
            icon: 'error'
          })
        }
        reject(error)
      }

      setTimeout(() => {
        speechSynthesis.speak(utterance)
      }, 100)
    })
  }

  createUtterance (text, config) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = config.rate || 1
    utterance.volume = config.volume || 1.0
    utterance.pitch = config.pitch || 1.0
    if (config.lang) {
      utterance.lang = config.lang
    }

    const voice = this.findVoice(config.voice)
    if (voice) {
      utterance.voice = voice
    }
    return utterance
  }

  findVoice (voiceName) {
    const speechSynthesis = getSpeechSynthesis()
    if (!voiceName || !speechSynthesis) return null

    const voices = speechSynthesis.getVoices()
    return voices.find(v => v.name.includes(voiceName)) || null
  }

  stop () {
    // #ifdef H5
    const speechSynthesis = getSpeechSynthesis()
    if (speechSynthesis) {
      speechSynthesis.cancel()
    }
    // #endif
    this.setState()
  }

  pause () {
    // #ifdef H5
    const speechSynthesis = getSpeechSynthesis()
    if (speechSynthesis) {
      speechSynthesis.pause()
      this.setState({ paused: true })
    }
    // #endif
  }

  resume () {
    // #ifdef H5
    const speechSynthesis = getSpeechSynthesis()
    if (speechSynthesis) {
      speechSynthesis.resume()
      this.setState({ speaking: true })
    }
    // #endif
  }
}
