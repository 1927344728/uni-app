<template>
  <view class="tab-bar">
    <view
      v-for="item in tabList"
      :key="item.key"
      class="tab-item"
      :class="{
        active: item.key === activeTabKey
      }"
      @click="onClickTab(item)"
    >
			<uni-icons :type="item.icon" size="20" />
			<text>{{ item.name }}</text>
    </view>
  </view>
</template>

<script>
import { FOOTER_BUTTON_LIST } from '@/config/index.js'
import store from '@/store/index.js'

export default {
	props: {
		activeTabKey: String
	},
  data () {
    return {
      tabList: FOOTER_BUTTON_LIST
    }
  },
  created () {
    store.commit('setActiveTabKey', 'index')
  },
  methods: {
    onClickTab (item) {
			if (item && item.url) {
				uni.redirectTo({
				  url: item.url,
					fail (error) {
						uni.showModal({
							title: '请求异常',
						  content: error.errMsg,
							showCancel: false
						});
					}
				});
				return
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