<template>
  <view v-if="book" class="book_detail_page" scroll-y>
    <view class="overview">
      <image class="cover" :src="book.cover + '?imageMogr2/thumbnail/160x'" mode="aspectFill" />
      <view class="info">
        <text class="title">{{ book.title }}</text>
        <view class="meta">
          <text class="meta_label">作者：</text>
          <text class="meta_value">{{ book.author }}</text>
        </view>
        <view class="meta">
          <text class="meta_label">书主：</text>
          <text class="meta_value">{{ book.owner }}</text>
        </view>
        <view v-if="book.score" class="rating">
          <text class="rating_label">评分：</text>
          <text class="rating_value">{{ book.score.toFixed(1) }}</text>
          <view class="rating_stars">
            <text
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ active: n <= Math.round(book.score / 2) }"
            >
              ★
            </text>
          </view>
        </view>
        <view v-if="book.tags && book.tags.length" class="tag">
          <text class="tx" v-for="tag in book.tags" :key="tag">
            {{ tag }}
          </text>
        </view>
      </view>
    </view>

    <view class="book_content">
      <view v-if="book.summaries" class="card">
        <view class="title">书籍简介</view>
        <view v-for="tx in [book.summaries].flat()" class="summary">
          <rich-text :nodes="tx"></rich-text>
        </view>
      </view>

      <view v-if="book.highlights && book.highlights.length" class="card">
        <view class="title">精彩内容</view>
        <view class="highlights">
          <view class="highlight" v-for="(tx, index) in [book.highlights].flat()" :key="index">
            <rich-text class="text" :nodes="tx"></rich-text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getBookById } from '@/api/book.js'
export default {
  data () {
    return {
      book: null
    }
  },
  onLoad (options) {
    const { id } = options
    if (id) {
      return getBookById({ id }).then(data => {
        this.book = data || null
      })
    }
  },
}
</script>

<style lang="less">
@import './detail.less';
</style>