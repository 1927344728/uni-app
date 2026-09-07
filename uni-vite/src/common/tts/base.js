export const DEFAULT_TTS_CONFIG = {
  voice: '',
  rate: 1.0,
  volume: 1.0,
  pitch: 1.0,
  lang: ''
}

export function clampNumber (value, min, max, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(min, Math.min(max, number))
}

export function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class TTSBaseService {
  constructor(config = {}) {
    this.config = {
      ...DEFAULT_TTS_CONFIG,
      ...config
    }
    this.isLoading = false
    this.isSpeaking = false
    this.isPaused = false
  }

  validateText (text) {
    const value = String(text || '').trim()
    if (!value) {
      throw new Error('文本内容不能为空')
    }
    return value
  }

  setState ({ loading = false, speaking = false, paused = false } = {}) {
    this.isLoading = loading
    this.isSpeaking = speaking
    this.isPaused = paused
  }

  callOption (options, name, payload) {
    const fn = options && options[name]
    if (typeof fn === 'function') {
      fn(payload)
    }
  }

  speak (text, options = {}) {
    return this.play(text, options)
  }

  play () {
    return Promise.reject(new Error('当前平台暂不支持语音合成播放'))
  }

  stop () {
    this.setState()
  }

  pause () {
    this.setState({ paused: true })
  }

  resume () {
    this.setState({ speaking: true })
  }

  destroy () {
    this.stop()
  }
}
