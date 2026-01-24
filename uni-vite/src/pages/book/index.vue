<template>
  <scroll-view class="book_page" scroll-y="true" @scrolltolower="onScrollToLower" lower-threshold="100">
    <view class="header">
      <view>
        <text class="title">一兆精选 · 图书馆</text>
        <text class="subtitle">沉浸阅读 · 私藏好书随时借阅</text>
      </view>
    </view>

    <view v-if="isLoad" class="book_list">
      <view v-if="bookList && bookList.length" class="book_item" v-for="book in bookList" :key="book.id" @click="onClickCard(book)">
        <image class="book_cover" mode="aspectFill" :src="scaleImageWidthInCOS(book.cover, 160)" />
        <view class="book_content">
          <view class="book_header">
            <text class="book_title">{{ book.title }}</text>
            <view v-if="book.score" class="book_score">
              <text class="score">{{ book.score.toFixed(1) }}</text>
              <text class="suffix">分</text>
            </view>
          </view>

          <view class="book_meta">
            <text>作者：{{ book.author }}</text>
          </view>
          <view class="book_meta">
					  <text>书主：{{ book.owner }}</text>
          </view>

          <text class="book_desc">
            {{ textEllipsis(book.description, 32) }}
          </text>

          <view class="book_tag">
            <text class="tag" v-for="tag in book.tags" :key="tag">
              {{ tag }}
            </text>
          </view>
        </view>
      </view>
      <view v-if="bookList && bookList.length && pagination.isLast" class="nomore_load_tips">
        ~没有更多了哦~
      </view>
      <view v-if="!(bookList && bookList.length)" class="nothing_tips" style="padding-top: 30vh; padding-bottom: 30vh;">
        ~什么都没有哦~
      </view>
    </view>
  </scroll-view>
</template>
<script>
import { get as _get } from 'lodash'
import { textEllipsis, scaleImageWidthInCOS } from '@/utils/common.js'
import { getBookPageList } from '@/api/book.js'

const initPagination = () => ({
  pageNum: 0,
  pageSize: 10,
  isLast: false
})

export default {
  props: {
    queryParams: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      isLoad: false,
			bookList: [],
      pagination: initPagination()
    }
  },
  created () {
    this.getBookPageList()
  },
	methods: {
    textEllipsis,
    scaleImageWidthInCOS,
    getBookPageList () {
      const { queryParams, pagination } = this
      const { pageNum, pageSize } = pagination
      const { subType, keyword } = queryParams
      return getBookPageList({
        type: subType || null,
        keyword: keyword || '',
        pageNum,
        pageSize
      })
        .then(data => {
					const list = _get(data, 'content') || []
          if (list.length < pageSize) {
            pagination.isLast = true
          }
          this.bookList = this.bookList.concat(list)
        })
        .finally(() => {
          this.isLoad = true
        })
    },
    refreshList () {
			this.isLoad = false
      this.bookList = []
      this.pagination = initPagination()
      this.getBookPageList()
    },
		onClickCard (item) {
			if (item) {
				uni.navigateTo({
					url: `/pages/book/detail?id=${encodeURIComponent(item.id)}`
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