<template>
  <view class="home-page">
    <view class="home-content">
      <uni-swiper-dot
        class="home-banner"
        :info="bannerList"
        :current="currentBanner"
        field="content"
        :dotsStyles="{
          bottom: 15
        }"
      >
        <swiper class="swiper-box" @change="e => (currentBanner = e.detail.current)">
          <swiper-item v-for="item in bannerList" :key="item.id">
            <view class="swiper-item">
              <image class="banner-img" :src="item.image" mode="aspectFill" @click="openUrl(item)"></image>
            </view>
          </swiper-item>
        </swiper>
      </uni-swiper-dot>

      <view class="home-feature">
        <view class="wrapper">
          <view v-for="f in featureIcons" :key="f.key" class="item" @click="openUrl(f)">
            <view class="icon-wrapper">
              <image class="icon" :src="f.image" mode="aspectFill"></image>
            </view>
            <text class="text">{{ f.name }}</text>
          </view>
        </view>
      </view>

      <view class="home-recommend">
        <view class="header">
          <text class="title">推荐内容</text>
          <!-- <text class="more">查看更多</text> -->
        </view>
        <view class="list">
          <view v-for="a in recommendArticles" :key="a.id" class="item" @click="openUrl(a)">
            <image class="image" :src="a.image" mode="aspectFill"></image>
            <view class="content">
              <view class="item-title">{{ a.title }}</view>
              <view class="desc">{{ a.desc }}</view>
              <view class="stats">
                <text class="stats-text">{{ a.readCount }} 阅读</text>
                <text class="stats-dot">·</text>
                <text class="stats-text">{{ a.collectCount }} 收藏</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="home-version">
        <view>一兆含窗@1.0.1</view>
      </view>			
    </view>

    <FooterBar :activeTabKey="activeTabKey" />
  </view>
</template>

<script>
import { SERVER_API_DOMAIN, openUrl } from '@/utils'
import { HOME_BANNER_IMAGE, LOGO_WHITE_IMAGE, BANNER_LIST } from '@/config/index.js'
import { helloWord } from '@/api'
import store from '@/store/index'
import { FEATURE_ICON_ENUM, RECOMMEND_ARTICLES } from './constant.js'

import FooterBar from '@/components/footer_bar/index.vue'
export default {
  components: {
    FooterBar
  },
  data () {
    return {
      helloWord: '',
      logoWhiteImage: LOGO_WHITE_IMAGE,
      currentBanner: 0,
      bannerList: BANNER_LIST,
      bannerImage: HOME_BANNER_IMAGE,
      serverApiDomain: SERVER_API_DOMAIN,
      featureIcons: FEATURE_ICON_ENUM,
      recommendArticles: RECOMMEND_ARTICLES
    }
  },
  computed: {
    activeTabKey () {
      return store.state.activeTabKey
    }
  },
  created () {
    store.commit('setActiveTabKey', 'index')
    helloWord().then((data) => {
      this.helloWord = data
    }).catch((err) => {
      uni.showToast({
        title: err ? err.errMsg : '请求异常'
      })
    })
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