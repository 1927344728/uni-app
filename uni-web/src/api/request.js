import { gotoLogin } from '@/utils/index.js';
import { APP_HOSTNAME } from '@/utils/variables.js';

let loadingTimer = null;
const loading = bool => {
	const hasShowLoading = window && window.appBridge && window.appBridge.showLoading
  if (hasShowLoading) {
    if (bool) {
      window.appBridge.showLoading();
    } else {
      window.appBridge.hideLoading();
    }
  }
};

async function service (options = {}) {
	const { url, method, data, params } = options
	debugger
	return new Promise((resolve, reject) => {
		uni.request({
			url: `${APP_HOSTNAME}/${url}`,
			method: ['post', 'POST'].includes(method) ? 'POST' : 'GET',
			timeout: 5000,
			withCredentials: true,
			data: data || params,
			header: {
				'X-Requested-With': 'XMLHttpRequest',
			},
			success: (res) => {
				debugger
				resolve(res)
			},
			fail: (res) => {
				reject(res)
			}
	});
	})
}


// // request拦截器
// service.interceptors.request.use(
//   config => {
//     if (loadingTimer) clearTimeout(loadingTimer);
//     loadingTimer = setTimeout(() => {
//       let configData = null;
//       if (config.data) {
//         configData = JSON.parse(config.data);
//       }
//       loading(configData && configData.withoutLoading ? false : true);
//     }, 300);

//     return config;
//   },
//   error => {
//     // Do something with request error
//     console.log(error); // for debug
//     Promise.reject(error);
//   }
// );

// // respone拦截器
// service.interceptors.response.use(
//   response => {
//     if (loadingTimer) clearTimeout(loadingTimer);
//     loading(false);
//     const res = response.data;
//     if (
//       res.code === 401 ||
//       res.status === 401 ||
//       (res.data && res.data.data === NOT_LOGGED_IN_CODE)
//     ) {
//       gotoLogin();
//       return Promise.reject('login');
//     }
//     return res;
//   },
//   error => {
//     if (loadingTimer) clearTimeout(loadingTimer);
//     loading(false);
//     if (error.response && error.response.status == 401) {
//       gotoLogin();
//       return Promise.reject('login');
//     }
//     console.log('err' + error); // for debug
//     return Promise.reject(error);
//   }
// );

export default service;
