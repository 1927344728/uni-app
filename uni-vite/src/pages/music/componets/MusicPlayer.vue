<template>
  <view class="music_play_module">
    <view
      v-if="currentSong"
      class="music_play_track"
      :style="{
        height: `${swiperPages.length * wHeight}px`,
        top: `${realSwiperTop}px`
      }"
      @touchstart="ontouchstart"
      @touchmove="ontouchmove"
      @touchend="ontouchend"
    >
      <MusicPlayerItem
        v-for="(page, i) in swiperPages"
        :key="page.id"
        :index="i"
        :song="page"
        :height="wHeight"
        :lyric-lines="page.key === 'current' ? lyricLines : []"
        :active-lyric-index="activeLyricIndex"
        :current-lyric-anchor="currentLyricAnchor"
      />
    </view>

    <view class="music_play_setting">
      <view class="left"></view>
      <view class="right">
        <uni-icons type="gear" size="24" color="white" @click="onClickSetting"></uni-icons>
      </view>
    </view>

    <view class="music_play_footer">
      <view class="music_play_progress">
        <text class="music_play_time">{{ formatTime(currentTime) }}</text>
        <slider
          class="music_play_slider"
          min="0"
          :max="Math.floor(duration) || 1"
          :value="Math.floor(currentTime)"
          step="1"
          block-size="16"
          :disabled="!duration"
          @changing="handleSliderChanging"
          @change="handleSliderChange"
        />
        <text class="music_play_time">{{ formatTime(duration) }}</text>
      </view>

      <view class="music_play_controls">
        <view
          class="music_btn"
          :class="{ disabled: !canGoPrev }"
          @click="handlePrev"
        >
          <text>上一曲</text>
        </view>
        <view class="music_play_play_btn" @click="togglePlay">
          <text class="iconfont">
            {{isPlaying ? '&#xe608;' : '&#xe609;'}}
          </text>
        </view>
        <view
          class="music_btn"
          :class="{ disabled: !canGoNext }"
          @click="handleNext"
        >
          <text>下一曲</text>
        </view>
      </view>
    </view>

    <UniPopup
      mode="bottom"
      ref="uniPopup"
      class="music_play_setting_popup"
      :style="{ zIndex: 100, height: '40vh' }"
      @close="$refs.uniPopup.close()"
    >
      <view class="wrapper">
        <view class="item">
          <view class="title">定时关闭</view>
          <view class="pills">
            <view
              class="pill"
              v-for="m in [0, 10, 20, 30, 60, 90]"
              :key="m"
              :class="{
                active: durationMinutes === m
              }"
              @click="onClickMinute(m)"
            >
              {{m === 0 ? '关闭' : m}}
            </view>
          </view>
        </view>
      </view>
    </UniPopup>
  </view>
</template>

<script>
import { get as _get } from 'lodash';
import { unlockAudio, adoptUnlockedAudio, clearUnlockedAudio, playInnerAudio } from '@/utils/audioUnlock.js';
import { getMusicById, getMusicByIds, getMusicPageList, getMusicByRandom } from '@/api/music.js';
import { parseLyric, formatTime } from './MusicPlayer.js';
import MusicPlayerItem from './MusicPlayerItem.vue';
import UniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';

let startTime = 0;
let endTime = 0;
let startPageY = 0;
let endPageY = 0;

export default {
  name: 'MusicPlayer',
  components: {
    MusicPlayerItem,
    UniPopup
  },
  emits: ['play', 'pause', 'next', 'prev', 'ended', 'error'],
  props: {
    mode: {
      type: String,
      default: 'auto'
    },
    id: [String, Number],
    ids: [String, Array],
    type: [String, Number],
    song: [Object, String],
    songs: Array
  },
  data () {
    return {
      wWidth: 1,
      wHeight: 1,

      allMusicList: [],
      playedIds: [],
      currentSong: null,
      prevSong: null,
      nextSong: null,
      audioCtx: null,
      nextSongFetchPromise: null,
      // auto 模式下：预取队列（替代 setInterval 兜底）
      prefetchCount: 10,
      upcomingSongs: [],
      prefetchPromise: null,
      prefetchTargetCount: 0,

      // 省电策略引导（24h 最多弹一次）
      batteryGuideLastShownAt: 0,
      isSwitching: false,
      isSliding: false,
      swiperTop: 0,
      realSwiperTop: 0,
      slideTimer: null,

      isPlaying: false,
      isSeeking: false,
      autoplayBlocked: false,
      duration: 0,
      currentTime: 0,
      lyricLines: [],
      activeLyricIndex: 0,
      currentLyricAnchor: '',
      durationMinutes: 0
    };
  },
  computed: {
    swiperPages () {
      const { prevSong, currentSong, nextSong } = this;
      const pages = [];
      if (prevSong) {
        pages.push({
          ...prevSong,
          key: 'prev'
        });
      }
      if (currentSong) {
        pages.push({
          ...currentSong,
          key: 'current'
        });
      }
      if (nextSong) {
        pages.push({
          ...nextSong,
          key: 'next'
        });
      }
      return pages;
    },
    currentIndex () {
      return this.prevSong ? 1 : 0;
    },
    canGoPrev () {
      return !!this.prevSong;
    },
    canGoNext () {
      return !!this.nextSong;
    }
  },
  async mounted () {
    // 先起播，避免额外 await 拉长与列表点击手势的间隔（对齐改前逻辑）
    this.initViewport();
    await this.init();
  },
  unmounted () {
    this.clearSlideTimer();
    clearUnlockedAudio();
    if (this.audioCtx) {
      this.audioCtx.destroy();
      this.audioCtx = null;
    }
  },
  methods: {
    formatTime,
    initViewport () {
      try {
        const res = uni.getSystemInfoSync();
        this.wWidth = res.windowWidth || 1;
        this.wHeight = res.windowHeight || 1;
      } catch (e) {}
      this.$nextTick(() => {
        uni.createSelectorQuery()
          .in(this)
          .select('.music_play_module')
          .boundingClientRect((rect) => {
            if (rect && rect.height) {
              this.wWidth = rect.width || this.wWidth;
              this.wHeight = rect.height;
              this.syncSlidePosition();
            }
          })
          .exec();
      });
    },
    syncSlidePosition () {
      this.swiperTop = -this.wHeight * this.currentIndex;
      this.realSwiperTop = this.swiperTop;
    },
    clearSlideTimer () {
      if (this.slideTimer) {
        clearInterval(this.slideTimer);
        this.slideTimer = null;
      }
    },
    animateTo (targetTop) {
      return new Promise((resolve) => {
        this.clearSlideTimer();
        const goingUp = targetTop < this.realSwiperTop;
        let s = 15;
        let ss = 20;
        this.slideTimer = setInterval(() => {
          if (goingUp) {
            this.realSwiperTop = this.realSwiperTop - ss;
            if (this.realSwiperTop < targetTop + 10) {
              this.realSwiperTop = targetTop;
              this.clearSlideTimer();
              resolve();
            }
          } else {
            this.realSwiperTop = this.realSwiperTop + ss;
            if (this.realSwiperTop > targetTop - 10) {
              this.realSwiperTop = targetTop;
              this.clearSlideTimer();
              resolve();
            }
          }
          s = Math.max(--s, 3);
          ss = Math.min(++ss, 35);
        }, s);
      });
    },
    resetSlidePosition () {
      this.realSwiperTop = this.swiperTop;
      this.isSliding = false;
    },
    getBatteryGuideStorageKey () {
      return 'music_player:battery_guide_last_shown_at';
    },
    loadBatteryGuideLastShownAt () {
      try {
        const v = uni.getStorageSync(this.getBatteryGuideStorageKey());
        return Number(v) || 0;
      } catch (e) {
        return 0;
      }
    },
    saveBatteryGuideLastShownAt (ts) {
      try {
        uni.setStorageSync(this.getBatteryGuideStorageKey(), ts);
      } catch (e) {}
    },
    openAppDetailSettings () {
      try {
        // #ifdef APP-PLUS
        if (!plus || !plus.os || plus.os.name !== 'Android') return false;
        const main = plus.android.runtimeMainActivity();
        const Intent = plus.android.importClass('android.content.Intent');
        const Uri = plus.android.importClass('android.net.Uri');
        const intent = new Intent('android.settings.APPLICATION_DETAILS_SETTINGS');
        intent.setData(Uri.parse('package:' + main.getPackageName()));
        main.startActivity(intent);
        return true;
        // #endif
      } catch (e) {
        return false;
      }
      return false;
    },
    maybeShowBatteryGuide () {
      // 仅 Android App 才需要/才有效（不要用 APP-ANDROID 宏，部分构建链路可能不生效）
      // #ifdef APP-PLUS
      if (!plus || !plus.os || plus.os.name !== 'Android') return;
      // #endif
      // #ifndef APP-PLUS
      return;
      // #endif
      if (this.mode !== 'auto') return;

      const now = Date.now();
      const last = this.batteryGuideLastShownAt || this.loadBatteryGuideLastShownAt();
      const oneDay = 24 * 60 * 60 * 1000;
      if (last && now - last < oneDay) return;

      this.batteryGuideLastShownAt = now;
      this.saveBatteryGuideLastShownAt(now);

      uni.showModal({
        title: '为保证锁屏连续播放',
        content:
          '系统省电策略可能限制后台联网/自动切歌，导致锁屏后播放中断。\n' +
          '建议将本应用的电池策略设置为「无限制」。\n\n' +
          '路径一般在：应用信息 → 电池/省电策略/后台运行 → 选择「无限制」。',
        confirmText: '去设置',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            const ok = this.openAppDetailSettings();
            if (!ok) {
              uni.showToast({
                title: '无法打开设置页，请到系统设置中手动设置',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    getAutoPlayingIds () {
      const { prevSong, currentSong, upcomingSongs } = this;
      const ids = [];
      if (prevSong?.id) ids.push(prevSong.id);
      if (currentSong?.id) ids.push(currentSong.id);
      if (Array.isArray(upcomingSongs)) {
        upcomingSongs.forEach(s => s?.id && ids.push(s.id));
      }
      return ids;
    },
    async fetchOneAutoNextSong () {
      const { type, playedIds } = this;
      const playingIds = this.getAutoPlayingIds();
      const newSong = await getMusicByRandom({
        type,
        playingIds,
        playedIds
      }).catch(() => null);

      if (!newSong || !newSong.url) return null;

      if (Array.isArray(this.allMusicList)) {
        this.allMusicList.push(newSong);
      } else if (this.currentSong) {
        this.allMusicList = [this.currentSong, newSong];
      }
      return newSong;
    },
    async prefetchAutoSongs (targetCount = this.prefetchCount) {
      if (this.mode !== 'auto') return;
      const wanted = Math.max(0, Number(targetCount) || 0);
      if (wanted === 0) return;

      if (this.prefetchPromise) {
        this.prefetchTargetCount = Math.max(this.prefetchTargetCount, wanted);
        return this.prefetchPromise;
      }

      this.prefetchTargetCount = wanted;
      this.prefetchPromise = (async () => {
        while (this.upcomingSongs.length < this.prefetchTargetCount) {
          const song = await this.fetchOneAutoNextSong();
          if (!song) break;
          this.upcomingSongs.push(song);
          this.nextSong = this.upcomingSongs[0] || null;
        }
      })();

      try {
        await this.prefetchPromise;
      } finally {
        this.prefetchPromise = null;
      }
    },
    async init () {
      let { mode, id, ids, type, song, songs } = this;

      let currentSong = null;
      let allMusicList = [];
      let playedIds = [];

      if (song && typeof song === 'string') {
        try {
          currentSong = JSON.parse(decodeURIComponent(song));
        } catch (e) {}
      } else {
        currentSong = song;
      }
      if (ids && typeof ids === 'string') {
        try {
          ids = JSON.parse(decodeURIComponent(ids));
        } catch (e) {}
      }

      // 单音频播放：传音频 id 或者完整音频对象
      if (mode === 'single') {
        currentSong = currentSong || (await getMusicById({id})) || null;
        allMusicList = currentSong ? [currentSong] : null;
      }
      // 音频列表播放：传音频类型id，或者完整音频列表
      if (mode === 'menu') {
        if (_get(songs, 'length')) {
          allMusicList = songs;
        } else if (ids) {
          allMusicList = await getMusicByIds({ids});
        } else if (type) {
          allMusicList = await getMusicPageList({type});
        }
        const currentIndex = allMusicList.findIndex(e => String(e.id) === String(id));
        currentSong = allMusicList[Math.max(currentIndex, 0)];
        playedIds = allMusicList.map(e => e.id).filter((id, i) => i < currentIndex);
      }
      // 无限下滑：音频id，也可以指定 type
      if (mode === 'auto') {
        let pending = null;
        try {
          pending = uni.getStorageSync('__music_unlock_song__');
          uni.removeStorageSync('__music_unlock_song__');
        } catch (e) {}
        // 优先用列表点击缓存，尽快接管手势内已起播的 Audio
        if (pending && String(pending.id) === String(id) && pending.url) {
          currentSong = pending;
          getMusicById({ id }).then((full) => {
            if (!full || !this.currentSong) return;
            if (String(full.id) !== String(this.currentSong.id)) return;
            this.currentSong = Object.assign({}, this.currentSong, full);
            parseLyric(full.lyric).then((lines) => {
              this.lyricLines = lines || [];
            }).catch(() => {});
          }).catch(() => {});
        } else {
          currentSong = currentSong || (await getMusicById({id})) || null;
        }
        allMusicList = currentSong ? [currentSong] : null;
      }

      if (!currentSong || !currentSong.url) {
        uni.showToast({
          title: '未找到播放歌曲',
          icon: 'none'
        });
        return;
      }
      this.playedIds = [];
      this.allMusicList = allMusicList;
      this.prevSong = null;
      this.currentSong = currentSong;
      this.batteryGuideLastShownAt = this.loadBatteryGuideLastShownAt();

      // 先起播/接管，再异步预取下一首（避免 await 预取拖死首播）
      this.syncSlidePosition();
      this.createAudio();

      if (mode === 'auto') {
        this.upcomingSongs = [];
        this.prefetchAutoSongs(1).then(() => {
          this.nextSong = this.upcomingSongs[0] || null;
        }).catch(() => {});
        this.prefetchAutoSongs(this.prefetchCount).catch(() => {});
      } else {
        this.getNextSong().then((s) => {
          this.nextSong = s;
        }).catch(() => {});
      }
    },
    getPrevSong () {
      const { mode, allMusicList, playedIds } = this;
      let prevSong = null;
      if (['auto', 'menu'].includes(mode)) {
        if (playedIds.length > 0) {
          const prevId = playedIds[playedIds.length - 1];
          prevSong = allMusicList.find(song => song.id === prevId) || null;
        }
      }
      return prevSong;
    },
    async getNextSong () {
      const { mode, type, playedIds, currentSong, swiperPages, allMusicList } = this;
      const currentId = _get(currentSong, 'id');
      const allMusicLength = _get(allMusicList, 'length') || 0;

      // 无限下滑：单次拉取下一首，避免息屏时 sleep/setTimeout 被节流导致阻塞。
      if (['auto'].includes(mode)) {
        if (this.nextSongFetchPromise) {
          return await this.nextSongFetchPromise;
        }

        const playingIds = swiperPages.map(e => e.id);
        this.nextSongFetchPromise = (async () => {
          const newSong = await getMusicByRandom({
            type,
            playingIds,
            playedIds
          }).catch(() => null);

          // 后端偶发返回空/异常数据：返回 null，交由上层兜底重试。
          if (!newSong || !newSong.url) return null;

          if (Array.isArray(this.allMusicList)) {
            this.allMusicList.push(newSong);
          } else if (this.currentSong) {
            this.allMusicList = [this.currentSong, newSong];
          }
          return newSong;
        })();

        const res = await this.nextSongFetchPromise;
        this.nextSongFetchPromise = null;
        return res;
      }

      // 音频列表播放：循环下一首
      if (['menu'].includes(mode) && allMusicLength > 1) {
        const index = allMusicList.findIndex(song => song.id === currentId);
        if (index !== -1) {
          const nextIndex = (index + 1) % allMusicLength;
          if (nextIndex !== index) {
            return allMusicList[nextIndex];
          }
        }
      }

      return null;
    },
    createAudio () {
      if (this.audioCtx) {
        this.audioCtx.destroy();
        this.audioCtx = null;
      }

      // H5：优先接管列表点击手势内已 play 过的同一 Audio 实例
      const reused = adoptUnlockedAudio();
      const ctx = reused || uni.createInnerAudioContext();
      try {
        ctx.obeyMuteSwitch = false;
      } catch (e) {
        // obeyMuteSwitch 在某些版本中可能是只读属性，忽略设置错误
      }
      ctx.autoplay = false;
      ctx.onCanplay(() => {
        setTimeout(() => {
          this.duration = ctx.duration || this.duration;
        }, 120);
      });
      ctx.onPlay(() => {
        this.isPlaying = true;
        this.autoplayBlocked = false;
        this.$emit('play', this.currentSong);
      });
      ctx.onPause(() => {
        this.isPlaying = false;
        this.$emit('pause', this.currentSong);
      });
      ctx.onStop(() => {
        this.isPlaying = false;
        this.currentTime = 0;
      });
      ctx.onEnded(async () => {
        this.$emit('ended', this.currentSong);
        // 播完切歌先切数据并 play，避免 H5 因动画/await 丢失连续播放权限
        await this.goNextSong({ animate: false });
      });
      ctx.onError(err => {
        uni.showToast({
          title: err?.errMsg || '播放失败',
          icon: 'none'
        });
        console.error(err);
        this.$emit('error', err);
        // auto 模式下：当前曲播放失败时自动跳到下一首继续
        if (this.mode === 'auto') {
          this.goNextSong({ animate: false });
        }
      });
      ctx.onTimeUpdate(() => {
        if (this.isSeeking) return;
        this.currentTime = ctx.currentTime;
        if (!this.duration) {
          this.duration = ctx.duration || 0;
        }
        this.updateLyricByTime(ctx.currentTime);
      });
      this.audioCtx = ctx;
      this.loadCurrentSong({ reuse: !!reused });
    },
    playAudio () {
      if (!this.audioCtx) return;
      try {
        playInnerAudio(this.audioCtx);
      } catch (err) {
        this.isPlaying = false;
        this.autoplayBlocked = true;
      }
    },
    async loadCurrentSong ({ reuse = false } = {}) {
      const { lyric, url, title } = this.currentSong;
      this.activeLyricIndex = 0;
      this.currentLyricAnchor = '';

      if (reuse) {
        // 同一 Audio 实例已在手势内解锁，勿 stop() 打断
        const needRetarget = this.audioCtx.src !== url;
        if (needRetarget) {
          this.audioCtx.src = url;
        }
        this.currentTime = this.audioCtx.currentTime || 0;
        this.duration = this.audioCtx.duration || 0;
        this.isPlaying = true;
        this.autoplayBlocked = false;
        const audio = this.audioCtx._audio;
        const alreadyPlaying = !!(audio && !audio.paused);
        if (needRetarget || !alreadyPlaying) {
          this.playAudio();
        }
      } else {
        this.currentTime = 0;
        this.duration = 0;
        this.audioCtx.stop();
        this.audioCtx.src = url;
        this.audioCtx.seek(0);
        this.playAudio();
      }

      uni.setNavigationBarTitle({
        title: title || '音乐'
      });
      this.lyricLines = await parseLyric(lyric).catch((error) => {
        console.error(error);
        return [];
      });
    },
    updateLyricByTime (time) {
      const { lyricLines, activeLyricIndex } = this;
      let index = 0;
      if (lyricLines.length) {
        index = lyricLines.findIndex((line, idx) => {
          const next = lyricLines[idx + 1];
          if (!next) {
            return time >= line.time;
          }
          return time >= line.time && time < next.time;
        });
        index = Math.max(0, index);
      }
      if (index !== activeLyricIndex) {
        this.activeLyricIndex = index;
        this.currentLyricAnchor = `lyric-${index > 1 ? index - 1 : 0}`;
      }
    },
    togglePlay () {
      if (!this.audioCtx) return;
      if (this.isPlaying) {
        this.audioCtx.pause();
      } else {
        this.autoplayBlocked = false;
        unlockAudio();
        this.playAudio();
      }
    },
    handleSliderChanging (e) {
      this.isSeeking = true;
      this.currentTime = e.detail.value;
    },
    handleSliderChange (e) {
      if (!this.audioCtx) return;
      const value = e.detail.value;
      this.audioCtx.seek(value);
      if (!this.isPlaying) {
        this.playAudio();
      }
      this.isSeeking = false;
    },

    handlePrev () {
      if (this.canGoPrev) {
        this.goPrevSong({ animate: true });
      }
    },
    handleNext () {
      if (this.canGoNext) {
        this.goNextSong({ animate: true });
      }
    },
    ontouchstart (e) {
      // H5：首次用户手势解锁音频自动播放限制
      if (this.autoplayBlocked && this.audioCtx) {
        this.autoplayBlocked = false;
        this.playAudio();
      }

      if (this.isSliding || this.isSwitching) return;
      if (this.swiperPages.length <= 1) return;

      const timestamp = e.timeStamp || e.timestamp || Date.now();
      if ((timestamp - startTime) >= 500) {
        startPageY = e.changedTouches[0].screenY || e.changedTouches[0].pageY || 0;
      }
      endTime = startTime;
      startTime = timestamp;
    },
    ontouchmove (e) {
      const isIgnoreEvent = startTime - endTime < 500;
      if (isIgnoreEvent) return;
      if (this.isSliding || this.isSwitching) return;
      if (this.swiperPages.length <= 1) return;

      endPageY = e.changedTouches[0].screenY || e.changedTouches[0].pageY || 0;
      const distance = endPageY - startPageY;
      const { currentIndex, swiperPages, swiperTop } = this;
      if (currentIndex === 0 && distance > 50) {
        this.realSwiperTop = 50;
      } else if (currentIndex === swiperPages.length - 1 && distance < 0) {
        this.realSwiperTop = swiperTop;
      } else {
        this.realSwiperTop = swiperTop + distance;
      }
    },
    async ontouchend (e) {
      const isIgnoreEvent = startTime - endTime < 500;
      if (isIgnoreEvent) return;
      if (this.isSliding || this.isSwitching) return;
      if (this.swiperPages.length <= 1) return;

      endPageY = e.changedTouches[0].screenY || e.changedTouches[0].pageY || 0;
      const distance = endPageY - startPageY;

      if (Math.abs(distance) <= 40) {
        this.resetSlidePosition();
        return;
      }

      // 上滑 → 下一首
      if (distance < -30) {
        if (!this.canGoNext) {
          this.resetSlidePosition();
          return;
        }
        await this.slidingToNext();
        return;
      }

      // 下滑 → 上一首
      if (distance > 30) {
        if (!this.canGoPrev) {
          this.resetSlidePosition();
          return;
        }
        await this.slidingToPrev();
        return;
      }

      this.resetSlidePosition();
    },
    async slidingToNext () {
      this.isSliding = true;
      this.isSwitching = true;
      try {
        if (!this.nextSong && !this.canGoNext) {
          this.resetSlidePosition();
          return;
        }
        const targetTop = this.swiperTop - this.wHeight;
        await this.animateTo(targetTop);

        // 动画结束后：同步提交窗口 + 立刻复位 top，避免 await 期间按错误位置渲染一帧
        const ok = this.commitNextSongSync();
        if (!ok) {
          this.resetSlidePosition();
          return;
        }
        this.syncSlidePosition();

        await this.loadCurrentSong();
        this.$emit('next', this.currentSong);

        if (this.mode === 'auto') {
          this.prefetchAutoSongs(this.prefetchCount).catch(() => {});
        } else if (!this.nextSong) {
          this.nextSong = await this.getNextSong().catch(() => null);
        }
      } finally {
        this.isSwitching = false;
        this.isSliding = false;
      }
    },
    async slidingToPrev () {
      this.isSliding = true;
      this.isSwitching = true;
      try {
        if (!this.prevSong) {
          this.resetSlidePosition();
          return;
        }
        const targetTop = this.swiperTop + this.wHeight;
        await this.animateTo(targetTop);

        this.commitPrevSongSync();
        this.syncSlidePosition();

        await this.loadCurrentSong();
        this.$emit('prev', this.currentSong);
      } finally {
        this.isSwitching = false;
        this.isSliding = false;
      }
    },
    /** 同步切换到上一首窗口（不加载音频） */
    commitPrevSongSync () {
      const { prevSong, currentSong } = this;
      if (!prevSong) return false;
      this.playedIds.pop();
      this.currentSong = prevSong;
      this.prevSong = this.getPrevSong();
      this.nextSong = currentSong;
      this.lyricLines = [];
      this.activeLyricIndex = 0;
      this.currentLyricAnchor = '';
      this.currentTime = 0;
      this.duration = 0;
      return true;
    },
    /**
     * 同步切换到下一首窗口（不加载音频、不 await）
     * 依赖 this.nextSong / upcomingSongs 已就绪
     */
    commitNextSongSync () {
      const { currentSong } = this;
      let nextSong = null;

      if (this.mode === 'auto') {
        if (Array.isArray(this.upcomingSongs) && this.upcomingSongs.length > 0) {
          nextSong = this.upcomingSongs.shift();
        } else {
          nextSong = this.nextSong;
        }
        if (!nextSong) {
          this.maybeShowBatteryGuide();
          return false;
        }
        this.playedIds.push(_get(currentSong, 'id'));
        this.prevSong = currentSong;
        this.currentSong = nextSong;
        this.nextSong = this.upcomingSongs[0] || null;
      } else {
        nextSong = this.nextSong;
        if (!nextSong) return false;
        this.playedIds.push(_get(currentSong, 'id'));
        this.prevSong = currentSong;
        this.currentSong = nextSong;
        this.nextSong = null;
      }

      // 清掉上一首歌词，避免短暂显示在新 current 上
      this.lyricLines = [];
      this.activeLyricIndex = 0;
      this.currentLyricAnchor = '';
      this.currentTime = 0;
      this.duration = 0;
      return true;
    },
    applyPrevSong () {
      if (!this.commitPrevSongSync()) return;
      this.loadCurrentSong();
      this.$emit('prev', this.currentSong);
    },
    goPrevSong ({ animate = false } = {}) {
      const { audioCtx, prevSong } = this;
      if (!audioCtx || !prevSong) return;
      if (this.isSwitching || this.isSliding) return;

      if (animate) {
        this.slidingToPrev();
        return;
      }
      this.applyPrevSong();
      this.syncSlidePosition();
    },
    async applyNextSong () {
      const { audioCtx } = this;
      if (!audioCtx) return false;
      if (this.isSwitching) return false;

      this.isSwitching = true;
      try {
        // 无动画切歌：若还没有 next，先补齐（可 await）
        if (!this.nextSong) {
          if (this.mode === 'auto') {
            if (Array.isArray(this.upcomingSongs) && this.upcomingSongs.length > 0) {
              this.nextSong = this.upcomingSongs[0];
            } else {
              const song = await this.fetchOneAutoNextSong().catch(() => null);
              if (song) {
                this.upcomingSongs.push(song);
                this.nextSong = song;
              }
            }
          } else {
            this.nextSong = await this.getNextSong().catch(() => null);
          }
        }

        if (!this.nextSong) {
          if (this.mode === 'auto') {
            this.maybeShowBatteryGuide();
          } else {
            uni.showToast({
              title: '未加载下一歌曲，将稍后重试',
              icon: 'none'
            });
          }
          return false;
        }

        const ok = this.commitNextSongSync();
        if (!ok) return false;
        this.syncSlidePosition();

        await this.loadCurrentSong();
        this.$emit('next', this.currentSong);

        if (this.mode === 'auto') {
          this.prefetchAutoSongs(this.prefetchCount).catch(() => {});
        } else if (!this.nextSong) {
          this.nextSong = await this.getNextSong().catch(() => null);
          if (!this.nextSong) {
            uni.showToast({
              title: '下一首暂时不可用，播放将继续',
              icon: 'none'
            });
          }
        }
        return true;
      } finally {
        this.isSwitching = false;
      }
    },
    async goNextSong ({ animate = false } = {}) {
      const { audioCtx } = this;
      if (!audioCtx) return;
      if (this.isSwitching || this.isSliding) return;

      // 确保有下一首可读（用于动画前渲染 next 页）
      if (!this.nextSong) {
        if (this.mode === 'auto') {
          if (Array.isArray(this.upcomingSongs) && this.upcomingSongs.length > 0) {
            this.nextSong = this.upcomingSongs[0];
          } else {
            const song = await this.fetchOneAutoNextSong().catch(() => null);
            if (song) {
              this.upcomingSongs.push(song);
              this.nextSong = song;
            }
          }
        } else {
          this.nextSong = await this.getNextSong().catch(() => null);
        }
      }

      if (!this.nextSong) {
        if (this.mode === 'auto') {
          this.maybeShowBatteryGuide();
        }
        this.resetSlidePosition();
        return;
      }

      if (animate) {
        // 等 next 页渲染进 DOM 后再滑动，避免界面与数据错位
        await this.$nextTick();
        await this.slidingToNext();
        return;
      }

      const ok = await this.applyNextSong();
      if (ok) {
        this.syncSlidePosition();
      } else {
        this.resetSlidePosition();
      }
    },
    onClickSetting () {
      this.$refs.uniPopup.open();
    },
    onClickMinute (m) {
      const self = this;
      self.durationMinutes = m;
      if (self.audioCtx) {
        self.playAudio();
      }
      if (self.durationMinutes) {
        setTimeout(() => {
          if (self.audioCtx) {
            self.audioCtx.pause();
          }
          self.durationMinutes = 0;
        }, self.durationMinutes * 60 * 1000);
      }
      this.$refs.uniPopup.close();
    }
  }
};
</script>

<style lang="less">
@import './MusicPlayer.less';
</style>
