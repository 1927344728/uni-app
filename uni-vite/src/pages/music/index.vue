<template>
  <view class="life-music-page">
    <view class="music-section">
      <view class="music-quick-grid">
        <view
          v-for="item in quickEntryList"
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

    <!-- <view class="music-section">
      <view class="music-section__header">
        <text class="music-section__title">热搜推荐</text>
      </view>
      <view class="music-tag-wrap">
        <view
          v-for="tag in hotSearchList"
          :key="tag"
          class="music-tag"
          @click="handleSearch(tag)"
        >
          <text>#{{ tag }}</text>
        </view>
      </view>
    </view> -->

    <view class="music-section">
      <view class="music-section__header">
        <text class="music-section__title">精选歌曲</text>
      </view>
      <view class="music-playlist-list">
        <view
          v-for="item in playList"
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
import { MUSIC_LIST } from './constant.js'
export default {
  data () {
    return {
      quickEntryList: [
        {
          id: 'daily',
          icon: 'https://y.gtimg.cn/music/common/upload/MUSIC_FOCUS/6136698.jpg',
          title: '一兆精选',
          desc: '智能匹配今日心情',
          url: '/pages/music/daily'
        },
        {
          id: 'fm',
          icon: 'https://y.gtimg.cn/music/common/upload/MUSIC_FOCUS/6127917.jpg',
          title: '每日推荐',
          desc: '精彩一天 从音乐开始',
          url: '/pages/music/fm'
        },
        {
          id: 'mix',
          icon: 'https://y.gtimg.cn/music/common/upload/MUSIC_FOCUS/6136707.jpg',
          title: '跑步动感',
          desc: '128bpm 热汗燃烧',
          url: '/pages/music/mix'
        },
        {
          id: 'sleep',
          icon: 'https://y.gtimg.cn/music/common/upload/MUSIC_FOCUS/6136704.jpg',
          title: '兮小宝睡眠曲',
          desc: '助眠放松冥想',
          url: '/pages/music/sleep'
        }
      ],
      hotSearchList: ['热歌', '回忆杀', '国风', '翻唱', '电竞 BGM', '治愈女声', 'DJ 舞曲'],
      playList: MUSIC_LIST
    }
  },
  methods: {
    onClickCard (item) {
      if (item && item.url) {
        uni.navigateTo({
          url: `/pages/music/play?id=${encodeURIComponent(item.id)}&song=${encodeURIComponent(item.url)}`
        })
      }
    },
    onClickMusic (item) {
      if (item && item.url) {
        const fileName = item.url.split('/').pop()
        const basePath = item.url.replace(fileName, '')
        uni.navigateTo({
          url: `/pages/music/play?baseDir=${encodeURIComponent(basePath)}&song=${encodeURIComponent(fileName)}&mode=auto`
        })
      }
    },
    handleSearch (keyword) {
      uni.showToast({
        title: `搜索 ${keyword}`,
        icon: 'none'
      })
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>