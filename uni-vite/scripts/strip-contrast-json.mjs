/**
 * 从 contrast-static.json 中移除 pinyin、pyArr，仅保留 word、mark。
 * 运行: node scripts/strip-contrast-json.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const p = path.join(__dirname, '../src/pages/study/rhyme/contrast-static.json')
const data = JSON.parse(fs.readFileSync(p, 'utf8'))
const out = data.map((g) => ({
  ...g,
  left: g.left.map((x) => ({ word: x.word, mark: x.mark })),
  right: g.right.map((x) => ({ word: x.word, mark: x.mark }))
}))
fs.writeFileSync(p, JSON.stringify(out, null, 2), 'utf8')
console.log('Stripped', p)
