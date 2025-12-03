<template>
  <view class="video_play_page">
    <VideoPlayer
      :mode="mode"
      :id="id"
      :menuId="menuId"
      :video="video"
    />
  </view>
</template>

<script>
import qs from 'qs';
import { VIDEO_LIST } from './constant.js';
import VideoPlayer from './componets/VideoPlayer.vue';

export default {
  components: {
    VideoPlayer
  },
  data () {
    return {
      mode: 'auto',
      id: null,
      menuId: null,
      video: null
    };
  },
  onLoad (options) {
    this.init(options);
  },
  methods: {
    init (options = {}) {
      this.mode = options.mode || 'auto';
      this.id = options.id ? options.id : null;
      this.menuId = options.menuId ? Number(options.menuId) : null;
      this.video = options.video ? qs.parse(decodeURIComponent(options.video)) : null
      if (this.id) {
        this.video = VIDEO_LIST.find(item => item.id === this.id) || null;
      }
    }
  }
};
</script>

<style lang="less">
@import './play.less';
</style>
