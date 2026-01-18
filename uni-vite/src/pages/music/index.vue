<template>
  <scroll-view
    class="music_page"
    scroll-y="true"
    lower-threshold="100"
    @scrolltolower="onScrollToLower"
    @scroll="onScroll"
  >
    <view class="music_menu">
      <view
        v-for="item in menuList"
        :key="item.id"
        class="card"
        @click="onClickMenu(item)"
      >
        <image class="icon" :src="scaleImageWidthInCOS(item.icon, 120)" mode="aspectFill" />
        <view class="info">
          <text class="title">{{ item.title }}</text>
          <text class="desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <view v-if="musicTypeEnum && musicTypeEnum.length" class="navigation_bar">
      <view class="tabs" :class="[isFixedNavBar ? 'fixed' : '']" @touchstart.stop @touchmove.stop @touchend.stop>
        <view
          v-for="m in [{ typeId: null, name: '全部' }].concat(musicTypeEnum)"
          :key="m.typeId"
          class="tab"
          :class="{
            active: type === m.typeId
          }"
          @click="onClickTab(m)"
        >
          {{ m.name }}
        </view>
      </view>
    </view>

    <view class="music_main">
      <view class="header">
        <text class="title">精选歌曲</text>
      </view>
      <view class="list">
        <view
          v-for="item in musicList"
          :key="item.id"
          class="card"
          @click="onClickMusic(item)"
        >
          <image class="cover" :src="scaleImageWidthInCOS(item.cover, 120)" mode="aspectFill" />
          <view class="body">
            <text class="title">{{ item.title }}</text>
            <text class="singer">{{ item.singer }}</text>
          </view>
        </view>
      </view>
      <view v-if="musicList.length && pagination.isLast" class="nomore_load_tips">
        ~没有更多了哦~
      </view>
      <view v-if="isLoaded && !musicList.length" class="nothing_tips" :style="{ paddingTop: '20vh', paddingBottom: '20vh' }">
        ~什么都没有哦~
      </view>
    </view>
  </scroll-view>
</template>
<script>
import qs from 'qs'
import { cloneDeep } from 'lodash'
import { MUSIC_TYPE_ENUM } from '/database/type_enum.js'
import { scaleImageWidthInCOS } from '@/utils'
import { getMusicMenuList, getMusicPageList } from '@/api'

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
      isLoaded: false,
      type: 1,
      menuList: [],
      musicTypeEnum: cloneDeep(MUSIC_TYPE_ENUM),
      musicList: [],
      pagination: initPagination(),
      isFixedNavBar: false,
    }
  },
  created () {
    getMusicMenuList().then((data) => {
      this.menuList = data || []
    })
    this.refreshList()
  },
  methods: {
    scaleImageWidthInCOS,
    getMusicPageList () {
      const { queryParams, type, pagination } = this
      this.isLoaded = false
      return getMusicPageList({
        type,
        keyword: queryParams.keyword || '',
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize
      }).then((data) => {
        this.musicList = this.musicList.concat(data || [])
        if ((data || []).length < pagination.pageSize) {
          this.pagination.isLast = true
        }
      }).finally(() => {
        this.isLoaded = true
      })
    },
    refreshList () {
      this.musicList = []
      this.pagination = initPagination()
      this.getMusicPageList()
    },
    onClickMenu (item) {
      if (item && item.id) {
        uni.navigateTo({
          url: `/pages/music/play?mode=menu&ids=${encodeURIComponent(JSON.stringify(item.songIds))}`
        })
      }
    },
    onClickTab (item) {
      this.type = item.typeId
      this.refreshList()
    },
    onClickMusic (item) {
      if (item && item.id) {
        const params = {
          mode: 'auto',
          id: item.id,
          type: this.type || undefined
        }
        uni.navigateTo({
          url: `/pages/music/play?${qs.stringify(params)}`
        })
      }
    },
    onScroll (e) {
      const menuHeight = 170
      this.isFixedNavBar = e.detail.scrollTop > menuHeight
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