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
import store from '@/store/index'
import { WEB_DOMAIN } from '@/utils/variables'
export default {
	props: {
		activeTabKey: String
	},
  data () {
    return {
      tabList: [
        { key: 'index', name: '首页', icon: 'home', url: `${WEB_DOMAIN}index/index` },
        { key: 'task', name: '任务', icon: 'wallet', url: `${WEB_DOMAIN}task/index` },
        { key: 'study', name: '学习', icon: 'color', url: `${WEB_DOMAIN}study/index` },
        { key: 'life', name: '生活', icon: 'gift', url: `${WEB_DOMAIN}life/index` },
        { key: 'me', name: '我的', icon: 'person', url: `${WEB_DOMAIN}me/index` },
      ]
    }
  },
  methods: {
    onClickTab (item) {
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
    }
  }
}
</script>

<style lang="less">
@import './index.less';
</style>