<template>
	<view class="login_page">
		<image
			class="logo"
			:src="scaleImageWidthInCOS('https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/ai-generated-8432306_1280.jpg')"
			mode="widthFix"
		/>
		<view class="form">
			<uni-forms
				ref="Form"
				:modelValue="loginData"
				:label-width="60"
				:border="true"
				:rules="rules"
				validateTrigger="bind"
			>
				<uni-forms-item label="账号" name="account" required>
					<uni-easyinput
						v-model="loginData.account"
						type="text"
						placeholder="请输入手机号"
						:maxlength="11"
						@blur="onChange"
					/>
				</uni-forms-item>
				<uni-forms-item label="密码" name="password" required>
					<uni-easyinput
						v-model="loginData.password"
						type="password"
						placeholder="请输入密码"
						:maxlength="12"
						@blur="onChange"
					/>
				</uni-forms-item>
				<uni-forms-item label=" " name="agree">
					<uni-data-checkbox
						v-model="loginData.agree"
						:localdata="[{ value: true, text: '我已阅读并同意《用户协议》' }]"
						multiple
						@change="onChange"
					/>
				</uni-forms-item>
			</uni-forms>
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
import { scaleImageWidthInCOS } from '@/utils'
import { login } from '@/api';
import store from '@/store/index.js'

export default {
  data() {
    return {
      isDisabled: true,
      requestUrl: '',
      loginData: {
        account: uni.getStorageSync('USER_MOBILE') || '',
        password: '',
        agree: []
      },
      rules: {
        account: {
          rules: [
            {
              required: true,
              errorMessage: '请输入手机号',
            },
            {
              pattern: '^\\d{11}$',
              errorMessage: '请输入正确手机号',
            },
          ]
        },
        password: {
          rules: [
            {
              required: true,
              errorMessage: '请输入密码',
            },
            {
              pattern: '^\\d{6}$',
              errorMessage: '请输正确入密码',
            },
          ]
        },
        agree: {
          rules: [
            {
              validateFunction: (rule, value, data, callback) => {
                if (!(value && value.length)) {
                  callback(rule.errorMessage)
                }
                return true
              },
              errorMessage: '请阅读并同意《用户协议》',
            }
          ]
        }
      }
    }
  },
  onLoad (options = {}) {
    this.requestUrl = options.requestUrl
  },
  methods: {
    scaleImageWidthInCOS,
    onChange() {
      setTimeout(() => {
        this.$refs.Form.validate()
          .then(() => {
            this.isDisabled = false
          })
          .catch(() => {
            this.isDisabled = true
          })
      }, 300)
    },
    onLogin() {
      const self = this
      const { $refs, requestUrl, loginData } = this
      const { account, password } = loginData
      $refs.Form.validate().then(res => {
        uni.setStorageSync('USER_MOBILE', account)
        return login({
          phone: account,
          password
        }).then((data) => {
          uni.showToast({
            title: '登录成功！',
            icon: 'success'
          });
          setTimeout(() => {
            store.commit('setIsUseMock', false)
            uni.redirectTo({
              url: requestUrl || '/pages/index/index'
            });
          }, 1000);
        })
      }).catch((err) => {
        const errMsg = _get(err, 'errMsg') || '请完善表单信息！'
        uni.showToast({
          title: errMsg,
          icon: 'none'
        })
      })
    },
    onUseMock () {
      store.commit('setIsUseMock', true)
      uni.redirectTo({
        url: '/pages/index/index'
      });
    }
  }
}
</script>

<style lang="less">
  @import './index.less';
</style>