<template>
  <view v-if="isLoaded" class="page" :class="{ page_no_scroll: settingsVisible }">
    <view v-if="noteText" class="note">
      <text class="note_text">{{ noteText }}</text>
    </view>

    <view v-if="wordLength === 0" class="empty">
      <text class="empty_title">暂无词语</text>
      <text class="empty_desc">请打开设置弹层选择词语。</text>
    </view>

    <view v-else class="grid">
      <view
        v-for="(item, idx) in visibleWordList"
        :key="item.word + '_' + item._i + '_' + idx"
        class="card"
        :class="cardClass(item._i)"
        @click="onClickCard(item)"
      >
        <view class="card_word">{{ item.word }}</view>
        <view class="card_pinyin">{{ item.pinyin }}</view>
      </view>
    </view>

    <view class="bottom_stack">
      <view v-if="selectedWordLength" class="progress_dock">
        <view class="progress_inner">
          <text class="progress_muted">当前共 </text>
          <text class="progress_num">{{ selectedWordLength }}</text>
          <text class="progress_muted"> 个 </text>
          <text v-if="status === 'active'" class="progress_muted"> ，已完成 </text>
          <text v-if="status === 'active'" class="progress_num">{{ completedCount }}</text>
          <text v-if="status === 'active'" class="progress_muted"> 个，剩余 </text>
          <text v-if="status === 'active'" class="progress_num">{{ remainingCount }}</text>
          <text v-if="status === 'active'" class="progress_muted"> 个</text>
        </view>
      </view>
      <view class="footer">
        <template v-if="status === 'pending'">
          <button class="btn btn_settings btn_sm" @click="openSettings">设置</button>
          <button v-if="selectedWordLength" class="btn btn_primary btn_lg" :disabled="selectedWordLength === 0" @click="start">
            开始听写
          </button>
        </template>

        <template v-else-if="status === 'active'">
          <button class="btn btn_danger btn_sm" @click="finishEarly">结束</button>
          <button class="btn btn_warn btn_md" @click="togglePause">{{ pauseLabel }}</button>
          <button class="btn btn_primary btn_lg" :disabled="isPaused || selectedWordLength === 0" @click="next">
            下一个
          </button>
        </template>

        <template v-else>
          <button class="btn btn_primary btn_lg" :disabled="selectedWordLength === 0" @click="restart">重新开始</button>
        </template>
      </view>
    </view>

    <view v-if="settingsVisible" class="mask" @click.self="closeSettings" @touchmove.stop.prevent>
      <view class="sheet" @touchmove.stop>
        <view class="sheet_hd">
          <view class="sheet_title">设置</view>
        </view>

        <scroll-view scroll-y class="sheet_bd">
          <view class="form_row">
            <view class="form_row_label">间隔时间</view>
            <view class="form_row_field">
              <input
                class="input"
                type="number"
                :value="settings.intervalTime"
                @input="onInputInterval"
                placeholder="请输入词语听写的间隔时间（秒）"
              />
            </view>
          </view>

          <view v-if="!hasLinkParams" class="form_row">
            <view class="form_row_label">年级</view>
            <view class="form_row_field">
              <view class="chip_row">
                <view
                  v-for="(opt, i) in gradeOptions"
                  :key="opt.value"
                  class="chip"
                  :class="{ chip_active: settings.gradeKey === opt.value }"
                  @click="pickGrade(opt.value, i)"
                >
                  {{ opt.label }}
                </view>
              </view>
            </view>
          </view>

          <view v-if="wordLength" class="form_row">
            <view class="form_row_label">词语数量</view>
            <view class="form_row_field">
              <input
                class="input"
                type="number"
                :value="settings.wordCount"
                @input="onInputWordCount"
                @blur="onBlurWordCount"
                placeholder="请输入随机抽取的词语数量"
              />
            </view>
          </view>

          <view>
            <view class="word_pick_title">选择词语</view>
            <view class="word_pick_grid">
              <view
                v-for="w in settings.availableWords"
                :key="w"
                class="word_chip"
                :class="{ word_chip_on: settings.selectedWords.includes(w) }"
                @click="toggleWord(w)"
              >
                {{ w }}
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="sheet_ft">
          <button class="btn_cancel_sheet" @click="closeSettings">取消</button>
          <button class="btn_ok_sheet" @click="confirmSettings">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { get as _get } from 'lodash'
import { TTSService } from '@/common/js/TTSManager.js'
import { getChineseWordList } from '@/api'
import { clampNumber, splitWords, toPinyinSymbol } from '@/utils/dictation.js'

const tts = new TTSService()


function buildWordList (words) {
  return (words || []).map(w => ({
    word: w,
    pinyin: toPinyinSymbol(w)
  }))
}

export default {
  data () {
    return {
      isLoaded: false,
      status: 'pending',
      noteText: '',
      routeId: '',
      routeWordsRaw: '',
      allWordList: [],
      wordList: [],
      completedSet: new Set(),
      currentIndex: 0,
      waitingTimer: null,
      pausedDuringWait: false,
      isPaused: false,
      settingsVisible: false,
      settings: {
        intervalTime: 20,
        gradeKey: 1,
        availableWords: [],
        selectedWords: [],
        wordCount: 0
      },
    }
  },
  computed: {
    isWechatH5 () {
      // #ifdef H5
      try {
        const ua = (navigator.userAgent || '').toLowerCase()
        return ua.includes('micromessenger')
      } catch (e) {
        return false
      }
      // #endif
      return false
    },
    hasLinkParams () {
      if (this.routeId) return true
      return splitWords(this.routeWordsRaw).length > 0
    },
    wordLength () {
      return this.wordList.length
    },
    selectedWordList () {
      const { wordList, settings } = this
      let list = wordList
      if (settings.selectedWords.length > 0) {
        list = wordList.filter(x => settings.selectedWords.includes(x.word))
      }
      return list
    },
    selectedWordLength () {
      return this.selectedWordList.length
    },
    visibleWordList () {
      const mapItem = (item, idx) => ({ ...item, _i: idx })
      if (this.status === 'active') {
        return this.selectedWordList
          .map(mapItem)
          .filter(x => this.completedSet.has(x._i))
      }
      return this.selectedWordList.map(mapItem)
    },
    completedCount () {
      return this.completedSet.size
    },
    remainingCount () {
      return Math.max(0, this.selectedWordLength - this.completedCount)
    },
    pauseLabel () {
      return this.isPaused ? '继续' : '暂停'
    },
    gradeOptions () {
      let options = [
        { value: 1, label: '一（上）' },
        { value: 2, label: '一（下）' },
        { value: 3, label: '二（上）' },
        { value: 4, label: '二（下）' },
        { value: 5, label: '三（上）' },
        { value: 6, label: '三（下）' },
        { value: 7, label: '四（上）' },
        { value: 8, label: '四（下）' },
        { value: 9, label: '五（上）' },
        { value: 10, label: '五（下）' },
        { value: 11, label: '六（上）' },
        { value: 12, label: '六（下）' }
      ]
      const existGradeIds = this.allWordList.map(e => e.gradeId)
      if (existGradeIds.length > 0) {
        options = options.filter(e => existGradeIds.includes(e.value))
      }
      return options
    }
  },
  async onLoad (options = {}) {
    this.routeId = _get(options, 'id', '') || ''
    this.routeWordsRaw = decodeURIComponentSafe(_get(options, 'words', ''))
    this.noteText = decodeURIComponentSafe(_get(options, 'note', ''))

    const words = splitWords(this.routeWordsRaw)
    this.wordList = buildWordList(words)
    if (!words.length) {
      await this.getChineseWordList(this.routeId).catch(() => {})
    }

    this.isLoaded = true
    this.resetSettingsAvailableWords()

    this.$nextTick(() => {
      if (this.noteText) {
        tts.speak(this.noteText)
      }
    })
  },
  beforeUnmount () {
    this.clearWaiting()
    try { tts.stop() } catch (e) {}
  },
  methods: {
    getChineseWordList (id) {
      return getChineseWordList({
        id,
        pageNum: 0,
        pageSize: 20
      }).then(data => {
        this.allWordList = _get(data, 'content', [])
        this.wordList = buildWordList(splitWords(_get(data, 'content[0].words', '')))
        return data
      })
    },
    resetSettingsAvailableWords () {
      const { wordList, settings } = this
      const list = (wordList || []).map(e => e.word)
      settings.availableWords = Array.from(new Set(list)).filter(Boolean)
      settings.selectedWords = (settings.selectedWords || []).filter(w => settings.availableWords.includes(w))
      if (settings.selectedWords.length === 0) {
        settings.selectedWords = [...settings.availableWords]
      }
      settings.wordCount = clampNumber(settings.selectedWords.length, 1, settings.availableWords.length)
    },
    openSettings () {
      if (this.status !== 'pending') return
      this.resetSettingsAvailableWords()
      this.settingsVisible = true
    },
    closeSettings () {
      this.settingsVisible = false
    },
    onInputInterval (e) {
      const v = _get(e, 'detail.value')
      this.settings.intervalTime = clampNumber(v, 1, 120)
    },
    pickGrade (value, i) {
      const words = this.allWordList.find(e => e.gradeId === value)?.words || ''
      this.settings.gradeKey = value
      this.wordList = buildWordList(splitWords(words))
      this.resetSettingsAvailableWords()
    },
    toggleWord (w) {
      const word = String(w)
      const set = new Set(this.settings.selectedWords)
      if (set.has(word)) set.delete(word)
      else set.add(word)
      this.settings.selectedWords = Array.from(set)
      this.settings.wordCount = clampNumber(this.settings.selectedWords.length, 1, this.settings.availableWords.length)
    },
    onInputWordCount (e) {
      const v = _get(e, 'detail.value')
      const maxN = this.settings.availableWords.length || 1
      this.settings.wordCount = clampNumber(v, 1, maxN)
    },
    onBlurWordCount () {
      const maxN = this.settings.availableWords.length || 1
      let n = clampNumber(this.settings.wordCount, 1, maxN)
      this.settings.wordCount = n
      const pool = [...this.settings.availableWords]
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = pool[i]
        pool[i] = pool[j]
        pool[j] = t
      }
      this.settings.selectedWords = pool.slice(0, n)
    },
    confirmSettings () {
      const words = (this.settings.selectedWords || []).filter(Boolean)
      if (words.length === 0) {
        uni.showToast({ title: '请至少选择一个词语', icon: 'none' })
        return
      }
      this.restart()
      this.settingsVisible = false
    },
    start () {
      if (!this.selectedWordLength) return
      this.status = 'active'
      this.completedSet = new Set()
      this.currentIndex = 0
      this.isPaused = false
      this.pausedDuringWait = false
      this.clearWaiting()
      this.speakCurrent()
    },
    restart () {
      this.clearWaiting()
      this.pausedDuringWait = false
      try { tts.stop() } catch (e) {}
      this.status = 'pending'
      this.completedSet = new Set()
      this.currentIndex = 0
      this.isPaused = false
    },
    finishEarly () {
      this.clearWaiting()
      this.pausedDuringWait = false
      this.status = 'finished'
      try { tts.stop() } catch (e) {}
      this.isPaused = false
    },
    togglePause () {
      if (this.status !== 'active') return
      if (this.isPaused) {
        this.isPaused = false
        if (this.pausedDuringWait) {
          this.pausedDuringWait = false
          this.speakCurrent()
        } else {
          try { tts.resume() } catch (e) {}
        }
        return
      }
      this.pausedDuringWait = !!this.waitingTimer
      this.isPaused = true
      this.clearWaiting()
      try { tts.pause() } catch (e) {}
    },
    clearWaiting () {
      if (this.waitingTimer) {
        clearInterval(this.waitingTimer)
        this.waitingTimer = null
      }
    },
    cardClass (realIdx) {
      const done = this.completedSet.has(realIdx)
      if (this.status === 'finished') {
        return done ? 'done' : 'todo'
      }
      if (this.status === 'active') return 'done'
      return ''
    },
    onClickCard (item) {
      if (!item || !item.word) return
      this.clearWaiting()
      tts.speak(item.word)
    },
    async speakCurrent () {
      if (this.status !== 'active') return
      if (this.isPaused) return
      const item = this.selectedWordList[this.currentIndex]
      if (!item) return

      this.clearWaiting()
      if (this.isWechatH5) {
        tts.speak(item.word)
        return
      }

      const intervalSec = this.settings.intervalTime || 20
      const gapMs = Math.max(1000, Math.floor((intervalSec * 1000) / 4))
      let repeatCount = 0
      tts.speak(item.word)
      this.waitingTimer = setInterval(() => {
        if (this.status !== 'active' || this.isPaused) return
        repeatCount ++
        if (repeatCount < 3) {
          tts.speak(item.word)
        }
        if (repeatCount >= 4) {
          this.clearWaiting()
          this.completeAndAdvance()
        }
      }, gapMs)
    },
    next () {
      if (this.status !== 'active') return
      if (this.isPaused) return
      this.completeAndAdvance()
    },
    completeAndAdvance () {
      this.clearWaiting()
      try { tts.stop() } catch (e) {}

      const idx = this.currentIndex
      if (!this.completedSet.has(idx)) {
        const nextSet = new Set(this.completedSet)
        nextSet.add(idx)
        this.completedSet = nextSet
      }

      const nextIndex = idx + 1
      if (nextIndex >= this.selectedWordList.length) {
        this.status = 'finished'
        this.isPaused = false
        return
      }
      this.currentIndex = nextIndex

      this.speakCurrent()
    }
  }
}

function decodeURIComponentSafe (s) {
  try {
    return decodeURIComponent(String(s || ''))
  } catch (e) {
    return String(s || '')
  }
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
