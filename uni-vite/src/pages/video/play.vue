<template>
  <view class="video_play_page">
    <VideoPlayer
      v-if="isLoaded"
      :mode="mode"
      :id="id"
      :menuId="menuId"
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
      menuId: null,
      video: null
    };
  },
  async onLoad (options) {
    await this.init(options);
  },
  methods: {
    async init (options = {}) {
      this.isLoaded = false
      this.mode = options.mode || 'auto';
      this.id = options.id ? options.id : null;
      this.menuId = options.menuId ? Number(options.menuId) : null;
      this.video = options.video ? qs.parse(decodeURIComponent(options.video)) : null
      if (this.id) {
        const responseData = await getVideoById({ id: this.id }).catch(() => null);
        if (responseData) {
          this.video = responseData;
        }
      }
      this.isLoaded = true
    }
  }
};
</script>

<style lang="less">
@import './play.less';
</style>
