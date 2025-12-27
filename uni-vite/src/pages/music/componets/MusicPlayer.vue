<template>
  <view class="music_play_module">
    <swiper
      class="music_play_swiper"
      :current="swiperCurrent"
      :duration="swiperDuration"
      :circular="false"
      :rebound="false"
      vertical
      @change="handleSwiperPageChange"
    >
      <swiper-item v-for="(page, i) in swiperPages" :key="`${page.key}_${page.id}_${i}`" >
        <view
          class="music_play_swiper_item"
          :class="[`music_play_swiper_item--${page.key}`, `music_play_switch--${page.key}`]"
          :style="getPageBgStyle(page)"
        >
          <image
            v-if="page && page.cover"
            class="music_play_bg"
            :src="page.cover"
            mode="aspectFill"
          />
          <view class="music_play_blur_mask"></view>

          <view class="music_play_content">
            <view class="music_play_cover_wrapper">
              <image 
                v-if="page && page.cover"
                class="music_play_cover" 
                :src="page.cover" 
                mode="widthFix" 
              />
            </view>

            <view class="music_play_titles">
              <text class="music_play_song">
                {{ (page && page.title) || '音乐' }}
              </text>
              <text class="music_play_artist">
                {{ (page && page.artist) || '未知歌手' }}
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

    <view class="music_play_footer">
      <view class="music_play_progress">
        <text class="music_play_time">{{ formatTime(currentTime) }}</text>
        <slider
          class="music_play_slider"
          min="0"
          :max="Math.floor(duration)"
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
  </view>
</template>

<script>
import { get as _get } from 'lodash';
import { getMusicListByMenuId, getMusicByRandom } from '@/api/music.js';
import { parseLyric, formatTime } from './MusicPlayer.js';

export default {
  name: 'MusicPlayer',
  emits: ['play', 'pause', 'next', 'prev', 'ended', 'error'],
  props: {
    mode: {
      type: String,
      default: 'auto'
    },
    id: {
      type: [String, Number],
      default: null
    },
    menuId: {
      type: [String, Number],
      default: null
    },
    song: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      allMusicList: [],
      playedMusicIds: [],
      currentSong: {},
      prevSong: null,
      nextSong: null,
      audioCtx: null,
      isPlaying: false,
      isSeeking: false,
      swiperCurrent: 0,
      swiperDuration: 320,
      duration: 0,
      currentTime: 0,
      lyricLines: [],
      activeLyricIndex: 0,
      currentLyricAnchor: '',
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
      return pages;
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
    async init () {
      const { mode, id, menuId, song } = this;
      if (mode === 'menu') {
        this.allMusicList = await getMusicListByMenuId({menuId}).catch(() => []);
        this.currentSong = id ? this.allMusicList.find(s => s.id === id) : this.allMusicList[0];
      } else {
        this.allMusicList.push(song);
        this.currentSong = song;
      }
      if (!this.currentSong || !this.currentSong.url) {
        uni.showToast({
          title: '未找到播放歌曲',
          icon: 'none'
        });
        return;
      }
      this.playedMusicIds = [];
      this.prevSong = null;
      this.nextSong = null;
      this.updatePrevAndNextSong();
      this.createAudio();
    },
    getPageBgStyle (song) {
      const cover = _get(song, 'cover');
      return cover ? { '--music_play_bg': `url(${cover})` } : {};
    },
    async updatePrevAndNextSong () {
      const { mode, allMusicList, playedMusicIds, currentSong } = this;
      this.prevSong = null;
      this.nextSong = null;
      this.swiperCurrent = 0;
      const currentSongId = _get(currentSong, 'id');
      const allMusicLength = _get(allMusicList, 'length', 0);
      if (['auto', 'menu'].includes(mode)) {
        if (playedMusicIds.length > 0) {
          const prevId = playedMusicIds[playedMusicIds.length - 1];
          this.prevSong = allMusicList.find(song => song.id === prevId) || null;
          this.swiperCurrent = this.prevSong ? 1 : 0;
        }
      }
      if (['auto'].includes(mode)) {
        const responseData = await getMusicByRandom(currentSongId, playedMusicIds)
          .catch((error) => {
            console.error(error)
          });
        if (responseData) {
          this.nextSong = responseData;
          allMusicList.push(responseData);
        }
      }
      if (['menu'].includes(mode) && allMusicLength > 1) {
        const currentIndex = allMusicList.findIndex(song => song.id === currentSongId);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % allMusicList.length;
          if (nextIndex !== currentIndex) {
            this.nextSong = allMusicList[nextIndex];
          }
        }
      }
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
      ctx.onEnded(() => {
        this.$emit('ended', this.currentSong);
        console.log('ended')
        this.goNextSong();
      });
      ctx.onError(err => {
        uni.showToast({
          title: err?.errMsg || '播放失败',
          icon: 'none'
        });
        console.error(err)
        this.$emit('error', err);
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
      const { currentSong, canGoPrev, swiperCurrent } = this;
      if (canGoPrev) {
        this.goPrevSong();
        this.swiperCurrent = swiperCurrent > 0 ? swiperCurrent - 1 : swiperCurrent;
        this.$emit('prev', currentSong);
      }
    },
    handleNext () {
      const { currentSong, canGoNext, swiperCurrent } = this;
      if (canGoNext) {
        this.goNextSong();
        this.swiperCurrent = swiperCurrent < 2 ? swiperCurrent + 1 : swiperCurrent;
        this.$emit('next', currentSong);
      }
    },
    goNextSong () {
      const { audioCtx, nextSong } = this;
      if (!audioCtx) {
        return
      };
      if (!nextSong) {
        return;
      }
      const currentSongId = _get(this, 'currentSong.id');
      this.currentSong = nextSong;
      this.playedMusicIds.push(currentSongId);
      this.loadCurrentSong();
      this.updatePrevAndNextSong();
      this.$emit('next', this.currentSong);
    },
    goPrevSong () {
      const { audioCtx, prevSong } = this;
      if (!audioCtx) {
        return
      };
      if (!prevSong) {
        return;
      }
      this.currentSong = prevSong
      this.playedMusicIds.pop();
      this.loadCurrentSong();
      this.updatePrevAndNextSong();
      this.$emit('prev', this.currentSong);
    },
    handleSwiperPageChange (event) {
      const { swiperCurrent, nextSong, prevSong } = this;
      const nextIndex = event.detail.current;
      const prevIndex = swiperCurrent;
      this.swiperCurrent = nextIndex;
      if (nextIndex > prevIndex && nextSong) {
        this.goNextSong();
      }
      if (nextIndex < prevIndex && prevSong) {
        this.goPrevSong();
      }
    }
  }
};
</script>

<style lang="less">
@import './MusicPlayer.less';
</style>