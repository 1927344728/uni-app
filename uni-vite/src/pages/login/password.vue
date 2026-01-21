 <template>
  <view class="password_page">
    <image
      class="banner"
      :src="scaleImageWidthInCOS('https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/fantasy-illustration-7600566_1280.jpg')"
      mode="widthFix"
    />
    <view class="form">
      <uni-forms
        ref="Form"
        :modelValue="formValues"
        :label-width="100"
        :border="true"
        :rules="rules"
        validateTrigger="bind"
      >
        <uni-forms-item label="旧密码" name="password" required>
          <uni-easyinput
            v-model="formValues.password"
            type="password"
            placeholder="请输入旧密码"
            :maxlength="12"
            @blur="onChange"
          />
        </uni-forms-item>
        <uni-forms-item label="新密码" name="newPassword" required>
          <uni-easyinput
            v-model="formValues.newPassword"
            type="password"
            placeholder="请输入新密码"
            :maxlength="12"
            @blur="onChange"
          />
        </uni-forms-item>
        <uni-forms-item label="确认新密码" name="confirmPassword" required>
          <uni-easyinput
            v-model="formValues.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            :maxlength="12"
            @blur="onChange"
          />
        </uni-forms-item>
      </uni-forms>
    </view>
    <view class="submit">
      <view :class="['button', isDisabled ? 'disabled' : '']" @click="updatePassword">
        提交
      </view>
    </view>
  </view>
</template>

<script>
import { get as _get } from 'lodash'
import { scaleImageWidthInCOS } from '@/utils/common'
import { updatePassword } from '@/api'

export default {
  data() {
    return {
      isDisabled: true,
      formValues: {
        password: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        password: {
          rules: [
            { required: true, errorMessage: '请输入旧密码', trigger: ['blur', 'change'] },
          ]
        },
        newPassword: {
          rules: [
            { required: true, errorMessage: '请输入新密码', trigger: ['blur', 'change'] },
            { pattern: '^.{6,12}$', errorMessage: '新密码不能少于6位', trigger: ['blur', 'change'] }
          ]
        },
        confirmPassword: {
          rules: [
            { required: true, errorMessage: '请确认新密码', trigger: ['blur', 'change'] },
            {
              validateFunction : (rule, value, data, callback) => {
                if (value !== data.newPassword) {
                  return callback(rule.errorMessage);
                }
                return true
              },
              errorMessage: '两次输入的新密码不一致',
              trigger: ['blur', 'change'],
            }
          ]
        }
      }
    }
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
      }, 100)
    },
    updatePassword() {
      const { $refs, formValues } = this
      const { password, newPassword } = formValues
      $refs.Form.validate().then(res => {
        return updatePassword({
          password,
          newPassword
        }).then((data) => {
          uni.showToast({
            title: '密码修改成功！',
            icon: 'success'
          });
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/login/index'
            });
          }, 1000);
        })
      }).catch((e) => {
        const errorMessage = _get(e, 'errMsg') || _get(e, '[0].errorMessage') || '请完善表单信息！'
        uni.showToast({
          title: errorMessage,
          icon: 'none'
        })
      })
    }
  }
}
</script>

<style lang="less">
  @import './password.less';
</style>