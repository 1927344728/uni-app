<template>
  <view class="page">
    <view class="form">
      <view class="field">
        <text class="field_label">温馨提示</text>
        <textarea
          class="textarea placeholder_light"
          placeholder-class="textarea_placeholder"
          v-model="note"
          maxlength="100"
          :auto-height="false"
          placeholder="请输入温馨提示（选填）。比如注意事项、书写要求、时间限制等"
        />
        <view class="tip_actions">
          <button class="btn_tip" @click="cycleTip">换一条默认文案</button>
        </view>
      </view>

      <view class="field">
        <text class="field_label">听写词语</text>
        <textarea
          class="textarea textarea_lg placeholder_light"
          placeholder-class="textarea_placeholder"
          v-model="wordsInput"
          maxlength="500"
          :auto-height="false"
          placeholder="请输入听写词语，总字数不超过 500。词语用逗号、顿号（中英均可）或空格分隔。例如：苹果,香蕉 书包、橡皮。"
        />
      </view>

      <view v-if="generatedUrl" class="preview" @click="copyGenerated">
        <view class="preview_title">听写小助手链接（点击复制）</view>
        <text selectable class="preview_text">{{ generatedUrl }}</text>
      </view>
    </view>

    <view class="bottom_stack">
      <view class="hint_dock">
        输入听写词语，一键生成听写链接。转发给同学或家长，打开后就能按设置开始朗读听写，适合课堂小测与家庭练习。
      </view>
      <view class="footer_bar">
        <button class="btn_clear" @click="clearAll">清空</button>
        <button class="btn_goto" @click="goDictation">去听写</button>
        <button class="btn_generate" @click="generateAndCopy">生成链接并复制</button>
      </view>
    </view>
  </view>
</template>

<script>
import { PUBLIC_WEB_DOMAIN } from '@/utils/variables.js'
import { splitWords, joinWordsParam } from '@/utils/dictation.js'

const DEFAULT_TIPS = [
  '听写前请先准备好铅笔与田字格本，保持桌面整洁，书写时坐姿端正，注意笔顺与占格。',
  '每个词语会朗读多遍并留出书写时间，请专心听清再动笔，写完后可对照屏幕自查。',
  '遇到不会写的字先留空或写拼音，全部完成后再回头补写，避免长时间停顿影响节奏。',
  '书写要求：字迹工整、大小适中，标点若需要请写在格内相应位置，保持卷面干净。',
  '若环境嘈杂，可佩戴耳机或靠近设备，确保能听清每一个音节与声调。',
  '家长陪伴时尽量只提示「再听一遍」，不要直接说出字形，让孩子独立回忆与书写。',
  '完成后对照词语自查：先查错别字，再查笔顺与拼音，最后朗读一遍巩固记忆。',
  '听写间隔可在听写页设置里调整，建议根据年级与熟练度逐步缩短间隔以提升反应速度。',
  '若语音无法播放，请检查浏览器或系统是否允许页面发声，并适当调高媒体音量。',
  '把本页生成的链接收藏或发给同伴，即可反复练习同一组词，巩固生字与词语搭配。'
]

export default {
  data () {
    return {
      note: DEFAULT_TIPS[0] || '',
      tipIndex: 0,
      wordsInput: '',
      generatedUrl: ''
    }
  },
  methods: {
    cycleTip () {
      this.tipIndex = (this.tipIndex + 1) % DEFAULT_TIPS.length
      this.note = DEFAULT_TIPS[this.tipIndex]
    },
    clearAll () {
      this.note = ''
      this.wordsInput = ''
      this.generatedUrl = ''
    },
    buildLink ({ note, words }) {
      const noteEncoded = encodeURIComponent(String(note || ''))
      const wordsEncoded = encodeURIComponent(String(words || ''))
      const route = `/pages/study/dictation/index?note=${noteEncoded}&words=${wordsEncoded}`
      return `${PUBLIC_WEB_DOMAIN}${route}`
    },
    buildDictationRoute () {
      const wordsArr = splitWords(this.wordsInput)
      if (!wordsArr.length) return ''
      const words = joinWordsParam(wordsArr)
      const noteEncoded = encodeURIComponent(String(this.note || ''))
      const wordsEncoded = encodeURIComponent(words)
      return `/pages/study/dictation/index?note=${noteEncoded}&words=${wordsEncoded}`
    },
    goDictation () {
      const route = this.buildDictationRoute()
      if (!route) {
        uni.showToast({ title: '请至少输入一个词语', icon: 'none' })
        return
      }
      uni.navigateTo({ url: route })
    },
    async copyGenerated () {
      if (!this.generatedUrl) return
      uni.setClipboardData({
        data: this.generatedUrl,
        success: () => {
          uni.showToast({ title: '已复制链接', icon: 'none' })
        },
        fail: () => {
          uni.showToast({ title: '复制失败', icon: 'none' })
        }
      })
    },
    async generateAndCopy () {
      const wordsArr = splitWords(this.wordsInput)
      if (!wordsArr.length) {
        uni.showToast({ title: '请至少输入一个词语', icon: 'none' })
        return
      }

      const words = joinWordsParam(wordsArr)
      const url = this.buildLink({ note: this.note, words })
      this.generatedUrl = url

      uni.setClipboardData({
        data: this.generatedUrl,
        success: () => {
          uni.showToast({ title: '已复制链接', icon: 'none' })
        },
        fail: () => {
          uni.showToast({ title: '复制失败', icon: 'none' })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
