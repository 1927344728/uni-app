<template>
  <UniPopup
    mode="bottom"
    ref="uniPopup"
    class="video_play_popup"
    :is-mask-click="true"
    :show="visible"
    :style="{ zIndex: zIndex, height: '100vh' }"
    @maskClick="maskClosable"
    @close="close"
  >
    <view class="video_play_main" @click.stop>
      <VideoPlayer
        :mode="mode"
        :type="type"
        :video="video"
        :videos="videos"
        v-bind="$attrs"
        v-on="forwardedListeners"
      />
      <cover-view class="video_close_icon" @click.stop="close">
        ✕
      </cover-view>
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
  emits: ['update:value', 'open', 'close', 'play', 'pause', 'next', 'prev'],
  props: {
    value: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'auto'
    },
    type: {
      type: Number,
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
  computed: {
    visible: {
      get () {
        if (this.value) {
          this.open()
        } else {
          this.close()
        }
        return this.value
      },
      set (v) {
        this.$emit('update:value', v)
      }
    },
    forwardedListeners () {
      const map = {};
      ['play', 'pause', 'next', 'prev', 'ended', 'error'].forEach(k => {
        if (this.$attrs && this.$attrs[`on${k.charAt(0).toUpperCase() + k.slice(1)}`]) {
          map[k] = (...args) => this.$emit(k, ...args);
        }
      });
      return map;
    }
  },
  methods: {
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
