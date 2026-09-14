<template>
  <view class="article_detail_module">
    <block v-for="(item, idx) in cArticleData" :key="idx">
      <view v-if="['title', 'author', 'text'].includes(item.type)" :class="['detail_module', item.type, item.className]">
        <view v-for="(tx, i) in [item.content].flat()" :key="tx + i" class="detail_module_item">
          {{ tx }}
        </view>
      </view>

      <view v-if="['subTitle', 'richText'].includes(item.type)" :class="['detail_module', item.type, item.className]">
        <rich-text
          v-for="(rtx, i) in [item.content].flat()"
          :key="rtx + i"
          class="detail_module_item"
          :nodes="rtx"
        />
      </view>

      <view
        v-if="item.type === 'readText'"
        :class="['detail_module', item.type, item.className, { loading: speakingIndex === idx && ttsLoading }]"
        @click="onClickReadText(item, idx)"
      >
        <view class="detail_module_wrapper">
          <rich-text v-for="(rtx, i) in [item.content].flat()" :key="rtx + i" :nodes="rtx" />
          <view v-if="!ttsPaused && speakingIndex === idx" class="iconfont voice">&#xe612;</view>
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
            v-if="getVideoSrc(v)"
            :src="getVideoSrc(v)"
            :id="'video_' + idx"
            class="uni_video"
            controls
            :object-fit="item.objectFit || 'contain'"
            :poster="item.poster ? encodeMediaUrl(item.poster) : ''"
            :style="{
              height: getVideoHeight(v, item) + 'px'
            }"
            // #ifdef APP-PLUS
            codec="software"
            http-cache="true"
            // #endif
            @play="onPlay(idx)"
            @error="onVideoError"
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
          <rich-text v-if="item.content[1]" class="desc" :nodes="item.content[1]" />
        </view>
      </view>
    </block>
    <VideoPopup
      v-model:value="videoPopupConfig.visbile"
      mode="menu"
      :id="videoPopupConfig.video && videoPopupConfig.video.id"
      :video="videoPopupConfig.video"
      :videos="videoPopupConfig.videos"
    />
  </view>
</template>

<script>
import { getValue as _get } from '@/common/js/common.js'
import { stripHtml as convertHtmlToText } from '@/common/js/common.js'
import { getUrlParams, replaceCosDomainName, encodeMediaUrl  } from '@/common/js/variables.js'
import { scaleImageWidthInCOS } from '@/common/js/common.js'
import { TTSService } from '@/common/tts'
import VideoPopup from '@/components/video-player/VideoPopup.vue'

const ttsService = new TTSService()

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
      speakingIndex: null,
      // ttsService 是普通对象，模板不能直接依赖它的 isPaused / isLoading，需要在组件内同步一份响应式状态
      ttsPaused: false,
      ttsLoading: false,
      speakToken: 0,
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
    replaceCosDomainName,
    encodeMediaUrl,
    onClickReadText (item, i) {
      // 点同一段是暂停/继续，此时不能先 stop()，否则小程序端的音频实例已被销毁，pause / resume 都会失效
      if (this.speakingIndex === i) {
        this.toggleReadText()
        return
      }
      this.startReadText(item, i)
    },
    toggleReadText () {
      if (this.ttsPaused) {
        ttsService.resume()
      } else {
        ttsService.pause()
      }
      this.ttsPaused = ttsService.isPaused
    },
    startReadText (item, i) {
      // stop() 会让上一段抛出中断的 onEnded / onError，用 token 忽略这些过期回调，避免它们清掉新段落的状态
      ttsService.stop()
      const token = ++this.speakToken
      this.speakingIndex = i
      this.ttsPaused = false
      this.ttsLoading = true
      const text = (item.content || []).map(e => e).join('')
      let rate = item.rate || 0.5
      // #ifdef H5
      rate += 0.1
      // #endif
      ttsService.speak(convertHtmlToText(text), {
        vcn: 'aisjinger',
        rate,
        onPlay: () => {
          if (token !== this.speakToken) return
          this.ttsLoading = false
        },
        onEnded: () => {
          this.finishReadText(token)
        },
        onError: () => {
          this.finishReadText(token)
        }
      }).catch(() => {
        this.finishReadText(token)
      })
    },
    finishReadText (token) {
      if (token !== this.speakToken) return
      this.resetReadTextState()
    },
    resetReadTextState () {
      this.speakingIndex = null
      this.ttsPaused = false
      this.ttsLoading = false
    },
    stop () {
      this.speakToken ++
      ttsService.stop()
      this.resetReadTextState()
    },
    previewImage(url) {
      const { articleData } = this
      const imageItem = articleData.filter(e => e.type === 'image')
      const images = imageItem.reduce((arr, e) => arr.concat([e.content].flat().filter(Boolean)), [])
      const urls = images.map(replaceCosDomainName)
      const current = images.findIndex(e => e === url)
      uni.previewImage({
        current,
        urls
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
    getVideoSrc (url) {
      if (!url || typeof url !== 'string') return ''
      return encodeMediaUrl(url)
    },
    onVideoError () {
      uni.showToast({ title: '播放失败', icon: 'none' })
    },
    openVideoPopup (item) {
      const { cArticleData } = this
      const authorItem = cArticleData.find(e => e.type === 'author')
      const videos = (cArticleData || [])
        .filter(e => e.type === 'videoPopup')
        .map((e, index) => ({
          id: `popup-${index}`,
          type: null,
          title: e.description,
          desc: e.description,
          publisher: _get(authorItem, 'content') || '',
          url: Array.isArray(e.content) ? e.content[0] : e.content,
          cover: e.poster,
          objectFit: e.objectFit || 'cover'
        }))
        .filter(e => e.url)
      const currentUrl = Array.isArray(item.content) ? item.content[0] : item.content
      const video = videos.find(e => e.url === currentUrl)
      if (!video) {
        uni.showToast({ title: '没有视频', icon: 'none' })
        return
      }
      // App / 小程序：全屏播放页。App 同路径走 play.nvue，文案才能叠在原生 video 上
      // #ifdef APP-PLUS || MP
      uni.setStorageSync('tempVideoCache', videos)
      uni.navigateTo({
        url: `/pages/video/play?mode=menu&id=${encodeURIComponent(video.id)}&key=tempVideoCache`
      })
      // #endif

      // #ifdef H5
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

<style lang="less" src="./index.less"></style>