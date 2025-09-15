<template>
  <view class="home-page">
    <view class="home-content">
      <view class="home-banner">
        <image class="banner-img" :src="bannerImage" mode="aspectFill"></image>
      </view>

      <view class="home-feature">
				<view class="wrapper">
					<view v-for="f in featureIcons" :key="f.key" class="item" @click="gotoPage(f)">
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
          <text class="more">查看更多</text>
        </view>
        <view class="list">
          <view v-for="a in recommendArticles" :key="a.id" class="item" @click="gotoPage(a)">
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
import { HOME_BANNER_IMAGE, LOGO_WHITE_IMAGE } from '@/config/index.js'
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
		initBasicConfig()
		helloWord().then((data) => {
			this.helloWord = data
		}).catch((err) => {
			uni.showToast({
				title: err ? err.errMsg : '请求异常'
			})
		})
	},
	methods: {
		gotoPage (item) {
			if (item.url) {
				uni.navigateTo({
					url: item.url
				});
			}
		}
	}
}
</script>

<style lang="less">
@import './index.less';
</style>