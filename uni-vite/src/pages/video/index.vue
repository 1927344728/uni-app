<template>
  <scroll-view
    class="life_video_page"
    scroll-y="true"
    lower-threshold="50"
    @scrolltolower="onScrollToLower"
  >
    <view class="video_banners">
      <swiper class="banner_swiper" indicator-dots="true">
        <swiper-item v-for="b in bannerList" :key="`banner-${b.id}`" @click="onClickBanner(b)">
          <image class="banner_image" :src="b.image" mode="aspectFill" />
          <view class="banner_title">{{ convertHtmlToText(b.desc) }}</view>
        </swiper-item>
      </swiper>
    </view>

    <scroll-view class="recommend_section" scroll-x="true" :show-scrollbar="false">
      <view class="recommend_section_wrapper">
        <view
          v-for="item in recommendedList"
          :key="`rec-${item.id}`"
          class="recommend_card"
          @click="onClickVideo(item)"
        >
          <image class="rec_cover" :src="item.cover" mode="aspectFill" />
          <view class="rec_text">
            <view class="rec_title">{{ item.title }}</view>
            <view class="rec_desc">{{ convertHtmlToText(item.desc) }}</view>
          </view>
        </view>
      </view>
    </scroll-view>

    <scroll-view class="video_filter_row" scroll-x="true" :show-scrollbar="false">
      <view
        v-for="(m, idx) in videoMenuList"
        :key="`menu-${m.id}-${idx}`"
        class="chip"
        :class="{ active: videoMenuId === m.id }"
        @click="videoMenuId = m.id"
      >
        <text>{{ m.title }}</text>
      </view>
    </scroll-view>

    <view class="video_section">
      <view class="video_playlist_list">
        <view
          v-for="item in videoList"
          :key="item.id"
          class="movie_card"
          @click="onClickVideo(item)"
        >
          <image class="movie_cover" :src="item.cover" mode="aspectFill" />

          <view class="movie_meta">
            <text class="movie_title">{{ item.title }}</text>
            <text class="movie_sub">{{ convertHtmlToText(item.desc) }}</text>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>
<script>
import { convert as convertHtmlToText } from 'html-to-text'
import { getVideoMenuList, getVideoPageList } from '@/api'

export default {
  data () {
    return {
      videoMenuId: null,
      bannerList: [],
      recommendedList: [],
      videoMenuList: [],
      videoList: [],

      pageNum: 0,
      pageSize: 10,
      loadingMore: false,
      isLast: false
    }
  },
  created () {
    getVideoMenuList().then(data => {
      this.videoMenuList =[{
        id: null,
        title: '全部'
      }].concat(data || [])
    })
    getVideoPageList().then(data => {
      this.bannerList = (data || []).slice(0, 3).map(e => ({ id: e.id, image: e.cover, desc: e.desc })),
      this.recommendedList = (data || []).slice(0, 10),
      this.videoList = this.videoList.concat(data || [])
    })
  },
  methods: {
    convertHtmlToText,
    getVideoPageList () {
      return getVideoPageList().then(data => {
        this.videoList = this.videoList.concat(data || [])
      })
    },
    onClickBanner (item) {
      if (item && item.id) {
        uni.navigateTo({
          url: `/pages/video/play?mode=single&id=${item.id}`
        })
        return
      }
      uni.showToast({ title: '暂无播放地址', icon: 'none' })
    },
    onClickCard (item) {
      if (item && item.id) {
        uni.navigateTo({
          url: `/pages/video/play?mode=menu&menuId=${item.id}`
        })
        return
      }
      uni.showToast({
        title: '暂无播放列表',
        icon: 'none'
      })
    },
    onClickVideo (item) {
      if (item && item.id) {
        uni.navigateTo({
          url: `/pages/video/play?mode=auto&id=${item.id}`
        })
        return
      }
      uni.showToast({
        title: '暂无播放地址',
        icon: 'none'
      })
    },
    onScrollToLower () {
      this.getVideoPageList()
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>
