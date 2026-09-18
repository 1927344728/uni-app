<template>
  <view class="pingyin_page">
    <view class="pinyin_header">
      <text class="pinyin_title">英文字母发音学习</text>
      <view class="description">点击任意字母即可播放发音</view>
    </view>
    
    <view class="pingyin_card">
      <view class="pingyin_search">
        <uni-easyinput
          v-model="searchKey"
          type="text"
          class="search_key"
          placeholder="搜索字母..."
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
          v-for="item in shownItems"
          :key="item.value"
          class="item"
          :class="{
            active: item.value === currentValue
          }"
          @click="onClickItem(item)"
        >
          <view class="pinyin">{{ item.value.toLowerCase() }}</view>
          <view class="character">{{ item.name }}</view>
        </view>
      </view>
      <view v-else class="pinyin_empty">没有找到匹配的字母</view>
      
      <view class="pinyin_tips">
        共 {{ allCount }} 个字母，当前显示 {{ shownCount }} 个
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
import { TTSService } from '@/common/tts'
import { LETTERS } from './constant.js'

const UNIT_NAME = '字母'
const TTS_OPTIONS = { lang: 'en-US' }
const tts = new TTSService()

export default {
  data () {
    return {
      currentValue: 'A',
      searchKey: '',
      playingAll: false,
      playToken: 0,
      playSession: 0,
      playTimer: null,
      playQueue: []
    }
  },
  computed: {
    shownItems () {
      const raw = (this.searchKey || '').trim()
      if (!raw) return LETTERS
      const key = raw.toLowerCase()
      return LETTERS.filter(c => {
        const value = (c.value || '').toLowerCase()
        const pair = `${value}${value}`
        const name = (c.name || '').toLowerCase()
        return value.startsWith(key)
          || pair.startsWith(key)
          || name.includes(key)
          || (c.name && c.name.includes(raw))
      })
    },
    allCount () {
      return LETTERS.length
    },
    shownCount () {
      return this.shownItems.length
    }
  },
  onHide () {
    this.stop()
  },
  onUnload () {
    this.stop()
  },
  methods: {
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
    speakText (item) {
      return item && item.value
    },
    async play (value) {
      const item = LETTERS.find(c => c.value === value)
      if (!item) return false
      const token = ++this.playToken
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
    stop () {
      this.playingAll = false
      this.playQueue = []
      this.playSession += 1
      this.playToken += 1
      this.clearPlayTimer()
      try { tts.stop() } catch (e) {}
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
    async recursionPlayAt (index, session) {
      const list = this.playQueue
      const current = list[index]
      if (!this.isPlaySession(session) || !current) {
        if (session === this.playSession) this.playingAll = false
        return
      }
      this.currentValue = current.value
      await this.play(current.value)
      if (!this.isPlaySession(session)) return
      const next = list[index + 1]
      if (!next) {
        this.playingAll = false
        return
      }
      this.currentValue = next.value
      this.playTimer = setTimeout(() => {
        if (!this.isPlaySession(session)) return
        this.recursionPlayAt(index + 1, session)
      }, 500)
    }
  }
}
</script>

<style src="./index.css"></style>
