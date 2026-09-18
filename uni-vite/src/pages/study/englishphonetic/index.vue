<template>
  <view class="englishphonetic_page">
    <view class="pinyin_header">
      <text class="pinyin_title">英文音标发音学习</text>
      <view class="description">点击任意音标即可播放发音</view>
    </view>
    
    <view class="pingyin_card">
      <view class="pingyin_category">
        <view
          v-for="o in typeOptions"
          :key="o.value"
          class="button"
          :class="{
            active: o.value === currentType
          }"
          @click="onClickType(o)"
        >
          {{ o.name }}
        </view>
      </view>
      
      <view class="pingyin_search">
        <uni-easyinput
          v-model="searchKey"
          type="text"
          class="search_key"
          placeholder="搜索音标或例词..."
          confirmType="search"
          clearable
          @confirm="onClickSearch"
          @clear="clearSearchKey"
        ></uni-easyinput>
        <text class="search_button" @click="onClickSearch">
          搜索
        </text>
      </view>
      
      <view v-if="shownItems.length" class="pinyin_container">
        <view
          v-for="(item, index) in shownItems"
          :id="'study-item-' + index"
          :key="item.value"
          class="item"
          :class="{
            active: item.value === currentValue
          }"
          @click="onClickItem(item)"
        >
          <view class="pinyin">/{{ item.value }}/</view>
          <view class="character">{{ item.name }}</view>
        </view>
      </view>
      <view v-else class="pinyin_empty">没有找到匹配的音标</view>
      
      <view class="pinyin_tips">
        共 {{ allCount }} 个音标，当前显示 {{ shownCount }} 个
      </view>
    </view>

    <view class="pinyin_controls">
      <button
        class="button control_play"
        :class="{ disabled: !currentValue }"
        hover-class="none"
        @click="currentPlay"
      >
        播放选中
      </button>
      <button
        class="button control_stop"
        :class="{ disabled: !currentValue && !playingAll }"
        hover-class="none"
        @click="stop"
      >
        停止
      </button>
      <button
        class="button control_all"
        :class="{ disabled: !shownItems.length || playingAll }"
        hover-class="none"
        @click="playAll"
      >
        {{ playingAll ? '正在播放' : '播放全部' }}
      </button>
    </view>
  </view>
</template>

<script>
import { COS_DOMAIN_NAME, encodeMediaUrl, scrollSelectorIntoView } from '@/common/js/common.js'
import { TTSService } from '@/common/tts'
import { PHONETIC_TYPE_OPTIONS, PHONETIC_SYMBOLS } from './constant.js'

const AUDIO_DIR = 'englishphonetic'
const AUDIO_VER = '20260918'
const UNIT_NAME = '音标'
const TTS_OPTIONS = { lang: 'en-US' }
const tts = new TTSService()

export default {
  data () {
    return {
      currentType: 'all',
      currentValue: 'ɪ',
      searchKey: '',
      typeOptions: PHONETIC_TYPE_OPTIONS,
      audioContext: null,
      playingAll: false,
      playToken: 0,
      playSession: 0,
      playTimer: null,
      playQueue: [],
      playWait: null,
      audioHandlers: null
    }
  },
  computed: {
    shownItems () {
      const typeList = this.currentType === 'all'
        ? PHONETIC_SYMBOLS
        : PHONETIC_SYMBOLS.filter(c => c.type === this.currentType)
      const raw = (this.searchKey || '').trim()
      if (!raw) return typeList
      const key = raw.toLowerCase().replace(/^\/|\/$/g, '')
      return typeList.filter(c => {
        const value = (c.value || '').toLowerCase()
        const audio = (c.audio || '').toLowerCase()
        const alias = (c.alias || '').toLowerCase()
        const name = (c.name || '').toLowerCase()
        return value.startsWith(key)
          || audio.startsWith(key)
          || alias.startsWith(key)
          || alias === key
          || name.includes(key)
          || (c.name && c.name.includes(raw))
          || (`/${value}/`).includes(key)
      })
    },
    allCount () {
      return PHONETIC_SYMBOLS.length
    },
    shownCount () {
      return this.shownItems.length
    }
  },
  onHide () {
    this.stop()
  },
  onUnload () {
    this.stop({ destroy: true })
  },
  methods: {
    onClickType (o) {
      this.stop()
      this.currentType = o.value
      this.searchKey = ''
      this.currentValue = this.shownItems[0] ? this.shownItems[0].value : null
    },
    onClickSearch () {
      this.searchKey = (this.searchKey || '').trim()
      const first = this.shownItems[0]
      if (first) {
        this.currentValue = first.value
        return
      }
      uni.showToast({
        title: `没有找到匹配的${UNIT_NAME}`,
        icon: 'none',
        duration: 2000
      })
    },
    clearSearchKey () {
      this.searchKey = ''
    },
    onClickItem (item) {
      this.stop()
      this.currentValue = item.value
      this.play(item.value)
    },
    ensureAudio () {
      if (this.audioContext) return this.audioContext
      const ctx = uni.createInnerAudioContext()
      try { ctx.obeyMuteSwitch = false } catch (e) {}
      ctx.autoplay = false
      this.audioContext = ctx
      return ctx
    },
    unbindAudio () {
      const ctx = this.audioContext
      const handlers = this.audioHandlers
      if (!ctx || !handlers) return
      try { handlers.ended && ctx.offEnded(handlers.ended) } catch (e) {}
      try { handlers.error && ctx.offError(handlers.error) } catch (e) {}
      this.audioHandlers = null
    },
    settlePlay (ok) {
      const wait = this.playWait
      this.playWait = null
      if (wait) wait(ok)
    },
    speakText (item) {
      return item && (item.speak || item.value)
    },
    play (value) {
      const item = PHONETIC_SYMBOLS.find(c => c.value === value)
      if (!item) return Promise.resolve(false)
      this.settlePlay(false)
      const token = ++this.playToken
      const fileName = (item.audio || '').trim()
      if (fileName) return this.playAudioFile(fileName, token)
      return this.playTts(item, token)
    },
    playAudioFile (fileName, token) {
      const src = encodeMediaUrl(`${COS_DOMAIN_NAME}/audio/${AUDIO_DIR}/${fileName}.mp3?v=${AUDIO_VER}`)
      return new Promise((resolve) => {
        const ctx = this.ensureAudio()
        this.unbindAudio()
        this.playWait = resolve
        const done = (ok) => {
          if (token !== this.playToken) return
          this.unbindAudio()
          this.settlePlay(ok)
        }
        const handlers = {
          ended: () => done(true),
          error: () => done(false)
        }
        this.audioHandlers = handlers
        ctx.onEnded(handlers.ended)
        ctx.onError(handlers.error)
        ctx.src = src
        try {
          ctx.play()
        } catch (e) {
          done(false)
        }
      })
    },
    async playTts (item, token) {
      const text = this.speakText(item)
      if (!text) return false
      try {
        await tts.speak(text, {
          ...TTS_OPTIONS,
          onPlay: () => {
            if (token !== this.playToken) tts.stop()
          }
        })
        return token === this.playToken
      } catch (e) {
        return false
      }
    },
    clearPlayTimer () {
      if (this.playTimer) {
        clearTimeout(this.playTimer)
        this.playTimer = null
      }
    },
    stopAudio () {
      this.unbindAudio()
      if (!this.audioContext) return
      try { this.audioContext.stop() } catch (e) {}
    },
    destroyAudio () {
      this.stopAudio()
      if (!this.audioContext) return
      try { this.audioContext.destroy() } catch (e) {}
      this.audioContext = null
    },
    stop (options = {}) {
      this.playingAll = false
      this.playQueue = []
      this.playSession += 1
      this.playToken += 1
      this.clearPlayTimer()
      this.settlePlay(false)
      try { tts.stop() } catch (e) {}
      if (options.destroy) {
        this.destroyAudio()
      } else {
        this.stopAudio()
      }
    },
    currentPlay () {
      if (!this.currentValue) {
        uni.showToast({
          title: `请选择${UNIT_NAME}`,
          icon: 'none',
          duration: 2000
        })
        return
      }
      this.stop()
      this.play(this.currentValue)
    },
    playAll () {
      if (this.playingAll) return
      const list = this.shownItems
      if (!list.length) {
        uni.showToast({
          title: `没有可播放的${UNIT_NAME}`,
          icon: 'none',
          duration: 2000
        })
        return
      }
      this.stop()
      const session = ++this.playSession
      this.playQueue = list.slice()
      this.playingAll = true
      const start = Math.max(0, this.playQueue.findIndex(c => c.value === this.currentValue))
      this.recursionPlayAt(start, session)
    },
    isPlaySession (session) {
      return this.playingAll && session === this.playSession
    },
    scrollCurrentIntoView (index) {
      if (index == null || index < 0) return
      scrollSelectorIntoView(this, `#study-item-${index}`)
    },
    async recursionPlayAt (index, session) {
      const list = this.playQueue
      const current = list[index]
      if (!this.isPlaySession(session) || !current) {
        if (session === this.playSession) this.playingAll = false
        return
      }
      this.currentValue = current.value
      this.scrollCurrentIntoView(index)
      await this.play(current.value)
      if (!this.isPlaySession(session)) return
      const next = list[index + 1]
      if (!next) {
        this.playingAll = false
        return
      }
      this.currentValue = next.value
      this.scrollCurrentIntoView(index + 1)
      this.playTimer = setTimeout(() => {
        if (!this.isPlaySession(session)) return
        this.recursionPlayAt(index + 1, session)
      }, 500)
    }
  }
}
</script>

<style src="./index.css"></style>
