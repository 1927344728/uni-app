<template>
  <ScrollList
    ref="ScrollList"
    class="read_page"
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
    keyword: {
      handler () {
        this.$refs.ScrollList.refreshList()
      }
    }
  },
  methods: {
    getArticlePageList (options = {}) {
      const { keyword } = this
      return getArticlePageList({
        ...options,
        keyword,
        type: 1
      })
    }
  },
}
</script>