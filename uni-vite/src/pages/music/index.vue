<template>
  <view class="life-music-page">
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
    </view>
  </view>
</template>
<script>
import qs from 'qs'
import { MUSIC_MENU_LIST, MUSIC_LIST } from './constant.js'
export default {
  data () {
    return {
      musicMenuList: MUSIC_MENU_LIST,
      musicList: MUSIC_LIST
    }
  },
  methods: {
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
      if (item && item.url) {
        uni.navigateTo({
          url: `/pages/music/play?mode=auto&song=${encodeURIComponent(qs.stringify(item))}`
        })
        return
      }
      uni.showToast({
        title: '暂无播放地址',
        icon: 'none'
      })
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>