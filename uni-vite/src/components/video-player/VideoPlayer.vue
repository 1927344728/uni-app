<template>
  <view
    class="video_play_module"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <view
      class="video_play_track"
      :class="{ 'video_play_track--transition': isSliding }"
      :style="trackStyle"
    >
      <view
        v-for="(page, index) in swiperPages"
        :key="page.uid"
        class="video_play_swiper_item"
        :class="[`video_play_swiper_item--${page.key}`, `video_play_switch--${page.key}`]"
        :style="[getPageBgStyle(page), getPagePositionStyle(index)]"
        @click="togglePlay"
      >
        <image
          v-if="page.cover && page.near"
          class="video_play_bg"
          :src="scaleImageWidthInCOS(page.cover)"
          mode="aspectFill"
        />

        <view class="video_play_content">
          <view class="video_play_text" @click.stop="isShowMoreDesc = !isShowMoreDesc">
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
              <text>{{ page.key === 'prev' ? '下滑返回当前视频' : '上滑切换到下一个' }}</text>
            </view>
          </block>
        </view>
      </view>
    </view>

    <view
      class="video_play_footer"
      @click.stop
      @touchstart.stop
      @touchmove.stop
      @touchend.stop
      @touchcancel.stop
    >
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
import { getValue as _get } from '@/common/js/common.js';
import { getVideoById, getVideoByIds, getVideoPageList, getVideoByRandom } from '@/api'
import { textEllipsis, scaleImageWidthInCOS, replaceCosDomainName } from '@/common/js/common.js';

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
      // 线性播放列表：索引只随滑动前进/后退，不做数据平移
      playList: [],
      currentIndex: 0,
      uidSeed: 0,
      isFetchingNext: false,
      videoCtx: null,
      isPlaying: false,
      isSeeking: false,
      isSliding: false,
      pageHeight: 1,
      touchStartY: 0,
      touchMoveDistance: 0,
      hasTouchMoved: false,
      slideDuration: 320,
      duration: 0,
      currentTime: 0,
      isShowMoreDesc: false
    };
  },
  computed: {
    currentVideo () {
      return this.playList[this.currentIndex] || null;
    },
    swiperPages () {
      const { playList, currentIndex } = this;
      return playList.map((item, index) => ({
        ...item,
        key: index === currentIndex ? 'current' : (index < currentIndex ? 'prev' : 'next'),
        // 仅相邻页加载封面大图，避免列表变长后内存堆积
        near: Math.abs(index - currentIndex) <= 2
      }));
    },
    trackStyle () {
      const top = -(this.currentIndex * this.pageHeight) + this.touchMoveDistance;
      return {
        height: `${this.playList.length * this.pageHeight}px`,
        top: `${top}px`,
        transitionDuration: `${this.slideDuration}ms`
      };
    }
  },
  watch: {
    currentIndex () {
      this.currentTime = 0;
      this.duration = 0;
      this.isPlaying = false;
      this.isShowMoreDesc = false;
      const title = _get(this, 'currentVideo.title');
      uni.setNavigationBarTitle({ title: title || '视频' });
      // 当前页的 video 元素是新挂载的，需要重新拿上下文
      this.$nextTick(() => {
        this.videoCtx = uni.createVideoContext('playerVideo', this);
      });
    }
  },
  async mounted () {
    await this.getSystemInfo();
    await this.init();
    this.$nextTick(() => {
      this.videoCtx = uni.createVideoContext('playerVideo', this);
    });
  },
  unmounted () {
    this.videoCtx = null;
  },
  methods: {
    textEllipsis,
    scaleImageWidthInCOS,
    replaceCosDomainName,
    getSystemInfo () {
      return new Promise(resolve => {
        uni.getSystemInfo({
          success: res => {
            this.pageHeight = res.windowHeight || 1;
            resolve();
          },
          fail: () => resolve()
        });
      });
    },
    withUid (item) {
      this.uidSeed += 1;
      // 放宽重复限制后同一视频可能再次入列，用 uid 保证 key 唯一
      return { ...item, uid: `${_get(item, 'id', 'v')}_${this.uidSeed}` };
    },
    async init () {
      let { mode, id, ids, type, video, videos } = this;

      let currentVideo = null
      let list = []
      let startIndex = 0

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
        currentVideo = currentVideo || (await getVideoById({ id })) || null
        list = currentVideo ? [currentVideo] : []
      }
      // 视频列表播放：传视频类型id，或者完整视频列表
      if (mode === 'menu') {
        if (_get(videos, 'length')) {
          list = videos.slice()
        } else if (ids) {
          list = (await getVideoByIds({ ids })) || []
        } else if (type) {
          list = (await getVideoPageList({ type })) || []
        }
        const index = list.findIndex(e => String(e.id) === String(id))
        startIndex = Math.max(index, 0)
        currentVideo = list[startIndex]
      }
      // 无限下滑：视频id，也可以指定 type
      if (mode === 'auto') {
        currentVideo = currentVideo || (await getVideoById({ id })) || null
        list = currentVideo ? [currentVideo] : []
      }

      if (!(currentVideo && currentVideo.url)) {
        // 无视频意图时静默返回（如文章详情未打开弹层）
        const hasIntent = !!(id || type || ids || _get(videos, 'length') || _get(video, 'url'))
        if (hasIntent) {
          uni.showToast({ title: '没有视频', icon: 'none' });
        }
        return;
      }

      this.playList = list.map(item => this.withUid(item));
      this.currentIndex = startIndex;
      uni.setNavigationBarTitle({ title: currentVideo.title || '视频' });
      await this.ensureNextVideo();
    },
    getPageBgStyle (page) {
      const cover = page.near ? _get(page, 'cover') : '';
      return cover ? { '--video_play_bg': `url(${replaceCosDomainName(cover)})` } : {};
    },
    getPagePositionStyle (index) {
      return {
        top: `${index * this.pageHeight}px`,
        height: `${this.pageHeight}px`
      };
    },
    getTouchY (event) {
      const touch = _get(event, 'changedTouches.0') || _get(event, 'touches.0') || {};
      return touch.screenY || touch.pageY || 0;
    },
    /** 保证当前页后面至少还有一个视频，否则用户滑不动 */
    async ensureNextVideo () {
      const { mode, type, playList, currentIndex, isFetchingNext } = this;
      if (mode !== 'auto') return;
      if (isFetchingNext) return;
      if (currentIndex < playList.length - 1) return;

      this.isFetchingNext = true;
      try {
        const playingIds = playList.slice(-3).map(e => e.id);
        const playedIds = playList.slice(0, currentIndex).map(e => e.id);
        let newVideo = await getVideoByRandom({ type, playingIds, playedIds }).catch(() => null);
        if (!newVideo) {
          // 视频池较小时放宽排除条件，允许重复，避免下滑到底卡住
          newVideo = await getVideoByRandom({ type, playingIds }).catch(() => null);
        }
        if (newVideo && newVideo.url) {
          this.playList.push(this.withUid(newVideo));
        }
      } finally {
        this.isFetchingNext = false;
      }
    },
    onLoadedMeta (e) {
      this.duration = e?.detail?.duration || 0;
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
      if (this.hasTouchMoved) return;
      const { videoCtx, isPlaying } = this
      if (!videoCtx) return;
      if (isPlaying) {
        videoCtx.pause();
      } else {
        videoCtx.play();
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
      if (this.currentIndex <= 0) return;
      this.currentIndex -= 1;
      this.$emit('prev', this.currentVideo);
    },
    async goNextVideo () {
      await this.ensureNextVideo();
      if (this.currentIndex >= this.playList.length - 1) return;
      this.isSliding = true;
      this.touchMoveDistance = 0;
      this.currentIndex += 1;
      this.$emit('next', this.currentVideo);
      this.ensureNextVideo();
      this.finishSlide();
    },
    onTouchStart (event) {
      if (this.isSliding || this.playList.length <= 1) return;
      this.hasTouchMoved = false;
      this.touchMoveDistance = 0;
      this.touchStartY = this.getTouchY(event);
    },
    onTouchMove (event) {
      if (this.isSliding || this.playList.length <= 1 || !this.touchStartY) return;
      const distance = this.getTouchY(event) - this.touchStartY;
      this.hasTouchMoved = Math.abs(distance) > 4;
      if (this.currentIndex === 0 && distance > 0) {
        this.touchMoveDistance = distance / 3;
        return;
      }
      if (this.currentIndex === this.playList.length - 1 && distance < 0) {
        this.touchMoveDistance = distance / 3;
        return;
      }
      this.touchMoveDistance = distance;
    },
    async onTouchEnd () {
      if (this.isSliding || this.playList.length <= 1 || !this.touchStartY) return;

      const distance = this.touchMoveDistance;
      const threshold = Math.max(40, this.pageHeight * 0.08);
      this.touchStartY = 0;

      if (!this.hasTouchMoved) return;

      this.isSliding = true;

      if (Math.abs(distance) < threshold) {
        this.touchMoveDistance = 0;
        this.finishSlide();
        return;
      }

      if (distance < 0) {
        await this.slideToNext();
        return;
      }

      this.slideToPrev();
    },
    async slideToNext () {
      await this.ensureNextVideo();
      if (this.currentIndex >= this.playList.length - 1) {
        this.touchMoveDistance = 0;
        this.finishSlide();
        return;
      }
      this.touchMoveDistance = 0;
      this.currentIndex += 1;
      this.$emit('next', this.currentVideo);
      this.ensureNextVideo();
      this.finishSlide();
    },
    slideToPrev () {
      if (this.currentIndex <= 0) {
        this.touchMoveDistance = 0;
        this.finishSlide();
        return;
      }
      this.touchMoveDistance = 0;
      this.currentIndex -= 1;
      this.$emit('prev', this.currentVideo);
      this.finishSlide();
    },
    finishSlide () {
      setTimeout(() => {
        this.isSliding = false;
        this.hasTouchMoved = false;
      }, this.slideDuration);
    }
  }
};
</script>

<style lang="less">
@import './VideoPlayer.less';
</style>
