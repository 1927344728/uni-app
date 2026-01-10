<template>
  <view class="video_player_page">
    <VideoPlayer
      v-if="isLoaded"
      :mode="mode"
      :id="id"
      :type="type"
      :video="video"
    />
  </view>
</template>

<script>
import qs from 'qs';
import { getVideoById } from '@/api'
import VideoPlayer from './componets/VideoPlayer.vue';

export default {
  components: {
    VideoPlayer
  },
  data () {
    return {
      isLoaded: false,
      mode: 'auto',
      id: null,
      type: null,
      video: null
    };
  },
  async onLoad (options) {
    await this.init(options);
  },
  methods: {
    async init (options = {}) {
      const { mode, id, type, video, key } = options

      let videos = null
      if (mode === 'menu') {
        videos = uni.getStorageSync(key) || [] 
      }

      this.mode = mode || 'auto'
      this.id = id || null
      this.type = type || null
      this.video = video
      this.videos = videos
      this.isLoaded = true
      console.log('video_player_page')
    }
  }
};
</script>

<style lang="less">
@import './play.less';
</style>
