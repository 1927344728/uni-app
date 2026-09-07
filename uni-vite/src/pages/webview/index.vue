<template>
  <!-- #ifdef MP -->
  <view class="webview_fallback">
    <view class="title">无法在小程序内打开网页</view>
    <view class="desc">个人主体小程序不支持 web-view。请复制链接后，在手机浏览器中打开。</view>
    <view class="url">{{ localHtmlPath || '暂无链接' }}</view>
    <view class="btn" @tap="copyLink">复制链接</view>
  </view>
  <!-- #endif -->

  <!-- #ifndef MP -->
  <view>
    <web-view v-if="localHtmlPath" :src="localHtmlPath"></web-view>
  </view>
  <!-- #endif -->
</template>

<script>
import { openExternalUrlOnMp } from '@/common/js/common.js'

export default {
  data() {
    return {
      localHtmlPath: ''
    }
  },
  onLoad (options = {}) {
    this.localHtmlPath = options.url ? decodeURIComponent(options.url) : ''
    // #ifdef MP
    if (this.localHtmlPath) {
      openExternalUrlOnMp(this.localHtmlPath)
    }
    // #endif
  },
  methods: {
    copyLink () {
      openExternalUrlOnMp(this.localHtmlPath)
    }
  }
}
</script>

<style lang="less">
.webview_fallback {
  min-height: 100vh;
  padding: 80rpx 48rpx;
  box-sizing: border-box;
  background: #f2f2f2;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
  }

  .desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 32rpx;
  }

  .url {
    padding: 24rpx;
    background: #fff;
    border-radius: 12rpx;
    font-size: 24rpx;
    color: #999;
    word-break: break-all;
    margin-bottom: 48rpx;
  }

  .btn {
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    color: #fff;
    background: #59c2ad;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: bold;
  }
}
</style>
