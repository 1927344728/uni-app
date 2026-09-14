import { encodeMediaUrl } from '@/common/js/variables.js'

export const MODE_NAME = {
  add10: '10内加法',
  sub10: '10内减法',
  add20: '20内加法',
  sub20: '20内减法',
  add100: '100内加法',
  sub100: '100内减法',
  mul10: '10内乘法',
  div10: '10内除法',
  king: '王者挑战'
}

export const MODE_BUTTONS = [
  { key: 'add10', name: '10内加法', color: 'c-yellow' },
  { key: 'sub10', name: '10内减法', color: 'c-green' },
  { key: 'add20', name: '20内加法', color: 'c-blue' },
  { key: 'sub20', name: '20内减法', color: 'c-purple' },
  { key: 'add100', name: '100内加法', color: 'c-coral' },
  { key: 'sub100', name: '100内减法', color: 'c-teal' },
  { key: 'mul10', name: '10内乘法', color: 'c-cyan' },
  { key: 'div10', name: '10内除法', color: 'c-pink' }
]

export const COUNT_OPTIONS = [10, 20, 30]
export const TIME_OPTIONS = [5, 8, 10, 15]
export const FULL_SCORE = 100

export function scoreOf (correct, total) {
  const t = Number(total) || 0
  const c = Number(correct) || 0
  if (t <= 0) return 0
  return Math.round(c * FULL_SCORE / t)
}

export const LEVEL_NAMES = {
  1: '算术新手',
  2: '算术能手',
  3: '算术高手',
  4: '超级小达人',
  5: '算术小王者'
}

export function emptyStats () {
  return {
    level: 1,
    levelName: LEVEL_NAMES[1],
    bestScore: 0,
    bestDurationMs: 0,
    perfectCount: 0,
    kingPerfectCount: 0
  }
}

export function formatDuration (ms) {
  const total = Math.max(0, Math.floor(Number(ms) / 1000) || 0)
  const m = Math.floor(total / 60)
  const s = total % 60
  return m + ':' + String(s).padStart(2, '0')
}

const STORE_BEST = 'arithmetic.bestScore'
const STORE_SET = 'arithmetic.settings'
const STORE_RESULT = 'arithmetic.lastResult'

export function defaultSettings () {
  return { questionCount: 20, timeLimit: 10, sound: true }
}

export function loadSettings () {
  try {
    const raw = uni.getStorageSync(STORE_SET) || {}
    const d = defaultSettings()
    const questionCount = Number(raw.questionCount)
    const timeLimit = Number(raw.timeLimit)
    return {
      questionCount: COUNT_OPTIONS.includes(questionCount) ? questionCount : d.questionCount,
      timeLimit: TIME_OPTIONS.includes(timeLimit) ? timeLimit : d.timeLimit,
      sound: raw.sound !== false
    }
  } catch (e) {
    return defaultSettings()
  }
}

export function saveSettings (settings) {
  uni.setStorageSync(STORE_SET, settings)
}

const COS_BGM = 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/bgm'

export const ARITHMETIC_AUDIO = {
  bgm: COS_BGM + '/bgm-cheerful.mp3',
  bgmKing: COS_BGM + '/680-preview.mp3',
  correct: COS_BGM + '/2870-preview.mp3',
  wrong: COS_BGM + '/946-preview.mp3'
}

function makeAudioCtx () {
  const ctx = uni.createInnerAudioContext()
  try { ctx.obeyMuteSwitch = false } catch (e) {}
  return ctx
}

let bgmCtx = null
let sfxOkCtx = null
let sfxBadCtx = null
let bgmSrc = ''
let bgmWanted = false

function soundEnabled () {
  return loadSettings().sound !== false
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
    sfxOkCtx.volume = 0.9
    sfxOkCtx.src = encodeMediaUrl(ARITHMETIC_AUDIO.correct)
  }
  if (!sfxBadCtx) {
    sfxBadCtx = makeAudioCtx()
    sfxBadCtx.loop = false
    sfxBadCtx.volume = 0.9
    sfxBadCtx.src = encodeMediaUrl(ARITHMETIC_AUDIO.wrong)
  }
}

export function startArithmeticBgm (mode) {
  if (!soundEnabled()) {
    stopArithmeticBgm()
    return
  }
  bgmWanted = true
  const src = encodeMediaUrl(mode === 'king' ? ARITHMETIC_AUDIO.bgmKing : ARITHMETIC_AUDIO.bgm)
  if (!bgmCtx) {
    bgmCtx = makeAudioCtx()
    bgmCtx.loop = true
    bgmCtx.volume = 0.28
  }
  if (bgmSrc !== src) {
    bgmSrc = src
    bgmCtx.src = src
  }
  playCtx(bgmCtx)
  ensureSfx()
}

export function pauseArithmeticBgm () {
  if (!bgmCtx) return
  try { bgmCtx.pause() } catch (e) {}
}

export function resumeArithmeticBgm () {
  if (!bgmWanted || !soundEnabled()) return
  playCtx(bgmCtx)
}

export function stopArithmeticBgm () {
  bgmWanted = false
  bgmSrc = ''
  destroyCtx(bgmCtx)
  bgmCtx = null
}

export function playArithmeticSfx (ok) {
  if (!soundEnabled()) return
  ensureSfx()
  const ctx = ok ? sfxOkCtx : sfxBadCtx
  const src = encodeMediaUrl(ok ? ARITHMETIC_AUDIO.correct : ARITHMETIC_AUDIO.wrong)
  stopCtx(ctx)
  ctx.src = src
  try {
    if (typeof ctx.seek === 'function') ctx.seek(0)
  } catch (e) {}
  playCtx(ctx)
}

export function destroyArithmeticAudio () {
  stopArithmeticBgm()
  destroyCtx(sfxOkCtx)
  destroyCtx(sfxBadCtx)
  sfxOkCtx = null
  sfxBadCtx = null
}

export function loadBest () {
  try {
    const raw = uni.getStorageSync(STORE_BEST) || {}
    return {
      score: Number(raw.score) || 0,
      percent: Number(raw.percent) || 0
    }
  } catch (e) {
    return { score: 0, percent: 0 }
  }
}

export function saveBest (best) {
  uni.setStorageSync(STORE_BEST, best)
}

export function saveLastResult (result) {
  uni.setStorageSync(STORE_RESULT, result)
}

export function loadLastResult () {
  try {
    return uni.getStorageSync(STORE_RESULT) || null
  } catch (e) {
    return null
  }
}

export function levelOf (percent) {
  if (percent >= 100) return 5
  if (percent >= 95) return 4
  if (percent >= 80) return 3
  if (percent >= 60) return 2
  return 1
}

export function commentOf (rate) {
  if (rate >= 100) return '太厉害了！全部答对，你就是算术小能手！'
  if (rate >= 90) return '太棒了！您的计算能力非常出色！'
  if (rate >= 70) return '不错哦，再练几轮会更熟练。'
  if (rate >= 40) return '继续加油，熟能生巧。'
  return '别着急，先从更简单的题型练起。'
}

export function openLoginPage () {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  let requestUrl = '/pages/study/arithmetic/index'
  if (current && current.$page && current.$page.fullPath) {
    const p = String(current.$page.fullPath)
    requestUrl = p.charAt(0) === '/' ? p : '/' + p
  } else if (current && current.route) {
    requestUrl = '/' + String(current.route).replace(/^\//, '')
  }
  uni.navigateTo({
    url: '/pages/login/index?requestUrl=' + encodeURIComponent(requestUrl)
  })
}

export function shareText (result) {
  const name = MODE_NAME[result.mode] || ''
  return `我在「算术小达人」的${name}中答对 ${result.correct}/${result.total}，正确率 ${result.rate}%，总分 ${result.score} 分！`
}

function randInt (min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function shuffle (arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

function makeAdd (maxSum, minOne) {
  let a = 0
  let b = 0
  let n = 0
  do {
    a = randInt(0, maxSum)
    b = randInt(0, maxSum - a)
  } while (minOne && a < minOne && b < minOne && ++n < 80)
  return { expr: a + '+' + b + '=?', answer: a + b, op: 'add' }
}

function makeSub (maxA, minA) {
  const a = randInt(minA || 0, maxA)
  const b = randInt(0, a)
  return { expr: a + '-' + b + '=?', answer: a - b, op: 'sub' }
}

function makeMul () {
  const a = randInt(1, 10)
  const b = randInt(1, 10)
  return { expr: a + '×' + b + '=?', answer: a * b, op: 'mul' }
}

function makeDiv () {
  const b = randInt(1, 10)
  const q = randInt(1, 10)
  const a = b * q
  return { expr: a + '÷' + b + '=?', answer: q, op: 'div' }
}

function makeByMode (mode) {
  if (mode === 'add10') return makeAdd(10, 0)
  if (mode === 'sub10') return makeSub(10, 0)
  if (mode === 'add20') return makeAdd(20, 11)
  if (mode === 'sub20') return makeSub(20, 11)
  if (mode === 'add100') return makeAdd(100, 20)
  if (mode === 'sub100') return makeSub(100, 20)
  if (mode === 'mul10') return makeMul()
  if (mode === 'div10') return makeDiv()
  return makeAdd(10, 0)
}

function makeKing (prefer) {
  if (prefer === 'sub') return makeSub(100, 20)
  if (prefer === 'div') return makeDiv()
  const r = Math.random()
  if (r < 0.35) return makeAdd(100, 20)
  if (r < 0.7) return makeMul()
  return r < 0.85 ? makeSub(100, 20) : makeDiv()
}

function makeOptions (answer) {
  const set = new Set([answer])
  ;[answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, Math.abs(answer - 10)].forEach((n) => {
    if (Number.isInteger(n) && n >= 0 && n !== answer) set.add(n)
  })
  let guard = 0
  while (set.size < 4 && guard++ < 80) {
    const n = Math.max(0, answer + randInt(-6, 6))
    if (n !== answer) set.add(n)
  }
  let fill = 0
  while (set.size < 4) {
    if (!set.has(fill)) set.add(fill)
    fill += 1
  }
  return shuffle(Array.from(set).slice(0, 4))
}

export function generatePaper (mode, count) {
  const list = []
  const used = new Set()
  const types = []
  if (mode === 'king') {
    const subN = Math.ceil(count * 0.3)
    const divN = Math.ceil(count * 0.3)
    for (let i = 0; i < subN; i++) types.push('sub')
    for (let i = 0; i < divN; i++) types.push('div')
    while (types.length < count) types.push('mix')
    shuffle(types)
  }
  let guard = 0
  while (list.length < count && guard++ < count * 20) {
    const q = mode === 'king' ? makeKing(types[list.length]) : makeByMode(mode)
    if (used.has(q.expr)) continue
    used.add(q.expr)
    list.push({
      expr: q.expr,
      answer: q.answer,
      options: makeOptions(q.answer)
    })
  }
  return list
}
