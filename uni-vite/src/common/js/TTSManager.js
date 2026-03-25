
// NOTE: iFlytek TTS (XfTTSService) is loaded lazily to avoid including it in
// App runtime when only AppTTSService is used.

export class H5TTSService {
  constructor(config = {}) {
    this.config = {
      voice: '',
      rate: 1.0,
      volume: 1.0,
      pitch: 1.0,
      ...config
    }
    this.isSpeaking = false
    this.isPaused = false
    console.log('H5TTSService')
  }

  async speak(text, options = {}) {
    if (!text) {
      return Promise.reject('文本内容不能为空')
    }
    
    try {
      // #ifdef H5
      return await this.play(text, options)
      // #endif
      uni.showToast({
        title: '平台不支持',
        icon: 'error'
      });
      return Promise.reject('平台不支持')
    } catch (error) {
      console.error('TTS播放失败:', error)
      throw error
    }
  }

  async play(text, options = {}) {
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
        this.stop()
        if (options.onEnded) {
          options.onEnded();
        }
      }

      utterance.onerror = (event) => {
        this.destroy()
        if (options.onError){
          options.onError(event.error);
        }
      }

      if (this.isSpeaking) {
        setTimeout(() => {
          window.speechSynthesis.speak(utterance)
          this.isSpeaking = true
        }, 300)
      } else {
        window.speechSynthesis.speak(utterance)
        this.isSpeaking = true
      }
    })
  }

  stop() {
    // #ifdef H5
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    // #endif
  }

  pause() {
    // #ifdef H5
    if (window.speechSynthesis) {
      window.speechSynthesis.pause()
      this.isSpeaking = false
      this.isPaused = true
    }
    // #endif
  }

  resume() {
    // #ifdef H5
    if (window.speechSynthesis) {
      window.speechSynthesis.resume()
      this.isSpeaking = true
      this.isPaused = false
    }
    // #endif
  }

  destroy () {
    this.stop()
    this.isSpeaking = false
    this.isPaused = false
  }
}

export class AppTTSService {
  constructor(config = {}) {
    this.config = {
      voice: '',
      rate: 1.0,
      volume: 1.0,
      pitch: 1.0,
      lang: '',
      ...config
    }

    this.tts = null
    this._initPromise = null

    this.isLoading = false
    this.isSpeaking = false
    this.isPaused = false

    this._currentText = ''
    this._currentOptions = null

    this._pendingResolve = null
    this._pendingReject = null
    this._currentUtteranceId = null
    this._utteranceIndex = 0
    this._fallbackTimer = null

    console.log('AppTTSService')
  }

  _isAndroid () {
    return typeof plus !== 'undefined' && plus.os && plus.os.name === 'Android'
  }

  _estimateDurationMs (text, rate) {
    const r = rate || 1
    const perSec = Math.max(1.5, 3.0 * r) // rough chars/sec
    const len = String(text || '').replace(/\s+/g, '').length
    const ms = (len / perSec) * 1000
    return Math.max(800, Math.min(60000, ms))
  }

  _clearPending ({ resolvePending = true } = {}) {
    if (this._fallbackTimer) {
      clearTimeout(this._fallbackTimer)
      this._fallbackTimer = null
    }

    if (resolvePending && this._pendingResolve) {
      try {
        this._pendingResolve()
      } catch (e) {}
    }

    this._pendingResolve = null
    this._pendingReject = null
    this._currentUtteranceId = null
  }

  async _initAndroidTTS () {
    if (this.tts) return
    if (this._initPromise) return this._initPromise

    this._initPromise = new Promise((resolve, reject) => {
      try {
        const TextToSpeech = plus.android.importClass('android.speech.tts.TextToSpeech')
        const activity = plus.android.runtimeMainActivity()
        const context = activity.getApplicationContext()

        const tts = new TextToSpeech(context, (status) => {
          // 0 = SUCCESS
          if (status === 0) {
            // 尽量安装进度回调；个别机型可能不支持，失败也不阻断播放。
            try {
              const setListener = () => {
                if (typeof plus.android.implements !== 'function') return

                const listener = plus.android.implements('android.speech.tts.UtteranceProgressListener', {
                  onStart: (utteranceId) => {
                    if (utteranceId && utteranceId === this._currentUtteranceId) {
                      this.isLoading = false
                      this.isSpeaking = true
                      this.isPaused = false
                      if (this._currentOptions && this._currentOptions.onPlay) {
                        this._currentOptions.onPlay()
                      }
                    }
                  },
                  onDone: (utteranceId) => {
                    if (utteranceId && utteranceId === this._currentUtteranceId) {
                      this.isLoading = false
                      this.isSpeaking = false
                      this.isPaused = false

                      const opts = this._currentOptions || {}

                      if (opts.onEnded) opts.onEnded()
                      this._clearPending({ resolvePending: true })
                    }
                  },
                  onError: (utteranceId) => {
                    if (utteranceId && utteranceId === this._currentUtteranceId) {
                      this.isLoading = false
                      this.isSpeaking = false
                      this.isPaused = false

                      const err = new Error('Android TTS error')
                      const opts = this._currentOptions || {}
                      if (opts.onError) opts.onError(err)

                      const pendingReject = this._pendingReject
                      this._clearPending({ resolvePending: false })
                      if (pendingReject) pendingReject(err)
                    }
                  }
                })

                try {
                  tts.setOnUtteranceProgressListener(listener)
                } catch (e) {}
              }

              setListener()
            } catch (e) {}

            resolve()
          } else {
            reject(new Error('Android TTS init failed, status=' + status))
          }
        })

        this.tts = tts
      } catch (e) {
        reject(e)
      }
    })

    return this._initPromise
  }

  async speak (text, options = {}) {
    if (!text) return Promise.reject('文本内容不能为空')

    this._currentText = text
    this._currentOptions = options || {}

    if (!this._isAndroid()) {
      uni.showToast({ title: '平台不支持', icon: 'error' })
      return Promise.reject('平台不支持')
    }

    this.isLoading = true
    this.isSpeaking = true
    this.isPaused = false

    // 取消上一段播放（模拟 speechSynthesis 行为：同一时间只播一段）
    this.stop()
    this.isLoading = true
    this.isSpeaking = true
    this.isPaused = false

    await this._initAndroidTTS()

    console.log('AppTTSService')
    const rate = options.rate || this.config.rate || 1.0
    const pitch = options.pitch || this.config.pitch || 1.0

    // 应用语速/音高（Android 原生对音量支持有限，这里先忽略 volume）
    try {
      if (this.tts && this.tts.setSpeechRate) {
        this.tts.setSpeechRate(Math.max(0.1, Math.min(2.0, rate)))
      }
    } catch (e) {}
    try {
      if (this.tts && this.tts.setPitch) {
        this.tts.setPitch(Math.max(0.1, Math.min(2.0, pitch)))
      }
    } catch (e) {}

    const utteranceId = 'tts_' + Date.now() + '_' + (this._utteranceIndex++)
    this._currentUtteranceId = utteranceId

    return new Promise((resolve, reject) => {
      this._pendingResolve = resolve
      this._pendingReject = reject

      // 兜底：进度监听未生效时，用时长估算结束。
      this._fallbackTimer = setTimeout(() => {
        if (this._currentUtteranceId === utteranceId) {
          this.isLoading = false
          this.isSpeaking = false
          this.isPaused = false
          const opts = this._currentOptions || {}
          if (opts.onEnded) opts.onEnded()
          this._clearPending({ resolvePending: true })
        }
      }, this._estimateDurationMs(text, rate))

      const TextToSpeech = plus.android.importClass('android.speech.tts.TextToSpeech')
      const Bundle = plus.android.importClass('android.os.Bundle')
      const params = new Bundle()

      try {
        params.putString('utterance_id', utteranceId)
      } catch (e) {}

      const queueMode = TextToSpeech.QUEUE_FLUSH

      try {
        this.tts.speak(text, queueMode, params, utteranceId)
      } catch (e) {
        // 老/特殊机型：尝试少一个参数的重载
        try {
          this.tts.speak(text, queueMode, params)
        } catch (e2) {
          if (this._pendingReject) this._pendingReject(e2)
          this._clearPending({ resolvePending: false })
        }
      }
    })
  }

  stop () {
    try {
      if (this.tts) this.tts.stop()
    } catch (e) {}

    this.isLoading = false
    this.isSpeaking = false
    this.isPaused = false

    this._clearPending({ resolvePending: true })
  }

  pause () {
    // Android TextToSpeech 没有真正的 pause API；这里用 stop 模拟，并在 resume 时从头再播。
    try {
      if (this.tts) this.tts.stop()
    } catch (e) {}

    this.isLoading = false
    this.isSpeaking = false
    this.isPaused = true

    // 结束当前 speak() promise，避免界面逻辑卡住。
    this._clearPending({ resolvePending: true })
  }

  resume () {
    if (!this.isPaused) return
    this.isPaused = false
    const text = this._currentText
    const options = this._currentOptions || {}
    this.speak(text, options)
  }

  destroy () {
    this.stop()
    try {
      if (this.tts) this.tts.shutdown()
    } catch (e) {}

    this.tts = null
    this._initPromise = null
    this.isSpeaking = false
    this.isPaused = false
    this.isLoading = false
  }
}

export class XfTTSService  {
  constructor(config) {
    this.xfTTSInstance = null
    this.config = config
    this.innerAudioContext = null;
    this.currentAudioUrl = null;
    this.isLoading = false
    this.isSpeaking = false;
    this.isPaused = false;
    console.log('XfTTSService')
  }

  async _ensureXfInstance () {
    if (this.xfTTSInstance) return
    const mod = await import('./XfTTS.js')
    const XFTTS = mod.default || mod
    this.xfTTSInstance = new XFTTS(this.config)
  }
  
  async speak(text, options = {}) {
    try {
      await this._ensureXfInstance()
      const ttsOptions = {}
      if (ttsOptions.vcn) {
        ttsOptions.vcn = options.vcn;
      }
      if (options.rate) {
        ttsOptions.speed = options.rate * 100;
      }
      if (ttsOptions.volume) {
        ttsOptions.volume = options.volume;
      }
      this.isLoading = true
      const audioUrl = await this.xfTTSInstance.createAudioUrl(text, ttsOptions)
      await this.play(audioUrl, options || {});
      return audioUrl;
    } catch (error) {
      throw error;
    }
  }

  play(audioUrl, options = {}) {
    return new Promise((resolve, reject) => {
      this.destroy();
      
      this.innerAudioContext = uni.createInnerAudioContext();
      this.innerAudioContext.src = audioUrl;
      this.currentAudioUrl = audioUrl;
      
      if (options.autoplay !== false) {
        this.innerAudioContext.autoplay = true;
      }
      
      if (options.volume !== undefined) {
        this.innerAudioContext.volume = options.volume;
      }
      
      this.innerAudioContext.onPlay(() => {
        console.log('音频开始播放');
        this.isLoading = false
        if (options.onPlay) {
          options.onPlay();
        }
      });
      
      this.innerAudioContext.onEnded(() => {
        console.log('音频播放结束');
        if (options.onEnded) {
          options.onEnded()
        };
        resolve();
      });
      
      this.innerAudioContext.onError((error) => {
        console.error('音频播放错误:', error);
        console.error('音频源路径:', audioUrl);
        if (options.onError){
          options.onError(error);
        }
        reject(error);
      });
      
      this.isSpeaking = true;
      this.innerAudioContext.play();
    });
  }

  stop() {
    if (this.innerAudioContext) {
      this.isLoading = false
      this.isSpeaking = false
      this.innerAudioContext.stop();
      this.innerAudioContext.destroy();
      this.innerAudioContext = null;
    }
  }

  pause() {
    if (this.innerAudioContext && !this.innerAudioContext.paused) {
      this.isPaused = true
      this.innerAudioContext.pause();
    }
  }

  resume() {
    if (this.innerAudioContext && this.innerAudioContext.paused) {
      this.isPaused = false
      this.innerAudioContext.play();
    }
  }

  destroy() {
    this.stop();
    this.revokeAudioUrl(this.currentAudioUrl);
    this.currentAudioUrl = null;
    this.isSpeaking = false
    this.isPaused = false
  }

  revokeAudioUrl(audioUrl) {
    // #ifdef H5
    if (audioUrl && audioUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(audioUrl);
      } catch (error) {
        console.warn('清理 blob URL 失败:', error);
      }
    }
    // #endif
  }
}