<template>
  <view class="study_page" :class="classObject">
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
    <CourseList
    v-if="currentTab === 'course'"
    :class="classObject"
    :keyword="queryParam.keyword"
    />
    <ReadList
      v-if="currentTab === 'read'"
      :class="classObject"
      :keyword="queryParam.keyword"
    />
    <BookList
      v-if="currentTab === 'book'"
      :class="classObject"
      :keyword="queryParam.keyword"
    />
    <ScoreList
      v-if="currentTab === 'score'"
      :class="classObject"
      :keyword="queryParam.keyword"
    />
    <FooterBar :activeTabKey="activeTabKey" />
  </view>
</template>
<script>
import { cloneDeep } from 'lodash'
import store from '@/store/index'
import HeaderBar from '@/components/header_bar/index.vue'
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
export default {
  components: {
    HeaderBar,
    FooterBar,
    ReadList,
    CourseList,
    BookList,
    ScoreList,
  },
  data () {
    return {
      currentTab: 'course',
      queryParam: {
        keyword: ''
      }
    }
  },
  onLoad (options) {
    if (options.tab) {
      this.currentTab = options.tab
    } 
  },
  computed: {
    activeTabKey () {
      return store.state.activeTabKey
    },
    filteredItems () {
      return cloneDeep(items).filter(o => o.component)
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
    store.commit('setActiveTabKey', 'study')
  }
}
</script>
<style lang="less">
@import './index.less';
</style>