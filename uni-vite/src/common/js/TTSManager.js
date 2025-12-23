export default class TTSManager {
  constructor() {
    this.config = {
      voice: '',
      rate: 1.0,
      volume: 1.0,
      pitch: 1.0
    }
    this.isSpeaking = false
    this.isPausing = false
  }
  setConfig(config) {
    this.config = { ...this.config, ...config }
  }

  async speak(text, options = {}) {
    if (!text) {
      return Promise.reject('文本内容不能为空')
    }
    
    try {
      // #ifdef APP-PLUS
      return await this.speakInApp(text, options)
      // #endif
      
      // #ifdef H5
      return await this.speakInH5(text, options)
      // #endif
      
      return Promise.reject('平台不支持')
      
    } catch (error) {
      console.error('TTS播放失败:', error)
      throw error
    }
  }

  speakInApp(text, options) {
    const config = { ...this.config, ...options }
    return new Promise((resolve, reject) => {
      // #ifdef APP-PLUS
      if (plus.speech) {
        plus.speech.stop()
        plus.speech.speak(text, {
          volume: config.volume || 1.0,
          rate: config.rate || 1.0,
          voice: config.voice || 1, // 0-系统默认，1-中文，2-英文
        }, () => {
          this.stop()
          resolve()
        }, (error) => {
          this.stop()
          reject(error)
        })
        this.isSpeaking = true
      } else {
        reject('当前设备不支持语音合成')
      }
      // #endif
    })
  }

  async speakInH5(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject('浏览器不支持Web Speech API')
        return
      }
      this.stop()

      const config = { ...this.config, ...options }
      const utterance = new SpeechSynthesisUtterance(text)
      
      utterance.rate = config.rate || 1
      utterance.volume = config.volume || 1.0
      utterance.pitch = config.pitch || 1.0
      if (config.lang) {
        utterance.lang = config.lang
      }
      if (config.voice && window.speechSynthesis.getVoices().length > 0) {
        const voices = window.speechSynthesis.getVoices()
        const voice = voices.find(v => v.name.includes(config.voice))
        if (voice) {
          utterance.voice = voice
        }
      }

      utterance.onend = () => {
        this.clean()
        resolve()
      }

      utterance.onerror = (event) => {
        this.clean()
        reject(`语音合成失败: ${event.error}`)
      }

      window.speechSynthesis.speak(utterance)
      this.isSpeaking = true
    })
  }

  stop() {
    // #ifdef APP-PLUS
    if (plus.speech) {
      plus.speech.stop()
    }
    // #endif

    // #ifdef H5
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    // #endif

    this.clean()
  }

  pause() {
    // #ifdef H5
    if (window.speechSynthesis) {
      window.speechSynthesis.pause()
      this.isSpeaking = false
      this.isPausing = true
    }
    // #endif
  }

  resume() {
    // #ifdef H5
    if (window.speechSynthesis) {
      window.speechSynthesis.resume()
      this.isSpeaking = true
      this.isPausing = false
    }
    // #endif
  }

  clean () {
    this.isSpeaking = false
    this.isPausing = false
  }
}