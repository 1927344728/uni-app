<template>
  <view class="page" :class="{ with_login_dock: userReady && !isLoggedIn }">
    <arithmetic-deco tone="index" />
    <view class="page_main">
    <view class="user_card">
      <view class="user_name">{{ displayName }}</view>
      <view class="user_meta">等级: {{ stats.levelName }}</view>
      <view class="user_meta">最佳成绩: {{ stats.bestScore }} 分 {{ bestDurationText }}</view>
      <view class="user_meta">满分成绩: {{ stats.perfectCount }} 次</view>
      <view class="user_meta">王者挑战满分: {{ stats.kingPerfectCount }} 次</view>
    </view>

    <view class="grid">
      <view
        v-for="item in modeButtons"
        :key="item.key"
        class="mode_btn"
        :class="item.color"
        hover-class="mode_btn_hover"
        @click="startRound(item.key)"
      >
        {{ item.name }}
      </view>
    </view>

    <view class="challenge" hover-class="mode_btn_hover" @click="startRound('king')">王者挑战</view>
    <view v-if="userReady" class="link_wrap" hover-class="link_hover" @click="goScores">
      <text class="link_text">我的成绩</text>
    </view>

    <view v-if="userReady && !isLoggedIn" class="login_dock">
      <view class="link_wrap" hover-class="link_hover" @click="goLogin">
        <text class="link_text">登录</text>
      </view>
    </view>
    </view>

    <view class="fab">
      <view class="fab_btn" hover-class="fab_btn_hover" @click="openHelp">
        <uni-icons type="help-filled" size="26" color="rgb(0 135 108)"></uni-icons>
      </view>
      <view class="fab_btn" hover-class="fab_btn_hover" @click="openSettings">
        <uni-icons type="gear-filled" size="26" color="rgb(0 135 108)"></uni-icons>
      </view>
    </view>

    <common-dialog
      :show="helpVisible"
      title="怎么玩"
      message="选择题型后开始限时四选一。每题限时作答，满分 100 分，每题得分按题量均分，答错或超时不得分。默认 20 题、每题 10 秒，可在设置里修改。中途退出不保存进度。登录后成绩会保存到账号。"
      confirm-button-text="知道了"
      close-on-click-overlay
      @update:show="helpVisible = $event"
    />

    <common-popup
      :show="settingsVisible"
      title="设置"
      height="50%"
      :show-cancel-button="false"
      confirm-button-text="保存"
      @update:show="onSettingsShow"
      @confirm="saveDraft"
    >
      <view class="settings_body">
        <view class="form_row">
          <view class="form_label">题量</view>
          <view class="chip_row">
            <view
              v-for="n in countOptions"
              :key="'c-' + n"
              class="chip"
              :class="{ chip_active: draft.questionCount === n }"
              @click="draft.questionCount = n"
            >{{ n }}</view>
          </view>
        </view>
        <view class="form_row">
          <view class="form_label">每题时限</view>
          <view class="chip_row">
            <view
              v-for="n in timeOptions"
              :key="'t-' + n"
              class="chip"
              :class="{ chip_active: draft.timeLimit === n }"
              @click="draft.timeLimit = n"
            >{{ n }} 秒</view>
          </view>
        </view>
        <view class="form_row">
          <view class="form_label">音效</view>
          <view class="chip_row">
            <view class="chip" :class="{ chip_active: draft.sound }" @click="draft.sound = true">开</view>
            <view class="chip" :class="{ chip_active: !draft.sound }" @click="draft.sound = false">关</view>
          </view>
        </view>
      </view>
    </common-popup>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import store from '@/store/index'
import { getUserInfo } from '@/api'
import { getArithmeticStats } from '@/api/study.js'
import CommonDialog from '@/components/common/dialog/index.vue'
import CommonPopup from '@/components/common/popup/index.vue'
import ArithmeticDeco from './deco.vue'
import {
  MODE_BUTTONS,
  COUNT_OPTIONS,
  TIME_OPTIONS,
  loadSettings,
  saveSettings,
  emptyStats,
  formatDuration,
  openLoginPage,
  startArithmeticBgm
} from './arithmetic.js'

export default {
  components: {
    CommonDialog,
    CommonPopup,
    ArithmeticDeco
  },
  data () {
    return {
      modeButtons: MODE_BUTTONS,
      countOptions: COUNT_OPTIONS,
      timeOptions: TIME_OPTIONS,
      stats: emptyStats(),
      userReady: false,
      helpVisible: false,
      settingsVisible: false,
      draft: loadSettings()
    }
  },
  computed: {
    ...mapState(['userInfo']),
    isLoggedIn () {
      return !!(this.userInfo && (this.userInfo.id || this.userInfo.uuid || this.userInfo.phone || this.userInfo.nickname || this.userInfo.name))
    },
    displayName () {
      const u = this.userInfo
      return (u && (u.nickname || u.name)) || '游客'
    },
    bestDurationText () {
      if (!this.stats.bestScore) return ''
      return ' / ' + formatDuration(this.stats.bestDurationMs)
    }
  },
  onShow () {
    this.refreshUser()
  },
  methods: {
    refreshUser () {
      this.userReady = false
      getUserInfo({ login: 0 }).then((data) => {
        store.commit('setUserInfo', data || null)
        if (data) this.loadStats()
        else this.stats = emptyStats()
      }).catch(() => {
        store.commit('setUserInfo', null)
        this.stats = emptyStats()
      }).finally(() => {
        this.userReady = true
      })
    },
    loadStats () {
      getArithmeticStats({ login: 0 }).then((data) => {
        this.stats = { ...emptyStats(), ...(data || {}) }
      }).catch(() => {
        this.stats = emptyStats()
      })
    },
    startRound (mode) {
      startArithmeticBgm(mode)
      uni.navigateTo({
        url: '/pages/study/arithmetic/play?mode=' + encodeURIComponent(mode)
      })
    },
    goScores () {
      uni.navigateTo({
        url: '/pages/study/arithmetic/scores'
      })
    },
    goLogin () {
      openLoginPage()
    },
    openHelp () {
      this.helpVisible = true
    },
    openSettings () {
      this.draft = { ...loadSettings() }
      this.settingsVisible = true
    },
    onSettingsShow (val) {
      this.settingsVisible = val
    },
    saveDraft () {
      saveSettings({
        questionCount: this.draft.questionCount,
        timeLimit: this.draft.timeLimit,
        sound: !!this.draft.sound
      })
      this.settingsVisible = false
      uni.showToast({ title: '设置已保存', icon: 'none' })
    }
  }
}
</script>

<style lang="less" src="./index.less" scoped></style>
