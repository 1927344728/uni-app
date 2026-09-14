<template>
  <view class="deco" :class="'is-' + tone">
    <view class="blob b1"></view>
    <view class="blob b2"></view>
    <view class="blob b3"></view>
    <view v-if="showBottom" class="blob b4"></view>
    <view class="gem g1"></view>
    <view class="gem g2"></view>
    <view v-if="showBottom" class="gem g3"></view>
    <text class="star s1">★</text>
    <text class="star s2">★</text>
    <text v-if="showBottom" class="star s3">★</text>
    <image class="cloud tl" :src="cloudSrc('cloud1.png')" mode="widthFix" />
    <image class="cloud tr" :src="cloudSrc('cloud2.png')" mode="widthFix" />
    <image v-if="showBottom" class="cloud bl" :src="cloudSrc('cloud3.png')" mode="widthFix" />
    <image v-if="showBottom" class="cloud br" :src="cloudSrc('cloud5.png')" mode="widthFix" />
  </view>
</template>

<script>
import { COS_DOMAIN_NAME } from '@/common/js/common.js'

export default {
  name: 'ArithmeticDeco',
  props: {
    tone: {
      type: String,
      default: 'index'
    }
  },
  computed: {
    showBottom () {
      return this.tone !== 'play'
    }
  },
  methods: {
    cloudSrc (name) {
      return `${COS_DOMAIN_NAME}/images/${name}`
    }
  }
}
</script>

<style lang="less" src="./deco.less" scoped></style>
