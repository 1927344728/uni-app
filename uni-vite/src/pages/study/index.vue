<template>
  <view class="study_page" :class="classObject">
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
            type: item.id
          }"
        />
      </swiper-item>
    </swiper>
    <FooterBar activeTabKey="study" />
  </view>
</template>
<script>
import { get as _get, cloneDeep } from 'lodash'
import { textEllipsis } from '@/utils/common.js'
import { getArticleTypeList, getArticlePageList, getBookTypeList } from '@/api'
import HeaderBar from '@/components/header_bar/index.vue'
import SearchBar from '@/components/search_bar/index.vue'
import FooterBar from '@/components/footer_bar/index.vue'
import ScrollList from '@/components/scroll_list/index.vue'
import BookList from '@/pages/book/index.vue'

const items = [
  { id: 1, key: 'course', name: '课程', component: 'ScrollList' },
  { id: 3, key: 'read', name: '阅读', component: 'ScrollList' },
  { id: 4, key: 'score', name: '成绩', component: 'ScrollList' },
  { id: 8, key: 'book', name: '图书馆', component: 'BookList' },
]

const initQueryParam = () => ({
  subType: null,
  keyword: ''
})

export default {
  components: {
    HeaderBar,
    SearchBar,
    FooterBar,
    ScrollList,
    BookList,
  },
  data () {
    return {
      currentTabKey: 'read',
      currentTabIndex: 1,
      typeOptions: [],
      queryParams: initQueryParam(),
      articleTypeEnum: null,
      bookTypeEnum: null
    }
  },
  computed: {
    filteredItems () {
      const { articleTypeEnum } = this
      let options = cloneDeep(items).filter(o => o.component)
      if (articleTypeEnum) {
        const typeIds = articleTypeEnum.map(e => e.id)
        options = options.filter(e => typeIds.includes(e.id))
      }
      return options
    },
    classObject () {
      const { currentTabKey, filteredItems } = this
      return {
        [currentTabKey]: true,
        with_header_bar: filteredItems.length > 1,
        with_tab_module: true,
        with_search_bar: true,
        with_footer_bar: true
      }
    },
    subTypeOptions () {
      const { currentTabKey, articleTypeEnum, bookTypeEnum, filteredItems } = this

      let subTypeOptions = []
      if (['course', 'read', 'score'].includes(currentTabKey) && articleTypeEnum) {
        const currentItem = filteredItems.find(e => e.key === currentTabKey)
        if (articleTypeEnum && currentItem && currentItem.id) {
          const currentType = articleTypeEnum.find(e => e.id === currentItem.id)
          subTypeOptions = currentType.children || []
        }
      }
      if (currentTabKey === 'book' && bookTypeEnum) {
        subTypeOptions = bookTypeEnum
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
    getBookTypeList().then(data => {
      this.bookTypeEnum = data || null
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