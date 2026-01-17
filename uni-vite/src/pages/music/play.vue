<template>
  <view class="music_play_page">
    <MusicPlayer
      v-if="isLoaded"
      :mode="mode"
      :id="id"
      :ids="ids"
      :type="type"
      :song="song"
      :songs="songs"
    />
  </view>
</template>

<script>
import qs from 'qs';
import { getMusicByIds } from '@/api/music.js';
import MusicPlayer from './componets/MusicPlayer.vue';

// 跳转示例：
// url: `/pages/music/play?mode=auto&id=${item.id}`,
// url: `/pages/music/play?mode=auto&id=91&type=4`,
// url: `/pages/music/play?mode=single&id=${item.id}`
// url: `/pages/music/play?mode=menu&id=91&type=4`
// url: `/pages/music/play?mode=menu&id=91&ids=1`
export default {
  components: {
    MusicPlayer
  },
  data () {
    return {
      isLoaded: false,
      mode: 'auto',
      id: null,
      ids: null,
      type: null,
      song: null,
      songs: null
    };
  },
  async onLoad (options) {
    await this.init(options);
  },
  methods: {
    async init (options = {}) {
      const { mode, id, type, song, ids } = options;

      this.mode = mode || 'auto';
      this.id = id || null
      this.ids = ids || null
      this.type = type || null;
      this.song = song || null;
      this.isLoaded = true;
    }
  }
};
</script>

<style lang="less">
@import './play.less';
</style>