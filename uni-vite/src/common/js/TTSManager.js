
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
    
    return this.play(text, options).catch(error => {})
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
        resolve()
      }

      utterance.onerror = (event) => {
        this.destroy()
        if (options.onError){
          options.onError(event.error);
        }
        uni.showToast({
          title: event.error && event.error.message ? event.error.message : 'TTS播放失败',
          icon: 'error'
        })
        reject(event && event.error ? event.error : 'TTS播放失败')
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
    // 用于结束判定：优先用 TTS 引擎状态轮询，其次才用最大时长兜底。
    this._fallbackTimer = null
    this._endPollInterval = null
    this._endPollTimeout = null
    this._endedHandledUtteranceId = null
    // 解决“首次 speak 偶发无声”的初始化时序问题：首次播放前进行短预热。
    this._warmedUp = false

    // 尽量在 constructor 阶段就开始初始化，避免首次点击时机型/引擎仍未完全就绪。
    // 注意：这里不阻塞构造；失败时 speak() 会再次按需初始化。
    if (this._isAndroid()) {
      try {
        this._initAndroidTTS()
          .then(() => {
            this._warmedUp = true
          })
          .catch(() => {})
      } catch (e) {}
    }
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
    if (this._endPollInterval) {
      clearInterval(this._endPollInterval)
      this._endPollInterval = null
    }
    if (this._endPollTimeout) {
      clearTimeout(this._endPollTimeout)
      this._endPollTimeout = null
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

  _handleEnded ({ utteranceId, callFrom } = {}) {
    // 停止/切换时可能把 _currentUtteranceId 清掉；这种场景直接忽略。
    const currentId = this._currentUtteranceId
    if (!currentId) return

    // 监听回调若没有回传 utteranceId，可能会在“旧回调竞争新播放”时误伤当前播放。
    // 此类情况交给 poll/timeout 去兜底。
    if (callFrom === 'listener' && !utteranceId) return

    // 若引擎回传了 utteranceId 且不一致，则视为旧回调。
    if (utteranceId && utteranceId !== currentId) return

    if (this._endedHandledUtteranceId === currentId) return
    this._endedHandledUtteranceId = currentId

    this.isLoading = false
    this.isSpeaking = false
    this.isPaused = false

    const opts = this._currentOptions || {}
    if (opts.onEnded) opts.onEnded()

    // 清理 timers/state，避免 onDone/poll/timeout 多次触发
    this._clearPending({ resolvePending: true })
  }

  _handleError ({ err, utteranceId } = {}) {
    const currentId = this._currentUtteranceId
    if (!currentId) return
    if (utteranceId && utteranceId !== currentId) return

    this.isLoading = false
    this.isSpeaking = false
    this.isPaused = false

    const opts = this._currentOptions || {}
    if (opts.onError) opts.onError(err)

    const pendingReject = this._pendingReject
    this._clearPending({ resolvePending: false })
    if (pendingReject) {
      try {
        pendingReject(err)
      } catch (e) {}
    }
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
            console.log('[AppTTSService] TextToSpeech init SUCCESS')
            // 尽量安装进度回调；个别机型可能不支持，失败也不阻断播放。
            try {
              const setListener = () => {
                if (typeof plus.android.implements !== 'function') return

                const listener = plus.android.implements('android.speech.tts.UtteranceProgressListener', {
                  onStart: (utteranceId) => {
                    const currentId = this._currentUtteranceId
                    if (!currentId) return
                    if (utteranceId && utteranceId !== currentId) return

                    if (currentId) {
                      this.isLoading = false
                      this.isSpeaking = true
                      this.isPaused = false
                      if (this._currentOptions && this._currentOptions.onPlay) {
                        this._currentOptions.onPlay()
                      }
                    }
                  },
                  onDone: (utteranceId) => {
                    this._handleEnded({ utteranceId, callFrom: 'listener' })
                  },
                  onError: (utteranceId) => {
                    const err = new Error('Android TTS error')
                    this._handleError({ err, utteranceId })
                  }
                })

                try {
                  tts.setOnUtteranceProgressListener(listener)
                } catch (e) {}
              }

              setListener()
            } catch (e) {}

            // 某些系统/引擎会强制用户在“系统 TTS 设置”里的默认值，可能导致 setSpeechRate/setPitch 被覆盖。
            try {
              if (typeof tts.areDefaultsEnforced === 'function') {
                console.log('[AppTTSService] areDefaultsEnforced=', tts.areDefaultsEnforced())
              }
            } catch (e) {}

            resolve()
          } else {
            console.error('[AppTTSService] TextToSpeech init failed, status=', status)
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

    // 某些机型在首次初始化后立刻 speak() 会偶发无声，需要给引擎一点点就绪时间。
    if (!this._warmedUp) {
      this._warmedUp = true
      console.log('[AppTTSService] warm-up delay before first speak')
      await new Promise(resolve => setTimeout(resolve, 350))
    }

    console.log('AppTTSService')
    const rate = options.rate || this.config.rate || 1.0
    const pitch = options.pitch || this.config.pitch || 1.0

    const effectiveRate = Math.max(0.1, Math.min(2.0, Number(rate)))
    const effectivePitch = Math.max(0.1, Math.min(2.0, Number(pitch)))

    // 应用语速/音高（Android 原生对音量支持有限，这里先忽略 volume）
    try {
      if (this.tts && this.tts.setSpeechRate) {
        this.tts.setSpeechRate(effectiveRate)
      }
    } catch (e) {}
    try {
      if (this.tts && this.tts.setPitch) {
        this.tts.setPitch(effectivePitch)
      }
    } catch (e) {}

    const utteranceId = 'tts_' + Date.now() + '_' + (this._utteranceIndex++)
    this._currentUtteranceId = utteranceId
    this._endedHandledUtteranceId = null

    return new Promise((resolve, reject) => {
      this._pendingResolve = resolve
      this._pendingReject = reject

      const maxDurationMs = this._estimateDurationMs(text, rate)

      // 优先使用引擎的 isSpeaking() 状态轮询来判断播放是否真正结束，
      // 以减少某些机型 onDone 回调延迟（你提到的 10s 左右情况）。
      this._endPollInterval = setInterval(() => {
        if (this._currentUtteranceId !== utteranceId) return
        try {
          if (this.tts && typeof this.tts.isSpeaking === 'function') {
            const speaking = this.tts.isSpeaking()
            if (!speaking) {
              this._handleEnded({ utteranceId, callFrom: 'poll' })
            }
          }
        } catch (e) {}
      }, 300)

      // 最大时长兜底：避免引擎状态/回调都失效导致 Promise 永远不结束。
      this._endPollTimeout = setTimeout(() => {
        if (this._currentUtteranceId === utteranceId) {
          this._handleEnded({ utteranceId, callFrom: 'timeout' })
        }
      }, maxDurationMs)

      const TextToSpeech = plus.android.importClass('android.speech.tts.TextToSpeech')
      const Bundle = plus.android.importClass('android.os.Bundle')
      const params = new Bundle()

      try {
        params.putString('utterance_id', utteranceId)
      } catch (e) {}

      // 为了提高不同引擎上“语速/音高生效率”，同时通过 Bundle 传入引擎参数。
      // 某些 Android 版本/引擎会忽略 setSpeechRate/setPitch，但会读取 params 中的 KEY_PARAM_*。
      try {
        const Engine = plus.android.importClass('android.speech.tts.TextToSpeech$Engine')
        const rateKey = Engine && Engine.KEY_PARAM_RATE
        const pitchKey = Engine && Engine.KEY_PARAM_PITCH

        const putInt = (key, value) => {
          if (!key) return
          // plus.android 下静态常量有时是字符串，有时是对象包装。
          const actualKey = typeof key === 'string' ? key : key.value
          if (actualKey) params.putInt(String(actualKey), value)
        }

        putInt(rateKey, Math.round(effectiveRate * 100))
        putInt(pitchKey, Math.round(effectivePitch * 100))
      } catch (e) {}

      const queueMode = TextToSpeech.QUEUE_FLUSH

      // 某些机型首发偶发失败：尝试一次重试。
      let didRetry = false
      const invokeSpeakOnce = () => {
        // 这里尽量不依赖 speak 的返回值类型（plus.android 下可能是数字/对象），
        // 但如果能拿到数字且非 0，则视为失败。
        let ret
        try {
          ret = this.tts.speak(text, queueMode, params, utteranceId)
        } catch (e) {
          // 老/特殊机型：尝试少一个参数的重载
          ret = this.tts.speak(text, queueMode, params)
        }
        return ret
      }

      const invokeSpeak = () => {
        if (this._currentUtteranceId !== utteranceId) return

        let ret
        try {
          ret = invokeSpeakOnce()
        } catch (err) {
          try {
            reject(err)
          } catch (e) {}
          this._clearPending({ resolvePending: false })
          return
        }

        if (typeof ret === 'number' && ret !== 0) {
          if (!didRetry) {
            didRetry = true
            console.warn('[AppTTSService] speak non-zero code, retry once. code=', ret)
            setTimeout(() => {
              if (this._currentUtteranceId === utteranceId) {
                invokeSpeak()
              }
            }, 250)
          } else {
            const err = new Error('Android TTS speak failed, code=' + ret)
            try {
              console.error('[AppTTSService] speak failed after retry. code=', ret)
              reject(err)
            } catch (e) {}
            this._clearPending({ resolvePending: false })
          }
        }
      }

      invokeSpeak()
    })
  }

  stop () {
    try {
      if (this.tts) this.tts.stop()
    } catch (e) {}

    this.isLoading = false
    this.isSpeaking = false

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

let _defaultTtsService = null

export function getDefaultTTSService () {
  if (_defaultTtsService) return _defaultTtsService
  let service = new H5TTSService()
  // #ifdef APP-PLUS
  service = new AppTTSService()
  // #endif
  _defaultTtsService = service
  return _defaultTtsService
}

export const TTSManager = {
  speak (text, options = {}) {
    return getDefaultTTSService().speak(text, options)
  },
  stop () {
    return getDefaultTTSService().stop()
  },
  pause () {
    return getDefaultTTSService().pause()
  },
  resume () {
    return getDefaultTTSService().resume()
  },
  destroy () {
    return getDefaultTTSService().destroy()
  },
  get isLoading () {
    return !!getDefaultTTSService().isLoading
  },
  get isSpeaking () {
    return !!getDefaultTTSService().isSpeaking
  },
  get isPaused () {
    return !!getDefaultTTSService().isPaused
  }
}