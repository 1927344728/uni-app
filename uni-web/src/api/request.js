import { gotoLogin } from '@/utils/index.js';
import { APP_HOSTNAME } from '@/utils/variables.js';

let loadingTimer = null
export default function (options = {}) {
	const { baseURL, url, method, data, params, withoutLoading } = options
	return new Promise((resolve, reject) => {
		if (!withoutLoading) {
			loadingTimer = setTimeout(() => {
				uni.showLoading({
					title: '加载中'
				})
			}, 300);
		}
		uni.request({
			url: `${baseURL || APP_HOSTNAME}/${url}`,
			method: ['post', 'POST'].includes(method) ? 'POST' : 'GET',
			timeout: 5000,
			withCredentials: true,
			data: data || params,
			header: {
				'X-Requested-With': 'XMLHttpRequest',
			},
			success: ({ statusCode, data }) => {
				if (!data || !data.success) {
					const _info = data && data.info ? data.info : '请求失败'
					uni.showToast({
						title: _info,
						duration: 3000
					});
					return reject(_info || 'fail')
				}
				if (data.code === 401 || statusCode === 401) {
					gotoLogin()
					return reject('login')
				}
				resolve(data.data)
			},
			fail: (error) => {
				debugger
				return reject(error)
			},
			complete: (res) => {
				if (loadingTimer) {
					clearTimeout(loadingTimer)
				}
				uni.hideLoading()
			}
		})
	})
}
