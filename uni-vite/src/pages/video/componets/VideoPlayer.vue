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
                  v-if="currentVideo && currentVideo.url"
                  id="playerVideo"
                  ref="playerVideo"
                  class="video_element"
                  :src="currentVideo.url"
                  :show-progress="false"
                  :controls="false"
                  :autoplay="true"
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
      return this.swiperPages.findIndex(e => e.id === _get(this, 'currentVideo.id')) || 0
    }
  },
  watch: {
    // allVideoList: {
    //   deep: true,
    //   handler (list) {
    //     console.log(list.map(e => e.title))
    //   }
    // },
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
    async init () {
      const { mode, id, menuId, video } = this;
      let currentVideo = null
      if (mode === 'menu') {
        this.allVideoList = await getVideoListByMenuId({menuId}).catch(() => []);
        currentVideo = id ? this.allVideoList.find(s => s.id === id) : this.allVideoList[0];
      } else {
        currentVideo = video;
        this.allVideoList.push(currentVideo);
      }
      if (!(currentVideo && currentVideo.url)) {
        uni.showToast({ title: '未找到播放视频', icon: 'none' });
        return;
      }
      this.playedVideoIds = [];
      this.prevVideo = null;
      this.currentVideo = currentVideo
      this.nextVideo = await this.getNextVideo();
    },
    getPageBgStyle (video) {
      const bg = _get(video, 'bg');
      return bg ? { '--video_play_bg': `url(${bg})` } : {};
    },
    getPrevVideo () {
      const { mode, allVideoList, playedVideoIds } = this;
      this.isShowMoreDesc = false;
      let prevVideo = null
      if (['auto', 'menu'].includes(mode)) {
        if (playedVideoIds.length > 0) {
          const prevId = playedVideoIds[playedVideoIds.length - 1];
          prevVideo = allVideoList.find(v => v.id === prevId) || null;
        }
      }
      return prevVideo
    },
    async getNextVideo () {
      const { mode, allVideoList, playedVideoIds, currentVideo, swiperPages } = this;
      this.isShowMoreDesc = false;
      const currentVideoId = _get(currentVideo, 'id');
      const allVideoLength = _get(allVideoList, 'length', 0);
      let nextVideo = null
      if (['auto'].includes(mode)) {
        nextVideo = await getVideoByRandom({
          playingVideoIds: swiperPages.map(e => e.id),
          playedVideoIds
        }).catch(() => null);
        if (nextVideo) {
          allVideoList.push(nextVideo);
        }
      }
      if (['menu'].includes(mode) && allVideoLength > 1) {
        const currentIndex = allVideoList.findIndex(v => v.id === currentVideoId);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % allVideoList.length;
          if (nextIndex !== currentIndex) {
            nextVideo = allVideoList[nextIndex];
          }
        }
      }
      return nextVideo
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
        this.playedVideoIds.pop();
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
        this.playedVideoIds.push(currentId)
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
