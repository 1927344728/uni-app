<template>
  <UniPopup
    mode="bottom"
    ref="uniPopup"
    class="video_play_popup"
    :show="modelValue"
    :mask="true"
    :mask-closable="maskClosable"
    :style="{ zIndex: zIndex, height: '100vh' }"
    @update:show="onUpdateShow"
    @close="close"
  >
    <view
      class="video_play_popup__content"
      @click.stop
      tabindex="0"
      role="dialog"
      aria-modal="true"
    >
        <view class="video_play_popup__viewer">
          <VideoPlayer
            ref="player"
            :mode="mode"
            :menuId="menuId"
            :video="video"
            :videos="videos"
            v-bind="$attrs"
            v-on="forwardedListeners"
          />

          <view class="video_popup_topbar">
            <view class="video_popup_back" @click.stop="close">✕</view>
            <view class="video_popup_title">{{ (video && video.title) || '' }}</view>
            <view class="video_popup_share">⤴</view>
          </view>

          <view class="video_popup_actions">
            <view class="action like">❤<text>1.2k</text></view>
            <view class="action comment">💬<text>234</text></view>
            <view class="action share">🔗<text>分享</text></view>
          </view>

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
  emits: ['update:modelValue', 'open', 'close', 'play', 'pause', 'next', 'prev'],
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'auto'
    },
    menuId: {
      type: Number,
      default: null
    },
    video: {
      type: [String, Number, Object],
      default: null
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
    onUpdateShow (val) {
      this.$emit('update:modelValue', val);
    },
    close () {
      const popup = this.$refs.uniPopup;
      if (popup && typeof popup.close === 'function') {
        popup.close();
      }
      this.$emit('update:modelValue', false);
      this.$emit('close');
    },
    open (position = 'bottom') {
      const popup = this.$refs.uniPopup;
      if (popup && typeof popup.open === 'function') {
        popup.open(position);
      } else {
        this.$emit('update:modelValue', true);
        this.$emit('open');
      }
    }
  }
};
</script>

<style lang="less">
@import './VideoPopup.less';
</style>
