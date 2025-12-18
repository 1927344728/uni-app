<template>
  <scroll-view v-if="book" class="book_detail_page" scroll-y>
    <view class="book_hero">
      <image class="book_cover" :src="book.cover" mode="aspectFill" />
      <view class="hero_info">
        <text class="book_title">{{ book.title }}</text>
        <view class="book_meta">
          <text class="book_meta_label">作者：</text>
          <text class="book_meta_value">{{ book.author }}</text>
        </view>
        <view class="book_meta">
          <text class="book_meta_label">书主：</text>
          <text class="book_meta_value">{{ book.owner }}</text>
        </view>
        <view class="book_rating">
          <text class="book_rating_label">评分：</text>
          <text class="book_rating_value">{{ book.score }}</text>
          <view class="book_rating_stars">
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
        <view class="book_tag">
          <text class="tag" v-for="tag in book.tags" :key="tag">{{ tag }}</text>
        </view>
      </view>
    </view>

    <view class="book_content">
      <view class="book_content_wrapper">
        <view v-if="book.summary" class="content_card">
          <view class="content_card_title">书籍简介</view>
          <text class="summary_body">{{ book.summary }}</text>
        </view>

        <view v-if="book.highlights && book.highlights.length" class="content_card">
          <view class="content_card_title">精彩内容</view>
          <view class="highlight_body">
            <view class="highlight_item" v-for="(highlight, index) in book.highlights" :key="index">
              <text class="highlight_text">{{ highlight }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
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