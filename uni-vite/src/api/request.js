import { mockData } from '/mock/index.js';
import { SERVER_API_DOMAIN, gotoLogin } from '@/utils/index.js';

export default function (options) {
  const { baseURL, url, method, data, params, timeout, showLoading, login } = options
  const store = getApp().$store
  if (store.state.isUseMock && mockData[url]) {
    console.log(`[Mock]: ${url}`)
    return new Promise((resolve) => {
      const mockResponse = mockData[url](params)
      if (mockResponse instanceof Promise) {
        resolve(mockResponse.then(data => data.data))
      }
      resolve(mockResponse.data)
    })
  }
  if (showLoading === 1) {
    uni.hideLoading();
    uni.showLoading({
      title: '加载中'
    });
  }
  return new Promise((resolve, reject) => {
    return uni.request({
      url: `${baseURL || SERVER_API_DOMAIN}/${url}`,
      method: (method || 'GET').toLocaleUpperCase(),
      timeout: timeout || 15000,
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
        if (showLoading === 1) {
          uni.hideLoading();
        }
      }
    })
  })
}
