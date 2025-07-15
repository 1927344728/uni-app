 <template>
   <view class="login_page">
     <image class="logo" :src="logoImage" mode="aspectFit" />
     <view class="form">
       <input class="input" type="text" v-model="account" maxlength="11" placeholder="手机号或账号" />
       <input class="input" type="text" v-model="password" maxlength="6" placeholder="6位数字密码" />
       <view class="agreement_wrapper"> 				
        <checkbox-group @change="onCheckboxChange">
          <label>
            <checkbox value="1" :checked="checked === '1'" />
            <text>我已阅读并同意《用户协议》</text>
          </label>
      </checkbox-group>
       </view>
       <button
        class="login_button"
        :disabled="!canLogin"
        @click="onLogin"
      >
        登录
      </button>
     </view>
   </view>
 </template>

 <script>
  import { LOGO_COLOR_IMAGE } from '@/config/index.js'
  import { login } from '@/api';
  import { getUrlParams } from '@/utils/variables.js'

  const { requestUrl } = getUrlParams()
  export default {
    data() {
      return {
        logoImage: LOGO_COLOR_IMAGE,
        account: localStorage.getItem('YIZHAO_USER_PHONE') || '',
        password: '',
        checked: ''
      }
    },
    computed: {
      canLogin() {
        return this.account.length > 0 && this.password.length === 6 && this.checked;
      }
    },
    methods: {
      onCheckboxChange(e) {
        this.checked = e.detail.value[0] || ''
      },
      onLogin() {
        const { account, password, canLogin } = this
        if (canLogin) {
          return login({
            phone: account,
            password
          }).then((data) => {
            localStorage.setItem('YIZHAO_USER_PHONE', account)
            uni.showToast({
              title: data,
              icon: 'success'
            });
            uni.redirectTo({
              url: requestUrl || '/pages/home/index'
            });
          })
        }
      }
    }
  }
 </script>

 <style lang="less">
   @import './index.less';
 </style>