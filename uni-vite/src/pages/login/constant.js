export const PASSWORD_ELEMENT_OPTIONS = [
	{
		key: 'password',
		name: '旧密码',
		value: '',
		inputType: 'password',
		maxlength: 8,
		placeholder: "请输入旧密码",
		rules: [
			{ required: true, errorMessage: '请输入旧密码', trigger: ['blur', 'change'] },
		]
	},
	{
		key: 'newPassword',
		name: '新密码',
		value: '',
		inputType: 'password',
		maxlength: 8,
		placeholder: "请输入新密码",
		rules: [
			{ required: true, errorMessage: '请输入新密码', trigger: ['blur', 'change'] },
			{ min: 6, errorMessage: '新密码不能少于6位', trigger: ['blur', 'change'] }
		]
	},
	{
		key: 'confirmPassword',
		name: '确认新密码',
		value: '',
		inputType: 'password',
		maxlength: 8,
		placeholder: "请再次输入新密码",
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
]