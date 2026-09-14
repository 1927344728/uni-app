<template>
  <view v-if="show" class="common_popup" :style="{ zIndex: zIndex }">
    <view
      v-if="overlay"
      class="common_popup__overlay"
      @click="onClickOverlay"
      @touchmove.stop.prevent
    />
    <view
      class="common_popup__panel"
      :class="{ 'common_popup__panel--round': round }"
      :style="panelStyle"
      @click.stop
    >
      <view v-if="title || closeable" class="common_popup__header">
        <view class="common_popup__title">
          <slot name="title">{{ title }}</slot>
        </view>
        <view
          v-if="closeable"
          class="common_popup__close"
          hover-class="common_popup__close--hover"
          :hover-stay-time="70"
          @click="onCancel"
        >×</view>
      </view>

      <view class="common_popup__content">
        <slot />
      </view>

      <view v-if="showFooter" class="common_popup__footer">
        <slot name="footer">
          <view
            v-if="showCancelButton"
            class="common_popup__btn common_popup__cancel"
            :class="{ 'common_popup__btn--disabled': cancelButtonDisabled }"
            :style="cancelStyle"
            hover-class="common_popup__btn--hover"
            :hover-stay-time="70"
            @click="onCancel"
          >{{ cancelButtonText }}</view>
          <view
            v-if="showConfirmButton"
            class="common_popup__btn common_popup__confirm"
            :class="{ 'common_popup__btn--disabled': confirmButtonDisabled }"
            :style="confirmStyle"
            hover-class="common_popup__confirm--hover"
            :hover-stay-time="70"
            @click="onConfirm"
          >{{ confirmButtonText }}</view>
        </slot>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CommonPopup',
  emits: ['update:show', 'open', 'close', 'confirm', 'cancel'],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    round: {
      type: Boolean,
      default: true
    },
    closeable: {
      type: Boolean,
      default: true
    },
    showConfirmButton: {
      type: Boolean,
      default: true
    },
    showCancelButton: {
      type: Boolean,
      default: false
    },
    confirmButtonText: {
      type: String,
      default: '确认'
    },
    cancelButtonText: {
      type: String,
      default: '取消'
    },
    confirmButtonColor: {
      type: String,
      default: ''
    },
    cancelButtonColor: {
      type: String,
      default: ''
    },
    confirmButtonDisabled: {
      type: Boolean,
      default: false
    },
    cancelButtonDisabled: {
      type: Boolean,
      default: false
    },
    overlay: {
      type: Boolean,
      default: true
    },
    closeOnClickOverlay: {
      type: Boolean,
      default: true
    },
    lockScroll: {
      type: Boolean,
      default: true
    },
    safeAreaInsetBottom: {
      type: Boolean,
      default: true
    },
    height: {
      type: [String, Number],
      default: ''
    },
    zIndex: {
      type: [Number, String],
      default: 2000
    },
    beforeClose: {
      type: Function,
      default: null
    }
  },
  data () {
    return {
      closing: false
    }
  },
  computed: {
    showFooter () {
      return this.showConfirmButton || this.showCancelButton
    },
    panelStyle () {
      const style = {}
      if (this.height !== '' && this.height !== null && this.height !== undefined) {
        const value = typeof this.height === 'number' ? this.height + 'rpx' : String(this.height)
        style.height = value
        style.maxHeight = value
      }
      if (this.safeAreaInsetBottom) {
        style.paddingBottom = 'env(safe-area-inset-bottom)'
      }
      return style
    },
    confirmStyle () {
      const style = { color: '#ffffff' }
      if (this.confirmButtonColor) style.backgroundColor = this.confirmButtonColor
      return style
    },
    cancelStyle () {
      return this.cancelButtonColor ? { color: this.cancelButtonColor } : {}
    }
  },
  watch: {
    show: {
      handler (val) {
        this.lockBody(val)
        this.$emit(val ? 'open' : 'close')
      }
    }
  },
  beforeUnmount () {
    this.lockBody(false)
  },
  methods: {
    lockBody (lock) {
      // #ifdef H5
      if (typeof document === 'undefined') return
      document.body.style.overflow = lock && this.lockScroll ? 'hidden' : ''
      // #endif
    },
    updateShow (val) {
      this.$emit('update:show', val)
    },
    onClickOverlay () {
      if (!this.closeOnClickOverlay) return
      this.onCancel()
    },
    onCancel () {
      if (this.cancelButtonDisabled) return
      this.handleAction('cancel')
    },
    onConfirm () {
      if (this.confirmButtonDisabled) return
      this.handleAction('confirm')
    },
    handleAction (action) {
      if (!this.show || this.closing) return
      this.$emit(action)
      if (typeof this.beforeClose === 'function') {
        this.closing = true
        Promise.resolve(this.beforeClose(action)).then((allow) => {
          this.closing = false
          if (allow !== false) this.updateShow(false)
        }).catch(() => {
          this.closing = false
        })
        return
      }
      this.updateShow(false)
    }
  }
}
</script>

<style lang="less" src="./index.less" scoped></style>
