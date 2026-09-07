<template>
  <view class="video_player_page">
    <VideoPlayer
      v-if="isLoaded"
      :mode="mode"
      :id="id"
      :ids="ids"
      :type="type"
      :video="video"
      :videos="videos"
    />
  </view>
</template>

<script>
import VideoPlayer from '@/components/video-player/VideoPlayer.vue';

export default {
  components: {
    VideoPlayer
  },
  data () {
    return {
      isLoaded: false,
      mode: 'auto',
      id: null,
      ids: null,
      type: null,
      video: null,
      videos: null
    };
  },
  async onLoad (options) {
    await this.init(options);
  },
  methods: {
    async init (options = {}) {
      const { mode, id, ids, type, video, key } = options

      let videos = null
      if (mode === 'menu' && key) {
        videos = uni.getStorageSync(key) || []
      }

      this.mode = mode || 'auto'
      this.id = id || null
      this.ids = ids || null
      this.type = type || null
      this.video = video || (videos && videos[0]) || null
      this.videos = videos
      this.isLoaded = true
    }
  }
};
</script>

<style lang="less">
@import './play.less';
</style>
