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
import { mapState, mapActions } from 'vuex'
import { get as _get, cloneDeep } from 'lodash'
import { textEllipsis } from '@/utils/common.js'
import { getArticlePageList } from '@/api'
import HeaderBar from '@/components/header_bar/index.vue'
import SearchBar from '@/components/search_bar/index.vue'
import FooterBar from '@/components/footer_bar/index.vue'
import ScrollList from '@/components/scroll_list/index.vue'
import BookList from '@/pages/book/index.vue'

const items = [
  { id: 1, key: 'course', component: 'ScrollList' },
  { id: 3, key: 'read', component: 'ScrollList' },
  { id: 4, key: 'culture', component: 'ScrollList' },
  { id: 8, key: 'book', component: 'BookList' },
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
      queryParams: initQueryParam()
    }
  },
  computed: {
    ...mapState(['categoryEnum']),
    filteredItems () {
      const categoryEnum = _get(this, 'categoryEnum') || []
      const options = cloneDeep(items)
        .filter(o => o.component)
        .filter(o => categoryEnum.some(e => e.categoryId === 2 || (e.categoryId === 1 && e.typeId === o.id)))
        .map(o => {
          const option = categoryEnum.find(e => e.categoryId === 2 || (e.categoryId === 1 && e.typeId === o.id))
          if (o.key === 'book') {
            o.name = _get(option, 'categoryName')
          } else {
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
      if (['course', 'read', 'culture'].includes(currentTabKey) && currentItem && currentItem.id) {
        options = categoryEnum
          .filter(e => e.categoryId === 1 && e.typeId === currentItem.id)
          .map(e => ({
            value: e.subTypeId,
            text: textEllipsis(e.subTypeName, 12)
          }))
      }
      if (['book'].includes(currentTabKey)) {
        options = categoryEnum
          .filter(e => e.categoryId === 2)
          .map(e => ({
            value: e.typeId,
            text: e.typeName
          }))
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