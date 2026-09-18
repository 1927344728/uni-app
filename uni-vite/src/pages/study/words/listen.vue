<template>
  <view class="page" :class="{ page_no_scroll: settingsVisible }">
    <view class="topbar">
      <text class="progress">第 {{ roundIndex + 1 }} / {{ total }} 题</text>
      <text class="score">答对 {{ correctCount }}</text>
    </view>

    <view class="stage">
      <view v-if="!running" class="stage_card idle_card">
        <text class="idle_title">已停止</text>
        <text class="idle_hint">可调整倒计时长后重新开始</text>
      </view>
      <view v-else-if="phase === 'countdown'" class="stage_card count_card">
        <text class="count_num">{{ countdown }}</text>
        <text class="count_hint">请听即将播报的字词</text>
      </view>
      <view v-else class="stage_card speak_card" :class="{ sparkle: sparkleOn }" @click="replay">
        <view class="speak_icon">♪</view>
        <text class="speak_text">{{ speaking ? '正在播报…' : '再听一遍' }}</text>
        <view v-if="sparkleOn" class="sparkles">
          <text v-for="n in sparkleMarks" :key="n" class="sparkle_item" :class="'s' + n">✨</text>
        </view>
      </view>
    </view>

    <view v-if="running" class="choose">
      <view class="block block_word">
        <view class="block_title">选出听到的词语</view>
        <view class="opts">
          <view
            v-for="(item, idx) in displayWordOptions"
            :key="'w-' + idx"
            class="opt opt_word"
            :class="{
              opt_placeholder: !item.word,
              opt_on: item.word && pickedWord === item.word,
              opt_ok: item.word && judged && item.word === target.word,
              opt_bad: item.word && judged && pickedWord === item.word && item.word !== target.word,
              shake: item.word && shakeWord && pickedWord === item.word && item.word !== target.word
            }"
            hover-class="opt_hover"
            @click="pickWord(item.word)"
          >{{ item.word || ' ' }}</view>
        </view>
      </view>

      <view class="block block_pinyin">
        <view class="block_title">选出对应的拼音</view>
        <view class="opts">
          <view
            v-for="(item, idx) in displayPinyinOptions"
            :key="'p-' + idx"
            class="opt opt_py"
            :class="{
              opt_placeholder: !item.pinyin,
              opt_on: item.pinyin && pickedPinyin === item.pinyin,
              opt_ok: item.pinyin && judged && item.pinyin === target.pinyin,
              opt_bad: item.pinyin && judged && pickedPinyin === item.pinyin && item.pinyin !== target.pinyin,
              shake: item.pinyin && shakePinyin && pickedPinyin === item.pinyin && item.pinyin !== target.pinyin
            }"
            hover-class="opt_hover"
            @click="pickPinyin(item.pinyin)"
          >{{ item.pinyin || ' ' }}</view>
        </view>
      </view>

      <view class="timer_wrap">
        <countdown-ring
          :remain-ms="answerRemainMs"
          :total-ms="answerTotalMs"
          :warn-sec="5"
        />
      </view>
    </view>

    <view class="bottom_stack">
      <view class="footer">
        <button class="btn btn_settings" :class="{ btn_disabled: running }" @click="openSettings">设置</button>
        <button v-if="running" class="btn btn_stop" @click="stopGame">停止</button>
        <button v-else class="btn btn_start" @click="restart">开始</button>
      </view>
    </view>

    <view v-if="settingsVisible" class="mask" @click.self="closeSettings" @touchmove.stop.prevent>
      <view class="sheet" @click.stop @touchmove.stop>
        <view class="sheet_hd">
          <view class="sheet_title">设置</view>
          <view class="sheet_close" hover-class="sheet_close_hover" @click="closeSettings">×</view>
        </view>
        <view class="sheet_bd_wrap">
          <scroll-view scroll-y class="sheet_bd">
            <view class="form_block">
              <view class="form_block_label">倒计时长</view>
              <view class="input_wrap">
                <input
                  class="input"
                  type="number"
                  :value="draftAnswerSec"
                  :adjust-position="false"
                  confirm-type="done"
                  :hold-keyboard="true"
                  @input="onInputAnswerSec"
                  @focus="answerSecFocused = true"
                  @blur="onAnswerSecBlur"
                  placeholder="每题答题倒计时（秒）"
                />
                <view
                  v-if="answerSecFocused && draftAnswerSec !== '' && draftAnswerSec != null"
                  class="input_clear"
                  hover-class="input_clear_hover"
                  @mousedown.prevent
                  @touchstart.prevent="clearAnswerSec"
                  @click="clearAnswerSec"
                >×</view>
              </view>
              <view class="form_block_tip">每题默认 {{ defaultAnswerSec }} 秒，可设 {{ answerMin }}–{{ answerMax }} 秒</view>
            </view>

            <view class="word_pick_title">
              {{ libraryTitle || '当前词库' }}（共 {{ libraryWords.length }} 个）
            </view>
            <view class="word_pick_grid">
              <view
                v-for="w in libraryWords"
                :key="w"
                class="word_chip"
              >{{ w }}</view>
            </view>
          </scroll-view>
        </view>
        <view class="sheet_ft">
          <button class="btn_cancel_sheet" @click="closeSettings">取消</button>
          <button class="btn_ok_sheet" @click="confirmSettings">确认</button>
        </view>
      </view>
    </view>

    <common-dialog
      :show="overVisible"
      :title="overTitle"
      :message="overMessage"
      confirm-button-text="再来一轮"
      show-cancel-button
      cancel-button-text="返回"
      @update:show="overVisible = $event"
      @confirm="restart"
      @cancel="goHome"
    />
  </view>
</template>

<script>
import { getValue as _get } from '@/common/js/common.js'
import { clampNumber } from '@/common/js/dictation.js'
import { TTSService } from '@/common/tts'
import CommonDialog from '@/components/common/dialog/index.vue'
import CountdownRing from '@/components/common/countdown-ring/index.vue'
import { loadWordsPayload } from './storage.js'
import {
  LISTEN_ANSWER_MAX,
  LISTEN_ANSWER_MIN,
  LISTEN_ANSWER_SEC,
  LISTEN_DELAY_MS,
  buildWordItems,
  destroyWordSfx,
  fallbackWordItems,
  loadListenAnswerSec,
  pickN,
  playWordSfx,
  saveListenAnswerSec,
  shuffle
} from './words.js'

const PREP_SEC = Math.max(1, Math.round(LISTEN_DELAY_MS / 1000))

const tts = new TTSService()

export default {
  components: { CommonDialog, CountdownRing },
  data () {
    return {
      pool: [],
      distractorPool: [],
      queue: [],
      roundIndex: 0,
      correctCount: 0,
      running: false,
      phase: 'idle',
      countdown: PREP_SEC,
      answerSec: LISTEN_ANSWER_SEC,
      answerRemainMs: LISTEN_ANSWER_SEC * 1000,
      draftAnswerSec: LISTEN_ANSWER_SEC,
      defaultAnswerSec: LISTEN_ANSWER_SEC,
      answerMin: LISTEN_ANSWER_MIN,
      answerMax: LISTEN_ANSWER_MAX,
      settingsVisible: false,
      libraryTitle: '',
      libraryWords: [],
      answerSecFocused: false,
      missed: false,
      speakTimer: null,
      countdownTimer: null,
      answerTimer: null,
      delayTimer: null,
      nextTimer: null,
      shakeTimer: null,
      sparkleTimer: null,
      speaking: false,
      target: { word: '', pinyin: '' },
      wordOptions: [],
      pinyinOptions: [],
      pickedWord: '',
      pickedPinyin: '',
      judged: false,
      locked: false,
      shakeWord: false,
      shakePinyin: false,
      sparkleOn: false,
      sparkleMarks: [1, 2, 3, 4, 5, 6],
      overVisible: false,
      overTitle: '',
      overMessage: ''
    }
  },
  computed: {
    total () {
      return this.queue.length
    },
    answerTotalMs () {
      return Math.max(1000, this.answerSec * 1000)
    },
    displayWordOptions () {
      const list = (this.wordOptions || []).slice(0, 4)
      while (list.length < 4) list.push({ word: '', pinyin: '' })
      return list
    },
    displayPinyinOptions () {
      const list = (this.pinyinOptions || []).slice(0, 4)
      while (list.length < 4) list.push({ word: '', pinyin: '' })
      return list
    }
  },
  onLoad () {
    this.answerSec = loadListenAnswerSec()
    this.answerRemainMs = this.answerSec * 1000
    this.draftAnswerSec = this.answerSec
    const saved = loadWordsPayload()
    this.libraryTitle = (saved && saved.libraryTitle) || ''
    const savedWords = Array.isArray(saved && saved.words) ? saved.words : []
    this.libraryWords = Array.from(new Set(savedWords.filter(Boolean)))
    const selected = buildWordItems(savedWords)
    const extras = fallbackWordItems()
    this.pool = selected.length ? selected : extras
    if (!this.libraryWords.length) {
      this.libraryWords = this.pool.map(e => e.word).filter(Boolean)
    }
    this.distractorPool = this.uniqByWord(this.pool.concat(extras))
    if (this.pool.length < 1) {
      uni.showToast({ title: '请先选择词库', icon: 'none' })
      this.goHome()
      return
    }
    this.restart()
  },
  onUnload () {
    this.clearAllTimers()
    destroyWordSfx()
    try { tts.stop() } catch (e) {}
  },
  methods: {
    uniqByWord (list) {
      const seen = new Set()
      return (list || []).filter(e => {
        if (!e || !e.word || seen.has(e.word)) return false
        seen.add(e.word)
        return true
      })
    },
    goHome () {
      uni.navigateBack({
        fail: () => {
          uni.redirectTo({ url: '/pages/study/words/index' })
        }
      })
    },
    clearAllTimers () {
      if (this.countdownTimer) clearInterval(this.countdownTimer)
      if (this.answerTimer) clearInterval(this.answerTimer)
      if (this.delayTimer) clearTimeout(this.delayTimer)
      if (this.nextTimer) clearTimeout(this.nextTimer)
      if (this.shakeTimer) clearTimeout(this.shakeTimer)
      if (this.sparkleTimer) clearTimeout(this.sparkleTimer)
      if (this.speakTimer) clearTimeout(this.speakTimer)
      this.countdownTimer = null
      this.answerTimer = null
      this.delayTimer = null
      this.nextTimer = null
      this.shakeTimer = null
      this.sparkleTimer = null
      this.speakTimer = null
    },
    openSettings () {
      if (this.running) {
        uni.showToast({ title: '请先停止后再设置', icon: 'none' })
        return
      }
      this.draftAnswerSec = this.answerSec
      this.answerSecFocused = false
      this.settingsVisible = true
    },
    closeSettings () {
      this.settingsVisible = false
      this.answerSecFocused = false
    },
    onInputAnswerSec (e) {
      const v = _get(e, 'detail.value')
      if (v === '' || v == null) {
        this.draftAnswerSec = ''
        return
      }
      this.draftAnswerSec = clampNumber(v, LISTEN_ANSWER_MIN, LISTEN_ANSWER_MAX)
    },
    onAnswerSecBlur () {
      setTimeout(() => {
        this.answerSecFocused = false
      }, 120)
    },
    clearAnswerSec () {
      this.draftAnswerSec = ''
      this.answerSecFocused = true
    },
    confirmSettings () {
      this.answerSec = saveListenAnswerSec(this.draftAnswerSec === '' ? LISTEN_ANSWER_SEC : this.draftAnswerSec)
      this.draftAnswerSec = this.answerSec
      this.answerRemainMs = this.answerSec * 1000
      this.settingsVisible = false
      this.answerSecFocused = false
      uni.showToast({ title: '设置已保存', icon: 'none' })
    },
    stopGame () {
      this.clearAllTimers()
      try { tts.stop() } catch (e) {}
      this.running = false
      this.phase = 'idle'
      this.speaking = false
      this.locked = true
      this.sparkleOn = false
    },
    restart () {
      this.clearAllTimers()
      this.overVisible = false
      this.settingsVisible = false
      this.queue = shuffle(this.pool)
      this.roundIndex = 0
      this.correctCount = 0
      this.running = true
      this.startRound(true)
    },
    startRound (withDelay) {
      this.clearAllTimers()
      if (!this.running) return
      const item = this.queue[this.roundIndex]
      if (!item) {
        this.finish()
        return
      }
      this.target = item
      this.pickedWord = ''
      this.pickedPinyin = ''
      this.judged = false
      this.locked = false
      this.shakeWord = false
      this.shakePinyin = false
      this.sparkleOn = false
      this.missed = false
      this.speaking = false
      this.answerRemainMs = this.answerTotalMs
      if (withDelay) {
        // 首题准备阶段：占位格子占位，避免后续模块跳动
        this.wordOptions = []
        this.pinyinOptions = []
        this.phase = 'countdown'
        this.countdown = PREP_SEC
        this.countdownTimer = setInterval(() => {
          this.countdown -= 1
          if (this.countdown <= 0) {
            clearInterval(this.countdownTimer)
            this.countdownTimer = null
            this.revealAndSpeak()
          }
        }, 1000)
      } else {
        // 换题：先保留上一题选项占位，再无内容，避免模块位移
        this.phase = 'choose'
        this.delayTimer = setTimeout(() => this.revealAndSpeak(), 280)
      }
    },
    revealAndSpeak () {
      if (!this.running) return
      this.wordOptions = this.buildWordOptions(this.target)
      this.pinyinOptions = this.buildPinyinOptions(this.target)
      this.phase = 'choose'
      this.startAnswerCountdown()
      this.replay()
    },
    startAnswerCountdown () {
      if (this.answerTimer) clearInterval(this.answerTimer)
      const total = this.answerTotalMs
      const started = Date.now()
      this.answerRemainMs = total
      this.answerTimer = setInterval(() => {
        if (!this.running || this.locked) return
        const left = total - (Date.now() - started)
        this.answerRemainMs = Math.max(0, left)
        if (left <= 0) {
          clearInterval(this.answerTimer)
          this.answerTimer = null
          this.onAnswerTimeout()
        }
      }, 80)
    },
    onAnswerTimeout () {
      if (this.locked || !this.running) return
      this.locked = true
      this.missed = true
      playWordSfx(false)
      this.shakeOnTimeout()
      this.nextTimer = setTimeout(() => this.goNext(), 600)
    },
    shakeOnTimeout () {
      this.shakeWord = true
      this.shakePinyin = true
      this.shakeTimer = setTimeout(() => {
        this.shakeWord = false
        this.shakePinyin = false
      }, 420)
    },
    buildWordOptions (target) {
      const others = this.distractorPool.filter(e => e.word !== target.word)
      const extra = pickN(others, 3)
      while (extra.length < 3) extra.push(fallbackWordItems()[extra.length % 4])
      return shuffle([target, ...extra.slice(0, 3)])
    },
    buildPinyinOptions (target) {
      const seen = new Set([target.pinyin])
      const extras = []
      shuffle(this.distractorPool).forEach(e => {
        if (!e.pinyin || seen.has(e.pinyin)) return
        seen.add(e.pinyin)
        extras.push(e)
      })
      while (extras.length < 3) {
        const fb = fallbackWordItems().find(e => e.pinyin && !seen.has(e.pinyin))
        if (!fb) break
        seen.add(fb.pinyin)
        extras.push(fb)
      }
      return shuffle([target, ...extras.slice(0, 3)])
    },
    replay () {
      if (!this.target.word || this.locked || !this.running) return
      this.speaking = true
      try { tts.stop() } catch (e) {}
      tts.speak(this.target.word)
      if (this.speakTimer) clearTimeout(this.speakTimer)
      this.speakTimer = setTimeout(() => {
        this.speaking = false
      }, 1200)
    },
    pickWord (word) {
      if (!word || !this.running || this.locked || this.phase !== 'choose') return
      if (this.pickedWord && this.pickedWord === this.target.word) return
      this.pickedWord = word
      if (word !== this.target.word) {
        this.missed = true
        this.shakeWord = true
        playWordSfx(false)
        this.shakeTimer = setTimeout(() => {
          this.shakeWord = false
          this.pickedWord = ''
        }, 420)
        return
      }
      this.tryComplete()
    },
    pickPinyin (pinyin) {
      if (!pinyin || !this.running || this.locked || this.phase !== 'choose') return
      if (this.pickedPinyin && this.pickedPinyin === this.target.pinyin) return
      this.pickedPinyin = pinyin
      if (pinyin !== this.target.pinyin) {
        this.missed = true
        this.shakePinyin = true
        playWordSfx(false)
        this.shakeTimer = setTimeout(() => {
          this.shakePinyin = false
          this.pickedPinyin = ''
        }, 420)
        return
      }
      this.tryComplete()
    },
    tryComplete () {
      const wordOk = this.pickedWord === this.target.word
      const pyOk = this.pickedPinyin === this.target.pinyin
      if (!wordOk || !pyOk) return
      this.locked = true
      this.judged = true
      if (this.answerTimer) {
        clearInterval(this.answerTimer)
        this.answerTimer = null
      }
      if (!this.missed) this.correctCount += 1
      this.sparkleOn = true
      playWordSfx(true)
      this.sparkleTimer = setTimeout(() => {
        this.sparkleOn = false
        this.goNext()
      }, 900)
    },
    goNext () {
      if (!this.running) return
      const next = this.roundIndex + 1
      if (next >= this.queue.length) {
        this.finish()
        return
      }
      this.roundIndex = next
      this.startRound(false)
    },
    finish () {
      this.clearAllTimers()
      try { tts.stop() } catch (e) {}
      this.running = false
      this.phase = 'idle'
      this.overTitle = '本轮完成'
      this.overMessage = `一共 ${this.total} 题，一次答对 ${this.correctCount} 题。`
      this.overVisible = true
    }
  }
}
</script>

<style lang="less" src="./listen.less" scoped></style>
<style>
@keyframes words-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
@keyframes words-sparkle-pop {
  0% { transform: scale(0.4); opacity: 0; }
  35% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1.7); opacity: 0; }
}
@keyframes words-count-in {
  0% { transform: scale(0.7); opacity: 0.4; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
