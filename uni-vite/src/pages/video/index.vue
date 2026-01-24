<template>
  <scroll-view
    class="life_video_page"
    scroll-y="true"
    lower-threshold="100"
    @scrolltolower="onScrollToLower"
    @scroll="onScroll"
  >
    <view v-if="isShowBanner" class="video_banners">
      <swiper class="banner_swiper" indicator-dots="true">
        <swiper-item v-for="b in bannerList" :key="`banner-${b.id}`" @click="onClickBanner(b)">
          <image class="banner_image" :src="scaleImageWidthInCOS(b.cover)" mode="aspectFill" />
          <view class="banner_title">{{ convertHtmlToText(b.desc) }}</view>
        </swiper-item>
      </swiper>
    </view>

    <scroll-view v-if="isShowRecomend" class="recommend_section" scroll-x="true" :show-scrollbar="false">
      <view class="recommend_section_wrapper">
        <view
          v-for="item in recommendedList"
          :key="`rec-${item.id}`"
          class="recommend_card"
          @click="onClickMenu(item)"
        >
          <image class="rec_cover" :src="scaleImageWidthInCOS(item.cover, 120)" mode="aspectFill" />
          <view class="rec_text">
            <view class="rec_title">{{ item.title }}</view>
            <view class="rec_desc">{{ convertHtmlToText(item.desc) }}</view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="videoTypeEnum.length > 1" class="navigation_bar">
      <view class="tabs" :class="[isFixedNavBar ? 'fixed' : '']" @touchstart.stop @touchmove.stop @touchend.stop>
        <view
          v-for="m in videoTypeEnum"
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

    <view class="video_section">
      <view v-if="videoList.length" class="video_playlist_list">
        <view
          v-for="item in videoList"
          :key="item.id"
          class="movie_card"
          @click="onClickVideo(item)"
        >
          <image class="movie_cover" :src="scaleImageWidthInCOS(item.cover, 300)" mode="aspectFill" />

          <view class="movie_meta">
            <text class="movie_title">{{ item.title }}</text>
            <text class="movie_sub">{{ convertHtmlToText(item.desc) }}</text>
          </view>
        </view>
      </view>
      <view v-if="videoList.length && pagination.isLast" class="nomore_load_tips">
        ~没有更多了哦~
      </view>
      <view v-if="isLoaded && !videoList.length" class="nothing_tips" :style="{ paddingTop: '10vh', paddingBottom: '10vh' }">
        ~什么都没有哦~
      </view>
    </view>
  </scroll-view>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import qs from 'qs'
import { get as _get, cloneDeep } from 'lodash'
import { convert as convertHtmlToText } from 'html-to-text'
import { scaleImageWidthInCOS } from '@/utils/common.js'
import { getVideoMenuList, getVideoByIds, getVideoPageList } from '@/api'

const initPagination = () => ({
  pageNum: 0,
  pageSize: 6,
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
      bannerList: [],
      recommendedList: [],
      videoList: [],
      pagination: initPagination(),
      isFixedNavBar: false
    }
  },
  computed: {
    ...mapState(['categoryEnum']),
    videoTypeEnum () {
      const { categoryEnum } = this
      let options = [
        { typeId: null, name: '全部' }
      ]
      if (categoryEnum) {
        categoryEnum
          .filter(e => e.categoryId === 4)
          .forEach(e => {
            options.push({ typeId: e.typeId, name: e.typeName})
          })
      }
      return options
    },
    isShowBanner () {
      return _get(this, 'bannerList.length')
    },
    isShowRecomend () {
      return _get(this, 'recommendedList.length')
    }
  },
  onLoad (options = {}) {
    const type = options.type ? Number(options.type) : null
    this.type = Number(type) || this.type
    this.refreshList()
  },
  async created () {
    this.getCategoryEnum()
    getVideoMenuList().then(data => {
      if (data && data.length) {
        const bannerMenu = data.find(item => item.id === 1)
        const recommendMenu = data.find(item => item.id === 2)
        if (bannerMenu && bannerMenu.videoIds) {
          getVideoByIds({ ids: bannerMenu.videoIds }).then(data => {
            this.bannerList = data
          })
        }
        if (recommendMenu && recommendMenu.videoIds) {
          getVideoByIds({ ids: recommendMenu.videoIds }).then(data => {
            this.recommendedList = data
          })
        }
      }
    })
    await this.getVideoPageList()
  },
  methods: {
    ...mapActions(['getCategoryEnum']),
    convertHtmlToText,
    scaleImageWidthInCOS,
    getVideoPageList () {
      const { queryParams, type, videoList, pagination } = this
			if (pagination.isLast) {
				return
			}
      return getVideoPageList({
        type,
        keyword: queryParams.keyword || '',
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize
      }).then(data => {
				const list = _get(data, 'content') || []
        pagination.isLast = (list).length < pagination.pageSize
        this.videoList = videoList.concat(list)
      }).finally(() => {
        this.isLoaded = true
      })
    },
    refreshList () {
			this.isLoaded = false
      this.videoList = []
      this.pagination = initPagination()
      this.getVideoPageList()
    },
    onClickBanner (item) {
      const ids = (this.bannerList || []).map(e => e.id)
      uni.navigateTo({
        url: `/pages/video/play?mode=menu&ids=${encodeURIComponent(JSON.stringify(ids))}`
      })
    },
    onClickMenu (item) {
      const ids = (this.recommendedList || []).map(e => e.id)
      uni.navigateTo({
        url: `/pages/video/play?mode=menu&ids=${encodeURIComponent(JSON.stringify(ids))}`
      })
    },
    onClickTab (item) {
      this.type = item.typeId
      this.refreshList()
    },
    onClickVideo (item) {
      const params = {
        mode: 'auto',
        id: item.id,
        type: this.type || undefined
      }
      if (item && item.id) {
        uni.navigateTo({
          url: `/pages/video/play?${qs.stringify(params)}`,
        })
        return
      }
    },
    onScroll (e) {
      const bannerHeight = 184
      const recommendHeight = 180
      this.isFixedNavBar = e.detail.scrollTop > (bannerHeight + recommendHeight)
    },
    onScrollToLower () {
      this.pagination.pageNum ++
      this.getVideoPageList()
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>
