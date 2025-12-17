<template>
  <scroll-view class="study-book-page" scroll-y="true" @scrolltolower="onScrollToLower" lower-threshold="50">
    <view class="page-header">
      <view>
        <text class="page-title">一兆精选 · 图书馆</text>
        <text class="page-subtitle">沉浸阅读 · 私藏好书随时借阅</text>
      </view>
    </view>

    <view class="book-list">
      <view class="book-card" v-for="book in bookList" :key="book.id" @click="onClickCard(book)">
        <image class="book-cover" mode="aspectFill" :src="book.cover" />
        <view class="book-content">
          <view class="book-title-row">
            <text class="book-title">{{ book.title }}</text>
            <view class="score-wrapper">
              <text class="book-score">{{ book.score }}</text>
              <text class="score-suffix">分</text>
            </view>
          </view>

          <view class="meta-row">
            <text class="meta-item">作者：{{ book.author }}</text>
						<text class="meta-dot">·</text>
					  <text class="meta-item">书主：{{ book.owner }}</text>
          </view>

          <text class="book-desc">
            {{ book.description }}
          </text>

          <view class="tag-row">
            <text class="book-tag" v-for="tag in book.tags" :key="tag">
              {{ tag }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <FooterBar :activeTabKey="activeTabKey" />
  </scroll-view>
</template>
<script>
import { BOOK_LIST } from '/database/book.js'
import store from '@/store/index'
import FooterBar from '@/components/footer_bar/index.vue'

export default {
  components: {
    FooterBar
  },
  data () {
    return {
      bookList: BOOK_LIST
    }
  },
  computed: {
    activeTabKey () {
      return store.state.activeTabKey
    }
  },
  created () {
    store.commit('setActiveTabKey', 'study')
  },
	methods: {
		onClickCard (item) {
			if (item) {
				uni.navigateTo({
					url: `/pages/study/book/detail?id=${encodeURIComponent(item.id)}`
				});
			}
		},
    onScrollToLower () {
      console.log('滚动到底部加载更多')
    }
	}
}
</script>
<style lang="less">
@import './index.less';
</style>