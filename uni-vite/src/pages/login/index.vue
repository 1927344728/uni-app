<template>
	<view class="login_page">
		<image
			class="logo"
			:src="logoBannerUrl"
			mode="widthFix"
		/>
		<view class="form">
			<view class="form_card">
				<view class="form_item">
					<text class="label">账号</text>
					<input
						class="input"
						type="number"
						v-model="loginData.account"
						placeholder="请输入手机号"
						:maxlength="11"
						@input="onChange"
						@blur="onChange"
					/>
				</view>
				<view class="form_item">
					<text class="label">密码</text>
					<input
						class="input"
						:password="true"
						type="text"
						v-model="loginData.password"
						placeholder="请输入密码"
						:maxlength="12"
						@input="onChange"
						@blur="onChange"
					/>
				</view>
				<view class="form_item agree">
					<view class="checkbox_wrap" @click="toggleAgree">
						<view :class="['checkbox', loginData.agree ? 'checked' : '']">
							<view v-if="loginData.agree" class="tick"></view>
						</view>
					</view>
					<view class="agree_text">
						<text @click="toggleAgree">我已阅读并同意</text>
						<text class="agree_link" @click.stop="gotoAgreement">《用户协议》</text>
					</view>
				</view>
			</view>
		</view>
		<view class="login">
			<view :class="['button', isDisabled ? 'disabled' : '']" @click="onLogin">
				登录
			</view>
		</view>
		<view class="mock" @click="onUseMock">
			暂不登录
		</view>
	</view>
</template>

<script>
import { COS_DOMAIN_NAME, scaleImageWidthInCOS } from '@/common/js/common.js'
import { login } from '@/api/login.js'
import store from '@/store/index.js'

export default {
  data() {
    return {
      isDisabled: true,
      requestUrl: '',
      loginData: {
        account: uni.getStorageSync('USER_MOBILE') || '',
        password: '',
        agree: false
      },
      logoBannerUrl: scaleImageWidthInCOS(`${COS_DOMAIN_NAME}/images/ai-generated-8432306_1280.jpg`)
    }
  },
  onLoad (options = {}) {
    this.requestUrl = options.requestUrl
    this.onChange()
  },
  methods: {
    validateForm () {
      const { account, password, agree } = this.loginData
      if (!account) return '请输入手机号'
      if (!/^\d{11}$/.test(account)) return '请输入正确手机号'
      if (!password) return '请输入密码'
      if (!/^\d{6}$/.test(password)) return '请输正确入密码'
      if (!agree) return '请阅读并同意《用户协议》'
      return ''
    },
    onChange () {
      this.isDisabled = !!this.validateForm()
    },
    toggleAgree () {
      this.loginData.agree = !this.loginData.agree
      this.onChange()
    },
    gotoAgreement () {
      uni.navigateTo({
        url: '/pages/me/agreement'
      })
    },
    onLogin () {
      const errMsg = this.validateForm()
      if (errMsg) {
        this.isDisabled = true
        uni.showToast({
          title: errMsg,
          icon: 'none',
          duration: 3000
        })
        return
      }

      const { requestUrl, loginData } = this
      const { account, password } = loginData
      uni.setStorageSync('USER_MOBILE', account)
      login({
        phone: account,
        password
      }).then(() => {
        uni.showToast({
          title: '登录成功！',
          icon: 'success'
        })
        setTimeout(() => {
          store.commit('setIsUseMock', false)
          uni.redirectTo({
            url: requestUrl || '/pages/index/index'
          })
        }, 2000)
      }).catch((err) => {
        const message = (err && (err.errMsg || err.message)) || (typeof err === 'string' ? err : '') || '登录失败'
        uni.showToast({
          title: message,
          icon: 'none',
          duration: 3000
        })
        console.error(err)
      })
    },
    onUseMock () {
      store.commit('setIsUseMock', true)
      uni.redirectTo({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style lang="less" src="./index.less"></style>
