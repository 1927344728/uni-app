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
import { mapState, mapActions } from 'vuex'
import { getArticlePageList } from '@/api'
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
  data () {
    return {
      queryParams: initQueryParam()
    }
  },
  computed: {
    ...mapState(['categoryEnum']),
    cQueryParams () {
      const { queryParams } = this
      return {
        type: queryParams.subType,
        keyword: queryParams.keyword,
      }
    },
    subTypeOptions () {
      const { categoryEnum } = this
      const options = (categoryEnum || [])
        .filter(e => e.categoryId === 1)
        .filter((e, i, arr) => arr.findIndex(a => a.typeId === e.typeId) === i)
        .map(e => ({
          value: e.typeId,
          text: e.typeName
        }))
      return options
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
  onLoad (options = {}) {
    const type = options.type ? Number(options.type) : null
    this.queryParams.subType = Number(type) || this.queryParams.subType
  },
  created () {
    this.getCategoryEnum()
  },
	methods: {
    ...mapActions(['getCategoryEnum']),
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