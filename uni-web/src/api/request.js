import { API_HOSTNAME, gotoLogin } from '@/utils/index.js';

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
// 		'client': '/ssl/client.p12',
// 		'clientPassword': '123456',
// 		'server': ['/ssl/server.pem'],
// 	}],
// 	success (res){
// 		console.log(res)
// 		// uni.showModal({
// 		// 	title: 'configMTLS: success',
// 		// 	content: JSON.stringify(res)
// 		// });
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
		url: `${API_HOSTNAME}/${url}`,
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
		// uni.showModal({
		// 	title: `${API_HOSTNAME}`,
		// 	content: JSON.stringify(res)
		// });
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
		// uni.showModal({
		// 	title: 'request: error',
		// 	content: JSON.stringify(error)
		// });
		const { response } = error
		if (response && response.status == 401) {
			gotoLogin();
			return Promise.reject('login');
		}
		return Promise.reject(error);
	})
}

export default request
