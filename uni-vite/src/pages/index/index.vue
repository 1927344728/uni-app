<template>
  <view class="home_page">
    <uni-swiper-dot
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
            <image class="banner_img" :src="item.image" mode="aspectFill" @click="openUrl(item)"></image>
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
          <image class="image" :src="a.image" mode="aspectFill"></image>
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
import { BANNER_LIST, FEATURE_ICON_ENUM } from '@/config/index.js'
import { openUrl } from '@/utils'
import { getUserInfo, getArticlePageList } from '@/api'
import store from '@/store/index.js'

import FooterBar from '@/components/footer_bar/index.vue'
export default {
  components: {
    FooterBar
  },
  data () {
    return {
      userInfo: null,
      currentBanner: 0,
      bannerList: BANNER_LIST,
      featureIcons: FEATURE_ICON_ENUM,
      recommendArticles: null,
    }
  },
  computed: {
    userName () {
      return _get(this, 'userInfo.name')
    },
    isUseMock () {
      return _get(store, 'state.isUseMock')
    }
  },
  created () {
    getUserInfo().then((data) => {
      if (data && !data.name) {
        data.name = '欢迎来到'
      }
      this.userInfo = data
    })
    getArticlePageList({
      type: '2',
      pageNum: 0,
      pageSize: 4
    }).then((data) => {
      this.recommendArticles = data || []
    }).catch(() => {})
  },
  onReachBottom () {
    console.log('onReachBottom')
  },
  methods: {
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