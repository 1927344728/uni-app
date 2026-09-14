import { get as _get, cloneDeep } from "lodash"
import { CHINESE_WORD_LIST } from "/localdata/chinese_word.js"
import { initResponseData } from './common'

const SCORE_KEY = 'arithmetic.mockScores'

function loadScores () {
  try {
    return uni.getStorageSync(SCORE_KEY) || []
  } catch (e) {
    return []
  }
}

function saveScores (list) {
  uni.setStorageSync(SCORE_KEY, list)
}

function computeLevel (perfectCount, kingPerfectCount) {
  if (perfectCount > 50 && kingPerfectCount >= 10) return 5
  if (perfectCount > 50) return 4
  if (perfectCount > 20) return 3
  if (perfectCount > 10) return 2
  return 1
}

const LEVEL_NAMES = ['', '算术新手', '算术能手', '算术高手', '超级小达人', '算术小王者']

const getChineseWordList = (params) => {
  const { pageNum = 0, pageSize = 10 } = params
  const id = Number(params.id)
  let list = cloneDeep(CHINESE_WORD_LIST)
  if (id) {
    list = list.filter(item => item.id === id)
  }

  list = list.splice(pageNum * pageSize, pageSize)
  const data = initResponseData()
  data.data = {
    content: list,
  }
  return data
}

const saveArithmeticScore = (body = {}) => {
  const list = loadScores()
  const item = {
    id: Date.now(),
    mode: body.mode,
    score: Number(body.score) || 0,
    maxScore: Number(body.maxScore) || 0,
    correct: Number(body.correct) || 0,
    total: Number(body.total) || 0,
    durationMs: Number(body.durationMs) || 0,
    createdTime: Date.now()
  }
  list.unshift(item)
  saveScores(list)
  const data = initResponseData()
  data.data = item
  return data
}

const getArithmeticStats = () => {
  const list = loadScores()
  const perfects = list.filter(s => s.total > 0 && s.correct === s.total)
  const kingPerfects = perfects.filter(s => s.mode === 'king')
  const best = list.slice().sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return (a.durationMs || 0) - (b.durationMs || 0)
  })[0]
  const perfectCount = perfects.length
  const kingPerfectCount = kingPerfects.length
  const level = computeLevel(perfectCount, kingPerfectCount)
  const data = initResponseData()
  data.data = {
    level,
    levelName: LEVEL_NAMES[level],
    bestScore: best ? best.score : 0,
    bestDurationMs: best ? best.durationMs : 0,
    perfectCount,
    kingPerfectCount
  }
  return data
}

const getArithmeticScorePageList = (params = {}) => {
  const pageNum = Number(_get(params, 'pageNum') || 0)
  const pageSize = Number(_get(params, 'pageSize') || 20)
  const list = loadScores()
  const content = list.slice(pageNum * pageSize, pageNum * pageSize + pageSize)
  const data = initResponseData()
  data.data = { content }
  return data
}

export default {
  'api/study/getChineseWordList': getChineseWordList,
  'api/study/saveArithmeticScore': saveArithmeticScore,
  'api/study/getArithmeticStats': getArithmeticStats,
  'api/study/getArithmeticScorePageList': getArithmeticScorePageList
}
