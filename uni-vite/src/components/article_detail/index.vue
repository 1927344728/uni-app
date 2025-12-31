<template>
  <view class="article_detail_module">
    <block v-for="(item, idx) in articleData" :key="idx">
      <view v-if="['title', 'author', 'text'].includes(item.type)" :class="['detail_module', item.type, item.className]">
        <view v-for="(tx, i) in [item.content].flat()" :key="tx + i" class="detail_module_item">
          {{ tx }}
        </view>
      </view>

      <view v-if="['subTitle', 'richText'].includes(item.type)" :class="['detail_module', item.type, item.className]">
        <view
          v-for="(rtx, i) in [item.content].flat()"
          :key="rtx + i"
          class="detail_module_item"
          v-html="rtx"
        />
      </view>

      <view
        v-if="item.type === 'readText'"
        :class="{
          detail_module: true,
          [item.type]: true,
          [item.className || '']: true,
          loading: speakingIndex === idx && isLoading,
        }"
        @click="onClickReadText(item, idx)"
      >
        <view class="detail_module_wrapper">
          <view v-for="(rtx, i) in [item.content].flat()" :key="rtx + i" v-html="rtx" />
          <view v-if="!isPaused && speakingIndex === idx" class="iconfont voice">&#xe612;</view>
          <view v-else class="iconfont mute">&#xe60f;</view>
        </view>
      </view>

      <view v-if="item.type === 'image'" :class="['detail_module', item.type, item.className]">
        <view v-for="(img, i) in [item.content].flat()" :key="img + i" class="detail_module_item">
          <image
            :src="img + ((img || '').includes('?') ? '&' : '?') + 'imageMogr2/thumbnail/750x'"
            mode="widthFix"
            class="uni_image"
            @click="previewImage(i, [item.content].flat())"
          />
          <view v-if="item.description && i + 1 === [item.content].flat().length" class="desc">
            {{ item.description }}
          </view>
        </view>
      </view>

      <view v-if="item.type === 'video'" :class="['detail_module', item.type, item.className]">
        <view v-for="(v, i) in [item.content].flat()" :key="v + i"  class="detail_module_item">
          <video
            :src="v"
            class="uni_video"
            controls
            :object-fit="item.objectFit || 'contain'"
            :poster="item.poster"
          ></video>
          <view v-if="item.description && i + 1 === [item.content].flat().length" class="desc">
            {{ item.description }}
          </view>
        </view>
      </view>

      <view
        v-if="item.type === 'card'"
        :class="['detail_module', item.type, item.className]"
        @click="onClickReadText(item, idx)"
      >
        <view class="detail_module_wrapper">
          <image
            v-if="item.content[0]"
            :src="item.content[0] + (item.content[0].includes('?') ? '&' : '?') + 'imageMogr2/thumbnail/750x'"
            class="uni_image"
            mode="widthFix"
          />
          <view v-if="item.content[1]" class="desc" v-html="item.content[1]" />
        </view>
      </view>
    </block>
  </view>
</template>

<script>
import { convert as convertHtmlToText } from 'html-to-text'
import { H5TTSService, XfTTSService } from '@/common/js/TTSManager.js'

export default {
  props: {
    articleData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      // ttsService: new H5TTSService(),
      ttsService: new XfTTSService(),
      speakingIndex: null
    }
  },
  computed: {
    isLoading () {
      return this.ttsService.isLoading
    },
    isPaused () {
      return this.ttsService.isPaused
    }
  },
  mounted () {
    // #ifdef H5
    window.addEventListener('beforeunload', this.stop)
    // #endif
  },
  beforeUnmount() {
    this.stop()
    // #ifdef H5
    window.removeEventListener('beforeunload', this.stop)
    // #endif
  },
  methods: {
    onClickReadText (item, i) {
      const { ttsService, speakingIndex } = this
      ttsService.stop()
      if (speakingIndex === i) {
        if (ttsService.isPaused) {
          ttsService.resume()
        } else {
          ttsService.pause()
        }
        return
      }
      this.speakingIndex = i
      const text = (item.content || []).map(e => e).join('')
      ttsService.speak(convertHtmlToText(text), {
        vcn: 'aisjinger',
        rate: item.rate,
        onEnded: () => {
          this.speakingIndex = null
        }
      })
    },
    stop () {
      this.ttsService.stop()
    },
    previewImage(current, urls) {
      if (typeof uni !== 'undefined' && uni.previewImage) {
        uni.previewImage({ current, urls });
        return;
      }
      window.open(current, '_blank');
    },
  }
};
</script>

<style lang="less">
@import './index.less';
</style>

