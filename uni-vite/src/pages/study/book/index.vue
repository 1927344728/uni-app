<template>
  <scroll-view class="book_page" scroll-y="true" @scrolltolower="onScrollToLower" lower-threshold="50">
    <view class="book_header">
      <view>
        <text class="title">一兆精选 · 图书馆</text>
        <text class="subtitle">沉浸阅读 · 私藏好书随时借阅</text>
      </view>
    </view>

    <view v-if="isLoad" class="book_list">
      <view class="book_item" v-for="book in bookList" :key="book.id" @click="onClickCard(book)">
        <image class="book_cover" mode="aspectFill" :src="book.cover" />
        <view class="book_content">
          <view class="book_header">
            <text class="book_title">{{ book.title }}</text>
            <view class="book_score">
              <text class="score">{{ book.score }}</text>
              <text class="suffix">分</text>
            </view>
          </view>

          <view class="book_meta">
            <text>作者：{{ book.author }}</text>
						<text class="dot">·</text>
					  <text>书主：{{ book.owner }}</text>
          </view>

          <text class="book_desc">
            {{ book.description }}
          </text>

          <view class="book_tag">
            <text class="tag" v-for="tag in book.tags" :key="tag">
              {{ tag }}
            </text>
          </view>
        </view>
      </view>
      <view v-if="pagination.isLast" class="nomore_load_tips">~没有更多书籍了~</view>
    </view>

    <FooterBar :activeTabKey="activeTabKey" />
  </scroll-view>
</template>
<script>
import { getBookPageList } from '@/api/book.js'
import store from '@/store/index'
import FooterBar from '@/components/footer_bar/index.vue'

const initPagination = () => ({
  pageNum: 0,
  pageSize: 5,
  isLast: false
})

export default {
  components: {
    FooterBar
  },
  data () {
    return {
      isLoad: false,
			bookList: [],
      pagination: initPagination()
    }
  },
  computed: {
    activeTabKey () {
      return store.state.activeTabKey
    }
  },
  created () {
    store.commit('setActiveTabKey', 'study')
    this.getBookPageList()
  },
	methods: {
    getBookPageList () {
      const { pageNum, pageSize } = this.pagination
      this.isLoad = false
      return getBookPageList({
        pageNum,
        pageSize
      })
        .then(data => {
          this.bookList = this.bookList.concat(data || [])
          if ((data || []).length < pageSize) {
            this.pagination.isLast = true
          }
        })
        .finally(() => {
          this.isLoad = true
        })
    },
		onClickCard (item) {
			if (item) {
				uni.navigateTo({
					url: `/pages/study/book/detail?id=${encodeURIComponent(item.id)}`
				});
			}
		},
    onScrollToLower () {
      const { pagination } = this
      console.log('onScrollToLower')
      if (!pagination.isLast) {
        pagination.pageNum ++
        this.getBookPageList()
      }
    }
	}
}
</script>
<style lang="less">
@import './index.less';
</style>