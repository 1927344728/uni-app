<template>
	<view class="tab-bar">
	  <view
			v-for="item in tabList"
			:key="item.key"
			class="tab-item"
			:class="{
				'main-tab': item.key === 'study',
				active: item.key === activeTabBar
			}"
			@click="onClickTab(item)"
		>
			<view v-if="item.key === 'study'" class="main-tab-wrapper">
				<view class="main-tab-icon">
					<uni-icons type="book" size="24" />
				</view>
			</view>
	    <uni-icons v-else :type="item.icon" size="24" />
	    <text class="tab-text">{{ item.name }}</text>
	  </view>
	</view>
</template>

<script>
import store from '@/store/index.js'
import { WEB_DOMAIN } from '@/common/js/variables.js'
export default {
	data () {
		return {
			tabList: [
				{ key: 'home', name: '首页', icon: 'home', url: `${WEB_DOMAIN}home/index` },
				{ key: 'task', name: '任务', icon: 'checkbox', url: `${WEB_DOMAIN}task/index` },
				{ key: 'study', name: '学习', icon: 'book', url: `${WEB_DOMAIN}study/index` },
				{ key: 'life ', name: '生活', icon: 'heart', url: `${WEB_DOMAIN}life/index` },
				{ key: 'me', name: '我的', icon: 'person', url: `${WEB_DOMAIN}me/index` },
			]
		}
	},
	computed: {
		activeTabBar () {
			return store.state.activeTabBar
		}
	},
	methods: {
		onClickTab (item) {
			store.commit('setActiveTabBar', item.key)
			uni.navigateTo({
				url: item.url
			});
		}
	}
}
</script>

<style lang="less">
@import './index.less';
</style>