<template>
  <view class="tab-bar">
    <view
      v-for="item in tabList"
      :key="item.key"
      class="tab-item"
      :class="{
        primary: item.type === 'primary',
        active: item.key === activeTabBar
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
  data () {
    return {
      tabList: [
        { key: 'home', name: '首页', icon: 'home', url: `${WEB_DOMAIN}index/index` },
        { key: 'task', name: '任务', icon: 'wallet', url: `${WEB_DOMAIN}task/index` },
        { key: 'study', name: '学习', icon: 'color', url: `${WEB_DOMAIN}study/index`, type: 'primary' },
        { key: 'life ', name: '生活', icon: 'gift', url: `${WEB_DOMAIN}life/index` },
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