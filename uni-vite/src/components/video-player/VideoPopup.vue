<template>
  <UniPopup
    mode="bottom"
    ref="uniPopup"
    class="video_play_popup"
    :is-mask-click="maskClosable"
    :show="value"
    :style="{ zIndex: zIndex, height: '100vh' }"
    @maskClick="onMaskClick"
    @close="close"
  >
    <view class="video_play_main" @click.stop>
      <!-- 未打开时不挂载，避免空数据 init 弹「没有视频」 -->
      <VideoPlayer
        v-if="value"
        :mode="mode"
        :id="id"
        :ids="ids"
        :type="type"
        :video="video"
        :videos="videos"
        @play="$emit('play', $event)"
        @pause="$emit('pause', $event)"
        @next="$emit('next', $event)"
        @prev="$emit('prev', $event)"
        @ended="$emit('ended', $event)"
        @error="$emit('error', $event)"
      />
      <view class="video_close_icon" @click.stop="close">
        ✕
      </view>
    </view>
  </UniPopup>
</template>

<script>
import VideoPlayer from './VideoPlayer.vue';
import UniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';

export default {
  name: 'VideoPopup',
  components: {
    VideoPlayer,
    UniPopup
  },
  inheritAttrs: false,
  emits: ['update:value', 'open', 'close', 'play', 'pause', 'next', 'prev', 'ended', 'error'],
  props: {
    value: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'auto'
    },
    id: {
      type: [String, Number],
      default: null
    },
    ids: {
      type: [String, Array],
      default: null
    },
    type: {
      type: [String, Number],
      default: null
    },
    video: {
      type: Object,
      default: () => ({})
    },
    videos: {
      type: Array,
      default: () => []
    },
    maskClosable: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: [Number, String],
      default: 2000
    }
  },
  methods: {
    onMaskClick () {
      if (!this.maskClosable) return;
      this.close();
    },
    close () {
      const popup = this.$refs.uniPopup;
      if (popup && typeof popup.close === 'function') {
        popup.close();
      }
      this.$emit('update:value', false);
      this.$emit('close');
    },
    open (position = 'bottom') {
      const popup = this.$refs.uniPopup;
      if (popup && typeof popup.open === 'function') {
        popup.open(position);
      } else {
        this.$emit('update:value', true);
        this.$emit('open');
      }
    }
  }
};
</script>

<style lang="less">
@import './VideoPopup.less';
</style>
