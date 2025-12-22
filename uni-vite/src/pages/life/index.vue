<template>
  <view class="life_page" :class="classObject">
    <HeaderBar
      v-if="filteredItems.length > 1"
      :value="currentTab"
      :list="filteredItems"
      @input="currentTab = $event"
    />
    <uni-search-bar
      v-model.trim="queryParam.keyword"
      placeholder="请输入搜索词"
      :radius="100"
      @clear="queryParam.keyword = ''"
    />
    <MusicList
      v-if="currentTab === 'music'"
      :class="classObject"
      :keyword="queryParam.keyword"
    />
    <VideoList
      v-if="currentTab === 'video'"
      :class="classObject"
      :keyword="queryParam.keyword"
    />
    <TravelList
      v-if="currentTab === 'travel'"
      :class="classObject"
      :keyword="queryParam.keyword"
    />
    <FooterBar :activeTabKey="activeTabKey" />
  </view>
</template>
<script>
import store from '@/store/index'
import HeaderBar from '@/components/header_bar/index.vue'
import FooterBar from '@/components/footer_bar/index.vue'
import MusicList from '../music/index.vue'
import VideoList from '../video/index.vue'
import TravelList from './travel/index.vue'

const items = [
  { id: 'music', name: '音乐', component: 'MusicList' },
  { id: 'video', name: '视频', component: 'VideoList' },
  { id: 'travel', name: '旅游', component: 'TravelList' },
]
export default {
  components: {
    HeaderBar,
    FooterBar,
    MusicList,
    VideoList,
    TravelList
  },
  data () {
    return {
      currentTab: 'music',
      queryParam: {
        keyword: ''
      }
    }
  },
  onLoad (options = {}) {
    if (options.tab) {
      const tabItem = items.find(o => o.id === options.tab)
      if (tabItem) {
        this.currentTab = tabItem.id
      }
    }
  },
  computed: {
    activeTabKey () {
      return store.state.activeTabKey
    },
    filteredItems () {
      return items.filter(e => e.component)
    },
    classObject () {
      return {
        [this.currentTab]: true,
        with_header_bar: this.filteredItems.length > 1,
        with_sub_module: true,
        with_search_bar: true,
        with_footer_bar: true
      }
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