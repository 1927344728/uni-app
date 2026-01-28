<template>
  <view class="about_page">
    <view class="header">
      <image class="logo" :src="scaleImageWidthInCOS(appInfo.logo, 120)" mode="aspectFit"/>
      <text class="name">{{ appInfo.name }}</text>
      <text class="version">版本 {{ appInfo.version }}</text>
    </view>
    <view class="copyright">
      <view v-if="recordInfo.websiteRecord" class="text" @click="gotoBeian()">
        {{ recordInfo.websiteRecord }}
      </view>
      <view v-if="recordInfo.appRecord" class="text">
        {{ recordInfo.appRecord }}
      </view>
      <view class="text">
        {{ recordInfo.copyright }}
      </view>
    </view>
  </view>
</template>

<script>
import { APP_NAME, APP_VERSION, APP_LOGO } from '@/config/index'
import { scaleImageWidthInCOS } from '@/utils'
export default {
  data() {
    return {
      appInfo: {
        name: APP_NAME,
        version: APP_VERSION,
        logo: APP_LOGO
      },
      recordInfo: {
        websiteRecord: '备案号：赣ICP备2026000533号-2A',
        appRecord: '',
        copyright: `版权所有 © 2025-${new Date().getFullYear()} 李兆 保留所有权利`
      },
    }
  },
  methods: {
    scaleImageWidthInCOS,
    gotoBeian () {
      uni.navigateTo({
				url: `/pages/webview/index?url=${encodeURIComponent('https://beian.miit.gov.cn/#/Integrated/index')}`
			});
    }
  }
}
</script>

<style lang="less">
.about_page {
  background-color: #f8f8f8;
  min-height: 100vh;
  text-align: center;
  & .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120rpx 32rpx;
    & .logo {
      width: 160rpx;
      height: 160rpx;
      border-radius: 32rpx;
      margin-bottom: 24rpx;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
    }
    
    & .name {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 12rpx;
    }
    
    & .version {
      font-size: 28rpx;
      color: #666;
    }
  }
  .copyright {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 32rpx 0;
    & .text {
      font-size: 24rpx;
      line-height: 36rpx;
      color: #999;
    }
  }
}
</style>