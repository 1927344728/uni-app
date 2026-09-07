<template>
  <view 
    class="home_page"
    :class="{
      with_banner: !!(bannerList && bannerList.length)
    }"
  >
    <view v-if="bannerList && bannerList.length" class="home_banner">
      <!-- 不用 uni-swiper-dot：其默认 backgroundColor 会被当成 wx:key，小程序会报重复 key 并引发 FLOW_MINIPULATE_CHILD -->
      <swiper
        class="swiper_box"
        :current="currentBanner"
        :indicator-dots="bannerList.length > 1"
        indicator-color="rgba(0, 0, 0, .3)"
        indicator-active-color="#333333"
        :autoplay="bannerList.length > 1"
        :interval="4000"
        :circular="bannerList.length > 1"
        @change="onBannerChange"
      >
        <swiper-item v-for="item in bannerList" :key="'banner-' + item.id">
          <view class="swiper_item" @click="openUrl(item)">
            <image
              class="banner_img"
              :src="scaleImageWidthInCOS(item.image)"
              mode="aspectFill"
              :style="{ width: '100%', height: '360rpx' }"
            />
          </view>
        </swiper-item>
      </swiper>
    </view>

    <view class="home_feature">
      <view class="wrapper">
        <view v-for="f in featureIcons" :key="f.key" class="item" @click="openUrl(f)">
          <view class="icon_wrap">
            <image
              class="icon"
              :src="scaleImageWidthInCOS(f.image, 120)"
              mode="aspectFill"
              :style="{ width: '112rpx', height: '112rpx' }"
            />
          </view>
          <text class="text">{{ f.name }}</text>
        </view>
      </view>
    </view>

    <view v-if="recommendArticles && recommendArticles.length" class="home_recommend">
      <view class="header">
        <text class="title">推荐内容</text>
        <text class="more" @click="openUrl({ jumpTo: 'navigate', url: '/pages/article/index' })">
          查看更多
        </text>
      </view>
      <view class="list">
        <view v-for="a in recommendArticles" :key="a.id" class="item" @click="openUrl(a)">
          <image
            class="image"
            :src="scaleImageWidthInCOS(a.thumb, 120)"
            mode="aspectFill"
            :style="{ width: '132rpx', height: '132rpx' }"
          />
          <view class="content">
            <view class="title">{{ a.title }}</view>
            <view class="desc">{{ a.note }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="home_version">
      <view>你好，{{userName}}！</view>
      <view>{{appName}}@{{appVersion}} {{ isUseMock ? '[mock]' : '' }}</view>
    </view>			

    <FooterBar activeTabKey="index" />
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { getValue as _get } from '@/common/js/common.js'
import { openUrl, scaleImageWidthInCOS } from '@/common/js/common.js'
import { APP_NAME, APP_VERSION, FEATURE_ICON_ENUM } from '@/config/index.js'
import store from '@/store/index.js'
import { welcome, getUserInfo, getBannerList, getArticlePageList } from '@/api'

import FooterBar from '@/components/footer_bar/index.vue'
export default {
  components: {
    FooterBar
  },
  data () {
    return {
      currentBanner: 0,
      bannerList: null,
      featureIcons: FEATURE_ICON_ENUM,
      recommendArticles: null,
      appName: APP_NAME,
      appVersion: APP_VERSION
    }
  },
  computed: {
		...mapState(['isUseMock']),
    userName () {
      return _get(store, 'state.userInfo.name') || '欢迎来到'
    },
  },
  async created () {
    if (this.isUseMock) {
      this.init()
    } else {
      welcome().then(() => {
        store.commit('setIsUseMock', false)
      }).catch(() => {
        uni.hideToast()
        store.commit('setIsUseMock', true)
      }).finally(() => {
        this.init()
      })
    }
  },
  onReachBottom () {
    console.log('onReachBottom')
  },
  methods: {
    scaleImageWidthInCOS,
    onBannerChange (e) {
      this.currentBanner = e.detail.current
    },
    init () {
      getUserInfo().then((data) => {
        store.commit('setUserInfo', data)
      }).catch(() => {})
      getBannerList().then((data) => {
        this.bannerList = data || []
      }).catch(() => {})
      getArticlePageList({ type: '2' }).then((data) => {
        this.recommendArticles = _get(data, 'content') || []
      }).catch(() => {})
    },
    openUrl (item) {
			if (item && item) {
				return openUrl(item)
			}
			uni.showToast({
			  title: '敬请期待...'
			})
		}
  }
}
</script>

<style lang="less" src="./index.less"></style>