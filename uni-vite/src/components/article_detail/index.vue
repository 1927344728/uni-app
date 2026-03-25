<template>
  <view class="article_detail_module">
    <block v-for="(item, idx) in cArticleData" :key="idx">
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
            :src="scaleImageWidthInCOS(img)"
            mode="widthFix"
            class="uni_image"
            @click="previewImage(img)"
          />
          <view v-if="item.description && i + 1 === [item.content].flat().length" class="desc">
            {{ item.description }}
          </view>
        </view>
      </view>

      <view v-if="item.type === 'video'" :class="['detail_module', item.type, item.className]">
        <view v-for="(v, i) in [item.content].flat()" :key="v + i"  class="detail_module_item">
          <video
            :src="replaceCosDomainName(v)"
            :id="`video_${idx}`"
            class="uni_video"
            controls
            :object-fit="item.objectFit || 'contain'"
            :poster="item.poster"
            :style="{
              height: getVideoHeight(v, item) + 'px'
            }"
            @play="onPlay(idx)"
          ></video>					
          <view v-if="item.description && i + 1 === [item.content].flat().length" class="desc">
            {{ item.description }}
          </view>
        </view>
      </view>

      <view v-if="item.type === 'videoPopup'" :class="['detail_module', item.type, item.className]">
        <view class="detail_module_item" @click="openVideoPopup(item)">
          <view class="image_wrapper">
            <image
              :src="scaleImageWidthInCOS(item.poster)"
              mode="aspectFill"
              class="uni_image"
            />
            <view class="mask"></view>
            <view class="icon">
              <view class="iconfont">&#xe609;</view>
            </view>
          </view>
          <view v-if="item.description" class="desc">
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
            :src="scaleImageWidthInCOS(item.content[0])"
            class="uni_image"
            mode="widthFix"
          />
          <view v-if="item.content[1]" class="desc" v-html="item.content[1]" />
        </view>
      </view>
    </block>
    <VideoPopup
      v-model:value="videoPopupConfig.visbile"
      mode="menu"
      :video="videoPopupConfig.video"
      :videos="videoPopupConfig.videos"
    />
  </view>
</template>

<script>
import { get as _get } from 'lodash'
import { convert as convertHtmlToText } from 'html-to-text'
import { getUrlParams, replaceCosDomainName  } from '@/utils/variables.js'
import { scaleImageWidthInCOS } from '@/utils/common.js'
import { H5TTSService, AppTTSService } from '@/common/js/TTSManager.js'
import VideoPopup from '@/pages/video/componets/VideoPopup.vue'

let ttsService = new H5TTSService()
// #ifdef APP-PLUS
ttsService = new AppTTSService()
// #endif

export default {
  components: {
    VideoPopup
  },
  props: {
    articleData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      // ttsService: new H5TTSService(),
      ttsService,
      speakingIndex: null,
      videoContexts: {},
      currentVideoIndex: null,
      videoPopupConfig: {
        visbile: false,
        video: null,
        videos: null
      }
    }
  },
  computed: {
    isLoading () {
      return this.ttsService.isLoading
    },
    isPaused () {
      return this.ttsService.isPaused
    },
    cArticleData () {
      return (this.articleData || []).map(item => {
        if (item.type === 'readText') {
          const contnet = [item.content].flat()
          item.content = contnet.map(e => {
            e = e.replace(/\n/g, '<br/>')
            return e
          })
        }
        return item
      })
    }
  },
  mounted () {
    const self = this
    // #ifdef H5
    window.addEventListener('beforeunload', this.stop)
    // #endif

    self.articleData.forEach((item, index) => {
      if (item.type === 'video') {
        self.videoContexts[`video_${index}`] = uni.createVideoContext(`video_${index}`, self)
      }
    })
  },
  beforeUnmount() {
    this.stop()
    // #ifdef H5
    window.removeEventListener('beforeunload', this.stop)
    // #endif
  },
  methods: {
    scaleImageWidthInCOS,
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
      let rate = item.rate
      // #ifdef H5
      rate = item.rate + 0.1
      // #endif
      ttsService.speak(convertHtmlToText(text), {
        vcn: 'aisjinger',
        rate,
        onEnded: () => {
          this.speakingIndex = null
        }
      })
    },
    stop () {
      this.ttsService.stop()
    },
    previewImage(url) {
      const { articleData } = this
      const imageItem = articleData.filter(e => e.type === 'image')
      const images = imageItem.reduce((arr, e) => arr.concat([e.content].flat().filter(Boolean)), [])
      const current = images.findIndex(e => e === url)
      uni.previewImage({
        current,
        urls: images
      });
    },
    onPlay (index) {
      const { currentVideoIndex, videoContexts } = this
      if (currentVideoIndex !== null && currentVideoIndex !== index) {
        videoContexts[`video_${currentVideoIndex}`].pause()
      }
      this.currentVideoIndex = index
    },
    getVideoHeight(url, item) {
      const windowWidth = uni.getWindowInfo().windowWidth
      const width = item.className === 'full_width' ? windowWidth : windowWidth - 32
      let height = 225
      const { ratio } = getUrlParams(url || '') || {}
      if (ratio && width) {
        height = width * ratio
      }
      return height
    },
    openVideoPopup (item) {
      const { cArticleData } = this
      const authorItem = cArticleData.find(e => e.type === 'author')
      const videos = (cArticleData || [])
        .filter(e => e.type === 'videoPopup')
        .map(e => ({
          id: Number(Math.random().toString().substring(2)),
          type: null,
          title: e.description,
          desc: e.description,
          publisher: _get(authorItem, 'content') || '',
          url: e.content,
          cover: e.poster,
          objectFit: e.objectFit || 'cover'
        }))
      const video = videos.find(e => e.url === item.content)
      // #ifdef APP-PLUS
      uni.setStorageSync('tempVideoCache', videos)
      uni.navigateTo({
        url: `/pages/video/play?mode=menu&id=${video.id}&key=tempVideoCache`
      })
      // #endif

      // #ifndef APP-PLUS
      this.videoPopupConfig = {
        visbile: true,
        video,
        videos
      }
      // #endif
    },
  }
};
</script>

<style lang="less">
@import '@/common/css/common.less';
@import './index.less';
</style>