/**
 * 生成 rhyme 页 CONTRAST_RAW 中 left/right 的静态对象数组。
 * 运行: node scripts/gen-rhyme-contrast.mjs
 */
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
  return words.map((w) => {
    const word = String(w)
    const pyArr = pinyin(word, { type: 'array', toneType: 'symbol' })
    const mark = findMarkCharIndexForRhyme(word, rhyme)
    return { word, pinyin: pyArr.join(' '), pyArr, mark }
  })
}

const groups = [
  {
    key: 'an-ang',
    title: 'an（前鼻韵） 和 ang（后鼻韵）',
    leftRhyme: 'an',
    rightRhyme: 'ang',
    left: ['早安', '答案', '喜欢', '公园', '安全', '寒冷', '蓝天', '看见', '面包', '饭店', '雨伞', '参加', '班长', '光盘', '弹琴', '花盆', '铅笔', '语言', '温暖', '河边', '探险', '栏杆', '危险', '板凳', '安然', '饭碗', '竹竿', '沙滩', '帆船', '衬衫'],
    right: ['太阳', '花香', '明亮', '广场', '方向', '帮忙', '长江', '商场', '希望', '想象', '月亮', '响亮', '冰箱', '飞翔', '绵羊', '螳螂', '池塘', '窗户', '强壮', '蟑螂', '风霜', '粮仓', '海浪', '灯光', '银行', '羊肠', '霜冻']
  },
  {
    key: 'en-eng',
    title: 'en（前鼻韵） 和 eng（后鼻韵）',
    leftRhyme: 'en',
    rightRhyme: 'eng',
    left: ['认真', '声音', '本子', '门口', '森林', '温暖', '树根', '灰尘', '衬衫', '新闻', '门诊', '花盆', '深沉', '早晨', '人们', '根本', '身体', '真正', '门铃', '沉闷'],
    right: ['青蛙', '风筝', '灯光', '成长', '明天', '朋友', '风声', '钟声', '成功', '丰盛', '蜜蜂', '蜻蜓', '星星', '名称', '英雄', '熊猫', '长城', '乘凉', '农民', '梦境']
  },
  {
    key: 'in-ing',
    title: 'in（前鼻韵） 和 ing（后鼻韵）',
    leftRhyme: 'in',
    rightRhyme: 'ing',
    left: ['今天', '拼音', '新年', '心里', '近处', '金鱼', '信心', '前进', '毛巾', '辛勤', '亲近', '阴天', '银杏', '临近'],
    right: ['星星', '事情', '安静', '蜻蜓', '听见', '声音', '电影', '透明', '姓名', '苹果', '熊猫']
  }
]

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const out = groups.map((g) => ({
  key: g.key,
  title: g.title,
  leftRhyme: g.leftRhyme,
  rightRhyme: g.rightRhyme,
  left: mk(g.left, g.leftRhyme),
  right: mk(g.right, g.rightRhyme)
}))

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const target = path.join(__dirname, 'rhyme-contrast-out.json')
fs.writeFileSync(target, JSON.stringify(out, null, 2), 'utf8')
console.log('Wrote', target)
