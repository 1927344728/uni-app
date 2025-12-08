<template>
  <view class="music_play_page">
    <MusicPlayer
      v-if="isLoaded"
      :mode="mode"
      :id="id"
      :menuId="menuId"
      :song="song"
    />
  </view>
</template>

<script>
import qs from 'qs';
import { getMusicById } from '@/api/music.js';
import MusicPlayer from './componets/MusicPlayer.vue';

export default {
  components: {
    MusicPlayer
  },
  data () {
    return {
      isLoaded: false,
      mode: 'auto',
      id: null,
      menuId: null,
      song: null
    };
  },
  async onLoad (options) {
    await this.init(options);
  },
  methods: {
    async init (options = {}) {
      this.isLoaded = false;
      this.mode = options.mode || 'auto';
      this.id = options.id ? options.id : null;
      this.menuId = options.menuId ? Number(options.menuId) : null;
      this.song = options.song ? qs.parse(decodeURIComponent(options.song)) : null
      if (this.id) {
        const responseData = await getMusicById({ id: this.id }).catch(() => null);
        if (responseData) {
          this.song = responseData;
        }
      }
      this.isLoaded = true;
    }
  }
};
</script>

<style lang="less">
@import './play.less';
</style>