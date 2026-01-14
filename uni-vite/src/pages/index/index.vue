<template>
  <view 
    class="home_page"
    :class="{
      with_banner: !!(bannerList && bannerList.length)
    }"
  >
    <uni-swiper-dot
      v-if="bannerList && bannerList.length"
      class="home_banner"
      :info="bannerList"
      :current="currentBanner"
      field="content"
      :dotsStyles="{
        bottom: 15
      }"
    >
      <swiper class="swiper_box" @change="e => (currentBanner = e.detail.current)">
        <swiper-item v-for="item in bannerList" :key="item.id">
          <view class="swiper_item">
            <image class="banner_img" :src="scaleImageWidthInCOS(item.image)" mode="aspectFill" @click="openUrl(item)"></image>
          </view>
        </swiper-item>
      </swiper>
    </uni-swiper-dot>

    <view class="home_feature">
      <view class="wrapper">
        <view v-for="f in featureIcons" :key="f.key" class="item" @click="openUrl(f)">
          <image class="icon" :src="f.image" mode="aspectFill"></image>
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
          <image class="image" :src="scaleImageWidthInCOS(a.image, 120)" mode="aspectFill"></image>
          <view class="content">
            <view class="title">{{ a.title }}</view>
            <view class="desc">{{ a.note }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="home_version">
      <view>你好，{{userName}}！</view>
      <view>一兆窗含@1.0.0 {{ isUseMock ? '[mock]' : '' }}</view>
    </view>			

    <FooterBar activeTabKey="index" />
  </view>
</template>

<script>
import { get as _get } from 'lodash'
import { openUrl, scaleImageWidthInCOS } from '@/utils'
import { FEATURE_ICON_ENUM } from '@/config/index.js'
import store from '@/store/index.js'
import { getUserInfo, getBannerList, getArticlePageList } from '@/api'

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
    }
  },
  computed: {
    userName () {
      return _get(store, 'state.userInfo.name') || '欢迎来到'
    },
    isUseMock () {
      return _get(store, 'state.isUseMock')
    }
  },
  created () {
    getUserInfo().then((data) => {
      store.commit('setUserInfo', data)
    })
    getBannerList().then((data) => {
      this.bannerList = data || []
    })
    getArticlePageList({ type: '2' }).then((data) => {
      this.recommendArticles = data || []
    })
  },
  onReachBottom () {
    console.log('onReachBottom')
  },
  methods: {
    scaleImageWidthInCOS,
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

<style lang="less">
@import './index.less';
</style>