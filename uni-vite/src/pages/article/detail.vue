<template>
  <view v-if="articleDetail" class="article_detail_page">
    <ArticleDetail :articleData="articleDetail.content" :class="[articleDetail.className]" />
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
@import '@/common/css/reset.less';
@import '@/common/css/common.less';
@import '@/common/css/color.less';
@import '@/common/css/apply.less';

.article_detail_page {
  line-height: 1.6;
  color: @text-primary-color;
  background: white;
}
</style>

