<template>
  <view
    class="music_play_swiper_item"
    :class="[`music_play_swiper_item--${song.key}`]"
    :style="itemStyle"
  >
    <image
      v-if="song.cover"
      class="music_play_bg"
      :src="coverUrl"
      mode="aspectFill"
    />
    <view class="music_play_blur_mask"></view>

    <view class="music_play_content">
      <view
        class="music_play_cover_wrapper"
        :style="{
          backgroundImage: coverUrl ? `url('${coverUrl}')` : 'none'
        }"
      />

      <view class="music_play_titles">
        <text class="music_play_song">
          {{ song.title || '' }}
        </text>
        <text class="music_play_artist">
          {{ song.singer || '未知歌手' }}
        </text>
      </view>

      <view class="music_play_lyric" :class="{ music_play_lyric_empty: isCurrent ? !lyricLines.length : true }">
        <scroll-view
          v-if="isCurrent && lyricLines.length"
          class="music_lyric_scroll"
          scroll-y
          :scroll-with-animation="true"
          :scroll-into-view="currentLyricAnchor"
        >
          <view
            v-for="(line, idx) in lyricLines"
            :key="`lyric-${idx}-${line.time}`"
            class="music_lyric_line"
            :id="`lyric-${idx}`"
            :class="{ active: idx === activeLyricIndex }"
          >
            {{ line.text }}
          </view>
        </scroll-view>
        <text v-else-if="isCurrent">暂无歌词</text>
        <text v-else>{{ hintText }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { get as _get } from 'lodash';
import { scaleImageWidthInCOS } from '@/utils/common.js';

export default {
  name: 'MusicPlayerItem',
  props: {
    index: {
      type: Number,
      required: true
    },
    song: {
      type: Object,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    lyricLines: {
      type: Array,
      default: () => []
    },
    activeLyricIndex: {
      type: Number,
      default: 0
    },
    currentLyricAnchor: {
      type: String,
      default: ''
    }
  },
  computed: {
    isCurrent () {
      return this.song.key === 'current';
    },
    coverUrl () {
      const cover = _get(this.song, 'cover');
      return cover ? scaleImageWidthInCOS(cover) : '';
    },
    hintText () {
      if (this.song.key === 'prev') return '下滑返回当前歌曲';
      if (this.song.key === 'next') return '上滑切换到下一首';
      return '';
    },
    itemStyle () {
      const cover = _get(this.song, 'cover');
      const style = {
        height: `${this.height}px`,
        top: `${this.height * this.index}px`
      };
      if (cover) {
        style['--music_play_bg'] = `url(${cover})`;
      }
      return style;
    }
  }
};
</script>

<style lang="less">
@import './MusicPlayerItem.less';
</style>
