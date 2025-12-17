<template>
  <ScrollList class="score_page" :request="getArticlePageList" :pageSize="5" />
</template>

<script>
import { getArticlePageList } from '@/api'
import ScrollList from '@/components/scroll_list/index.vue'

export default {
  components: { ScrollList },
  methods: {
    getArticlePageList (options = {}) {
      return getArticlePageList({
        ...options,
        type: 2
      })
    }
  },
}
</script>
<style lang="less" scoped>
  .score_page {
    height: calc(100vh - 64rpx - constant(safe-area-inset-bottom));
    height: calc(100vh - 64rpx - env(safe-area-inset-bottom));
  }
</style>