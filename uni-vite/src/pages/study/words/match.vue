<template>
  <view class="page" :class="{ page_no_scroll: settingsVisible }">
    <view class="hud">
      <view class="hud_item">
        <text class="hud_label">场上</text>
        <text class="hud_val">{{ tileCount }}</text>
      </view>
      <view class="hud_item">
        <text class="hud_label">{{ waveLabel }}</text>
        <text class="hud_val">{{ nextWaveText }}</text>
      </view>
      <view class="hud_item">
        <text class="hud_label">已消</text>
        <text class="hud_val">{{ clearedCount }}</text>
      </view>
    </view>

    <view class="hint" :class="{ sparkle: sparkleOn, shake: shakeOn }">
      <text v-if="!running">已停止，可调整下一波间隔后重新开始</text>
      <text v-else-if="selected.length === 0">点单字组成词语即可消除</text>
      <text v-else>已选 {{ selectedChars }}</text>
      <view v-if="sparkleOn" class="sparkles">
        <text v-for="n in sparkleMarks" :key="n" class="sparkle_item" :class="'s' + n">✨</text>
      </view>
    </view>

    <view class="board" :style="boardStyle">
      <view
        v-for="(col, ci) in columns"
        :key="'c-' + ci"
        class="col"
        :class="{ col_warn: col.length >= 8 }"
      >
        <view
          v-for="(tile, ti) in col"
          :key="tile.id"
          class="tile"
          :style="tileStyle"
          :class="[
            'tone' + tile.tone,
            {
              dropping: tile.dropping,
              on: isSelected(tile.id),
              flash: tile.flash
            }
          ]"
          @click="onTapTile(ci, ti)"
        >{{ tile.char }}</view>
      </view>
    </view>

    <view class="bottom_stack">
      <view class="progress_dock">
        剩余字词 {{ remainingWordCount }} / 总字词 {{ totalWordCount }}
      </view>
      <view class="footer">
        <button class="btn btn_settings" :class="{ btn_disabled: running }" @click="openSettings">设置</button>
        <button v-if="running" class="btn btn_stop" @click="stopGame">停止</button>
        <button v-else class="btn btn_start" @click="restart">开始</button>
      </view>
    </view>

    <view v-if="settingsVisible" class="mask" @click.self="closeSettings" @touchmove.stop.prevent>
      <view class="sheet" @click.stop @touchmove.stop>
        <view class="sheet_hd">
          <view class="sheet_title">设置</view>
          <view class="sheet_close" hover-class="sheet_close_hover" @click="closeSettings">×</view>
        </view>
        <view class="sheet_bd_wrap">
          <scroll-view scroll-y class="sheet_bd">
            <view class="form_block">
              <view class="form_block_label">下一波间隔</view>
              <view class="input_wrap">
                <input
                  class="input"
                  type="number"
                  :value="draftDropSec"
                  :adjust-position="false"
                  confirm-type="done"
                  :hold-keyboard="true"
                  @input="onInputDropSec"
                  @focus="dropSecFocused = true"
                  @blur="onDropSecBlur"
                  placeholder="下一波掉落间隔（秒）"
                />
                <view
                  v-if="dropSecFocused && draftDropSec !== '' && draftDropSec != null"
                  class="input_clear"
                  hover-class="input_clear_hover"
                  @mousedown.prevent
                  @touchstart.prevent="clearDropSec"
                  @click="clearDropSec"
                >×</view>
              </view>
              <view class="form_block_tip">默认 {{ defaultDropSec }} 秒，可设 {{ dropMin }}–{{ dropMax }} 秒</view>
            </view>

            <view class="word_pick_title">
              {{ libraryTitle || '当前词库' }}（共 {{ libraryWords.length }} 个）
            </view>
            <view class="word_pick_grid">
              <view
                v-for="w in libraryWords"
                :key="w"
                class="word_chip"
              >{{ w }}</view>
            </view>
          </scroll-view>
        </view>
        <view class="sheet_ft">
          <button class="btn_cancel_sheet" @click="closeSettings">取消</button>
          <button class="btn_ok_sheet" @click="confirmSettings">确认</button>
        </view>
      </view>
    </view>

    <common-dialog
      :show="overVisible"
      :title="overTitle"
      :message="overMessage"
      confirm-button-text="再玩一次"
      show-cancel-button
      cancel-button-text="返回"
      :close-on-click-overlay="false"
      @update:show="onOverShow"
      @confirm="restart"
      @cancel="goHome"
    />
  </view>
</template>

<script>
import { getValue as _get } from '@/common/js/common.js'
import { clampNumber } from '@/common/js/dictation.js'
import CommonDialog from '@/components/common/dialog/index.vue'
import { loadWordsPayload } from './storage.js'
import {
  COL_COUNT,
  COL_HEIGHT_DIFF_MAX,
  COL_MAX,
  DROP_WORD_COUNT,
  INIT_WORD_COUNT,
  MATCH_DROP_MAX,
  MATCH_DROP_MIN,
  MATCH_DROP_SEC,
  MATCH_FINAL_SEC,
  TILE_HEIGHT_RPX,
  boardHeightRpx,
  buildWordItems,
  charsOf,
  destroyWordSfx,
  isMatchableWord,
  loadMatchDropSec,
  pauseMatchBgm,
  pickTileTone,
  playMatchResult,
  playWordSfx,
  resumeMatchBgm,
  saveMatchDropSec,
  shuffle,
  startMatchBgm,
  stopMatchBgm
} from './words.js'

let tileSeq = 0

function emptyColumns () {
  return Array.from({ length: COL_COUNT }, () => [])
}

export default {
  components: { CommonDialog },
  data () {
    return {
      wordSet: [],
      deck: [],
      columns: emptyColumns(),
      selected: [],
      clearedCount: 0,
      dropSec: MATCH_DROP_SEC,
      draftDropSec: MATCH_DROP_SEC,
      defaultDropSec: MATCH_DROP_SEC,
      dropMin: MATCH_DROP_MIN,
      dropMax: MATCH_DROP_MAX,
      remainSec: MATCH_DROP_SEC,
      running: false,
      settingsVisible: false,
      libraryTitle: '',
      libraryWords: [],
      dropSecFocused: false,
      dropTimer: null,
      tickTimer: null,
      dropTimeouts: [],
      matching: false,
      ended: false,
      finalClearing: false,
      shakeOn: false,
      sparkleOn: false,
      sparkleMarks: [1, 2, 3, 4, 5],
      shakeTimer: null,
      sparkleTimer: null,
      overVisible: false,
      overTitle: '',
      overMessage: '',
      overWin: false
    }
  },
  computed: {
    tileCount () {
      return this.columns.reduce((n, col) => n + col.length, 0)
    },
    totalWordCount () {
      return this.wordSet.length
    },
    remainingWordCount () {
      return Math.max(0, this.totalWordCount - this.clearedCount)
    },
    waveLabel () {
      if (this.running && this.finalClearing) return '倒计时'
      return '下一波'
    },
    nextWaveText () {
      if (!this.running) return '—'
      if (!this.deck.length && !this.finalClearing) return '—'
      return this.remainSec + 's'
    },
    selectedChars () {
      const chars = this.selected.map(s => s.char)
      if (!chars.length) return ''
      return chars.join(' + ') + ' + ？'
    },
    maxWordLen () {
      return this.wordSet.reduce((m, w) => Math.max(m, charsOf(w).length), 2)
    },
    boardStyle () {
      return { height: boardHeightRpx(COL_MAX) + 'rpx' }
    },
    tileStyle () {
      return {
        height: TILE_HEIGHT_RPX + 'rpx',
        lineHeight: TILE_HEIGHT_RPX + 'rpx'
      }
    }
  },
  onLoad () {
    this.dropSec = loadMatchDropSec()
    this.draftDropSec = this.dropSec
    this.remainSec = this.dropSec
    const saved = loadWordsPayload()
    this.libraryTitle = (saved && saved.libraryTitle) || ''
    const savedWords = Array.isArray(saved && saved.words) ? saved.words : []
    this.libraryWords = Array.from(new Set(savedWords.filter(Boolean)))
    const items = buildWordItems(savedWords)
    const words = items.map(e => e.word).filter(isMatchableWord)
    this.wordSet = Array.from(new Set(words))
    if (this.wordSet.length < 1) {
      uni.showToast({ title: '请选择至少一组词语', icon: 'none' })
      this.goHome()
      return
    }
    this.restart()
  },
  onUnload () {
    this.clearTimers()
    destroyWordSfx()
  },
  onHide () {
    pauseMatchBgm()
  },
  onShow () {
    if (this.running && !this.ended) resumeMatchBgm()
  },
  methods: {
    goHome () {
      uni.navigateBack({
        fail: () => {
          uni.redirectTo({ url: '/pages/study/words/index' })
        }
      })
    },
    onOverShow (val) {
      this.overVisible = val
    },
    clearDropLoop () {
      if (this.dropTimer) clearInterval(this.dropTimer)
      if (this.tickTimer) clearInterval(this.tickTimer)
      this.dropTimer = null
      this.tickTimer = null
    },
    clearTimers () {
      this.clearDropLoop()
      this.finalClearing = false
      this.remainSec = 0
      if (this.shakeTimer) clearTimeout(this.shakeTimer)
      if (this.sparkleTimer) clearTimeout(this.sparkleTimer)
      ;(this.dropTimeouts || []).forEach(id => clearTimeout(id))
      this.shakeTimer = null
      this.sparkleTimer = null
      this.dropTimeouts = []
    },
    openSettings () {
      if (this.running) {
        uni.showToast({ title: '请先停止后再设置', icon: 'none' })
        return
      }
      this.draftDropSec = this.dropSec
      this.dropSecFocused = false
      this.settingsVisible = true
    },
    closeSettings () {
      this.settingsVisible = false
      this.dropSecFocused = false
    },
    onInputDropSec (e) {
      const v = _get(e, 'detail.value')
      if (v === '' || v == null) {
        this.draftDropSec = ''
        return
      }
      this.draftDropSec = clampNumber(v, MATCH_DROP_MIN, MATCH_DROP_MAX)
    },
    onDropSecBlur () {
      setTimeout(() => {
        this.dropSecFocused = false
      }, 120)
    },
    clearDropSec () {
      this.draftDropSec = ''
      this.dropSecFocused = true
    },
    confirmSettings () {
      this.dropSec = saveMatchDropSec(this.draftDropSec === '' ? MATCH_DROP_SEC : this.draftDropSec)
      this.draftDropSec = this.dropSec
      this.remainSec = this.dropSec
      this.settingsVisible = false
      this.dropSecFocused = false
      uni.showToast({ title: '设置已保存', icon: 'none' })
    },
    stopGame () {
      this.clearTimers()
      this.running = false
      this.matching = false
      this.selected = []
      this.shakeOn = false
      this.sparkleOn = false
      stopMatchBgm()
    },
    takeFromDeck (n) {
      const count = Math.max(0, n)
      if (!count || !this.deck.length) return []
      return this.deck.splice(0, Math.min(count, this.deck.length))
    },
    restart () {
      this.clearTimers()
      this.overVisible = false
      this.settingsVisible = false
      this.overWin = false
      this.ended = false
      this.matching = false
      this.columns = emptyColumns()
      this.selected = []
      this.clearedCount = 0
      this.shakeOn = false
      this.sparkleOn = false
      this.deck = shuffle(this.wordSet.slice())
      this.remainSec = this.dropSec
      this.finalClearing = false
      this.running = true
      startMatchBgm()
      const first = this.takeFromDeck(INIT_WORD_COUNT)
      this.dropWords(first, true)
      this.startDropLoop()
    },
    startDropLoop () {
      this.clearDropLoop()
      this.finalClearing = false
      if (!this.deck.length) {
        this.startFinalCountdown()
        return
      }
      this.remainSec = this.dropSec
      this.tickTimer = setInterval(() => {
        if (!this.running || this.ended || this.finalClearing || !this.deck.length) return
        this.remainSec = Math.max(0, this.remainSec - 1)
      }, 1000)
      this.dropTimer = setInterval(() => {
        if (!this.running || this.ended || this.finalClearing) return
        if (!this.deck.length) {
          this.startFinalCountdown()
          return
        }
        const more = this.takeFromDeck(DROP_WORD_COUNT)
        this.dropWords(more, true)
        if (!this.deck.length) {
          this.startFinalCountdown()
          return
        }
        this.remainSec = this.dropSec
      }, this.dropSec * 1000)
    },
    startFinalCountdown () {
      this.clearDropLoop()
      if (!this.running || this.ended) return
      if (this.tileCount <= 0 && this.clearedCount >= this.totalWordCount) {
        this.finish(true)
        return
      }
      this.finalClearing = true
      this.remainSec = MATCH_FINAL_SEC
      this.tickTimer = setInterval(() => {
        if (!this.running || this.ended || !this.finalClearing) return
        this.remainSec = Math.max(0, this.remainSec - 1)
        if (this.remainSec <= 0) {
          this.clearDropLoop()
          if (this.tileCount <= 0 && this.clearedCount >= this.totalWordCount) {
            this.finish(true)
          } else {
            this.finish(false)
          }
        }
      }, 1000)
    },
    pickColIndex () {
      const lengths = this.columns.map(col => col.length)
      const candidates = []
      for (let i = 0; i < lengths.length; i++) {
        const next = lengths.slice()
        next[i] += 1
        const min = Math.min(...next)
        const max = Math.max(...next)
        if (max - min <= COL_HEIGHT_DIFF_MAX) candidates.push(i)
      }
      if (candidates.length) {
        return candidates[Math.floor(Math.random() * candidates.length)]
      }
      // 兜底：落最短列，尽量压住高度差
      const minLen = Math.min(...lengths)
      const shorts = []
      lengths.forEach((len, i) => {
        if (len === minLen) shorts.push(i)
      })
      return shorts[Math.floor(Math.random() * shorts.length)]
    },
    dropWords (words, stagger) {
      if (this.ended || !this.running) return
      const chars = []
      ;(words || []).forEach(w => {
        charsOf(w).forEach(ch => chars.push(ch))
      })
      const shuffled = shuffle(chars)
      if (!stagger) {
        shuffled.forEach(ch => this.placeChar(ch))
        return
      }
      shuffled.forEach((ch, i) => {
        const id = setTimeout(() => {
          if (this.ended || !this.running) return
          this.placeChar(ch)
        }, i * 70)
        this.dropTimeouts.push(id)
      })
    },
    placeChar (ch) {
      if (this.ended || !this.running) return
      const colIdx = this.pickColIndex()
      const tile = {
        id: 't' + (++tileSeq),
        char: ch,
        tone: pickTileTone(),
        dropping: true,
        flash: false
      }
      const next = this.columns.map((col, i) => i === colIdx ? col.concat([tile]) : col)
      this.columns = next
      if (next[colIdx].length > COL_MAX) {
        this.finish(false)
        return
      }
      const dropId = setTimeout(() => {
        this.columns = this.columns.map(col => col.map(t => t.id === tile.id ? { ...t, dropping: false } : t))
      }, 420)
      this.dropTimeouts.push(dropId)
    },
    isSelected (id) {
      return this.selected.some(s => s.id === id)
    },
    matchStatus (chars) {
      const formed = chars.join('')
      if (this.wordSet.includes(formed)) return 'exact'
      if (chars.length === 2) {
        const rev = chars.slice().reverse().join('')
        if (this.wordSet.includes(rev)) return 'exact'
      }
      if (chars.length === 1) {
        const ch = chars[0]
        return this.wordSet.some(w => w.includes(ch)) ? 'prefix' : 'none'
      }
      const hasPrefix = this.wordSet.some(w => w.startsWith(formed))
      if (hasPrefix) return 'prefix'
      return 'none'
    },
    onTapTile (ci, ti) {
      if (!this.running || this.ended || this.matching) return
      const tile = this.columns[ci] && this.columns[ci][ti]
      if (!tile || tile.dropping) return
      const exist = this.selected.findIndex(s => s.id === tile.id)
      if (exist >= 0) {
        this.selected = this.selected.filter(s => s.id !== tile.id)
        return
      }
      const next = this.selected.concat([{ id: tile.id, char: tile.char, col: ci }])
      const chars = next.map(s => s.char)
      const status = this.matchStatus(chars)
      if (status === 'exact') {
        this.selected = next
        this.clearPair(next)
        return
      }
      if (status === 'prefix' && chars.length < this.maxWordLen) {
        this.selected = next
        return
      }
      this.selected = next
      this.shakeOn = true
      playWordSfx(false)
      this.shakeTimer = setTimeout(() => {
        this.shakeOn = false
        this.selected = []
      }, 420)
    },
    clearPair (pair) {
      const ids = new Set(pair.map(s => s.id))
      const remaining = this.tileCount - pair.length
      this.columns = this.columns.map(col => col.map(t => ids.has(t.id) ? { ...t, flash: true } : t))
      this.sparkleOn = true
      playWordSfx(true)
      this.clearedCount += 1
      if (remaining <= 0 && !this.deck.length) {
        this.finish(true)
        return
      }
      this.matching = true
      this.sparkleTimer = setTimeout(() => {
        this.columns = this.columns.map(col => col.filter(t => !ids.has(t.id)))
        this.selected = []
        this.sparkleOn = false
        this.matching = false
        this.tryWinIfClear()
      }, 380)
    },
    tryWinIfClear () {
      if (this.ended || !this.running) return
      if (!this.deck.length && this.tileCount <= 0) {
        this.finish(true)
      }
    },
    finish (win) {
      if (this.ended || this.overVisible) return
      this.ended = true
      this.running = false
      this.clearTimers()
      this.overWin = !!win
      this.overTitle = win ? '全部消除啦' : '挑战结束'
      this.overMessage = win
        ? `太棒了，一共消除 ${this.clearedCount} 组词语。`
        : '游戏失败'
      this.overVisible = true
      playMatchResult(!!win)
    }
  }
}
</script>

<style lang="less" src="./match.less" scoped></style>
<style>
@keyframes words-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
@keyframes words-sparkle-pop {
  0% { transform: scale(0.4); opacity: 0; }
  35% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1.7); opacity: 0; }
}
@keyframes words-tile-drop {
  0% { transform: translateY(-220px); opacity: 0.15; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes words-tile-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}
</style>
