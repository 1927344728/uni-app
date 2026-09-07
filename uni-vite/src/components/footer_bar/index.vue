<template>
  <view class="tab-bar">
    <view
      v-for="item in tabList"
      :key="item.key"
      class="tab-item"
      :class="{ active: item.key === currentKey }"
      hover-class="tab-item--hover"
      :hover-stay-time="70"
      @tap.stop="onClickTab(item)"
    >
      <view class="icon">
        <!-- 小程序自定义组件样式隔离，颜色/字号必须走 props -->
        <uni-icons
          :class="[item.key]"
          :type="`${item.icon}${item.key === currentKey ? '-filled' : ''}`"
          :size="item.key === 'study' ? 24 : 20"
          :color="item.key === currentKey ? activeColor : normalColor"
        />
      </view>
      <view class="label">{{ item.name }}</view>
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
      tabList: FOOTER_BUTTON_LIST,
      pendingKey: '',
      // 与 color.less 的 @primary-color / @text-patch1-color 保持一致
      activeColor: 'rgb(89,194,173)',
      normalColor: '#999'
    }
  },
  computed: {
    currentKey () {
      return this.pendingKey || this.activeTabKey || 'index'
    }
  },
  watch: {
    activeTabKey (val) {
      if (val) {
        this.pendingKey = ''
        store.commit('setActiveTabKey', val)
      }
    }
  },
  mounted () {
    if (this.activeTabKey) {
      store.commit('setActiveTabKey', this.activeTabKey)
    }
    // 预加载其它 Tab，减轻 redirectTo 体感延迟
    this.tabList.forEach((item) => {
      if (item.url && item.key !== this.currentKey) {
        try {
          uni.preloadPage({ url: item.url })
        } catch (e) {}
      }
    })
  },
  methods: {
    onClickTab (item) {
      if (!item || !item.url) {
        uni.showToast({ title: '敬请期待...' })
        return
      }

      const pages = getCurrentPages()
      const current = pages[pages.length - 1]
      const route = current && current.route ? `/${current.route}` : ''
      if (route === item.url || this.currentKey === item.key) {
        return
      }

      // 先切换高亮，避免等页面加载完才反馈
      this.pendingKey = item.key
      store.commit('setActiveTabKey', item.key)

      uni.redirectTo({
        url: item.url,
        fail: (error) => {
          this.pendingKey = ''
          uni.showModal({
            title: '跳转失败',
            content: (error && error.errMsg) || '请稍后重试',
            showCancel: false
          })
        }
      })
    }
  }
}
</script>

<style lang="less" src="./index.less"></style>
