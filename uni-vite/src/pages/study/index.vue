<template>
  <view class="study-page" :class="classObject">
    <view v-if="filteredItems.length > 1" class="study-nav">
      <view
        v-for="o in filteredItems"
        :key="o.id"
        class="item"
        :class="{
          active: currentId === o.id
        }"
        @click="currentId = o.id"
      >
        {{ o.name }}
      </view>
    </view>
    <ReadList v-if="currentId === 'read'" :class="classObject"/>
    <CourseList v-if="currentId === 'course'" :class="classObject"/>
    <BookList v-if="currentId === 'book'" :class="classObject"/>
    <ScoreList v-if="currentId === 'score'" :class="classObject"/>
    <FooterBar :activeTabKey="activeTabKey" />
  </view>
</template>
<script>
import store from '@/store/index'
import ReadList from './read/index.vue'
import CourseList from './course/index.vue'
import BookList from './book/index.vue'
import ScoreList from './score/index.vue'
import FooterBar from '@/components/footer_bar/index.vue'

const items = [
  { id: 'course', name: '课程', component: 'CourseList' },
  { id: 'read', name: '阅读', component: 'ReadList' },
  { id: 'score', name: '成绩', component: 'ScoreList' },
  { id: 'book', name: '图书馆', component: 'BookList' },
]
export default {
  components: {
    ReadList,
    CourseList,
    BookList,
    ScoreList,
    FooterBar
  },
  data () {
    return {
      currentId: 'course',
      items
    }
  },
  onLoad (options) {
    if (options.tab) {
      this.currentId = options.tab
    } 
  },
  computed: {
    activeTabKey () {
      return store.state.activeTabKey
    },
    filteredItems () {
      return this.items.filter(o => o.component)
    },
    classObject () {
      return {
        [this.currentId]: true,
        'with_padding_top': this.filteredItems.length > 1
      }
    }
  },
  created () {
    store.commit('setActiveTabKey', 'study')
  },
  methods: {
    onClickItem (item) {
      
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>