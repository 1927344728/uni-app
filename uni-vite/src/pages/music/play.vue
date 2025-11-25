<template>
  <view class="music_play_root">
    <swiper
      class="music_play_swiper"
      :current="swiperCurrent"
      :duration="swiperDuration"
      :circular="false"
      vertical
      @change="handleSwiperPageChange"
    >
      <swiper-item v-for="page in swiperPages" :key="page.key + page.song.id" >
        <view
          class="music_play_page"
          :class="[page.positionClass, page.isCurrent ? switchDirectionClass : '']"
          :style="getPageBgStyle(page.song)"
        >
          <image
            v-if="page.song && page.song.cover"
            class="music_play_bg"
            :src="page.song.cover"
            mode="aspectFill"
          />
          <view class="music_play_blur_mask"></view>

          <view
            class="music_play_content"
            :class="page.isPreview ? 'music_play_content--preview' : ''"
          >
            <view class="music_play_cover_wrapper">
              <image 
                v-if="page.song && page.song.cover"
                class="music_play_cover" 
                :src="page.song.cover" 
                mode="widthFix" 
              />
            </view>

            <view class="music_play_titles">
              <text class="music_play_song">
                {{ (page.song && page.song.title) || '音乐' }}
              </text>
              <text class="music_play_artist">
                {{ (page.song && page.song.artist) || '未知歌手' }}
              </text>
            </view>

            <block v-if="page.isCurrent">
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
                <text>{{ page.hint }}</text>
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
          <text class="iconfont">{{isPlaying ? '&#xe608;' : '&#xe609;'}}</text>
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
import { decodeLyricBuffer } from '@/utils/common';
import { MUSIC_LIST } from './constant';

export default {
  data () {
    return {
      mode: 'auto',
      songs: [],
      allSongs: MUSIC_LIST,
      playlist: [],
      playlistPos: 0,
      currentIndex: 0,
      currentSong: {},
      prevSong: null,
      nextSong: null,
      preloadIndex: null,
      audioCtx: null,
      isPlaying: false,
      isSeeking: false,
      swiperCurrent: 0,
      swiperDuration: 320,
      switchDirection: '',
      duration: 0,
      currentTime: 0,
      lyricLines: [],
      activeLyricIndex: 0,
      currentLyricAnchor: '',
      playedHistory: [],
      touchStartY: 0,
      touchStartTime: 0
    };
  },
  computed: {
    swiperPages () {
      const { mode, playlist, prevSong, currentSong, nextSong } = this;
      const playListLength = _get(playlist, 'length');
      const isSingleLike = mode === 'single' || (mode === 'menu' && playListLength <= 1);

      if (isSingleLike) {
        return [{
          key: 'current',
          song: currentSong,
          isCurrent: true,
          isPreview: false,
          positionClass: 'music_play_page--current',
          hint: ''
        }];
      }

      const pages = [];

      if (prevSong) {
        pages.push({
          key: 'prev',
          song: prevSong,
          isCurrent: false,
          isPreview: true,
          positionClass: 'music_play_page--prev',
          hint: '下滑返回当前歌曲'
        });
      }

      pages.push({
        key: 'current',
        song: currentSong,
        isCurrent: true,
        isPreview: false,
        positionClass: 'music_play_page--current',
        hint: ''
      });

      if (nextSong) {
        pages.push({
          key: 'next',
          song: nextSong,
          isCurrent: false,
          isPreview: true,
          positionClass: 'music_play_page--next',
          hint: '上滑切换到下一首'
        });
      }

      return pages;
    },
    switchDirectionClass () {
      const map = {
        next: 'music_play_switch--next',
        prev: 'music_play_switch--prev',
        none: ''
      };
      return map[this.switchDirection] || '';
    },
    canGoPrev () {
      if (this.mode === 'single') {
        return false;
      }
      return this.playedHistory.length > 0;
    },
    canGoNext () {
      if (this.mode === 'single') {
        return false;
      }
      return !!this.nextSong;
    }
  },
  onLoad (options) {
    this.init(options);
  },
  onUnload () {
    if (this.audioCtx) {
      this.audioCtx.destroy();
      this.audioCtx = null;
    }
  },
  methods: {
    init (options = {}) {
      const { allSongs } = this
      const { mode, menuId, song, songs, index } = this.normalizeOptions(options);
      this.mode = mode;
      this.songs = songs;

      let currentIndex = allSongs.findIndex(e => decodeURIComponent(e.url) === song);
      if (currentIndex < 0) {
        currentIndex = 0;
      }
      this.currentIndex = currentIndex;
      this.currentSong = allSongs[currentIndex] || {};

      this.setupPlayMode(menuId, index);
      this.createAudio();
    },
    normalizeOptions (options) {
      const mode = options.mode || 'auto';
      const menuId = options.menuId ? Number(options.menuId) : null;
      const baseDir = options.baseDir ? decodeURIComponent(options.baseDir) : '';
      const song = baseDir + (options.song ? decodeURIComponent(options.song) : null);
      const songs = (options.songs ? JSON.parse(decodeURIComponent(options.songs)) : []).map(e => `${baseDir}${e}`);
      const index = options.index ? Number(options.index) : null;
      return {
        mode,
        menuId,
        song,
        songs,
        index
      };
    },
    getPageBgStyle (song) {
      const cover = _get(song, 'cover');
      return cover ? { '--music_play_bg': `url(${cover})` } : {};
    },
    setupPlayMode () {
      const { allSongs, currentIndex, mode } = this;
      this.playedHistory = [];
      this.prevSong = null;
      this.nextSong = null;
      this.preloadIndex = null;
      this.playlist = [];
      this.playlistPos = 0;

      if (currentIndex === null || currentIndex < 0 || currentIndex >= allSongs.length) {
        this.currentIndex = 0;
      }

      if (mode === 'single') {
        this.songs = [this.currentSong];
        return;
      }

      const songsLength = _get(this, 'songs.length');
      if (songsLength) {
        this.playlist = this.songs;
      }

      if (!this.playlist.length) {
        this.playlist = allSongs.map((_, idx) => idx);
      }

      let pos = this.playlist.indexOf(currentIndex);

      if (pos === -1) {
        this.playlist.push(currentIndex);
        pos = this.playlist.length - 1;
      }
      this.playlistPos = pos;

      if (mode === 'auto') {
        this.playedHistory = [];
        this.preloadIndex = this.pickRandomUnplayed();
      }
      if (mode === 'menu') {
        if (this.playlist.length > 1) {
          const nextPos = (this.playlistPos + 1) % this.playlist.length;
          this.preloadIndex = this.playlist[nextPos];
        }
      }

      this.updatePrevNextSongs();
    },
    createAudio () {
      if (this.audioCtx) {
        this.audioCtx.destroy();
      }
      const ctx = uni.createInnerAudioContext();
      ctx.obeyMuteSwitch = false;
      ctx.autoplay = false;
      ctx.onCanplay(() => {
        setTimeout(() => {
          this.duration = ctx.duration || this.duration;
        }, 120);
      });
      ctx.onPlay(() => {
        this.isPlaying = true;
      });
      ctx.onPause(() => {
        this.isPlaying = false;
      });
      ctx.onStop(() => {
        this.isPlaying = false;
        this.currentTime = 0;
      });
      ctx.onEnded(() => {
        this.goNextSong();
      });
      ctx.onError(err => {
        uni.showToast({
          title: err?.errMsg || '播放失败',
          icon: 'none'
        });
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
    loadCurrentSong () {
      const { lyric, url } = this.currentSong;
      this.currentTime = 0;
      this.duration = 0;
      this.activeLyricIndex = 0;
      this.currentLyricAnchor = '';
      this.parseLyric(lyric);
      this.audioCtx.stop();
      this.audioCtx.src = url;
      this.audioCtx.seek(0);
      this.audioCtx.play();
    },
    async fetchLyricText (url = '') {
      if (!url) return '';
      return new Promise(resolve => {
        uni.request({
          url,
          method: 'GET',
          responseType: 'arraybuffer',
          header: {
            'Content-Type': 'text/plain;charset=utf-8',
            Accept: 'text/plain'
          },
          success: res => {
            if (typeof res?.data === 'string') {
              resolve(res.data);
              return;
            }
            if (res?.data instanceof ArrayBuffer) {
              resolve(decodeLyricBuffer(res.data));
              return;
            }
            resolve('');
          },
          fail: () => {
            resolve('');
          }
        });
      });
    },
    async parseLyric (lyricSource = '') {
      let lyricLines = [];
      if (lyricSource) {
        try {
          const lyricText = lyricSource.startsWith('http') ? await this.fetchLyricText(lyricSource) : lyricSource;
          if (lyricText) {
            lyricLines = lyricText
              .split(/\n+/)
              .map(line => {
                const match = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?](.*)/);
                if (!match) return null;
                const minute = Number(match[1]);
                const second = Number(match[2]);
                const millisecond = Number(match[3] || 0);
                return {
                  time: minute * 60 + second + millisecond / 1000,
                  text: match[4].trim()
                };
              })
              .filter(Boolean)
              .sort((a, b) => a.time - b.time);
          }
        } catch (error) {}
      }
      this.lyricLines = lyricLines;
      return lyricLines;
    },
    updateLyricByTime (time) {
      const { lyricLines, activeLyricIndex } = this;
      if (lyricLines.length) {
        let index = lyricLines.findIndex((line, idx) => {
          const next = lyricLines[idx + 1];
          if (!next) {
            return time >= line.time;
          }
          return time >= line.time && time < next.time;
        });
        if (index === -1) {
          index = lyricLines.length - 1;
        }
        if (index !== activeLyricIndex) {
          this.activeLyricIndex = index;
          this.currentLyricAnchor = `lyric-${index > 1 ? index - 1 : 0}`;
        }
      }
    },
    updatePrevNextSongs () {
      const { allSongs, mode, playlist, playedHistory, preloadIndex, currentSong } = this;
      this.prevSong = null;
      this.nextSong = null;

      const isSingleLike = mode === 'single' || (mode === 'menu' && Array.isArray(playlist) && playlist.length <= 1);

      if (isSingleLike) {
        this.prevSong = null;
        this.nextSong = null;
        this.resetSwiperCurrentByEdges();
        return;
      }

      if (mode === 'single') {
        this.nextSong = currentSong;
        return;
      }

      if (playedHistory.length > 0) {
        const prevId = playedHistory[playedHistory.length - 1];
        this.prevSong = allSongs.find(song => song.id === prevId) || null;
      }

      if (preloadIndex != null && allSongs[preloadIndex]) {
        this.nextSong = allSongs[preloadIndex];
      }

      this.resetSwiperCurrentByEdges();
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
      const { canGoPrev, swiperCurrent } = this;
      if (canGoPrev) {
        this.triggerSwitch('prev');
        this.goPrevSong();
        const target = swiperCurrent > 0 ? swiperCurrent - 1 : swiperCurrent;
        this.swiperCurrent = target;
      }
    },
    handleNext () {
      const { canGoNext, swiperCurrent } = this;
      if (canGoNext) {
        this.triggerSwitch('next');
        this.goNextSong();
        const target = swiperCurrent < 2 ? swiperCurrent + 1 : swiperCurrent;
        this.swiperCurrent = target;
      }
    },
    pickRandomUnplayed () {
      const { allSongs, playedHistory, currentSong } = this;
      if (!allSongs.length) return null;

      const currentId = _get(currentSong, 'id');
      const toPairs = allSongs.map((song, idx) => ({ song, idx }));
      const playedIdSet = new Set(playedHistory);

      if (currentId !== undefined && currentId !== null) {
        playedIdSet.add(currentId);
      }

      let pool = toPairs.filter(item => !playedIdSet.has(item.song.id));

      if (!pool.length) {
        pool = toPairs.filter(item => item.song.id !== currentId);
      }

      if (!pool.length) {
        return null;
      }

      const randIdx = Math.floor(Math.random() * pool.length);
      return pool[randIdx].idx;
    },
    preparePreloadNext () {
      const { allSongs, mode, playlist, playlistPos } = this;
      if (!allSongs.length) return;

      if (mode === 'single') {
        this.preloadIndex = null;
        this.updatePrevNextSongs();
        return;
      }

      if (mode === 'menu') {
        if (!playlist.length) return;
        const nextPos = (playlistPos + 1) % playlist.length;
        this.preloadIndex = playlist[nextPos];
      } else if (mode === 'auto') {
        this.preloadIndex = this.pickRandomUnplayed();
      }

      this.updatePrevNextSongs();
    },
    goNextSong () {
      const { audioCtx, mode, allSongs, currentSong, playlist, playlistPos, playedHistory, preloadIndex } = this;
      if (!audioCtx) return;

      if (mode === 'single') {
        audioCtx.seek(0);
        audioCtx.play();
        return;
      }

      if (!allSongs.length) return;

      const currentId = _get(currentSong, 'id');
      if (currentId !== undefined && currentId !== null && !playedHistory.includes(currentId)) {
        playedHistory.push(currentId);
      }

      let nextIndex = null;

      if (mode === 'menu') {
        if (!playlist.length) return;
        const len = playlist.length;
        if (len === 1) {
          audioCtx.seek(0);
          audioCtx.play();
          return;
        }
        const nextPos = (playlistPos + 1) % len;
        this.playlistPos = nextPos;
        nextIndex = playlist[nextPos];
      } else if (mode === 'auto') {
        if (preloadIndex != null && allSongs[preloadIndex]) {
          nextIndex = preloadIndex;
        } else {
          nextIndex = this.pickRandomUnplayed();
        }
      }

      if (nextIndex == null || !allSongs[nextIndex]) {
        return;
      }

      this.currentIndex = nextIndex;
      this.currentSong = allSongs[nextIndex];
      this.loadCurrentSong();
      this.preparePreloadNext();
    },
    goPrevSong () {
      const { audioCtx, mode, allSongs, playedHistory, playlist } = this;
      if (!audioCtx) return;

      if (mode === 'single') {
        audioCtx.seek(0);
        audioCtx.play();
        return;
      }

      if (!allSongs.length) return;

      if (!playedHistory.length) return;

      const prevId = playedHistory.pop();
      if (prevId === undefined || prevId === null) return;
      const prevIndex = allSongs.findIndex(song => song.id === prevId);
      if (prevIndex === -1) return;

      this.currentIndex = prevIndex;
      this.currentSong = allSongs[prevIndex];

      if (mode === 'menu' && playlist && playlist.length) {
        const pos = playlist.indexOf(prevIndex);
        if (pos !== -1) this.playlistPos = pos;
      }

      this.loadCurrentSong();
      this.preparePreloadNext();
    },
    resetSwiperCurrentByEdges () {
      this.swiperCurrent = this.prevSong ? 1 : 0;
    },
    handleSwiperPageChange (event) {
      const nextIndex = event.detail.current;
      const prevIndex = this.swiperCurrent;

      if (nextIndex === prevIndex) return;

      this.swiperCurrent = nextIndex;
      if (nextIndex > prevIndex && this.nextSong) {
        this.triggerSwitch('next');
        this.goNextSong();
      } else if (nextIndex < prevIndex && this.prevSong) {
        this.triggerSwitch('prev');
        this.goPrevSong();
      }
    },
    triggerSwitch (direction) {
      this.switchDirection = direction;
      setTimeout(() => {
        this.switchDirection = '';
      }, 320);
    },
    formatTime (value) {
      const seconds = Math.floor(value || 0);
      const minute = Math.floor(seconds / 60);
      const second = seconds % 60;
      const m = minute < 10 ? `0${minute}` : `${minute}`;
      const s = second < 10 ? `0${second}` : `${second}`;
      return `${m}:${s}`;
    }
  }
};
</script>

<style lang="less">
@import './play.less';
</style>