import QS from 'qs'

const _hostname = location ? location.hostname : ''

export const IS_PRODUCT_ENV = _hostname.search(/yizhao\.cn/) !== -1
export const IS_TEST_ENV = _hostname.search(/yizhao\.cn/) !== -1
export const IS_LOCALHOST_ENV = _hostname.search(/localhost|192\.168|127\.0\.0\.1|dev\.yizhao\.cn/) !== -1

// export const APP_HOSTNAME = IS_LOCALHOST_ENV ? 'http://localhost' : `https://app.yizhao.cn`
export const APP_HOSTNAME = import.meta.env.VITE_SERVE_HOST
// export const APP_HOSTNAME = 'http://[::1]'
console.log(import.meta.env.VITE_SERVE_HOST)

export const COS_ASSET_PATH = 'https://app-1259410276.cos.ap-shanghai.myqcloud.com/uni/'
export const WEB_DOMAIN = '/pages/'

export const APP_CHANNEL = getAppChannel()

export function getUrlParams () {
	const hash = location ? location.hash : ''
	const searchStr = hash ? hash.split('?')[1] : ''
	return searchStr ? QS.parse(searchStr) : {}
}
export const URL_PARAM = getUrlParams()

function getAppChannel() {
  return 'YIZHAO'
  // https://developers.weixin.qq.com/community/develop/doc/00022e37c78b802f186750b5751000
	const _userAgent = navigator ? navigator.userAgent : '';
  if ((_userAgent.match(/micromessenger/i) && _userAgent.match(/miniprogram/i)) || (window && window.__wxjs_environment === 'miniprogram')) {
    return 'WXMP'
  }
  if (_userAgent.match(/micromessenger/i)) {
    return 'WECHAT'
  }
  return 'H5'
}