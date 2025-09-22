<template>
  <view class="password-page">
    <view class="password-container">
      <uni-forms
				ref="formRef"
				:modelValue="form"
				class="password-form"
				label-width="6em"
			>
        <uni-forms-item
					v-for="item in elementOptions"
					:key="item.key"
					:name="item.key"
					:label="item.name"
					:rules="getElementRules(item)"
					label-align="right"
				>
          <uni-easyinput
						v-model="form[item.key]"
						:type="item.inputType"
						:placeholder="item.placeholder"
						:maxlength="item.maxlength"
						:primaryColor="primaryColor"
					/>
        </uni-forms-item>
        <view class="form-submit">
          <button class="button" type="primary" @click="handleSubmit">提交</button>
        </view>
      </uni-forms>
    </view>
  </view>
</template>
  
  <script>
	import { get as _get, cloneDeep } from 'lodash';
	import { primaryColor } from '@/utils/color.js'
	import { updatePassword } from '@/api'
	import { PASSWORD_ELEMENT_OPTIONS } from './constant'
  export default {
    data() {
      return {
        form: PASSWORD_ELEMENT_OPTIONS.reduce((accu, o) => Object.assign(accu, { [o.key]: o.value }), {}),
				elementOptions: cloneDeep(PASSWORD_ELEMENT_OPTIONS),
				primaryColor
      }
    },
    methods: {
			getElementRules (item) {
				return item.rules || []
			},
      handleSubmit() {
				const { form } = this
        this.$refs.formRef.validate().then(() => {
					return updatePassword(({
						password: form.password,
						newPassword: form.newPassword
					})).then((res) => {
						uni.showToast({
							title: '密码修改成功'
						});
						setTimeout(() => {
							uni.redirectTo({
								url: '/pages/index/index'
							});
						}, 1000)
					})
        }).catch(err => {
					let message = '请检查表单输入'
					if (typeof err === 'string') {
						message = err
					}
					if (_get(err, '[0].errorMessage')) {
						message = _get(err, '[0].errorMessage')
					}
					uni.showToast({
						title: message
					});
        });
      }
    }
  }
  </script>
  
	<style lang="less">
	  @import './password.less';
	</style>