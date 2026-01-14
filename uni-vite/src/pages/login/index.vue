 <template>
  <view class="login_page">
    <image
      class="logo"
      :src="scaleImageWidthInCOS('https://images.pexels.com/photos/1563355/pexels-photo-1563355.jpeg')"
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
            :maxlength="6"
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
  </view>
 </template>

 <script>
  import { scaleImageWidthInCOS } from '@/utils/common'
  import { login } from '@/api';

  export default {
    data() {
      return {
        isDisabled: true,
        requestUrl: '',
        loginData: {
          account: uni.getStorageSync('YIZHAO_USER_PHONE') || '',
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
        const { $refs, requestUrl, loginData } = this
        const { account, password } = loginData
        $refs.Form.validate().then(res => {
          return login({
            phone: account,
            password
          }).then((data) => {
            uni.setStorageSync('YIZHAO_USER_PHONE', account)
            uni.showToast({
              title: '登录成功！',
              icon: 'success'
            });
            setTimeout(() => {
              uni.redirectTo({
                url: requestUrl || '/pages/index/index'
              });
            }, 1000);
          })
        }).catch(() => {
          uni.showToast({
            title: '请完善表单信息！',
            icon: 'none'
          })
        })
      }
    }
  }
 </script>

 <style lang="less">
   @import './index.less';
 </style>