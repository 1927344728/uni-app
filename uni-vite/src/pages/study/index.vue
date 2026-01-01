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
      <swiper-item v-for="item in filteredItems" :key="item.id">
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
import HeaderBar from '@/components/header_bar/index.vue'
import SearchBar from '@/components/search_bar/index.vue'
import FooterBar from '@/components/footer_bar/index.vue'
import CourseList from './course/index.vue'
import ReadList from './read/index.vue'
import ScoreList from './score/index.vue'
import BookList from './book/index.vue'

const items = [
  { id: 'course', name: '课程', component: 'CourseList' },
  { id: 'read', name: '阅读', component: 'ReadList' },
  { id: 'score', name: '成绩', component: 'ScoreList' },
  { id: 'book', name: '图书馆', component: 'BookList' },
]
const SUB_TYPE_OPTION_MAP = {
  read: [
    { value: '2-1', text: '亲子阅读' },
    { value: '2-2', text: '诗词' }
  ],
  book: [
    { value: '4-1', text: '诗词' },
    { value: '4-2', text: '经典名著' },
    { value: '4-3', text: '少儿读物' }
  ]
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
    ReadList,
    CourseList,
    BookList,
    ScoreList,
  },
  data () {
    return {
      currentTab: 'course',
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
      return cloneDeep(items).filter(o => o.component)
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
  watch: {
    currentTab () {
      this.queryParams = initQueryParam()
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