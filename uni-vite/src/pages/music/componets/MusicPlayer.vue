<template>
  <view class="music_play_module">
    <swiper
      class="music_play_swiper"
      :current="swiperCurrent"
      :duration="swiperDuration"
      :circular="false"
      vertical
      @change="onChange"
    >
      <swiper-item v-for="page in swiperPages" :key="page.id" >
        <view
          v-if="page"
          class="music_play_swiper_item"
          :class="[`music_play_swiper_item--${page.key}`, `music_play_switch--${page.key}`]"
          :style="getPageBgStyle(page)"
        >
          <image
            v-if="page.cover"
            class="music_play_bg"
            :src="scaleImageWidthInCOS(page.cover)"
            mode="aspectFill"
          />
          <view class="music_play_blur_mask"></view>

          <view class="music_play_content">
            <view
              class="music_play_cover_wrapper"
              :style="{
                backgroundImage: `url('${scaleImageWidthInCOS(page.cover)}')`
              }"
            />

            <view class="music_play_titles">
              <text class="music_play_song">
                {{ page.title || '' }}
              </text>
              <text class="music_play_artist">
                {{ page.singer || '未知歌手' }}
              </text>
            </view>

            <block v-if="page.key === 'current'">
              <view class="music_play_lyric" v-if="lyricLines.length">
                <scroll-view
                  class="music_lyric_scroll"
                  scroll-y
                  :scroll-with-animation="true"
                  :scroll-into-view="currentLyricAnchor"
                >
                  <view
                    v-for="(line, idx2) in lyricLines"
                    :key="`lyric-${idx2}-${line.time}`"
                    class="music_lyric_line"
                    :id="`lyric-${idx2}`"
                    :class="{ active: idx2 === activeLyricIndex }"
                  >
                    {{ line.text }}
                  </view>
                </scroll-view>
              </view>
              <view class="music_play_lyric music_play_lyric_empty" v-else>
                <text>暂无歌词</text>
              </view>
            </block>

            <block v-else>
              <view class="music_play_hint">
                <text>{{ page.key === 'prev' ? '下滑返回当前歌曲' : page.key === 'next' ? '上滑切换到下一首' : '' }}</text>
              </view>
            </block>
          </view>
        </view>
      </swiper-item>
    </swiper>

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
import { scaleImageWidthInCOS } from '@/utils/common.js'
import { getMusicById, getMusicByIds, getMusicPageList, getMusicByRandom } from '@/api/music.js';
import { parseLyric, formatTime } from './MusicPlayer.js';
import UniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';
export default {
  name: 'MusicPlayer',
  components: {
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
      // swiper 受控索引 & 程序性 change 屏蔽
      swiperCurrent: 0,
      suppressSwiperChange: false,
      suppressSwiperChangeTimer: null,
      isPlaying: false,
      isSeeking: false,
      swiperDuration: 320,
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
        pages.push(Object.assign(prevSong, {
          key: 'prev',
        }));
      }
      if (currentSong) {
        pages.push(Object.assign(currentSong, {
          key: 'current'
        }));
      }
      if (nextSong) {
        pages.push(Object.assign(nextSong, {
          key: 'next',
        }));
      }
      // console.log(pages.map(e => e.title))
      return pages;
    },
    currentIndex () {
      const index = this.prevSong ? 1 : 0
      return index
    },
    canGoPrev () {
      return !!this.prevSong;;
    },
    canGoNext () {
      return !!this.nextSong;
    }
  },
  async mounted () {
    await this.init();
  },
  unmounted () {
    if (this.audioCtx) {
      this.audioCtx.destroy();
      this.audioCtx = null;
    }
  },
  methods: {
    formatTime,
    scaleImageWidthInCOS,
    syncSwiperCurrent () {
      this.swiperCurrent = this.prevSong ? 1 : 0;
    },
    withSuppressedSwiperChange (fn) {
      this.suppressSwiperChange = true;
      if (this.suppressSwiperChangeTimer) {
        clearTimeout(this.suppressSwiperChangeTimer);
        this.suppressSwiperChangeTimer = null;
      }
      try {
        fn();
      } finally {
        // 受控 :current 会在后续若干帧触发 change，这里覆盖整个动画时长
        const holdMs = Math.max(0, Number(this.swiperDuration) || 0) + 80;
        this.suppressSwiperChangeTimer = setTimeout(() => {
          this.suppressSwiperChange = false;
          this.suppressSwiperChangeTimer = null;
        }, holdMs);
      }
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

      let currentSong = null
      let allMusicList = []
      let playedIds = []
      
      if (song && typeof song === 'string') {
        try {
          currentSong = JSON.parse(decodeURIComponent(song))
        } catch (e) {}
      } else {
        currentSong = song
      }
      if (ids && typeof ids === 'string') {
        try {
          ids = JSON.parse(decodeURIComponent(ids))
        } catch (e) {}
      }

      // 单音频播放：传音频 id 或者完整音频对象
      if (mode === 'single') {
        currentSong = currentSong || (await getMusicById({id})) || null
        allMusicList = currentSong ? [currentSong] : null
      }
      // 音频列表播放：传音频类型id，或者完整音频列表
      if (mode === 'menu') {
        if (_get(songs, 'length')) {
          allMusicList = songs
        } else if (ids) {
          allMusicList = await getMusicByIds({ids})
        } else if (type) {
          allMusicList = await getMusicPageList({type})
        }
        const currentIndex = allMusicList.findIndex(e => String(e.id) === String(id))
        currentSong = allMusicList[Math.max(currentIndex, 0)]
        playedIds = allMusicList.map(e => e.id).filter((id, i) => i < currentIndex)
      }
      // 无限下滑：音频id，也可以指定 type
      if (mode === 'auto') {
        currentSong = currentSong || (await getMusicById({id})) || null
        allMusicList = currentSong ? [currentSong] : null
      }

      if (!currentSong || !currentSong.url) {
        uni.showToast({
          title: '未找到播放歌曲',
          icon: 'none'
        });
        return;
      }
      this.playedIds = [];
      this.allMusicList = allMusicList
      this.prevSong = null;
      this.currentSong = currentSong;
      this.batteryGuideLastShownAt = this.loadBatteryGuideLastShownAt();

      if (mode === 'auto') {
        this.upcomingSongs = [];
        await this.prefetchAutoSongs(1).catch(() => {});
        this.nextSong = this.upcomingSongs[0] || null;
      } else {
        this.nextSong = await this.getNextSong()
      }
      this.syncSwiperCurrent();
      this.createAudio();
      if (mode === 'auto') {
        this.prefetchAutoSongs(this.prefetchCount).catch(() => {});
      }
    },
    getPageBgStyle (song) {
      const _cover = _get(song, 'cover');
      return _cover ? { '--music_play_bg': `url(${_cover})` } : {};
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
      return prevSong
    },
    async getNextSong () {
      const { mode, type, playedIds, currentSong, swiperPages, allMusicList } = this;
      const currentId = _get(currentSong, 'id');
      const allMusicLength = _get(allMusicList, 'length') || 0;

      // 无限下滑：单次拉取下一首，避免息屏时 sleep/setTimeout 被节流导致阻塞。
      // “需要切歌但 nextSong 为空/拉取失败”的兜底由 goNextSong 的 setInterval 完成。
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
      }
      const ctx = uni.createInnerAudioContext();
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
        await this.goNextSong();
      });
      ctx.onError(err => {
        uni.showToast({
          title: err?.errMsg || '播放失败',
          icon: 'none'
        });
        console.error(err)
        this.$emit('error', err);
        // auto 模式下：当前曲播放失败时自动跳到下一首继续
        if (this.mode === 'auto') {
          this.goNextSong();
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
      this.loadCurrentSong();
    },
    async loadCurrentSong () {
      const { lyric, url, title } = this.currentSong;
      this.currentTime = 0;
      this.duration = 0;
      this.activeLyricIndex = 0;
      this.currentLyricAnchor = '';
      this.audioCtx.stop();
      this.audioCtx.src = url;
      this.audioCtx.seek(0);
      this.audioCtx.play();
      uni.setNavigationBarTitle({
        title: title || '音乐'
      })
      this.lyricLines = await parseLyric(lyric).catch((error) => {
        console.error(error)
      });
    },
    updateLyricByTime (time) {
      const { lyricLines, activeLyricIndex } = this;
      let index = 0
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
        this.audioCtx.play();
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
        this.audioCtx.play();
      }
      this.isSeeking = false;
    },

    handlePrev () {
      if (this.canGoPrev) {
        this.goPrevSong();
        this.$emit('prev', this.currentSong);
      }
    },
    handleNext () {
      if (this.canGoNext) {
        this.goNextSong();
        this.$emit('next', this.currentSong);
      }
    },
    goPrevSong () {
      const { audioCtx, prevSong, currentSong } = this;
      if (!audioCtx) {
        return
      };
      if (prevSong) {
        this.withSuppressedSwiperChange(() => {
          this.playedIds.pop();
          this.currentSong = prevSong
          this.prevSong = this.getPrevSong()
          this.nextSong = currentSong
          this.syncSwiperCurrent();
        });
        this.loadCurrentSong();
      }
      this.$emit('prev', this.currentSong);
    },
    async goNextSong () {
      const { audioCtx, currentSong } = this;
      if (!audioCtx) return;
      if (this.isSwitching) return;

      this.isSwitching = true;
      try {
        // auto 模式：优先消费预取队列，不依赖 setInterval 兜底
        if (this.mode === 'auto') {
          let nextSong = null;

          if (Array.isArray(this.upcomingSongs) && this.upcomingSongs.length > 0) {
            nextSong = this.upcomingSongs.shift();
          } else {
            nextSong = await this.fetchOneAutoNextSong().catch(() => null);
          }

          if (!nextSong) {
            this.maybeShowBatteryGuide();
            return;
          }

          const currentId = _get(currentSong, 'id');
          this.playedIds.push(currentId);

          this.withSuppressedSwiperChange(() => {
            this.prevSong = currentSong;
            this.currentSong = nextSong;
            this.nextSong = this.upcomingSongs[0] || null;
            this.syncSwiperCurrent();
          });

          // 不阻塞切歌：异步补齐队列到 N 首
          this.prefetchAutoSongs(this.prefetchCount).catch(() => {});

          await this.loadCurrentSong();
          this.$emit('next', this.currentSong);
          return;
        }

        // 非 auto 模式：保持原先逻辑
        let nextSong = this.nextSong;
        if (!nextSong) {
          nextSong = await this.getNextSong().catch(() => null);
          if (!nextSong) {
            uni.showToast({
              title: '未加载下一歌曲，将稍后重试',
              icon: 'none'
            });
            return;
          }
        }

        const currentId = _get(currentSong, 'id');
        this.playedIds.push(currentId);

        this.withSuppressedSwiperChange(() => {
          this.prevSong = currentSong;
          this.currentSong = nextSong;
          this.nextSong = null;
          this.syncSwiperCurrent();
        });

        // 预加载下一首（用于下一次 ended）
        this.nextSong = await this.getNextSong().catch(() => null);
        if (!this.nextSong) {
          uni.showToast({
            title: '下一首暂时不可用，播放将继续',
            icon: 'none'
          });
        }

        await this.loadCurrentSong();
        this.$emit('next', this.currentSong);
      } finally {
        this.isSwitching = false;
      }
    },
    onChange (event) {
      const newIndex = event?.detail?.current ?? 0;
      const oldIndex = this.swiperCurrent;
      const source = event?.detail?.source;

      // 只响应用户手势触发（程序性 setData/受控 current 会产生额外 change）
      if (source && source !== 'touch') {
        this.syncSwiperCurrent();
        return;
      }

      // 程序性重置 current 引发的 change：忽略，且把 swiper 拉回正确位置
      if (this.suppressSwiperChange) {
        this.syncSwiperCurrent();
        return;
      }

      if (newIndex > oldIndex) {
        if (this.canGoNext) {
          this.goNextSong();
        } else {
          this.withSuppressedSwiperChange(() => this.syncSwiperCurrent());
        }
      } else if (newIndex < oldIndex) {
        if (this.canGoPrev) {
          this.goPrevSong();
        } else {
          this.withSuppressedSwiperChange(() => this.syncSwiperCurrent());
        }
      }
    },
    onClickSetting () {
      this.$refs.uniPopup.open()
    },
    onClickMinute (m) {
      const self = this
      self.durationMinutes = m
      if (self.audioCtx) {
        self.audioCtx.play()
      }
      if (self.durationMinutes) {
        setTimeout(() => {
          if (self.audioCtx) {
            self.audioCtx.pause()
          }
          self.durationMinutes = 0
        }, self.durationMinutes * 60 * 1000)
      }
      this.$refs.uniPopup.close()
    }
  }
};
</script>

<style lang="less">
@import './MusicPlayer.less';
</style>