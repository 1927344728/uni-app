<template>
  <ScrollList
    ref="ScrollList"
    class="read_page"
    :request="getArticlePageList"
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
    getArticlePageList (options = {}) {
      const { queryParams } = this
      return getArticlePageList({
        ...options,
        ...(queryParams || {}),
        type: 3
      })
    }
  },
}
</script>