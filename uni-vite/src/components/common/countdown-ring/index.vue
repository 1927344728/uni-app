<template>
  <view class="countdown_ring" :style="rootStyle">
    <!-- #ifndef MP -->
    <view class="countdown_ring__conic" :style="conicStyle"></view>
    <!-- #endif -->
    <!-- #ifdef MP -->
    <view class="countdown_ring__track"></view>
    <view
      v-for="(pos, i) in tickStyles"
      :key="i"
      class="countdown_ring__tick"
      :class="{ on: i < remainTicks, warn: isWarn }"
      :style="pos"
    ></view>
    <!-- #endif -->
    <view class="countdown_ring__inner">
      <text
        :key="'t-' + remainCeil"
        class="countdown_ring__num"
        :class="{ warn: isWarn }"
      >{{ remainCeil }}</text>
    </view>
  </view>
</template>

<script>
const TICK_COUNT = 48

export default {
  name: 'CountdownRing',
  props: {
    remainMs: {
      type: Number,
      default: 0
    },
    totalMs: {
      type: Number,
      default: 10000
    },
    warnSec: {
      type: Number,
      default: 3
    },
    size: {
      type: Number,
      default: 140
    }
  },
  computed: {
    rootStyle () {
      return {
        width: this.size + 'rpx',
        height: this.size + 'rpx'
      }
    },
    remainCeil () {
      return Math.max(0, Math.ceil(this.remainMs / 1000))
    },
    remainRatio () {
      const total = Number(this.totalMs) || 0
      if (!total) return 0
      return Math.max(0, Math.min(1, this.remainMs / total))
    },
    remainTicks () {
      return Math.round(this.remainRatio * TICK_COUNT)
    },
    isWarn () {
      return this.remainCeil <= this.warnSec
    },
    tickStyles () {
      const n = TICK_COUNT
      const sizeRpx = this.size
      const tickRpx = Math.max(8, Math.round(sizeRpx * 12 / 140))
      const cx = uni.upx2px(sizeRpx / 2)
      const cy = uni.upx2px(sizeRpx / 2)
      const r = uni.upx2px(sizeRpx / 2 - 6)
      const size = uni.upx2px(tickRpx)
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
      const color = this.isWarn ? '#e85d5d' : '#3cbf6a'
      return {
        width: this.size + 'rpx',
        height: this.size + 'rpx',
        background: `conic-gradient(${color} 0deg, ${color} ${deg}deg, #d7ece9 ${deg}deg)`
      }
    }
  }
}
</script>

<style lang="less" src="./index.less" scoped></style>
