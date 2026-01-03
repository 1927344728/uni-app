<template>
  <ScrollList
    ref="ScrollList"
    class="article_page"
    :request="getArticlePageList"
    :queryParams="queryParams"
  />
</template>

<script>
import { getArticlePageList } from '@/api'
import ScrollList from '@/components/scroll_list/index.vue'

export default {
	components: { ScrollList },
  props: {
    queryParams: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    queryParams: {
      deep: true,
      handler () {
        this.$refs.ScrollList.refreshList()
      }
    }
  },
	methods: {
    getArticlePageList
	},
}
</script>