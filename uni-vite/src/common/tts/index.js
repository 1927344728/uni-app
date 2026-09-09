import { H5TTSService } from './H5TTSService.js'
import { AppTTSService } from './AppTTSService.js'
import { XfTTSService } from './XfTTSService.js'
import { XfServerTTSService } from './XfServerTTSService.js'

export { H5TTSService, AppTTSService, XfTTSService, XfServerTTSService }

export class TTSService {
  constructor(config = {}) {
    this.ttsService = null
    // #ifdef APP-PLUS
    this.ttsService = new AppTTSService(config)
    console.log('TTSService', 'AppTTSService')
    // #endif

    // #ifdef H5
    // if (typeof window !== 'undefined' && window.speechSynthesis) {
    //   this.ttsService = new H5TTSService(config)
    //   console.log('TTSService', 'H5TTSService')
    // }
    // #endif

    // 小程序无 speechSynthesis，走服务端讯飞 TTS（COS 缓存）+ InnerAudioContext
    // #ifdef MP
    this.ttsService = new XfServerTTSService(config)
    console.log('TTSService', 'XfServerTTSService')
    // #endif

    if (!this.ttsService) {
      this.ttsService = new XfServerTTSService(config)
      console.log('TTSService', 'XfServerTTSService')
    }
  }

  speak (text, options = {}) {
    return this.ttsService.speak(text, options)
  }
  play (text, options = {}) {
    return this.ttsService.play(text, options)
  }
  stop () {
    return this.ttsService.stop()
  }
  pause () {
    return this.ttsService.pause()
  }
  resume () {
    return this.ttsService.resume()
  }
  destroy () {
    return this.ttsService.destroy()
  }

  get isLoading () {
    return !!this.ttsService.isLoading
  }
  get isSpeaking () {
    return !!this.ttsService.isSpeaking
  }
  get isPaused () {
    return !!this.ttsService.isPaused
  }
}
