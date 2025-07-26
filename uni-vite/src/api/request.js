import { SERVER_API_DOMAIN, gotoLogin } from '@/utils/index.js';

// uni.configMTLS({
// 	certificates: [{
// 		'host': 'app.yizhao.cn',
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

export default function (options) {
  const { url, method, data, params, showLoading, login } = options
  if (showLoading === 1) {
    uni.hideLoading();
    uni.showLoading({
      title: '加载中'
    });
  }
  return new Promise((resolve, reject) => {
    return uni.request({
      url: `${SERVER_API_DOMAIN}/${url}`,
      method: (method || 'GET').toLocaleUpperCase(),
      timeout: 1500,
      withCredentials: true,
      sslVerify: false,
      data: data || params,
      header: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
      },
      success (res) {
        const { success, code, message, data } = res.data
        if (success && code === 200) {
          return resolve(data);
        }
				if (login !== 0) {
					if (code === 401) {
					  gotoLogin();
					  return reject('login');
					}
				}
        uni.showToast({
          title: message || '请求异常',
          icon: 'error'
        });
        return reject(message || '请求异常')
      },
      fail (err) {
        uni.showToast({
          title: err ? err.errMsg : '请求异常',
          icon: 'error'
        });
        return reject(err);
      },
      complete () {
        uni.hideLoading();
      }
    })
  })
}
