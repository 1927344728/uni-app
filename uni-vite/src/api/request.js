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
  return new Promise((resolve, reject) => {
    return uni.request({
      url: `${APP_HOSTNAME}/${url}`,
      method: (method || 'GET').toLocaleUpperCase(),
      timeout: 5000,
      withCredentials: true,
      sslVerify: false,
      data: data || params,
      header: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
      },
      success (res) {
        if (loadingTimer) {
          clearTimeout(loadingTimer);
        }
        loading(false);
        const { success, code, message, data } = res.data
        if (success && code === 200) {
          return resolve(data);
        }
        if (code === 401) {
          gotoLogin();
          return reject('login');
        }
        uni.showToast({
          title: message || '请求错误',
          icon: 'error'
        });
        return reject(message || '请求错误')
      },
      fail: function(err) {
        if (loadingTimer) {
          clearTimeout(loadingTimer);
        }
        loading(false);
        uni.showToast({
          title: '请求错误',
          icon: 'error'
        });
        return reject(err);
      }
    })
  })
}

export default request
