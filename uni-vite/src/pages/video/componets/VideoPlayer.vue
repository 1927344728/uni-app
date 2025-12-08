<template>
  <view class="video_play_module">
    <swiper
      class="video_play_swiper"
      :current="swiperCurrent"
      :duration="swiperDuration"
      :circular="false"
      vertical
      @change="handleSwiperPageChange"
    >
      <swiper-item v-for="page in swiperPages" :key="page.key + page.id" >
        <view
          class="video_play_swiper_item"
          :class="[`video_play_swiper_item--${page.key}`, `video_play_switch--${page.key}`]"
          :style="getPageBgStyle(page)"
          @click="handleTogglePlay"
        >
          <image
            v-if="page && page.bg"
            class="video_play_bg"
            :src="page.bg"
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
                  id="playerVideo"
                  ref="playerVideo"
                  class="video_element"
                  :src="currentVideo && currentVideo.url"
                  :show-progress="false"
                  :controls="false"
                  :autoplay="false"
                  :show-center-play-btn="false"
                  :object-fit="currentVideo.objectFit || 'cover'"
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
import { getVideoListByMenuId, getVideoByRandom } from '@/api'
import { textEllipsis } from '@/utils/common.js';

export default {
  name: 'VideoPlayer',
  emits: ['play', 'pause', 'next', 'prev', 'ended', 'error'],
  props: {
    mode: {
      type: String,
      default: 'auto'
    },
    id: {
      type: [Number, String],
      default: null
    },
    menuId: {
      type: Number,
      default: null
    },
    video: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      allVideoList: [],
      playedVideoIds: [],
      currentVideo: {},
      prevVideo: null,
      nextVideo: null,
      videoCtx: null,
      isPlaying: false,
      isSeeking: false,
      swiperCurrent: 0,
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
      return pages;
    },
    canGoPrev () {
      return !!this.prevVideo;
    },
    canGoNext () {
      return !!this.nextVideo;
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
    async init () {
      const { mode, id, menuId, video } = this;
      if (mode === 'menu') {
        this.allVideoList = await getVideoListByMenuId({menuId}).catch(() => []);
        this.currentVideo = id ? this.allVideoList.find(s => s.id === id) : this.allVideoList[0];
      } else {
        this.allVideoList.push(video);
        this.currentVideo = video;
      }
      if (!this.currentVideo || !this.currentVideo.url) {
        uni.showToast({ title: '未找到播放视频', icon: 'none' });
        return;
      }
      this.playedVideoIds = [];
      this.prevVideo = null;
      this.nextVideo = null;
      this.updatePrevAndNextVideo();
    },
    getPageBgStyle (video) {
      const bg = _get(video, 'bg');
      return bg ? { '--video_play_bg': `url(${bg})` } : {};
    },
    async updatePrevAndNextVideo () {
      const { mode, allVideoList, playedVideoIds, currentVideo } = this;
      this.prevVideo = null;
      this.nextVideo = null;
      this.isShowMoreDesc = false;
      this.swiperCurrent = 0;
      const currentVideoId = _get(currentVideo, 'id');
      const allVideoLength = _get(allVideoList, 'length', 0);
      if (['auto', 'menu'].includes(mode)) {
        if (playedVideoIds.length > 0) {
          const prevId = playedVideoIds[playedVideoIds.length - 1];
          this.prevVideo = allVideoList.find(v => v.id === prevId) || null;
          this.swiperCurrent = this.prevVideo ? 1 : 0;
        }
      }
      if (['auto'].includes(mode)) {
        this.nextVideo = await getVideoByRandom({currentVideoId, playedVideoIds}).catch(() => null);
        if (this.nextVideo) allVideoList.push(this.nextVideo);
      }
      if (['menu'].includes(mode) && allVideoLength > 1) {
        const currentIndex = allVideoList.findIndex(v => v.id === currentVideoId);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % allVideoList.length;
          if (nextIndex !== currentIndex) {
            this.nextVideo = allVideoList[nextIndex];
          }
        }
      }
      if (currentVideo) {
        uni.setNavigationBarTitle({ title: currentVideo.title || '视频' });
      }
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
      if (!this.videoCtx) return;
      if (this.isPlaying) {
        this.videoCtx.pause();
      } else {
        this.videoCtx.play();
      }
    },
    handleSliderChanging (e) {
      this.isSeeking = true;
      this.currentTime = e.detail.value;
    },
    handleSliderChange (e) {
      if (!this.videoCtx) return;
      const value = e.detail.value;
      this.videoCtx.seek(value);
      if (!this.isPlaying) {
        this.videoCtx.play();
      }
      this.isSeeking = false;
    },
    handlePrev () {
      const { canGoPrev, swiperCurrent } = this;
      if (canGoPrev) {
        this.goPrevVideo();
        this.swiperCurrent = swiperCurrent > 0 ? swiperCurrent - 1 : swiperCurrent;
        this.$emit('prev', this.currentVideo);
      }
    },
    handleNext () {
      const { canGoNext, swiperCurrent } = this;
      if (canGoNext) {
        this.goNextVideo();
        this.swiperCurrent = swiperCurrent < 2 ? swiperCurrent + 1 : swiperCurrent;
        this.$emit('next', this.currentVideo);
      }
    },
    goNextVideo () {
      const { nextVideo } = this;
      if (!nextVideo) return;
      const currentId = _get(this, 'currentVideo.id');
      this.currentVideo = nextVideo;
      if (currentId) this.playedVideoIds.push(currentId);
      this.currentTime = 0;
      this.duration = 0;
      this.swiperCurrent = 0;
      this.updatePrevAndNextVideo();
      this.$nextTick(() => {
        if (this.videoCtx) this.videoCtx.play();
      });
      this.$emit('next', this.currentVideo);
    },
    goPrevVideo () {
      const { prevVideo } = this;
      if (!prevVideo) return;
      this.currentVideo = prevVideo;
      this.playedVideoIds.pop();
      this.currentTime = 0;
      this.duration = 0;
      this.swiperCurrent = 0;
      this.updatePrevAndNextVideo();
      this.$nextTick(() => {
        if (this.videoCtx) this.videoCtx.play();
      });
      this.$emit('prev', this.currentVideo);
    },
    handleSwiperPageChange (event) {
      const { swiperCurrent, nextVideo, prevVideo } = this;
      const nextIndex = event.detail.current;
      const prevIndex = swiperCurrent;
      this.swiperCurrent = nextIndex;
      if (nextIndex > prevIndex && nextVideo) {
        this.goNextVideo();
      }
      if (nextIndex < prevIndex && prevVideo) {
        this.goPrevVideo();
      }
    }
    ,
    handleTogglePlay () {
      this.togglePlay();
    }
  }
};
</script>

<style lang="less">
@import './VideoPlayer.less';
</style>
