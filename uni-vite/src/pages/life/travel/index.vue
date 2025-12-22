<template>
  <ScrollList
    ref="ScrollList"
    class="travel_page"
    :request="getArticlePageList"
    :pageSize="5"
  />
</template>

<script>
import { getArticlePageList } from '@/api'
import ScrollList from '@/components/scroll_list/index.vue'

export default {
  components: { ScrollList },
  props: {
    keyword: {
      type: String,
      default: ''
    }
  },
  watch: {
    keyword () {
      this.$refs.ScrollList.refreshList()
    }
  },
  methods: {
    getArticlePageList (options = {}) {
      const { keyword } = this
      return getArticlePageList({
        ...options,
        keyword,
        type: 4
      })
    }
  },
}
</script>
<style lang="less" scoped>
  .course_page {
    height: calc(100vh - 64rpx - constant(safe-area-inset-bottom));
    height: calc(100vh - 64rpx - env(safe-area-inset-bottom));
  }
</style>