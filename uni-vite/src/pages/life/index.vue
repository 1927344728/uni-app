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
import { mapState, mapActions } from 'vuex'
import { get as _get, cloneDeep } from 'lodash'
import { getArticlePageList } from '@/api'
import { textEllipsis } from '@/utils/common.js'
import HeaderBar from '@/components/header_bar/index.vue'
import SearchBar from '@/components/search_bar/index.vue'
import ScrollList from '@/components/scroll_list/index.vue'
import FooterBar from '@/components/footer_bar/index.vue'
import MusicList from '../music/index.vue'
import VideoList from '../video/index.vue'

const items = [
  { id: 1, key: 'music', component: 'MusicList' },
  { id: 2, key: 'video', component: 'VideoList' },
  { id: 5, key: 'travel', component: 'ScrollList' },
  { id: 6, key: 'ana', component: 'ScrollList' },
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
      queryParams: initQueryParam()
    }
  },
  computed: {
    ...mapState(['categoryEnum']),
    filteredItems () {
      const categoryEnum = _get(this, 'categoryEnum') || []
      const options = cloneDeep(items)
        .filter(o => o.component)
        .filter(o => categoryEnum.some(e => [3, 4].includes(e.categoryId) || (e.categoryId === 1 && e.typeId === o.id)))
        .map(o => {
          if (['music'].includes(o.key)) {
            const option = categoryEnum.find(e => e.categoryId === 3)
            o.name = _get(option, 'categoryName')
          } else if (['music', 'video'].includes(o.key)) {
            const option = categoryEnum.find(e => e.categoryId === 4)
            o.name = _get(option, 'categoryName')
          } else {
            const option = categoryEnum.find(e => e.categoryId === 1 && e.typeId === o.id)
            o.name = _get(option, 'typeName')
          }
          return o
        })
      return options
    },
    subTypeOptions () {
      const { currentTabKey, filteredItems } = this
      let options = []
      const categoryEnum = _get(this, 'categoryEnum') || []
      const currentItem = filteredItems.find(e => e.key === currentTabKey)
      if (['travel', 'ana'].includes(currentTabKey) && currentItem && currentItem.id) {
        options = categoryEnum
          .filter(e => e.categoryId === 1 && e.typeId === currentItem.id)
          .map(e => ({
            value: e.subTypeId,
            text: textEllipsis(e.subTypeName, 12)
          }))
          .filter(e => e.value)
      }
      return options
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
    this.getCategoryEnum()
  },
  methods: {
    ...mapActions(['getCategoryEnum']),
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