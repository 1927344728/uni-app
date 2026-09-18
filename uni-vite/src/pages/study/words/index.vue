<template>
  <view class="page" :class="{ page_no_scroll: settingsVisible }">
    <view class="hero">
      <view class="hero_kicker">字词小游戏</view>
      <view class="hero_title">听一听，消一消</view>
      <view class="hero_desc">选好词库后开始练习。听音选出字词和拼音，或点单字组成词语消掉。</view>
    </view>

    <view class="lib_card">
      <view class="lib_label">当前词库</view>
      <view class="lib_name">{{ libraryLabel }}</view>
      <view class="lib_meta">已选 {{ selectedCount }} 个词语</view>
    </view>

    <view class="entries">
      <view class="entry entry_listen" hover-class="entry_hover" @click="goListen">
        <view class="entry_badge">听</view>
        <view class="entry_body">
          <view class="entry_title">听音选词</view>
          <view class="entry_desc">听读音，选出正确的字词和拼音</view>
        </view>
        <view class="entry_arrow">›</view>
      </view>
      <view class="entry entry_match" hover-class="entry_hover" @click="goMatch">
        <view class="entry_badge">消</view>
        <view class="entry_body">
          <view class="entry_title">字词消消乐</view>
          <view class="entry_desc">点单字组成词语，全部消除就获胜</view>
        </view>
        <view class="entry_arrow">›</view>
      </view>
    </view>

    <view class="bottom_stack">
      <view class="footer">
        <button class="btn_lib" @click="openSettings">选择词库</button>
      </view>
    </view>

    <view v-if="settingsVisible" class="mask" @click.self="closeSettings" @touchmove.stop.prevent>
      <view class="sheet" @click.stop @touchmove.stop>
        <view class="sheet_hd">
          <view class="sheet_title">选择词库</view>
          <view class="sheet_close" hover-class="sheet_close_hover" @click="closeSettings">×</view>
        </view>

        <scroll-view scroll-y class="sheet_bd">
          <view v-if="libraryOptions.length" class="form_row">
            <view class="form_row_label">词库</view>
            <view class="form_row_field">
              <picker
                class="picker"
                mode="selector"
                :range="libraryOptions"
                range-key="label"
                :value="libraryIndex"
                @change="onLibraryChange"
              >
                <view class="input picker_value">
                  <text class="picker_value_text">{{ libraryLabel }}</text>
                </view>
              </picker>
            </view>
          </view>

          <view v-if="wordLength" class="form_row">
            <view class="form_row_label">词语数量</view>
            <view class="form_row_field">
              <input
                class="input"
                type="number"
                :value="settings.wordCount"
                :adjust-position="false"
                confirm-type="done"
                :hold-keyboard="true"
                @input="onInputWordCount"
                @blur="onBlurWordCount"
                placeholder="请输入随机抽取的词语数量"
              />
            </view>
          </view>

          <view>
            <view class="word_pick_title">选择词语</view>
            <view class="word_pick_grid">
              <view
                v-for="w in settings.availableWords"
                :key="w"
                class="word_chip"
                :class="{ word_chip_on: settings.selectedWords.includes(w) }"
                @click="toggleWord(w)"
              >
                {{ w }}
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="sheet_ft">
          <button class="btn_cancel_sheet" @click="closeSettings">取消</button>
          <button class="btn_ok_sheet" @click="confirmSettings">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getValue as _get } from '@/common/js/common.js'
import { getChineseWordList } from '@/api'
import { clampNumber, splitWords } from '@/common/js/dictation.js'
import { loadWordsPayload, saveWordsPayload } from './storage.js'

export default {
  data () {
    return {
      allWordList: [],
      wordList: [],
      settingsVisible: false,
      settings: {
        libraryId: null,
        availableWords: [],
        selectedWords: [],
        wordCount: 0
      }
    }
  },
  computed: {
    wordLength () {
      return this.wordList.length
    },
    selectedCount () {
      return (this.settings.selectedWords || []).length
    },
    libraryOptions () {
      return (this.allWordList || [])
        .filter(e => e && (e.title || e.id != null))
        .map(e => ({
          value: e.id,
          label: e.title || `词库${e.id}`
        }))
    },
    libraryIndex () {
      const idx = this.libraryOptions.findIndex(e => Number(e.value) === Number(this.settings.libraryId))
      return idx < 0 ? 0 : idx
    },
    libraryLabel () {
      return this.libraryOptions[this.libraryIndex]?.label || '请选择词库'
    }
  },
  async onLoad () {
    await this.fetchLibraries().catch(() => {})
    this.restorePayload()
    this.resetSettingsAvailableWords()
    this.openSettings()
  },
  methods: {
    fetchLibraries () {
      return getChineseWordList({
        pageNum: 0,
        pageSize: 50
      }).then(data => {
        this.allWordList = _get(data, 'content', [])
        const first = this.allWordList[0] || {}
        if (this.settings.libraryId == null && first.id != null) {
          this.pickLibrary(first.id)
        }
        return data
      })
    },
    restorePayload () {
      const saved = loadWordsPayload()
      if (!saved) return
      if (saved.libraryId != null) {
        const found = this.allWordList.find(e => Number(e.id) === Number(saved.libraryId))
        if (found) {
          this.settings.libraryId = found.id
          this.wordList = splitWords(found.words || '')
        }
      }
      if (!this.wordList.length && saved.words.length) {
        this.wordList = saved.words.slice()
      }
      this.settings.selectedWords = (saved.words || []).filter(w => this.wordList.includes(w))
      this.settings.wordCount = clampNumber(saved.wordCount || this.settings.selectedWords.length, 1, this.wordList.length || 1)
    },
    resetSettingsAvailableWords () {
      const list = (this.wordList || []).filter(Boolean)
      this.settings.availableWords = Array.from(new Set(list))
      this.settings.selectedWords = (this.settings.selectedWords || []).filter(w => this.settings.availableWords.includes(w))
      if (this.settings.selectedWords.length === 0) {
        this.settings.selectedWords = [...this.settings.availableWords]
      }
      this.settings.wordCount = clampNumber(this.settings.selectedWords.length, 1, this.settings.availableWords.length || 1)
    },
    persist () {
      saveWordsPayload({
        libraryId: this.settings.libraryId,
        libraryTitle: this.libraryLabel,
        words: this.settings.selectedWords,
        wordCount: this.settings.wordCount
      })
    },
    openSettings () {
      this.resetSettingsAvailableWords()
      this.settingsVisible = true
    },
    closeSettings () {
      this.settingsVisible = false
    },
    onLibraryChange (e) {
      const idx = Number(_get(e, 'detail.value', 0))
      const opt = this.libraryOptions[idx]
      if (opt) this.pickLibrary(opt.value)
    },
    pickLibrary (value) {
      const id = Number(value)
      const words = this.allWordList.find(e => Number(e.id) === id)?.words || ''
      this.settings.libraryId = id
      this.wordList = splitWords(words)
      this.settings.selectedWords = []
      this.resetSettingsAvailableWords()
    },
    toggleWord (w) {
      const word = String(w)
      const set = new Set(this.settings.selectedWords)
      if (set.has(word)) set.delete(word)
      else set.add(word)
      this.settings.selectedWords = Array.from(set)
      this.settings.wordCount = clampNumber(this.settings.selectedWords.length, 1, this.settings.availableWords.length)
    },
    onInputWordCount (e) {
      const v = _get(e, 'detail.value')
      const maxN = this.settings.availableWords.length || 1
      this.settings.wordCount = clampNumber(v, 1, maxN)
    },
    onBlurWordCount () {
      const maxN = this.settings.availableWords.length || 1
      const n = clampNumber(this.settings.wordCount, 1, maxN)
      this.settings.wordCount = n
      const pool = [...this.settings.availableWords]
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = pool[i]
        pool[i] = pool[j]
        pool[j] = t
      }
      this.settings.selectedWords = pool.slice(0, n)
    },
    confirmSettings () {
      const words = (this.settings.selectedWords || []).filter(Boolean)
      if (!words.length) {
        uni.showToast({ title: '请至少选择一个词语', icon: 'none' })
        return
      }
      this.persist()
      this.settingsVisible = false
    },
    ensureReady () {
      const words = (this.settings.selectedWords || []).filter(Boolean)
      if (!words.length) {
        uni.showToast({ title: '请先选择词库', icon: 'none' })
        this.openSettings()
        return false
      }
      this.persist()
      return true
    },
    goListen () {
      if (!this.ensureReady()) return
      uni.navigateTo({
        url: '/pages/study/words/listen',
        fail: () => uni.showToast({ title: '打开页面失败', icon: 'none' })
      })
    },
    goMatch () {
      if (!this.ensureReady()) return
      uni.navigateTo({
        url: '/pages/study/words/match',
        fail: () => uni.showToast({ title: '打开页面失败', icon: 'none' })
      })
    }
  }
}
</script>

<style lang="less" src="./index.less" scoped></style>
