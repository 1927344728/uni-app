<template>
  <view class="page">
    <arithmetic-deco tone="result" />
    <view v-if="showConfetti" class="confetti">
      <view
        v-for="p in confetti"
        :key="p.id"
        class="confetti_piece"
        :style="p.style"
      />
    </view>
    <view class="body">
      <view class="stat_ok">答对题目: {{ result.correct }}/{{ result.total }}</view>
      <view class="stat_rate">正确率: {{ result.rate }}%</view>
      <view class="stat_score">总分: {{ result.score }}分</view>
      <view v-if="result.isRecord" class="record">新纪录</view>
      <view class="comment">{{ result.comment }}</view>
      <view class="actions">
        <button class="btn btn_green" hover-class="none" @click="goHome">返回主页</button>
        <!-- #ifdef MP-WEIXIN -->
        <button class="btn btn_orange share_btn" hover-class="none" open-type="share">分享成绩</button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <button class="btn btn_orange" hover-class="none" @click="shareScore">分享成绩</button>
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>

<script>
import { MODE_NAME, loadLastResult, shareText } from './arithmetic.js'
import store from '@/store/index'
import { TTSService } from '@/common/tts'
import ArithmeticDeco from './deco.vue'

const tts = new TTSService()
const CONFETTI_COLORS = ['#f2d15c', '#f08a2a', '#7ed47a', '#5aa7f2', '#d48cc8', '#e85d5d', '#ffffff']

function makeConfetti () {
  const list = []
  for (let i = 0; i < 22; i++) {
    const w = 10 + (i % 8)
    list.push({
      id: i,
      style: {
        left: ((i * 19) % 96) + 2 + '%',
        width: w + 'rpx',
        height: (8 + (i % 6)) + 'rpx',
        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        animationName: 'confetti-fall',
        animationDelay: ((i % 7) * 0.08) + 's',
        animationDuration: (1.8 + (i % 5) * 0.22) + 's'
      }
    })
  }
  return list
}

export default {
  components: {
    ArithmeticDeco
  },
  data () {
    return {
      showConfetti: false,
      confetti: [],
      confettiTimer: null,
      result: {
        mode: '',
        correct: 0,
        total: 0,
        rate: 0,
        score: 0,
        isRecord: false,
        comment: ''
      }
    }
  },
  onLoad () {
    const result = loadLastResult()
    if (!result || !result.total) {
      uni.redirectTo({ url: '/pages/study/arithmetic/index' })
      return
    }
    this.result = result
    if (Number(result.rate) >= 90) {
      this.confetti = makeConfetti()
      this.showConfetti = true
      this.confettiTimer = setTimeout(() => {
        this.showConfetti = false
      }, 2800)
    }
  },
  onReady () {
    if (!this.result.comment) return
    const u = store.state.userInfo
    const name = (u && (u.nickname || u.name)) || ''
    tts.speak(name ? name + '，' + this.result.comment : this.result.comment)
  },
  onUnload () {
    if (this.confettiTimer) {
      clearTimeout(this.confettiTimer)
      this.confettiTimer = null
    }
    try { tts.stop() } catch (e) {}
  },
  onShareAppMessage () {
    const r = this.result
    const name = MODE_NAME[r.mode] || '算术小达人'
    return {
      title: `算术小达人｜${name} ${r.correct}/${r.total}`,
      path: '/pages/study/arithmetic/index'
    }
  },
  methods: {
    goHome () {
      uni.navigateBack({
        fail: () => {
          uni.redirectTo({ url: '/pages/study/arithmetic/index' })
        }
      })
    },
    shareScore () {
      const text = shareText(this.result)
      uni.setClipboardData({
        data: text,
        success: () => {
          uni.showToast({ title: '成绩已复制', icon: 'none' })
        },
        fail: () => {
          uni.showModal({
            title: '请手动截图分享',
            content: text,
            showCancel: false
          })
        }
      })
    }
  }
}
</script>

<style lang="less" src="./result.less" scoped></style>
<style>
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(1400rpx) rotate(280deg);
    opacity: 0.15;
  }
}
</style>
