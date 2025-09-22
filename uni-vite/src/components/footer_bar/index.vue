<template>
  <view class="tab-bar">
    <view
      v-for="item in tabList"
      :key="item.key"
      class="tab-item"
      :class="{
        primary: item.type === 'primary',
        active: item.key === activeTabKey
      }"
      @click="onClickTab(item)"
    >
      <view v-if="item.key === 'study'" class="main-tab-wrapper">
        <view class="icon"><uni-icons :type="item.icon" size="20" /></view>
        <view class="name">{{ item.name }}</view>
        <view class="bg"></view>
      </view>
      <template v-else>
        <uni-icons :type="item.icon" size="20" />
        <text>{{ item.name }}</text>
      </template>
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
        { key: 'index', name: '首页', icon: 'home', url: '/' },
        { key: 'task', name: '任务', icon: 'wallet', url: `${WEB_DOMAIN}task/index` },
        { key: 'study', name: '学习', icon: 'color', url: `${WEB_DOMAIN}study/index`, type: 'primary' },
        { key: 'life', name: '生活', icon: 'gift', url: `${WEB_DOMAIN}life/index` },
        { key: 'me', name: '我的', icon: 'person', url: `${WEB_DOMAIN}me/index` },
      ]
    }
  },
  methods: {
    onClickTab (item) {
      store.commit('setActiveTabKey', item.key)
      uni.redirectTo({
        url: item.url
      });
    }
  }
}
</script>

<style lang="less">
@import './index.less';
</style>