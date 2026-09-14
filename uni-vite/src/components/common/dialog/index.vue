<template>
  <view v-if="show" class="common_dialog" :style="{ zIndex: zIndex }">
    <view
      v-if="overlay"
      class="common_dialog__overlay"
      @click="onClickOverlay"
      @touchmove.stop.prevent
    />
    <view class="common_dialog__wrap">
      <view
        class="common_dialog__panel"
        :class="'common_dialog__panel--' + theme"
        :style="panelStyle"
        @click.stop
      >
        <view
          v-if="title"
          class="common_dialog__header"
          :class="{ 'common_dialog__header--isolated': isolatedHeader }"
        >
          <slot name="title">{{ title }}</slot>
        </view>

        <view
          v-if="message"
          class="common_dialog__content"
          :class="{ 'common_dialog__content--isolated': isolatedContent }"
        >
          <view class="common_dialog__message" :class="messageClass">{{ message }}</view>
        </view>
        <slot />

        <view v-if="showFooter" class="common_dialog__footer">
          <slot name="footer">
            <view
              v-if="showCancelButton"
              class="common_dialog__btn common_dialog__cancel"
              :class="{ 'common_dialog__btn--disabled': cancelButtonDisabled }"
              :style="cancelStyle"
              hover-class="common_dialog__btn--hover"
              :hover-stay-time="70"
              @click="onCancel"
            >{{ cancelButtonText }}</view>
            <view
              v-if="showConfirmButton"
              class="common_dialog__btn common_dialog__confirm"
              :class="{
                'common_dialog__btn--disabled': confirmButtonDisabled,
                'common_dialog__btn--hairline': showCancelButton
              }"
              :style="confirmStyle"
              hover-class="common_dialog__btn--hover"
              :hover-stay-time="70"
              @click="onConfirm"
            >{{ confirmButtonText }}</view>
          </slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CommonDialog',
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
    message: {
      type: String,
      default: ''
    },
    width: {
      type: [String, Number],
      default: ''
    },
    theme: {
      type: String,
      default: 'default'
    },
    messageAlign: {
      type: String,
      default: 'center'
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
      default: false
    },
    lockScroll: {
      type: Boolean,
      default: true
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
    isolatedHeader () {
      return !this.message
    },
    isolatedContent () {
      return !this.title
    },
    showFooter () {
      return this.showConfirmButton || this.showCancelButton
    },
    messageClass () {
      return [
        this.title ? 'common_dialog__message--has-title' : '',
        this.messageAlign !== 'center' ? 'common_dialog__message--' + this.messageAlign : ''
      ]
    },
    panelStyle () {
      if (this.width === '' || this.width === null || this.width === undefined) return {}
      return {
        width: typeof this.width === 'number' ? this.width + 'px' : String(this.width)
      }
    },
    confirmStyle () {
      return this.confirmButtonColor ? { color: this.confirmButtonColor } : {}
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
