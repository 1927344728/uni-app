/**
 * H5 音频解锁：必须在用户 click 里同步调用。
 * 同时写入 window / getApp().globalData / 模块变量，避免页面切换后取不到实例。
 * 播放页必须接管同一 InnerAudioContext（底层同一 Audio），不能 destroy 后再 new。
 */

const WIN_KEY = '__UNI_MUSIC_AUDIO_CTX__'

const SILENT_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'

let moduleCtx = null

function getWin () {
  try {
    return typeof window !== 'undefined' ? window : null
  } catch (e) {
    return null
  }
}

function getAppStore () {
  try {
    if (typeof getApp !== 'function') return null
    const app = getApp()
    if (!app) return null
    if (!app.globalData) app.globalData = {}
    return app.globalData
  } catch (e) {
    return null
  }
}

function saveCtx (ctx) {
  moduleCtx = ctx
  const win = getWin()
  if (win) win[WIN_KEY] = ctx
  const store = getAppStore()
  if (store) store[WIN_KEY] = ctx
}

function readCtx () {
  if (moduleCtx) return moduleCtx
  const win = getWin()
  if (win && win[WIN_KEY]) return win[WIN_KEY]
  const store = getAppStore()
  if (store && store[WIN_KEY]) return store[WIN_KEY]
  return null
}

function clearCtxRef () {
  moduleCtx = null
  const win = getWin()
  if (win) win[WIN_KEY] = null
  const store = getAppStore()
  if (store) store[WIN_KEY] = null
}

function safePlay (ctx) {
  if (!ctx) return
  try {
    const audio = ctx._audio
    if (audio && typeof audio.play === 'function') {
      ctx._stoping = false
      const ret = audio.play()
      if (ret && typeof ret.catch === 'function') {
        ret.catch(() => {})
      }
      return
    }
    ctx.play()
  } catch (e) {}
}

/**
 * @param {string} [url]
 */
export function unlockAudio (url) {
  try {
    let ctx = readCtx()
    if (!ctx) {
      ctx = uni.createInnerAudioContext()
      try {
        ctx.obeyMuteSwitch = false
      } catch (e) {}
      ctx.autoplay = false
    }
    ctx.src = url || SILENT_WAV
    safePlay(ctx)
    saveCtx(ctx)
  } catch (e) {}
}

/** 播放页接管（交权） */
export function adoptUnlockedAudio () {
  const ctx = readCtx()
  clearCtxRef()
  return ctx || null
}

export function clearUnlockedAudio () {
  const ctx = readCtx()
  if (!ctx) return
  try {
    ctx.stop()
    ctx.destroy()
  } catch (e) {}
  clearCtxRef()
}

export function playInnerAudio (ctx) {
  safePlay(ctx)
}
