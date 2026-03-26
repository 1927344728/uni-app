<template>
  <view class="music_play_module">
    <swiper
      class="music_play_swiper"
      :current="currentIndex"
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
      // 兜底定时重试：当需要切歌但 nextSong 为空且拉取失败时启动。
      // 期望行为：当该标记为 false 时，setInterval 会触发 goNextSong，直到切歌成功。
      nextSongSwitchRetryFlag: true,
      nextSongRetryTimer: null,
      nextSongRetryToastShown: false,
      nextSongRetryIntervalMs: 5000,
      isSwitching: false,
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
    if (this.nextSongRetryTimer) {
      clearInterval(this.nextSongRetryTimer);
      this.nextSongRetryTimer = null;
    }
  },
  methods: {
    formatTime,
    scaleImageWidthInCOS,
    startNextSongRetryTimer () {
      if (this.nextSongRetryTimer) return;
      this.nextSongRetryTimer = setInterval(() => {
        // 仅在“需要重试切歌”的场景触发，避免影响正常播放/手动切歌。
        if (this.mode !== 'auto') return;
        if (this.nextSongSwitchRetryFlag) return; // 标记为 false 时才调用 goNextSong
        if (this.isSwitching) return;
        this.goNextSong();
      }, this.nextSongRetryIntervalMs);
    },
    stopNextSongRetryTimer () {
      if (this.nextSongRetryTimer) {
        clearInterval(this.nextSongRetryTimer);
        this.nextSongRetryTimer = null;
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
      this.nextSong = await this.getNextSong()
      this.createAudio();
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
        this.playedIds.pop();
        this.currentSong = prevSong
        this.prevSong = this.getPrevSong()
        this.nextSong = currentSong
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
        // 兜底：如果上一轮预加载失败导致 nextSong 为空，ended/onError 时再拉取一次；
        // 若仍拉取失败，在 auto 模式下启动 setInterval 直到切歌成功（不退出页面）。
        let nextSong = this.nextSong;
        if (!nextSong) {
          nextSong = await this.getNextSong().catch(() => null);
          if (!nextSong) {
            if (this.mode === 'auto') {
              this.nextSongSwitchRetryFlag = false; // 标记为 false 时 setInterval 会触发 goNextSong
              this.startNextSongRetryTimer();
              if (!this.nextSongRetryToastShown) {
                uni.showToast({
                  title: '下一首暂不可用，正在自动重试',
                  icon: 'none'
                });
                this.nextSongRetryToastShown = true;
              }
              return;
            }

            uni.showToast({
              title: '未加载下一歌曲，将稍后重试',
              icon: 'none'
            });
            return;
          }
        }

        if (this.mode === 'auto') {
          // 切歌成功，停止兜底轮询
          this.nextSongSwitchRetryFlag = true;
          this.stopNextSongRetryTimer();
          this.nextSongRetryToastShown = false;
        }

        const currentId = _get(currentSong, 'id');
        this.playedIds.push(currentId);

        this.prevSong = currentSong;
        this.currentSong = nextSong;
        this.nextSong = null;

        // 预加载下一首（用于下一次 ended）
        this.nextSong = await this.getNextSong().catch(() => null);
        if (!this.nextSong) {
          // 不中断当前播放，等当前歌结束后再临时拉取
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
      const { currentIndex, nextSong, prevSong } = this;
      if (event.detail.current > currentIndex && nextSong) {
        this.goNextSong();
      }
      if (event.detail.current < currentIndex && prevSong) {
        this.goPrevSong();
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