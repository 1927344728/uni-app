<template>
  <view class="pingyin_page">
    <view class="pinyin_header">
      <text class="pinyin_title">汉语拼音发音学习</text>
      <view class="description">点击任意拼音即可播放发音</view>
    </view>
    
    <view class="pingyin_card">
      <view class="pingyin_category">
        <view
          v-for="o in pinyinTypeOptions"
          :key="o.value"
          class="button"
          :class="{
            active: o.value === pinyinType
          }"
          @click="onClickPinyinType(o)"
        >
          {{ o.name }}
        </view>
      </view>
      
      <view class="pingyin_search">
        <uni-easyinput
          v-model="searchKey"
          type="text"
          class="search_key"
          placeholder="搜索拼音..."
          confirmType="search"
          clearable
          @confirm="onClickSearch"
          @clear="clearSearchKey"
        ></uni-easyinput>
        <text class="search_button" @click="onClickSearch">
          搜索
        </text>
      </view>
      
      <view v-if="pinyinCharacters.length" class="pinyin_container">
        <view
          v-for="(item, index) in pinyinCharacters"
          :id="'study-item-' + index"
          :key="item.value"
          class="item"
          :class="{
            active: item.value === pinyinValue
          }"
          @click="onClickPinyin(item)"
        >
          <view class="pinyin">{{item.value}}</view>
          <view class="character">{{item.name}}</view>
        </view>
      </view>
      <view v-else class="pinyin_empty">没有找到匹配的拼音</view>
      
      <view class="pinyin_tips">
        共 {{allPinyinCount}} 个拼音，当前显示 {{pinyinCount}} 个
      </view>
    </view>

    <view class="pinyin_controls">
      <button
        class="button control_play"
        :class="{ disabled: !pinyinValue }"
        hover-class="none"
        @click="currentPlay"
      >
        播放选中
      </button>
      <button
        class="button control_stop"
        :class="{ disabled: !pinyinValue && !playingAll }"
        hover-class="none"
        @click="stop"
      >
        停止
      </button>
      <button
        class="button control_all"
        :class="{ disabled: !pinyinCharacters.length || playingAll }"
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
import { PINYIN_TYPE_OPTIONS, PINYIN_CHARACTERS } from './constant.js'

export default {
  data () {
    return {
      pinyinType: 'all',
      pinyinValue: 'b',
      searchKey: '',
      pinyinTypeOptions: PINYIN_TYPE_OPTIONS,
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
    pinyinCharacters () {
      const typeList = this.pinyinType === 'all'
        ? PINYIN_CHARACTERS
        : PINYIN_CHARACTERS.filter(c => c.type === this.pinyinType)
      const raw = (this.searchKey || '').trim()
      if (!raw) return typeList
      const key = raw.toLowerCase()
      return typeList.filter(c => {
        const value = (c.value || '').toLowerCase()
        const audio = (c.audio || '').toLowerCase()
        return value.startsWith(key) || audio.startsWith(key) || (c.name && c.name.includes(raw))
      })
    },
    allPinyinCount () {
      return PINYIN_CHARACTERS.length
    },
    pinyinCount () {
      return this.pinyinCharacters.length
    }
  },
  onHide () {
    this.stop()
  },
  onUnload () {
    this.stop({ destroy: true })
  },
  methods: {
    onClickPinyinType (o) {
      this.stop()
      this.pinyinType = o.value
      this.searchKey = ''
      this.pinyinValue = this.pinyinCharacters[0] ? this.pinyinCharacters[0].value : null
    },
    onClickSearch () {
      this.searchKey = (this.searchKey || '').trim()
      const first = this.pinyinCharacters[0]
      if (first) {
        this.pinyinValue = first.value
        return
      }
      uni.showToast({
        title: '没有找到匹配的拼音',
        icon: 'none',
        duration: 2000
      })
    },
    clearSearchKey () {
      this.searchKey = ''
    },
    onClickPinyin (item) {
      this.stop()
      this.pinyinValue = item.value
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
    play (value) {
      const item = PINYIN_CHARACTERS.find(c => c.value === value)
      if (!item) return Promise.resolve(false)
      this.settlePlay(false)
      const token = ++this.playToken
      const src = encodeMediaUrl(`${COS_DOMAIN_NAME}/audio/hanyupinyin/${item.audio || item.value}.mp3`)
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
      if (options.destroy) {
        this.destroyAudio()
      } else {
        this.stopAudio()
      }
    },
    currentPlay () {
      if (!this.pinyinValue) {
        uni.showToast({
          title: '请选择拼音',
          icon: 'none',
          duration: 2000
        })
        return
      }
      this.stop()
      this.play(this.pinyinValue)
    },
    playAll () {
      if (this.playingAll) return
      const list = this.pinyinCharacters
      if (!list.length) {
        uni.showToast({
          title: '没有可播放的拼音',
          icon: 'none',
          duration: 2000
        })
        return
      }
      this.stop()
      const session = ++this.playSession
      this.playQueue = list.slice()
      this.playingAll = true
      const start = Math.max(0, this.playQueue.findIndex(c => c.value === this.pinyinValue))
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
      this.pinyinValue = current.value
      this.scrollCurrentIntoView(index)
      await this.play(current.value)
      if (!this.isPlaySession(session)) return
      const next = list[index + 1]
      if (!next) {
        this.playingAll = false
        return
      }
      this.pinyinValue = next.value
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
