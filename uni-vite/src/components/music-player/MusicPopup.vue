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
    >
      <MusicPlayer
        ref="player"
        :mode="mode"
        :id="id"
        :ids="ids"
        :type="type"
        :song="song"
        :songs="songs"
        @play="$emit('play', $event)"
        @pause="$emit('pause', $event)"
        @next="$emit('next', $event)"
        @prev="$emit('prev', $event)"
        @ended="$emit('ended', $event)"
        @error="$emit('error', $event)"
      />
      <view class="music_play_popup__close" @click.stop="close">
        &#xe60e;
      </view>
    </view>
  </UniPopup>
</template>

<script>
import MusicPlayer from './MusicPlayer.vue';
import UniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';
import { unlockAudio } from '@/common/js/audioUnlock.js';

export default {
  name: 'MusicPopup',
  components: {
    MusicPlayer,
    UniPopup
  },
  inheritAttrs: false,
  emits: ['update:modelValue', 'open', 'close', 'play', 'pause', 'next', 'prev', 'ended', 'error'],
  props: {
    modelValue: {
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
      unlockAudio();
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