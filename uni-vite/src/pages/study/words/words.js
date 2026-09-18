import { toPinyinSymbol } from '@/common/js/dictation.js'
import { encodeMediaUrl } from '@/common/js/variables.js'

export const COL_COUNT = 5
export const COL_MAX = 10
/** 最短列与最长列允许的最大高度差（单字个数） */
export const COL_HEIGHT_DIFF_MAX = 3
export const INIT_WORD_COUNT = 10
export const DROP_WORD_COUNT = 5
/** 单字瓦片高度 / 列内间距 / 内边距（rpx），用于动态计算 board 高度 */
export const TILE_HEIGHT_RPX = 80
export const TILE_GAP_RPX = 8
export const COL_PAD_Y_RPX = 16
export const BOARD_PAD_Y_RPX = 24
/** 单字固定色板数量（tone0 ~ toneN-1） */
export const TILE_TONE_COUNT = 8

export function pickTileTone () {
  return Math.floor(Math.random() * TILE_TONE_COUNT)
}

export function boardHeightRpx (colMax = COL_MAX) {
  const n = Math.max(1, colMax)
  return BOARD_PAD_Y_RPX + COL_PAD_Y_RPX + n * TILE_HEIGHT_RPX + (n - 1) * TILE_GAP_RPX
}
export const LISTEN_DELAY_MS = 3000
export const LISTEN_ANSWER_SEC = 15
export const LISTEN_ANSWER_MIN = 5
export const LISTEN_ANSWER_MAX = 60
export const MATCH_DROP_SEC = 30
export const MATCH_DROP_MIN = 5
export const MATCH_DROP_MAX = 120
/** 词库全部掉落后的清场倒计时（秒） */
export const MATCH_FINAL_SEC = 60

const LISTEN_SETTINGS_KEY = 'study_words_listen_settings'
const MATCH_SETTINGS_KEY = 'study_words_match_settings'

export function loadListenAnswerSec () {
  try {
    const raw = uni.getStorageSync(LISTEN_SETTINGS_KEY)
    const n = Number(raw && raw.answerSec)
    if (Number.isFinite(n) && n >= LISTEN_ANSWER_MIN && n <= LISTEN_ANSWER_MAX) return Math.round(n)
  } catch (e) {}
  return LISTEN_ANSWER_SEC
}

export function saveListenAnswerSec (sec) {
  try {
    const n = Math.max(LISTEN_ANSWER_MIN, Math.min(LISTEN_ANSWER_MAX, Math.round(Number(sec) || LISTEN_ANSWER_SEC)))
    uni.setStorageSync(LISTEN_SETTINGS_KEY, { answerSec: n })
    return n
  } catch (e) {
    return LISTEN_ANSWER_SEC
  }
}

export function loadMatchDropSec () {
  try {
    const raw = uni.getStorageSync(MATCH_SETTINGS_KEY)
    const n = Number(raw && raw.dropSec)
    if (Number.isFinite(n) && n >= MATCH_DROP_MIN && n <= MATCH_DROP_MAX) return Math.round(n)
  } catch (e) {}
  return MATCH_DROP_SEC
}

export function saveMatchDropSec (sec) {
  try {
    const n = Math.max(MATCH_DROP_MIN, Math.min(MATCH_DROP_MAX, Math.round(Number(sec) || MATCH_DROP_SEC)))
    uni.setStorageSync(MATCH_SETTINGS_KEY, { dropSec: n })
    return n
  } catch (e) {
    return MATCH_DROP_SEC
  }
}

const COS_BGM = 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/bgm'
const AUDIO = {
  bgm: COS_BGM + '/bgm-cheerful.mp3',
  clap: COS_BGM + '/2870-preview.mp3',
  wrong: COS_BGM + '/946-preview.mp3',
  win: COS_BGM + '/2870-preview.mp3',
  lose: COS_BGM + '/946-preview.mp3'
}

let sfxOkCtx = null
let sfxBadCtx = null
let matchBgmCtx = null
let matchResultCtx = null
let matchBgmWanted = false
let matchBgmSrc = ''

function makeAudioCtx () {
  const ctx = uni.createInnerAudioContext()
  try { ctx.obeyMuteSwitch = false } catch (e) {}
  return ctx
}

function playCtx (ctx) {
  if (!ctx) return
  try { ctx.play() } catch (e) {}
}

function stopCtx (ctx) {
  if (!ctx) return
  try { ctx.stop() } catch (e) {}
}

function destroyCtx (ctx) {
  if (!ctx) return
  try {
    ctx.stop()
    ctx.destroy()
  } catch (e) {}
}

function ensureSfx () {
  if (!sfxOkCtx) {
    sfxOkCtx = makeAudioCtx()
    sfxOkCtx.loop = false
    sfxOkCtx.volume = 0.92
    sfxOkCtx.src = encodeMediaUrl(AUDIO.clap)
  }
  if (!sfxBadCtx) {
    sfxBadCtx = makeAudioCtx()
    sfxBadCtx.loop = false
    sfxBadCtx.volume = 0.85
    sfxBadCtx.src = encodeMediaUrl(AUDIO.wrong)
  }
}

export function playWordSfx (ok) {
  ensureSfx()
  const ctx = ok ? sfxOkCtx : sfxBadCtx
  const src = encodeMediaUrl(ok ? AUDIO.clap : AUDIO.wrong)
  stopCtx(ctx)
  ctx.src = src
  try {
    if (typeof ctx.seek === 'function') ctx.seek(0)
  } catch (e) {}
  playCtx(ctx)
}

export function startMatchBgm () {
  matchBgmWanted = true
  const src = encodeMediaUrl(AUDIO.bgm)
  if (!matchBgmCtx) {
    matchBgmCtx = makeAudioCtx()
    matchBgmCtx.loop = true
    matchBgmCtx.volume = 0.3
  }
  if (matchBgmSrc !== src) {
    matchBgmSrc = src
    matchBgmCtx.src = src
  }
  playCtx(matchBgmCtx)
}

export function pauseMatchBgm () {
  if (!matchBgmCtx) return
  try { matchBgmCtx.pause() } catch (e) {}
}

export function resumeMatchBgm () {
  if (!matchBgmWanted) return
  playCtx(matchBgmCtx)
}

export function stopMatchBgm () {
  matchBgmWanted = false
  matchBgmSrc = ''
  destroyCtx(matchBgmCtx)
  matchBgmCtx = null
}

export function playMatchResult (win) {
  stopMatchBgm()
  const src = encodeMediaUrl(win ? AUDIO.win : AUDIO.lose)
  if (!matchResultCtx) {
    matchResultCtx = makeAudioCtx()
    matchResultCtx.loop = false
    matchResultCtx.volume = 0.95
  }
  stopCtx(matchResultCtx)
  matchResultCtx.src = src
  try {
    if (typeof matchResultCtx.seek === 'function') matchResultCtx.seek(0)
  } catch (e) {}
  playCtx(matchResultCtx)
}

export function destroyWordSfx () {
  stopMatchBgm()
  destroyCtx(sfxOkCtx)
  destroyCtx(sfxBadCtx)
  destroyCtx(matchResultCtx)
  sfxOkCtx = null
  sfxBadCtx = null
  matchResultCtx = null
}

export function shuffle (list) {
  const arr = (list || []).slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

export function pickN (list, n) {
  return shuffle(list).slice(0, Math.max(0, n))
}

/** 可重复抽取 n 个，词库不足时仍能掉落指定数量 */
export function pickNAllowRepeat (list, n) {
  const pool = (list || []).filter(Boolean)
  const count = Math.max(0, n)
  if (!pool.length || !count) return []
  if (pool.length >= count) return pickN(pool, count)
  const out = pool.slice()
  while (out.length < count) {
    out.push(pool[Math.floor(Math.random() * pool.length)])
  }
  return shuffle(out)
}

export function charsOf (word) {
  return Array.from(String(word || ''))
}

export function isTwoCharWord (word) {
  return charsOf(word).length === 2
}

/** 消消乐可用词语：至少 2 个字 */
export function isMatchableWord (word) {
  return charsOf(word).length >= 2
}

export function buildWordItems (words) {
  return (words || []).map(w => {
    const word = String(w || '').trim()
    return {
      word,
      pinyin: toPinyinSymbol(word)
    }
  }).filter(e => e.word)
}

const FALLBACK_WORDS = ['学习', '同学', '老师', '练习', '认真', '开心', '春天', '阳光']

export function fallbackWordItems () {
  return buildWordItems(FALLBACK_WORDS)
}
