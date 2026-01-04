<template>
  <view class="article_page with_search_bar">
    <SearchBar v-model:value="queryParams" :subTypeOptions="subTypeOptions" />
    <ScrollList
      ref="ScrollList"
      :request="getArticlePageList"
      :queryParams="cQueryParams"
    />
  </view>
</template>

<script>
import { getArticleTypeList, getArticlePageList } from '@/api'
import SearchBar from '@/components/search_bar/index.vue'
import ScrollList from '@/components/scroll_list/index.vue'

const initQueryParam = () => ({
  subType: null,
  keyword: ''
})

export default {
	components: {
    SearchBar,
    ScrollList
  },
  props: {
    queryParams: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      subTypeOptions: [],
      queryParams: initQueryParam(),
    }
  },
  computed: {
    cQueryParams () {
      return {
        type: this.queryParams.subType,
        keyword: this.queryParams.keyword
      }
    }
  },
  watch: {
    cQueryParams: {
      deep: true,
      handler () {
        setTimeout(() => {
          this.$refs.ScrollList.refreshList()
        }, 100)
      }
    }
  },
  created () {
    getArticleTypeList().then(data => {
      this.subTypeOptions = (data || [])
        .map(e => ({
          value: e.id,
          text: e.name
        }))
        .filter(e => [1, 3, 4, 5, 6, 7, 99].includes(e.value))
    })
  },
	methods: {
    getArticlePageList
	},
}
</script>
<style>
  .article_page {
    padding-top: 112rpx;
    .common_list_module {
      height: calc(100vh - 112rpx - constant(safe-area-inset-bottom));
      height: calc(100vh - 112rpx - env(safe-area-inset-bottom));
    }
  }
</style>