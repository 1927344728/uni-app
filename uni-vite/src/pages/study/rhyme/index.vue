<template>
  <view class="page">
    <!-- 浏览模式 -->
    <block v-if="!detectionMode">
      <view v-for="g in contrastGroups" :key="g.key" class="card_outer">
        <view class="card_title_row">{{ g.title }}</view>
        <view class="contrast_body">
          <view class="contrast_col">
            <view class="mini_grid">
              <view
                v-for="item in g.left"
                :key="g.key + '-l-' + item.word"
                class="cell"
                @click="speak(item.word)"
              >
                <view class="word_chars">
                  <view
                    v-for="(ch, ci) in charsOf(item.word)"
                    :key="g.key + '-lc-' + item.word + ci"
                    class="char_cell"
                  >
                    <text class="word_char" :class="{ word_char_mark: item.mark === ci }">
                      {{ ch }}
                    </text>
                  </view>
                </view>
                <view class="pinyin_row">
                  <text
                    v-for="(py, pi) in item.pyArr"
                    :key="g.key + '-lp-' + item.word + pi"
                    class="pinyin_syl"
                    :class="{ pinyin_hi: item.mark === pi }"
                  >{{ py }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="vbar" />
          <view class="contrast_col">
            <view class="mini_grid">
              <view
                v-for="item in g.right"
                :key="g.key + '-r-' + item.word"
                class="cell"
                @click="speak(item.word)"
              >
                <view class="word_chars">
                  <view
                    v-for="(ch, ci) in charsOf(item.word)"
                    :key="g.key + '-rc-' + item.word + ci"
                    class="char_cell"
                  >
                    <text class="word_char" :class="{ word_char_mark: item.mark === ci }">
                      {{ ch }}
                    </text>
                  </view>
                </view>
                <view class="pinyin_row">
                  <text
                    v-for="(py, pi) in item.pyArr"
                    :key="g.key + '-rp-' + item.word + pi"
                    class="pinyin_syl"
                    :class="{ pinyin_hi: item.mark === pi }"
                  >{{ py }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-for="s in singleGroups" :key="s.key" class="card_outer card_outer_single">
        <view class="card_title_row">{{ s.title }}</view>
        <view class="mini_grid two_cols">
          <view
            v-for="item in s.words"
            :key="s.key + '-' + item.word"
            class="cell"
            @click="speak(item.word)"
          >
            <view class="word_chars">
              <view
                v-for="(ch, ci) in charsOf(item.word)"
                :key="s.key + '-c-' + item.word + ci"
                class="char_cell"
              >
                <text class="word_char" :class="{ word_char_mark: item.mark === ci }">
                  {{ ch }}
                </text>
              </view>
            </view>
            <view class="pinyin_row">
              <text
                v-for="(py, pi) in item.pyArr"
                :key="s.key + '-p-' + item.word + pi"
                class="pinyin_syl"
                :class="{ pinyin_hi: item.mark === pi }"
              >{{ py }}</text>
            </view>
          </view>
        </view>
      </view>
    </block>

    <!-- 检测模式 -->
    <block v-else>
      <view v-if="!resultMode">
        <view v-for="(item, idx) in testItems" :key="item.uid" class="test_row_inline">
          <button
            class="det_btn"
            :class="{ det_on: choices[idx] === 'front' }"
            @click="setChoice(idx, 'front')"
          >
            {{ item.leftRhyme }}
          </button>
          <view class="det_word_wrap">
            <view class="det_word_chars">
              <text
                v-for="(ch, ci) in charsOf(item.word)"
                :key="'d' + ci"
                class="det_char"
                :class="{ det_char_hi: ci === item.mark }"
              >{{ ch }}</text>
            </view>
          </view>
          <button
            class="det_btn"
            :class="{ det_on: choices[idx] === 'back' }"
            @click="setChoice(idx, 'back')"
          >
            {{ item.rightRhyme }}
          </button>
        </view>
      </view>

      <view v-else class="result_grid">
        <view
          v-for="item in sortedResultItems"
          :key="item.uid + '_r'"
          class="result_cell"
          :class="resultCellClass(item)"
        >
          <view class="word_chars word_chars_result">
            <view
              v-for="(ch, ci) in charsOf(item.word)"
              :key="'rc' + ci"
              class="char_cell char_cell_flat"
            >
              <text
                class="word_char"
                :class="{ word_char_mark: ci === item.mark }"
              >{{ ch }}</text>
            </view>
          </view>
          <view class="pinyin_row pinyin_row_result">
            <text
              v-for="(py, pi) in item.pyArr"
              :key="'rp' + pi"
              class="pinyin_syl"
              :class="{ pinyin_hi: pi === item.mark }"
            >{{ py }}</text>
          </view>
        </view>
      </view>
    </block>

    <view class="bottom_stack">
      <view v-if="detectionMode && !resultMode" class="hint_dock">
        <text class="hint_muted">请根据每行左右韵母，选择该词更接近哪一侧</text>
      </view>
      <view v-else-if="detectionMode && resultMode" class="hint_dock">
        <text class="hint_muted">检测完成：答对 </text>
        <text class="hint_num">{{ scoreNum }}</text>
        <text class="hint_muted"> / </text>
        <text class="hint_num">{{ totalNum }}</text>
        <text class="hint_muted"> 题</text>
      </view>
      <view class="bottom_bar">
        <button v-if="!detectionMode" class="btn_detect" @click="startDetection">韵母拼音检测</button>
        <button
          v-else-if="!resultMode"
          class="btn_done"
          @click="finishDetection"
        >
          完成检测
        </button>
        <button v-else class="btn_reset" @click="resetDetection">重新检测</button>
      </view>
    </view>

    <!-- 分数弹层（样式可自定义，比系统 showModal 更明显） -->
    <view v-if="scoreModalVisible" class="score_mask" @click="closeScoreModal">
      <view class="score_box" @click.stop>
        <text class="score_modal_title">检测完成</text>
        <view class="score_modal_body">
          <text class="score_modal_label">得分</text>
          <text class="score_modal_num">{{ scorePercent }}</text>
          <text class="score_modal_unit">分</text>
        </view>
        <button class="score_modal_ok" @click="closeScoreModal">知道了</button>
      </view>
    </view>
  </view>
</template>

<script>
import { pinyin } from 'pinyin-pro'
import { TTSManager } from '@/common/js/TTSManager.js'
import { CONTRAST_STATIC, SINGLE_STATIC } from './constant.js'

/** 静态 { word, mark } → 运行时补全 pinyin / pyArr */
function enrichItem (wordItem) {
  const w = String(wordItem.word)
  const pyArr = pinyin(w, { type: 'array', toneType: 'symbol' })
  return {
    word: w,
    mark: wordItem.mark,
    pinyin: pyArr.join(' '),
    pyArr
  }
}

function buildContrast () {
  return CONTRAST_STATIC.map(g => ({
    ...g,
    left: g.left.map(item => enrichItem(item)),
    right: g.right.map(item => enrichItem(item))
  }))
}

function buildSingle () {
  return SINGLE_STATIC.map(s => ({
    ...s,
    words: s.words.map(item => enrichItem(item))
  }))
}

export default {
  data () {
    return {
      contrastGroups: [],
      singleGroups: [],
      detectionMode: false,
      resultMode: false,
      testItems: [],
      choices: {},
      scoreNum: 0,
      totalNum: 0,
      scoreModalVisible: false,
      scorePercent: 0
    }
  },
  created () {
    this.contrastGroups = buildContrast()
    this.singleGroups = buildSingle()
  },
  computed: {
    /** 检测结果：正确 → 错误 → 未答 */
    sortedResultItems () {
      const order = { bad: 0, ok: 1, skip: 2 }
      return [...this.testItems].sort((a, b) => {
        const ra = order[a.resultStatus] ?? 9
        const rb = order[b.resultStatus] ?? 9
        return ra - rb
      })
    }
  },
  beforeUnmount () {
    try { TTSManager.stop() } catch (e) {}
  },
  methods: {
    charsOf (word) {
      return Array.from(String(word || ''))
    },
    resultCellClass (item) {
      const s = item.resultStatus
      return {
        result_cell_ok: s === 'ok',
        result_cell_bad: s === 'bad',
        result_cell_skip: s === 'skip'
      }
    },
    speak (word) {
      if (!word) return
      TTSManager.speak(word)
    },
    buildAnswerPool () {
      const pool = []
      this.contrastGroups.forEach(g => {
        g.left.forEach(item => {
          pool.push({
            word: item.word,
            pinyin: item.pinyin,
            pyArr: item.pyArr,
            mark: item.mark,
            rhyme: g.leftRhyme,
            leftRhyme: g.leftRhyme,
            rightRhyme: g.rightRhyme,
            answer: 'front'
          })
        })
        g.right.forEach(item => {
          pool.push({
            word: item.word,
            pinyin: item.pinyin,
            pyArr: item.pyArr,
            mark: item.mark,
            rhyme: g.rightRhyme,
            leftRhyme: g.leftRhyme,
            rightRhyme: g.rightRhyme,
            answer: 'back'
          })
        })
      })
      return pool
    },
    shuffle (arr) {
      const a = arr.slice()
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = a[i]
        a[i] = a[j]
        a[j] = t
      }
      return a
    },
    startDetection () {
      const pool = this.buildAnswerPool()
      if (!pool.length) {
        uni.showToast({ title: '暂无检测题库', icon: 'none' })
        return
      }
      const mixed = this.shuffle(pool)
      const out = []
      let i = 0
      while (out.length < 50) {
        out.push(mixed[i % mixed.length])
        i++
      }
      this.testItems = out.map((e, idx) => ({
        ...e,
        uid: `t_${Date.now()}_${idx}`,
        resultStatus: ''
      }))
      this.choices = {}
      this.resultMode = false
      this.detectionMode = true
      uni.pageScrollTo({ scrollTop: 0, duration: 0 })
    },
    setChoice (idx, side) {
      this.choices = { ...this.choices, [idx]: side }
    },
    finishDetection () {
      let score = 0
      const total = this.testItems.length
      this.testItems.forEach((item, idx) => {
        const choice = this.choices[idx]
        if (choice === item.answer) score++
      })
      this.scoreNum = score
      this.totalNum = total

      this.testItems = this.testItems.map((item, idx) => {
        const choice = this.choices[idx]
        let resultStatus = 'skip'
        if (choice !== undefined && choice !== null && choice !== '') {
          resultStatus = choice === item.answer ? 'ok' : 'bad'
        }
        return { ...item, resultStatus }
      })

      this.resultMode = true
      uni.pageScrollTo({ scrollTop: 0, duration: 200 })

      const pct = total ? Math.floor((score / total) * 100) : 0
      this.scorePercent = pct
      this.scoreModalVisible = true
    },
    closeScoreModal () {
      this.scoreModalVisible = false
    },
    resetDetection () {
      this.detectionMode = false
      this.resultMode = false
      this.testItems = []
      this.choices = {}
      this.scoreNum = 0
      this.totalNum = 0
      this.scoreModalVisible = false
      this.scorePercent = 0
      uni.pageScrollTo({ scrollTop: 0, duration: 0 })
    }
  }
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
