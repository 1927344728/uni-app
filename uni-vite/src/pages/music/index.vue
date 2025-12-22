<template>
  <scroll-view class="life-music-page" scroll-y="true" @scrolltolower="onScrollToLower" lower-threshold="50">
    <view class="music-section">
      <view class="music-quick-grid">
        <view
          v-for="item in musicMenuList"
          :key="item.id"
          class="music-quick-card"
          @click="onClickCard(item)"
        >
          <image class="music-quick-card__icon" :src="item.icon" mode="aspectFill" />
          <view class="music-quick-card__info">
            <text class="music-quick-card__title">{{ item.title }}</text>
            <text class="music-quick-card__desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="music-section">
      <view class="music-section__header">
        <text class="music-section__title">精选歌曲</text>
      </view>
      <view class="music-playlist-list">
        <view
          v-for="item in musicList"
          :key="item.id"
          class="music-playlist-card"
          @click="onClickMusic(item)"
        >
          <image class="music-playlist-card__cover" :src="item.cover" mode="aspectFill" />
          <view class="music-playlist-card__body">
            <text class="music-playlist-card__title">{{ item.title }}</text>
            <text class="music-playlist-card__desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>
      <div v-if="!pagination.isLast" class="nomore_load_tips">~没有更多了~</div>
    </view>
  </scroll-view>
</template>
<script>
import { getMusicMenuList, getMusicPageList } from '@/api'
export default {
  props: {
    keyword: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      musicMenuList: [],
      musicList: [],
      pagination: {
        pageNum: 0,
        pageSize: 3,
        isLast: false
      }
    }
  },
  watch: {
    keyword: {
      handler () {
        this.refershList()
      },
      immediate: true
    }
  },
  created () {
    getMusicMenuList().then((data) => {
      this.musicMenuList = data || []
    })
  },
  methods: {
    getMusicPageList () {
      const { keyword, pagination } = this
      return getMusicPageList({
        keyword,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize
      }).then((data) => {
        this.musicList = this.musicList.concat(data || [])
      })
    },
    refershList () {
      this.musicList = []
      this.pagination.pageNum = 0
      this.getMusicPageList()
    },
    onClickCard (item) {
      if (item && item.id) {
        uni.navigateTo({
          url: `/pages/music/play?mode=menu&menuId=${item.id}`
        })
        return
      }
      uni.showToast({
        title: '暂无播放歌单',
        icon: 'none'
      })
    },
    onClickMusic (item) {
      if (item && item.id) {
        uni.navigateTo({
          url: `/pages/music/play?mode=auto&id=${item.id}`
        })
        return
      }
      uni.showToast({
        title: '暂无播放地址',
        icon: 'none'
      })
    },
    onScrollToLower () {
      this.pagination.pageNum ++
      this.getMusicPageList()
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>