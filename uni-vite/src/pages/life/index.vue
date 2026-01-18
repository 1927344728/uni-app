<template>
  <view class="life_page" :class="classObject">
    <HeaderBar
      v-if="filteredItems.length > 1"
      v-model:value="currentTabKey"
      :list="filteredItems"
      @change="onChangeTab"
    />
    <SearchBar v-model:value="queryParams" :subTypeOptions="subTypeOptions" />
    <swiper :current="currentTabIndex" class="swiper" @change="onChangeSwiper">
      <swiper-item v-for="item in filteredItems" :key="item.key">
        <component
          :key="item.component"
          :ref="item.component + item.id"
          :is="item.component"
          :class="classObject"
          :request="getArticlePageList"
          :queryParams="{
            ...queryParams,
            type: item.id || null
          }"
        />
      </swiper-item>
    </swiper>
    <FooterBar activeTabKey="life" />
  </view>
</template>
<script>
import { get as _get, cloneDeep } from 'lodash'
import { getArticleTypeList, getArticlePageList } from '@/api'
import { textEllipsis } from '@/utils/common.js'
import HeaderBar from '@/components/header_bar/index.vue'
import SearchBar from '@/components/search_bar/index.vue'
import ScrollList from '@/components/scroll_list/index.vue'
import FooterBar from '@/components/footer_bar/index.vue'
import MusicList from '../music/index.vue'
import VideoList from '../video/index.vue'

const items = [
  { id: 1, key: 'music', name: '音乐', component: 'MusicList' },
  { id: 2, key: 'video', name: '视频', component: 'VideoList' },
  { id: 5, key: 'travel', name: '旅游', component: 'ScrollList' },
  { id: 6, key: 'ana', name: '轻摘', component: 'ScrollList' },
]

const initQueryParam = () => ({
  type: null,
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
    ScrollList
  },
  data () {
    return {
      currentTabKey: 'music',
      currentTabIndex: 0,
      articleTypeEnum: null,
      queryParams: initQueryParam()
    }
  },
  computed: {
    filteredItems () {
      return items.filter(e => e.component)
    },
    classObject () {
      const { currentTabKey, filteredItems } = this
      return {
        [currentTabKey]: true,
        with_header_bar: filteredItems.length > 1,
        with_search_bar: true,
        with_tab_module: true,
        with_footer_bar: true
      }
    },
    subTypeOptions () {
      const { currentTabKey, articleTypeEnum, filteredItems } = this
      let subTypeOptions = []
      const currentItem = filteredItems.find(e => e.key === currentTabKey)
      if (articleTypeEnum && currentItem && currentItem.id && ['travel', 'ana'].includes(currentTabKey)) {
        const currentType = articleTypeEnum.find(e => e.id === currentItem.id)
        subTypeOptions = currentType.children || []
      }
      return subTypeOptions.map(e => ({
        value: e.id,
        text: textEllipsis(e.name, 12)
      }))
    },
  },
  watch: {
    currentTabKey (k) {
      const currentTab = items.find(e => e.key === k)
      this.queryParams.type = _get(currentTab, 'id') || null
      this.queryParams.subType = null
      this.queryParams.keyword = ''
    },
    queryParams: {
      deep: true,
      handler () {
        const { currentTabIndex } = this
        const currentTab = items[currentTabIndex]
        const componentName = _get(currentTab, 'component')
        const id = _get(currentTab, 'id')
        const refName = componentName + id
        const ref = _get(this, `$refs[${refName}][0]`)
        if (ref && ref.refreshList) {
          setTimeout(() => {
            ref.refreshList()
          }, 100)
        }
      }
    }
  },
  onLoad (options = {}) {
    const option = this.filteredItems.find(e => e.key === options.tab)
    const index = this.filteredItems.findIndex(e => e.key === options.tab)
    if (option) {
      this.currentTabKey = option.key
      this.currentTabIndex = index
    }
  },
  created () {
    getArticleTypeList().then(data => {
      this.articleTypeEnum = data || null
    })
  },
  methods: {
    getArticlePageList,
    onChangeTab (tab) {
      this.currentTabIndex = Math.max(this.filteredItems.findIndex(e => e.key === tab), 0)
    },
    onChangeSwiper (data) {
      this.currentTabKey = _get(this, `filteredItems[${data.detail.current}].key`) || ''
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>