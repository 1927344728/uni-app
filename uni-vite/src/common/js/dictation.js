import { pinyin } from 'pinyin-pro'

export function clampNumber (value, min, max) {
  const n = Number(value)
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, n))
}

export function splitWords (input) {
  const raw = String(input || '')
    // 统一分隔符：逗号/顿号/分号/换行/空格（含全角）
    .replace(/[，,、；;]+/g, ' ')
    .replace(/[\n\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

    if (!raw) return []

  return raw
    .split(' ')
    .map(s => s.trim())
    .filter(Boolean)
}

export function joinWordsParam (words) {
  return (words || [])
    .map(w => String(w || '').trim())
    .filter(Boolean)
    .join(',')
}

export function toPinyinSymbol (word) {
  const w = String(word || '').trim()
  if (!w) return ''
  try {
    return pinyin(w, { toneType: 'symbol' })
  } catch (e) {
    return ''
  }
}

export function findMarkCharIndexForRhyme (word, rhyme) {
  const w = String(word || '')
  const r = String(rhyme || '').toLowerCase()
  if (!w || !r) return Math.max(0, w.length - 1)
  for (let i = 0; i < w.length; i++) {
    try {
      const py = pinyin(w[i], { toneType: 'symbol' })
      if (String(py).toLowerCase().includes(r)) return i
    } catch (e) {}
  }
  return Math.max(0, w.length - 1)
}

export function highlightRhymeHtml (pinyinText, rhyme) {
  const t = String(pinyinText || '')
  const r = String(rhyme || '').toLowerCase()
  if (!t || !r) return t

  // 先匹配长的，避免 an 命中 ang
  const pattern = new RegExp(`(${r})`, 'gi')
  const syllables = t.split(' ').filter(Boolean)
  const html = syllables
    .map(s => s.replace(pattern, '<span class="rhyme-highlight">$1</span>'))
    .join(' ')
  return html
}

