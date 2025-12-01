<template>
  <view class="music_play_page">
    <MusicPlayer
      :mode="mode"
      :id="id"
      :menuId="menuId"
      :song="song"
    />
  </view>
</template>

<script>
import qs from 'qs';
import MusicPlayer from './componets/MusicPlayer.vue';

export default {
  components: {
    MusicPlayer
  },
  data () {
    return {
      mode: 'auto',
      id: null,
      menuId: null,
      song: null
    };
  },
  onLoad (options) {
    this.init(options);
  },
  methods: {
    init (options = {}) {
      this.mode = options.mode || 'auto';
      this.id = options.id ? Number(options.id) : null;
      this.menuId = options.menuId ? Number(options.menuId) : null;
      this.song = options.song ? qs.parse(decodeURIComponent(options.song)) : null
    }
  }
};
</script>

<style lang="less">
@import './play.less';
</style>