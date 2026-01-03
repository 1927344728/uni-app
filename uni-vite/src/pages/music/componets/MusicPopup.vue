<template>
  
  <UniPopup
    mode="bottom"
    ref="uniPopup"
    class="music_play_popup"
    :show="modelValue"
    :mask="true"
    :mask-closable="maskClosable"
    :style="{ zIndex: zIndex, height: '100vh' }"
    @update:show="onUpdateShow"
    @close="close"
  >
    <view
      class="music_play_popup__content"
      @click.stop
      tabindex="0"
      role="dialog"
      aria-modal="true"
    >
      <MusicPlayer
        ref="player"
        :mode="mode"
        :type="type"
        :song="song"
        :songs="songs"
        v-bind="$attrs"
        v-on="forwardedListeners"
      />
      <view class="music_play_popup__close" aria-label="关闭播放窗口" @click.stop="close">
        &#xe60e;
      </view>
    </view>
  </UniPopup>
</template>

<script>
import MusicPlayer from './MusicPlayer.vue';
import UniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';

export default {
  name: 'MusicPopup',
  components: {
    MusicPlayer,
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
    type: {
      type: Number,
      default: null
    },
    song: {
      type: [String, Number, Object],
      default: null
    },
    songs: {
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
    },
    onMaskClick (e) {
      if (!this.maskClosable) return;
      this.close();
    }
  }
};
</script>

<style lang="less">
@import './MusicPopup.less';
</style>