<template>
  <UniPopup
    ref="uniPopup"
    type="bottom"
    class="video_play_popup"
    :is-mask-click="maskClosable"
    :style="{ zIndex: zIndex, height: '100vh' }"
    @maskClick="onMaskClick"
    @change="onChange"
  >
    <view class="video_play_main" @click.stop>
      <!-- 弹层真正打开后再挂载，避免在 display:none 里 autoplay 报 no supported sources -->
      <VideoPlayer
        v-if="playerReady"
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
  data () {
    return {
      playerReady: false
    }
  },
  watch: {
    value (val) {
      if (val) {
        this.$nextTick(() => this.open())
      } else {
        this.playerReady = false
        const popup = this.$refs.uniPopup
        if (popup && popup.showPopup && typeof popup.close === 'function') {
          popup.close()
        }
      }
    }
  },
  methods: {
    onChange (e) {
      const show = !!(e && e.show)
      this.playerReady = show
      if (!show) {
        this.$emit('update:value', false)
        this.$emit('close')
      }
    },
    onMaskClick () {
      if (!this.maskClosable) return
      this.close()
    },
    close () {
      this.playerReady = false
      const popup = this.$refs.uniPopup
      if (popup && typeof popup.close === 'function') {
        popup.close()
      }
      this.$emit('update:value', false)
      this.$emit('close')
    },
    open (position = 'bottom') {
      const popup = this.$refs.uniPopup
      if (popup && typeof popup.open === 'function') {
        popup.open(position)
        this.$emit('open')
        return
      }
      this.playerReady = true
      this.$emit('update:value', true)
      this.$emit('open')
    }
  }
};
</script>

<style lang="less">
@import './VideoPopup.less';
</style>
