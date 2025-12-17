<template>
  <view v-if="articleDetail" class="article_detail_page">
    <view class="article_detail_header">
      <text class="title">{{ articleDetail.title }}</text>
      <text class="author">{{ articleDetail.author }}</text>
    </view>

    <view class="article_detail_content">
      <ArticleDetail :articleData="articleDetail.content" />
    </view>
  </view>
</template>

<script>
import { getArticleById } from '@/api'
import ArticleDetail from '@/components/article_detail/index.vue'

export default {
  components: {
    ArticleDetail
  },
  data() {
    return {
      articleDetail: null
    };
  },
  async onLoad(options = {}) {
    const id = options.id || options.articleId || null;
    if (id) {
      this.getArticleById(id)
    }
  },
  methods: {
    getArticleById (id) {
      return getArticleById({
        id
      }).then((data) => {
        this.articleDetail = data || null
        if (data && data.title) {
          uni.setNavigationBarTitle({ title: data.title });
        }
      })
    }
  }
};
</script>

<style lang="less">
@import './detail.less';
</style>

