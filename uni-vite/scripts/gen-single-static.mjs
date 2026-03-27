/**
 * 生成 single-static.json：words 为 { word, mark }，mark 与 dictation 中算法一致。
 * 运行: node scripts/gen-single-static.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pinyin } from 'pinyin-pro'

function findMarkCharIndexForRhyme (word, rhyme) {
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

function mk (words, rhyme) {
  return words.map((w) => ({
    word: w,
    mark: findMarkCharIndexForRhyme(w, rhyme)
  }))
}

const out = [
  {
    key: 'un',
    title: 'un（前鼻韵）',
    rhyme: 'un',
    words: mk(
      ['春天', '夏天', '秋天', '冬天', '轮船', '昆仑', '论文', '群体', '困难', '裙子', '村庄', '温顺', '春笋', '春雨', '春风', '春雷', '春雪', '春草', '春花', '春树'],
      'un'
    )
  },
  {
    key: 'ong',
    title: 'ong（后鼻韵）',
    rhyme: 'ong',
    words: mk(
      ['中国', '日本', '韩国', '美国', '英国', '法国', '德国', '俄罗斯', '巴西', '印度', '埃及', '加拿大', '澳大利亚', '新西兰', '墨西哥', '阿根廷', '南非', '越南', '泰国', '马来西亚'],
      'ong'
    )
  }
]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const target = path.join(__dirname, '../src/pages/study/rhyme/single-static.json')
fs.writeFileSync(target, JSON.stringify(out, null, 2), 'utf8')
console.log('Wrote', target)
