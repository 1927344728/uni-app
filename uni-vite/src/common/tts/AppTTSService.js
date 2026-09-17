import { TTSBaseService, clampNumber, sleep } from './base.js'

const ANDROID_TTS_OK = 0
const DEFAULT_END_POLL_MS = 300

export class AppTTSService extends TTSBaseService {
  constructor(config = {}) {
    super(config)
    this.tts = null
    this.initPromise = null
    this.currentText = ''
    this.currentOptions = {}
    this.currentUtteranceId = ''
    this.utteranceIndex = 0
    this.pendingResolve = null
    this.pendingReject = null
    this.endPollTimer = null
    this.endTimeoutTimer = null
    this.endedUtteranceId = ''
    this.warmedUp = false

    this.prewarm()
  }

  speak (text, options = {}) {
    return this.play(text, options)
  }

  async play (text, options = {}) {
    const content = this.validateText(text)
    if (!this.isAndroid()) {
      uni.showToast({ title: '平台不支持', icon: 'error' })
      throw new Error('平台不支持')
    }

    this.stop()
    this.currentText = content
    this.currentOptions = options || {}
    this.setState({ loading: true })

    await this.ensureEngine()
    await this.ensureWarmedUp()
    this.applySpeechOptions(options)

    const utteranceId = this.nextUtteranceId()
    this.currentUtteranceId = utteranceId
    this.endedUtteranceId = ''

    return this.startSpeaking(content, options, utteranceId)
  }

  stop () {
    try {
      if (this.tts) this.tts.stop()
    } catch (e) {}

    this.setState()
    this.clearPending({ resolvePending: true })
  }

  pause () {
    // Android TextToSpeech 没有 pause，使用 stop 模拟，resume 时从头播放当前文本。
    try {
      if (this.tts) this.tts.stop()
    } catch (e) {}

    this.setState({ paused: true })
    this.clearPending({ resolvePending: true })
  }

  resume () {
    if (!this.isPaused || !this.currentText) return
    this.play(this.currentText, this.currentOptions)
  }

  destroy () {
    this.stop()
    try {
      if (this.tts) this.tts.shutdown()
    } catch (e) {}

    this.tts = null
    this.initPromise = null
    this.currentText = ''
    this.currentOptions = {}
    this.setState()
  }

  prewarm () {
    if (!this.isAndroid()) return
    this.ensureEngine()
      .then(() => {
        this.warmedUp = true
      })
      .catch(() => {})
  }

  isAndroid () {
    return typeof plus !== 'undefined' && plus.os && plus.os.name === 'Android'
  }

  async ensureEngine () {
    if (this.tts) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      try {
        const TextToSpeech = plus.android.importClass('android.speech.tts.TextToSpeech')
        const activity = plus.android.runtimeMainActivity()
        const context = activity.getApplicationContext()

        this.tts = new TextToSpeech(context, (status) => {
          if (status !== ANDROID_TTS_OK) {
            reject(new Error('Android TTS init failed, status=' + status))
            return
          }

          this.bindProgressListener()
          resolve()
        })
      } catch (e) {
        reject(e)
      }
    })

    return this.initPromise
  }

  bindProgressListener () {
    try {
      if (!this.tts || typeof plus.android.implements !== 'function') return

      const listener = plus.android.implements('android.speech.tts.UtteranceProgressListener', {
        onStart: (utteranceId) => this.handleStart(utteranceId),
        onDone: (utteranceId) => this.handleEnded({ utteranceId, source: 'listener' }),
        onError: (utteranceId) => this.handleError(new Error('Android TTS error'), utteranceId)
      })

      this.tts.setOnUtteranceProgressListener(listener)
    } catch (e) {}
  }

  async ensureWarmedUp () {
    if (this.warmedUp) return
    this.warmedUp = true
    await sleep(350)
  }

  applySpeechOptions (options = {}) {
    const rate = clampNumber(options.rate ?? this.config.rate, 0.1, 2.0, 1.0)
    const pitch = clampNumber(options.pitch ?? this.config.pitch, 0.1, 2.0, 1.0)

    try {
      if (this.tts && this.tts.setSpeechRate) this.tts.setSpeechRate(rate)
    } catch (e) {}
    try {
      if (this.tts && this.tts.setPitch) this.tts.setPitch(pitch)
    } catch (e) {}
    this.applyLanguage(options.lang || this.config.lang)
  }

  applyLanguage (lang) {
    const locale = this.toAndroidLocale(lang)
    if (!locale || !this.tts || !this.tts.setLanguage) return
    try {
      this.tts.setLanguage(locale)
    } catch (e) {}
  }

  toAndroidLocale (lang) {
    const lower = String(lang || '').toLowerCase().replace('_', '-')
    if (!lower) return null
    try {
      const Locale = plus.android.importClass('java.util.Locale')
      if (lower === 'en-gb') return Locale.UK
      if (lower.startsWith('en')) return Locale.US
      if (lower.startsWith('zh')) return Locale.SIMPLIFIED_CHINESE || Locale.CHINA
    } catch (e) {}
    return null
  }

  startSpeaking (text, options, utteranceId) {
    return new Promise((resolve, reject) => {
      this.pendingResolve = resolve
      this.pendingReject = reject
      this.startEndGuards(text, options, utteranceId)
      this.invokeSpeakWithRetry(text, options, utteranceId)
    })
  }

  startEndGuards (text, options, utteranceId) {
    const maxDurationMs = this.estimateDurationMs(text, options.rate)

    this.endPollTimer = setInterval(() => {
      if (this.currentUtteranceId !== utteranceId) return
      try {
        if (this.tts && typeof this.tts.isSpeaking === 'function' && !this.tts.isSpeaking()) {
          this.handleEnded({ utteranceId, source: 'poll' })
        }
      } catch (e) {}
    }, DEFAULT_END_POLL_MS)

    this.endTimeoutTimer = setTimeout(() => {
      if (this.currentUtteranceId === utteranceId) {
        this.handleEnded({ utteranceId, source: 'timeout' })
      }
    }, maxDurationMs)
  }

  invokeSpeakWithRetry (text, options, utteranceId) {
    let didRetry = false
    const speak = () => {
      if (this.currentUtteranceId !== utteranceId) return

      let ret
      try {
        ret = this.invokeSpeak(text, options, utteranceId)
      } catch (error) {
        this.handleError(error, utteranceId)
        return
      }

      if (typeof ret !== 'number' || ret === ANDROID_TTS_OK) return
      if (didRetry) {
        this.handleError(new Error('Android TTS speak failed, code=' + ret), utteranceId)
        return
      }

      didRetry = true
      setTimeout(speak, 250)
    }

    speak()
  }

  invokeSpeak (text, options, utteranceId) {
    const TextToSpeech = plus.android.importClass('android.speech.tts.TextToSpeech')
    const queueMode = TextToSpeech.QUEUE_FLUSH
    const params = this.createSpeakParams(options, utteranceId)

    try {
      return this.tts.speak(text, queueMode, params, utteranceId)
    } catch (e) {
      return this.tts.speak(text, queueMode, params)
    }
  }

  createSpeakParams (options = {}, utteranceId) {
    const Bundle = plus.android.importClass('android.os.Bundle')
    const params = new Bundle()

    try {
      params.putString('utterance_id', utteranceId)
    } catch (e) {}

    try {
      const Engine = plus.android.importClass('android.speech.tts.TextToSpeech$Engine')
      this.putIntParam(params, Engine && Engine.KEY_PARAM_RATE, clampNumber(options.rate ?? this.config.rate, 0.1, 2.0, 1.0) * 100)
      this.putIntParam(params, Engine && Engine.KEY_PARAM_PITCH, clampNumber(options.pitch ?? this.config.pitch, 0.1, 2.0, 1.0) * 100)
    } catch (e) {}

    return params
  }

  putIntParam (params, key, value) {
    if (!key) return
    const actualKey = typeof key === 'string' ? key : key.value
    if (actualKey) params.putInt(String(actualKey), Math.round(value))
  }

  handleStart (utteranceId) {
    if (!this.isCurrentUtterance(utteranceId)) return

    this.setState({ speaking: true })
    this.callOption(this.currentOptions, 'onPlay')
  }

  handleEnded ({ utteranceId, source } = {}) {
    if (!this.currentUtteranceId) return
    if (source === 'listener' && !utteranceId) return
    if (!this.isCurrentUtterance(utteranceId)) return
    if (this.endedUtteranceId === this.currentUtteranceId) return

    this.endedUtteranceId = this.currentUtteranceId
    this.setState()
    this.callOption(this.currentOptions, 'onEnded')
    this.clearPending({ resolvePending: true })
  }

  handleError (error, utteranceId) {
    if (!this.isCurrentUtterance(utteranceId)) return

    this.setState()
    this.callOption(this.currentOptions, 'onError', error)

    const reject = this.pendingReject
    this.clearPending({ resolvePending: false })
    if (reject) {
      reject(error)
    }
  }

  isCurrentUtterance (utteranceId) {
    return !utteranceId || utteranceId === this.currentUtteranceId
  }

  clearPending ({ resolvePending = true } = {}) {
    this.clearTimers()

    const resolve = this.pendingResolve
    this.pendingResolve = null
    this.pendingReject = null
    this.currentUtteranceId = ''

    if (resolvePending && resolve) {
      resolve()
    }
  }

  clearTimers () {
    if (this.endPollTimer) {
      clearInterval(this.endPollTimer)
      this.endPollTimer = null
    }
    if (this.endTimeoutTimer) {
      clearTimeout(this.endTimeoutTimer)
      this.endTimeoutTimer = null
    }
  }

  nextUtteranceId () {
    return 'tts_' + Date.now() + '_' + (this.utteranceIndex++)
  }

  estimateDurationMs (text, rate) {
    const effectiveRate = rate || this.config.rate || 1
    const charsPerSecond = Math.max(1.5, 3.0 * effectiveRate)
    const charCount = String(text || '').replace(/\s+/g, '').length
    const ms = (charCount / charsPerSecond) * 1000
    return Math.max(800, Math.min(60000, ms))
  }
}
