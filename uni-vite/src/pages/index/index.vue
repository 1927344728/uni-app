<template>
  <view class="home-page">
    <view class="content">
      <view class="banner-wrapper">
        <image class="banner-img" :src="bannerImage" mode="aspectFill"></image>
      </view>

      <view class="grid-section">
        <view class="grid-item">
          <view class="grid-icon-wrapper">
            <image class="grid-icon" src="https://ai-public.mastergo.com/ai/img_res/d502c279bba37f3dfe78158803cfff37.jpg" mode="aspectFill"></image>
          </view>
          <text class="grid-text">任务中心</text>
        </view>
        <view class="grid-item">
          <view class="grid-icon-wrapper">
            <image class="grid-icon" src="https://ai-public.mastergo.com/ai/img_res/d4f59adc3c18b9289aef1f340a93357e.jpg" mode="aspectFill"></image>
          </view>
          <text class="grid-text">我的书单</text>
        </view>
        <view class="grid-item">
          <view class="grid-icon-wrapper">
            <image class="grid-icon" src="https://ai-public.mastergo.com/ai/img_res/d055efbe683f9117949d5fa4088f0d55.jpg" mode="aspectFill"></image>
          </view>
          <text class="grid-text">音乐收藏</text>
        </view>
        <view class="grid-item">
          <view class="grid-icon-wrapper">
            <image class="grid-icon" src="https://ai-public.mastergo.com/ai/img_res/147d5438ef903fcbbac27fc51b5627c8.jpg" mode="aspectFill"></image>
          </view>
          <text class="grid-text">视频订阅</text>
        </view>
      </view>

      <view class="recommend-section">
        <view class="recommend-header">
          <text class="recommend-title">推荐内容</text>
          <text class="recommend-more">查看更多</text>
        </view>
        <view class="recommend-list">
          <view class="recommend-item">
            <image class="recommend-image" src="https://ai-public.mastergo.com/ai/img_res/7e963e9932be6f9b684f7bb0e7c374e4.jpg" mode="aspectFill"></image>
            <view class="recommend-content">
              <text class="recommend-item-title">高效学习技巧分享</text>
              <text class="recommend-desc">10 个实用的学习方法，助你事半功倍</text>
              <view class="recommend-stats">
                <text class="stats-text">2.1k 阅读</text>
                <text class="stats-dot">·</text>
                <text class="stats-text">185 收藏</text>
              </view>
            </view>
          </view>
          <view class="recommend-item">
            <image class="recommend-image" src="https://ai-public.mastergo.com/ai/img_res/1dc7228cba03f2eb84dd9a53ecf84d12.jpg" mode="aspectFill"></image>
            <view class="recommend-content">
              <text class="recommend-item-title">周末户外摄影指南</text>
              <text class="recommend-desc">专业摄影师教你拍出完美自然风光</text>
              <view class="recommend-stats">
                <text class="stats-text">1.8k 阅读</text>
                <text class="stats-dot">·</text>
                <text class="stats-text">142 收藏</text>
              </view>
            </view>
          </view>
        </view>
      </view>
			<view class="version">
				<view>{{ helloWord }}</view>
				<view>{{ serverApiDomain }}</view>
				<view>v1.0.0-07212238</view>
			</view>			
    </view>

		<FooterBar :activeTabKey="activeTabKey" />
  </view>
</template>

<script>
import { SERVER_API_DOMAIN, initBasicConfig, COS_ASSET_PATH } from '@/utils'
import { LOGO_WHITE_IMAGE } from '@/config/index.js'
import { helloWord } from '@/api'
import store from '@/store/index'
import FooterBar from '@/components/footer_bar/index.vue'
export default {
	components: {
		FooterBar
	},
	data () {
		return {
			helloWord: '',
			logoWhiteImage: LOGO_WHITE_IMAGE,
			bannerImage: `${COS_ASSET_PATH}images/uni_20250313204613.jpg`,
			serverApiDomain: SERVER_API_DOMAIN
		}
	},
	computed: {
		activeTabKey () {
			return store.state.activeTabKey
		}
	},
	created () {
		store.commit('setActiveTabKey', 'index')
		initBasicConfig()
		helloWord().then((data) => {
			this.helloWord = data
		}).catch((err) => {
			uni.showToast({
				title: err ? err.errMsg : '请求异常'
			})
		})
	}
}
</script>

<style lang="less">
@import './index.less';
</style>