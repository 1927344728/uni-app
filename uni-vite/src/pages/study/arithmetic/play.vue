<template>
  <view class="page">
    <arithmetic-deco tone="play" />
    <view class="progress_dock top">
      <text class="progress_text">题目: {{ index + 1 }}/{{ total }}</text>
    </view>

    <view class="score">{{ score }}<text class="score_unit">分</text></view>
    <view class="expr">{{ expr }}</view>

    <view class="opts">
      <view
        v-for="n in options"
        :key="n"
        class="opt"
        :class="optClass(n)"
        hover-class="opt_hover"
        @click="onPick(n)"
      >{{ n }}</view>
    </view>

    <view class="timer">
      <!-- #ifndef MP -->
      <view class="ring_conic" :style="conicStyle"></view>
      <!-- #endif -->
      <!-- #ifdef MP -->
      <view class="ring_track"></view>
      <view
        v-for="(pos, i) in tickStyles"
        :key="i"
        class="tick"
        :class="{ on: i < remainTicks, warn: remainCeil <= 3 }"
        :style="pos"
      ></view>
      <!-- #endif -->
      <view class="ring_inner">
        <text :key="'t-' + remainCeil" class="timer_num" :class="{ warn: remainCeil <= 3 }">{{ remainCeil }}</text>
      </view>
    </view>

    <view class="progress_dock bottom">
      <text class="progress_text">已用时: {{ elapsedSec }}秒</text>
    </view>

    <common-dialog
      :show="leaveVisible"
      title="退出本轮练习？"
      message="进度不会保存。"
      show-cancel-button
      confirm-button-text="退出"
      cancel-button-text="继续答题"
      @update:show="onLeaveShow"
      @confirm="onLeaveConfirm"
    />
  </view>
</template>

<script>
import {
  MODE_NAME,
  FULL_SCORE,
  scoreOf,
  loadSettings,
  saveLastResult,
  generatePaper,
  commentOf,
  startArithmeticBgm,
  pauseArithmeticBgm,
  resumeArithmeticBgm,
  playArithmeticSfx,
  destroyArithmeticAudio
} from './arithmetic.js'
import store from '@/store/index'
import { saveArithmeticScore } from '@/api/study.js'
import CommonDialog from '@/components/common/dialog/index.vue'
import ArithmeticDeco from './deco.vue'

export default {
  components: {
    CommonDialog,
    ArithmeticDeco
  },
  data () {
    return {
      mode: '',
      settings: loadSettings(),
      paper: [],
      index: 0,
      score: 0,
      correct: 0,
      expr: '',
      answer: null,
      options: [],
      locked: false,
      choice: null,
      remainMs: 0,
      timer: null,
      elapsedMs: 0,
      elapsedTimer: null,
      roundStartedAt: 0,
      finished: false,
      leaveVisible: false
    }
  },
  computed: {
    total () {
      return this.paper.length
    },
    remainCeil () {
      return Math.ceil(this.remainMs / 1000)
    },
    elapsedSec () {
      return Math.max(0, Math.floor(this.elapsedMs / 1000) || 0)
    },
    remainRatio () {
      const total = (this.settings.timeLimit || 10) * 1000
      if (!total) return 0
      return Math.max(0, Math.min(1, this.remainMs / total))
    },
    remainTicks () {
      return Math.round(this.remainRatio * 48)
    },
    tickStyles () {
      const n = 48
      const cx = uni.upx2px(70)
      const cy = uni.upx2px(70)
      const r = uni.upx2px(64)
      const size = uni.upx2px(12)
      const list = []
      for (let i = 0; i < n; i++) {
        const rad = (i / n) * Math.PI * 2 - Math.PI / 2
        list.push({
          left: (cx + r * Math.cos(rad) - size / 2) + 'px',
          top: (cy + r * Math.sin(rad) - size / 2) + 'px',
          width: size + 'px',
          height: size + 'px'
        })
      }
      return list
    },
    conicStyle () {
      const deg = this.remainRatio * 360
      const color = this.remainCeil <= 3 ? '#e85d5d' : '#3cbf6a'
      return {
        background: `conic-gradient(${color} 0deg, ${color} ${deg}deg, #d7ece9 ${deg}deg)`
      }
    }
  },
  onLoad (query) {
    const mode = query && query.mode
    if (!mode || !MODE_NAME[mode]) {
      destroyArithmeticAudio()
      uni.redirectTo({ url: '/pages/study/arithmetic/index' })
      return
    }
    this.mode = mode
    uni.setNavigationBarTitle({ title: MODE_NAME[mode] })
    this.settings = loadSettings()
    this.paper = generatePaper(mode, this.settings.questionCount)
    if (!this.paper.length) {
      destroyArithmeticAudio()
      uni.showToast({ title: '出题失败', icon: 'none' })
      uni.redirectTo({ url: '/pages/study/arithmetic/index' })
      return
    }
    this.startElapsed()
    this.showQuestion()
    startArithmeticBgm(this.mode)
  },
  onShow () {
    if (!this.finished && !this.leaveVisible) resumeArithmeticBgm()
    // #ifdef MP-WEIXIN
    if (typeof wx !== 'undefined' && wx.enableAlertBeforeUnload) {
      wx.enableAlertBeforeUnload({
        message: '退出本轮练习？进度不会保存。'
      })
    }
    // #endif
  },
  onHide () {
    pauseArithmeticBgm()
  },
  onUnload () {
    this.clearTimer()
    this.clearElapsed()
    this.disableLeaveAlert()
    destroyArithmeticAudio()
  },
  onBackPress () {
    if (this.finished) return false
    this.confirmLeave()
    return true
  },
  methods: {
    disableLeaveAlert () {
      // #ifdef MP-WEIXIN
      if (typeof wx !== 'undefined' && wx.disableAlertBeforeUnload) {
        wx.disableAlertBeforeUnload()
      }
      // #endif
    },
    optClass (n) {
      if (!this.locked) return {}
      if (n === this.answer) return { correct: true }
      if (this.choice !== null && n === this.choice) return { wrong: true }
      return { dim: true }
    },
    clearTimer () {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    clearElapsed () {
      if (this.elapsedTimer) {
        clearInterval(this.elapsedTimer)
        this.elapsedTimer = null
      }
    },
    startElapsed () {
      this.clearElapsed()
      this.roundStartedAt = Date.now()
      this.elapsedMs = 0
      this.elapsedTimer = setInterval(() => {
        this.elapsedMs = Date.now() - this.roundStartedAt
      }, 200)
    },
    showQuestion () {
      const q = this.paper[this.index]
      this.expr = q.expr
      this.answer = q.answer
      this.options = q.options
      this.locked = false
      this.choice = null
      this.startTimer()
    },
    startTimer () {
      this.clearTimer()
      const total = this.settings.timeLimit * 1000
      const started = Date.now()
      this.remainMs = total
      this.timer = setInterval(() => {
        const left = total - (Date.now() - started)
        this.remainMs = Math.max(0, left)
        if (left <= 0) this.onPick(null)
      }, 80)
    },
    onPick (choice) {
      if (this.locked || this.finished) return
      this.locked = true
      this.clearTimer()
      this.choice = choice
      const ok = choice === this.answer
      if (ok) {
        this.correct += 1
        this.score = scoreOf(this.correct, this.total)
      }
      playArithmeticSfx(ok)
      setTimeout(() => {
        if (this.finished) return
        if (this.index >= this.paper.length - 1) {
          this.finishRound()
        } else {
          this.index += 1
          this.showQuestion()
        }
      }, 500)
    },
    finishRound () {
      this.finished = true
      this.clearTimer()
      this.clearElapsed()
      this.disableLeaveAlert()
      destroyArithmeticAudio()
      const total = this.paper.length
      const rate = total ? Math.round(this.correct / total * 100) : 0
      const maxScore = FULL_SCORE
      const durationMs = this.elapsedMs
      const score = scoreOf(this.correct, total)
      const payload = {
        mode: this.mode,
        correct: this.correct,
        total,
        rate,
        score,
        maxScore,
        durationMs,
        comment: commentOf(rate)
      }
      saveLastResult(payload)
      const user = store.state.userInfo
      if (user && (user.id || user.uuid || user.phone || user.nickname || user.name)) {
        saveArithmeticScore({
          mode: this.mode,
          score,
          maxScore,
          correct: this.correct,
          total,
          durationMs
        }, { login: 0 }).catch(() => {})
      }
      uni.redirectTo({ url: '/pages/study/arithmetic/result' })
    },
    confirmLeave () {
      if (this.leaveVisible || this.finished) return
      this.leaveVisible = true
      pauseArithmeticBgm()
    },
    onLeaveShow (val) {
      this.leaveVisible = val
      if (val) pauseArithmeticBgm()
      else if (!this.finished) resumeArithmeticBgm()
    },
    onLeaveConfirm () {
      this.finished = true
      this.clearTimer()
      this.clearElapsed()
      this.disableLeaveAlert()
      destroyArithmeticAudio()
      uni.navigateBack({
        fail: () => {
          uni.redirectTo({ url: '/pages/study/arithmetic/index' })
        }
      })
    }
  }
}
</script>

<style lang="less" src="./play.less" scoped></style>
