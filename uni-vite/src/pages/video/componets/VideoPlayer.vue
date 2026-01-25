<template>
  <view class="video_play_module">
    <swiper
      class="video_play_swiper"
      :current="currentIndex"
      :duration="swiperDuration"
      :circular="false"
      vertical
      @change="onChange"
    >
      <swiper-item v-for="page in swiperPages" :key="page.id" >
        <view
          class="video_play_swiper_item"
          :class="[`video_play_swiper_item--${page.key}`, `video_play_switch--${page.key}`]"
          :style="getPageBgStyle(page)"
          @click="togglePlay"
        >
          <image
            v-if="page && page.cover"
            class="video_play_bg"
            :src="scaleImageWidthInCOS(page.cover)"
            mode="aspectFill"
          />

          <view class="video_play_content">
            <view v-if="page" class="video_play_text" @click.stop="isShowMoreDesc = !isShowMoreDesc">
              <text class="video_play_publisher">
                @{{ page.publisher || '未知' }}
              </text>
              <rich-text
                v-if="page.desc"
                class="video_play_desc"
                :nodes="`#${textEllipsis(page.desc, isShowMoreDesc ? 240 : 64)}`"
              />
            </view>

            <block v-if="page.key === 'current'">
              <view class="video_player_area">
                <video
                  v-if="currentVideo && currentVideo.url"
                  id="playerVideo"
                  class="video_element"
                  :src="replaceCosDomainName(currentVideo.url)"
                  :show-progress="false"
                  :controls="false"
                  :autoplay="true"
                  :show-center-play-btn="false"
                  :object-fit="currentVideo.objectFit || 'cover'"
                  :poster="replaceCosDomainName(currentVideo.cover)"
                  @timeupdate="onTimeUpdate"
                  @ended="onEnded"
                  @error="onError"
                  @play="onPlay"
                  @pause="onPause"
                  @loadedmetadata="onLoadedMeta"
                />
                <text v-if="!isPlaying" class="iconfont">
                  &#xe609;
                </text>
              </view>
            </block>

            <block v-else>
              <view class="video_play_hint">
                <text>{{ page.key === 'prev' ? '下滑返回当前视频' : page.key === 'next' ? '上滑切换到下一个' : '' }}</text>
              </view>
            </block>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <view class="video_play_footer" @click.stop>
      <view class="video_play_progress">
        <slider
          class="video_play_slider"
          min="0"
          :max="Math.floor(duration)"
          :value="Math.floor(currentTime)"
          step="1"
          block-size="12"
          :disabled="!duration"
          @changing="handleSliderChanging"
          @change="handleSliderChange"
        />
      </view>
    </view>
  </view>
</template>

<script>
import { get as _get } from 'lodash';
import { getVideoById, getVideoByIds, getVideoPageList, getVideoByRandom } from '@/api'
import { textEllipsis, scaleImageWidthInCOS, replaceCosDomainName } from '@/utils';

export default {
  name: 'VideoPlayer',
  emits: ['play', 'pause', 'next', 'prev', 'ended', 'error'],
  props: {
    mode: {
      type: String,
      default: 'auto'
    },
    id: [Number, String],
    ids: [Array, String],
    type: [Number, String],
    video: [Object, String],
    videos: Array
  },
  data () {
    return {
      allVideoList: [],
      playedIds: [],
      currentVideo: null,
      prevVideo: null,
      nextVideo: null,
      videoCtx: null,
      isPlaying: false,
      isSeeking: false,
      swiperDuration: 320,
      duration: 0,
      currentTime: 0,
      isShowMoreDesc: false
    };
  },
  computed: {
    swiperPages () {
      const { prevVideo, currentVideo, nextVideo } = this;
      const pages = [];
      if (prevVideo) {
        pages.push(Object.assign(prevVideo, { key: 'prev' }));
      }
      if (currentVideo) {
        pages.push(Object.assign(currentVideo, { key: 'current' }));
      }
      if (nextVideo) {
        pages.push(Object.assign(nextVideo, { key: 'next' }));
      }
      console.log(pages.map(e => e.title))
      return pages;
    },
    currentIndex () {
      const index = this.swiperPages.findIndex(e => e.id === _get(this, 'currentVideo.id')) || 0
      return index
    }
  },
  watch: {
    currentVideo (o) {
      if (o) {
        uni.setNavigationBarTitle({ title: o.title || '视频' });
      }
    }
  },
  async mounted () {
    await this.init();
    this.videoCtx = uni.createVideoContext('playerVideo', this);
  },
  unmounted () {
    this.videoCtx = null;
  },
  methods: {
    textEllipsis,
    scaleImageWidthInCOS,
    replaceCosDomainName,
    async init () {
      let { mode, id, ids, type, video, videos } = this;

      let currentVideo = null
      let allVideoList = []
      let playedIds = []

      if (video && typeof video === 'string') {
        try {
          currentVideo = JSON.parse(decodeURIComponent(video))
        } catch (e) {}
      } else {
        currentVideo = video
      }
      if (ids && typeof ids === 'string') {
        try {
          ids = JSON.parse(decodeURIComponent(ids))
        } catch (e) {}
      }

      // 单视频播放：传视频 id 或者完整视频对象
      if (mode === 'single') {
        currentVideo = currentVideo || (await getVideoById({id})) || null
        allVideoList = currentVideo ? [currentVideo] : null
      }
      // 视频列表播放：传视频类型id，或者完整视频列表
      if (mode === 'menu') {
        if (_get(videos, 'length')) {
          allVideoList = videos
        } else if (ids) {
          allVideoList = await getVideoByIds({ids})
        }  else if (type) {
          allVideoList = await getVideoPageList({type})
        }
        const currentIndex = allVideoList.findIndex(e => String(e.id) === String(id))
        currentVideo = allVideoList[Math.max(currentIndex, 0)]
        playedIds = allVideoList.map(e => e.id).filter((id, i) => i < currentIndex)
      }
      // 无限下滑：视频id，也可以指定 type
      if (mode === 'auto') {
        currentVideo = currentVideo || (await getVideoById({ id })) || null
        allVideoList = currentVideo ? [currentVideo] : null
      }

      if (!(currentVideo && currentVideo.url)) {
        uni.showToast({ title: '没有视频', icon: 'none' });
        return;
      }
      this.playedIds = playedIds
      this.allVideoList = allVideoList
      this.prevVideo = this.getPrevVideo();
      this.currentVideo = currentVideo
      this.nextVideo = await this.getNextVideo();
    },
    getPageBgStyle (video) {
      const cover = _get(video, 'cover');
      return cover ? { '--video_play_bg': `url(${replaceCosDomainName(cover)})` } : {};
    },
    getPrevVideo () {
      const { mode, allVideoList, playedIds } = this;
      this.isShowMoreDesc = false;
      let prevVideo = null
      if (['auto', 'menu'].includes(mode)) {
        if (playedIds.length > 0) {
          const prevId = playedIds[playedIds.length - 1];
          prevVideo = allVideoList.find(v => v.id === prevId) || null;
        }
      }
      return prevVideo
    },
    async getNextVideo () {
      const { mode, type, allVideoList, playedIds, currentVideo, swiperPages } = this;
      this.isShowMoreDesc = false;
      const currentVideoId = _get(currentVideo, 'id');
      const allVideoLength = _get(allVideoList, 'length', 0);
      let newVideo = null
      if (['auto'].includes(mode)) {
        newVideo = await getVideoByRandom({
          type,
          playingIds: swiperPages.map(e => e.id),
          playedIds
        }).catch(() => null);
        if (newVideo) {
          allVideoList.push(newVideo);
        }
      }
      if (['menu'].includes(mode) && allVideoLength > 1) {
        const currentIndex = allVideoList.findIndex(v => v.id === currentVideoId);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % allVideoList.length;
          if (nextIndex !== currentIndex) {
            newVideo = allVideoList[nextIndex];
          }
        }
      }
      return newVideo
    },
    onLoadedMeta (e) {
      const dur = e?.detail?.duration || 0;
      this.duration = dur;
    },
    onTimeUpdate (e) {
      if (this.isSeeking) return;
      this.currentTime = e?.detail?.currentTime || 0;
    },
    onPlay () {
      this.isPlaying = true;
      this.$emit('play', this.currentVideo);
    },
    onPause () {
      this.isPlaying = false;
      this.$emit('pause', this.currentVideo);
    },
    onEnded () {
      this.$emit('ended', this.currentVideo);
      this.goNextVideo();
    },
    onError (err) {
      uni.showToast({ title: '播放失败', icon: 'none' });
      this.$emit('error', err);
    },
    togglePlay () {
      const { videoCtx, isPlaying } = this
      if (videoCtx) {
        if (isPlaying) {
          videoCtx.pause();
        } else {
          videoCtx.play();
        }
      }
    },
    handleSliderChanging (e) {
      this.isSeeking = true;
      this.currentTime = e.detail.value;
    },
    handleSliderChange (e) {
      const { videoCtx, isPlaying } = this
      if (videoCtx) {
        videoCtx.seek(e.detail.value);
        if (!isPlaying) {
          videoCtx.play();
        }
      }
      this.isSeeking = false;
    },
    goPrevVideo () {
      const { videoCtx, prevVideo, currentVideo } = this;
      if (prevVideo) {
        this.playedIds.pop();
        this.currentVideo = prevVideo;
        this.prevVideo = this.getPrevVideo();
        this.nextVideo = currentVideo
        this.currentTime = 0;
        this.duration = 0;
        if (videoCtx) {
          videoCtx.play();
        }
      }
      this.$emit('prev', this.currentVideo);
    },
    async goNextVideo () {
      const { videoCtx, currentVideo, nextVideo } = this;
      if (nextVideo) {
        const currentId = _get(currentVideo, 'id');
        this.playedIds.push(currentId)
        this.prevVideo = currentVideo;
        this.currentVideo = nextVideo;
        this.nextVideo = null
        this.nextVideo = await this.getNextVideo()
        this.currentTime = 0;
        this.duration = 0;
        if (videoCtx) {
          videoCtx.play();
        }
      }
      this.$emit('next', this.currentVideo);
    },
    onChange (event) {
      const { currentIndex, nextVideo, prevVideo } = this;
      if (event.detail.current > currentIndex && nextVideo) {
        this.goNextVideo();
      }
      if (event.detail.current < currentIndex && prevVideo) {
        this.goPrevVideo();
      }
    }
  }
};
</script>

<style lang="less">
@import './VideoPlayer.less';
</style>
