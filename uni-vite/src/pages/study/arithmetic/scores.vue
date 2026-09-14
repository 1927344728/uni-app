<template>
  <view class="page">
    <arithmetic-deco tone="scores" />
    <view class="page_main">
    <view class="user_card">
      <view class="user_name">{{ displayName }}</view>
      <view class="user_meta">等级: {{ stats.levelName }}</view>
      <view class="user_meta">最佳成绩: {{ stats.bestScore }}分{{ bestDurationText }}</view>
      <view class="user_meta">满分成绩: {{ stats.perfectCount }} 次</view>
      <view class="user_meta">王者挑战满分: {{ stats.kingPerfectCount }} 次</view>
    </view>
    <view v-if="isLoaded && !list.length" class="empty">还没有成绩，去做题吧</view>
    <view v-else-if="list.length" class="list">
      <view v-for="item in list" :key="item.id" class="row">
        <view class="row_main">
          <text class="row_mode">{{ modeLabel(item.mode) }}</text>
          <text class="row_score">{{ item.score }}分</text>
        </view>
        <view class="row_sub">
          <text>用时 {{ formatDuration(item.durationMs) }}</text>
          <text>{{ formatDate(item.createdTime) }}</text>
        </view>
      </view>
    </view>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import store from '@/store/index'
import { getUserInfo } from '@/api'
import { getArithmeticStats, getArithmeticScorePageList } from '@/api/study.js'
import { parseTime } from '@/common/js/common.js'
import { MODE_NAME, emptyStats, formatDuration } from './arithmetic.js'
import ArithmeticDeco from './deco.vue'

export default {
  components: {
    ArithmeticDeco
  },
  data () {
    return {
      isLoaded: false,
      stats: emptyStats(),
      list: []
    }
  },
  computed: {
    ...mapState(['userInfo']),
    displayName () {
      const u = this.userInfo
      return (u && (u.nickname || u.name)) || '游客'
    },
    bestDurationText () {
      if (!this.stats.bestScore) return ''
      return ' / ' + formatDuration(this.stats.bestDurationMs)
    }
  },
  onShow () {
    this.refresh()
  },
  methods: {
    formatDuration,
    modeLabel (mode) {
      return MODE_NAME[mode] || mode || '练习'
    },
    formatDate (time) {
      let t = Number(time)
      if (!t) return ''
      if (t < 1e12) t = t * 1000
      return parseTime(t, '{y}-{m}-{d} {h}:{i}') || ''
    },
    refresh () {
      getUserInfo({ login: 0 }).then((data) => {
        store.commit('setUserInfo', data || null)
        if (data) this.loadData()
        else this.resetScores()
      }).catch(() => {
        store.commit('setUserInfo', null)
        this.resetScores()
      })
    },
    resetScores () {
      this.stats = emptyStats()
      this.list = []
      this.isLoaded = true
    },
    loadData () {
      this.isLoaded = false
      getArithmeticStats({ login: 0 }).then((data) => {
        this.stats = { ...emptyStats(), ...(data || {}) }
      }).catch(() => {
        this.stats = emptyStats()
      })
      getArithmeticScorePageList({ pageNum: 0, pageSize: 50 }, { login: 0 }).then((data) => {
        this.list = (data && data.content) || []
      }).catch(() => {
        this.list = []
      }).finally(() => {
        this.isLoaded = true
      })
    }
  }
}
</script>

<style lang="less" src="./scores.less" scoped></style>
