import { APP_HOSTNAME, gotoLogin } from '@/utils/index.js';

let loadingTimer = null;
const loading = bool => {
	if (bool) {
		uni.showLoading({
			title: '加载中'
		});
	} else {
		uni.hideLoading();
	}
};

// uni.configMTLS({
// 	certificates: [{
// 		'host': 'app.winbaoxian.cn',
// 		'client': '/ssl/client.cer',
// 		'clientPassword': '123456',
// 		'server': ['/ssl/server.cer'],
// 	}],
// 	success (res){
// 		console.log(res.code)
// 		debugger
// 	}
// });
function request (options) {
	const { url, method, data, params, withoutLoading } = options
	if (loadingTimer) {
		clearTimeout(loadingTimer);
	}
	loadingTimer = setTimeout(() => {
		if (withoutLoading) {
			loading(false);
		}
	}, 300);
	return uni.request({
		url: `${APP_HOSTNAME}/${url}`,
		method: (method || 'GET').toLocaleUpperCase(),
		timeout: 5000,
		withCredentials: true,
		sslVerify: false,
		data: data || params,
		header: {
			'X-Requested-With': 'XMLHttpRequest'
		}
	}).then(res => {
		if (loadingTimer) {
			clearTimeout(loadingTimer);
		}
		uni.showModal({
			title: `${APP_HOSTNAME}`,
			content: JSON.stringify(res)
		});
		loading(false);
		const { code, status, data } = res.data
		if (code === 401 || status === 401 || (data && data.data === -1)) {
			gotoLogin();
			return Promise.reject('login');
		}
		return Promise.resolve(data);
	}).catch(error => {
		if (loadingTimer) {
			clearTimeout(loadingTimer);
		}
		loading(false);
		const { response } = error
		if (response && response.status == 401) {
			gotoLogin();
			return Promise.reject('login');
		}
		return Promise.reject(error);
	})
}

export default request
