<template>
  <view class="life-page">
		<FooterBar :activeTabKey="activeTabKey" />
  </view>
</template>

<script>
import store from '@/store/index'
import FooterBar from '@/components/footer_bar/index.vue'
export default {
	components: {
		FooterBar
	},
	computed: {
		activeTabKey () {
			return store.state.activeTabKey
		}
	},
	created () {
		store.commit('setActiveTabKey', 'life')
	}
}
</script>

<style lang="less">
@import './index.less';
</style>