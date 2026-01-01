<template>
  <view class="life_page" :class="classObject">
    <HeaderBar
      v-if="filteredItems.length > 1"
      v-model:value="currentTab"
      :list="filteredItems"
      @change="onChangeTab"
    />
    <SearchBar v-model:value="queryParams" :subTypeOptions="subTypeOptions" />
    <swiper :current="currentTabIndex" class="swiper" @change="onChangeSwiper">
      <swiper-item v-for="item in filteredItems" :key="item.id">
        <component
          :is="item.component"
          :class="classObject"
          :queryParams="queryParams"
        />
      </swiper-item>
    </swiper>
    <FooterBar activeTabKey="life" />
  </view>
</template>
<script>
import { get as _get, cloneDeep } from 'lodash'
import HeaderBar from '@/components/header_bar/index.vue'
import SearchBar from '@/components/search_bar/index.vue'
import FooterBar from '@/components/footer_bar/index.vue'
import MusicList from '../music/index.vue'
import VideoList from '../video/index.vue'
import TravelList from './travel/index.vue'

const items = [
  { id: 'music', name: '音乐', component: 'MusicList' },
  { id: 'video', name: '视频', component: 'VideoList' },
  { id: 'travel', name: '旅游', component: 'TravelList' },
]
const SUB_TYPE_OPTION_MAP = {
  
}
const initQueryParam = () => ({
  subType: null,
  keyword: ''
})

export default {
  components: {
    HeaderBar,
    SearchBar,
    FooterBar,
    MusicList,
    VideoList,
    TravelList
  },
  data () {
    return {
      currentTab: 'music',
      currentTabIndex: 0,
      queryParams: initQueryParam(),
    }
  },
  onLoad (options = {}) {
    const option = this.filteredItems.find(e => e.id === options.tab)
    const index = this.filteredItems.findIndex(e => e.id === options.tab)
    if (option) {
      this.currentTab = option.id
      this.currentTabIndex = index
    }
  },
  computed: {
    filteredItems () {
      return items.filter(e => e.component)
    },
    classObject () {
      return {
        [this.currentTab]: true,
        with_header_bar: this.filteredItems.length > 1,
        with_tab_module: true,
        with_search_bar: true,
        with_footer_bar: true
      }
    },
    subTypeOptions () {
      return cloneDeep(SUB_TYPE_OPTION_MAP)[this.currentTab] || []
    }
  },
  methods: {
    onChangeTab (tab) {
      this.currentTabIndex = Math.max(this.filteredItems.findIndex(e => e.id === tab), 0)
    },
    onChangeSwiper (data) {
      this.currentTab = _get(this, `filteredItems[${data.detail.current}].id`) || ''
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>