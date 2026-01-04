<template>
  <view class="study_page" :class="classObject">
    <HeaderBar
      v-if="filteredItems.length > 1"
      v-model:value="currentTab"
      :list="filteredItems"
      @change="onChangeTab"
    />
    <SearchBar v-model:value="queryParams" :subTypeOptions="subTypeOptions" />
    <swiper :current="currentTabIndex" class="swiper" @change="onChangeSwiper">
      <swiper-item v-for="item in filteredItems" :key="item.key">
        <component
          :is="item.component"
          :class="classObject"
          :queryParams="queryParams"
        />
      </swiper-item>
    </swiper>
    <FooterBar activeTabKey="study" />
  </view>
</template>
<script>
import { get as _get, cloneDeep } from 'lodash'
import { textEllipsis } from '@/utils/common.js'
import { getArticleTypeList } from '@/api'
import HeaderBar from '@/components/header_bar/index.vue'
import SearchBar from '@/components/search_bar/index.vue'
import FooterBar from '@/components/footer_bar/index.vue'
import CourseList from './course/index.vue'
import ReadList from './read/index.vue'
import ScoreList from './score/index.vue'
import BookList from './book/index.vue'

const items = [
  { id: 1, key: 'course', name: '课程', component: 'CourseList' },
  { id: 3, key: 'read', name: '阅读', component: 'ReadList' },
  { id: 4, key: 'score', name: '成绩', component: 'ScoreList' },
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
    ReadList,
    CourseList,
    BookList,
    ScoreList,
  },
  data () {
    return {
      currentTab: 'read',
      currentTabIndex: 1,
      typeOptions: [],
      queryParams: initQueryParam(),
      articleTypeEnum: null
    }
  },
  onLoad (options = {}) {
    const option = this.filteredItems.find(e => e.key === options.tab)
    const index = this.filteredItems.findIndex(e => e.key === options.tab)
    if (option) {
      this.currentTab = option.key
      this.currentTabIndex = index
    }
  },
  created () {
    getArticleTypeList().then(data => {
      this.articleTypeEnum = data || null
    })
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
      return {
        [this.currentTab]: true,
        with_header_bar: this.filteredItems.length > 1,
        with_tab_module: true,
        with_search_bar: true,
        with_footer_bar: true
      }
    },
    subTypeOptions () {
      const { currentTab, articleTypeEnum, filteredItems } = this
      let subTypeOptions = []
      const currentItem = filteredItems.find(e => e.key === currentTab)
      if (articleTypeEnum && currentItem && currentItem.id) {
        const currentType = articleTypeEnum.find(e => e.id === currentItem.id)
        subTypeOptions = currentType.children || []
      }
      return subTypeOptions.map(e => ({
        value: e.id,
        text: textEllipsis(e.name, 12)
      }))
    }
  },
  watch: {
    currentTab () {
      this.queryParams = initQueryParam()
    }
  },
  methods: {
    onChangeTab (tab) {
      this.currentTabIndex = Math.max(this.filteredItems.findIndex(e => e.key === tab), 0)
    },
    onChangeSwiper (data) {
      this.currentTab = _get(this, `filteredItems[${data.detail.current}].key`) || ''
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>