import { get as _get } from 'lodash'
import QS from 'qs'

const _hostname = location ? location.hostname : ''

export const IS_PRODUCT_ENV = _hostname.includes('app.yizhao.com')
export const IS_LOCALHOST_ENV = ['localhost', '192.168', '172.0.0.1', 'dev.lizhao.com'].some(s => _hostname.includes(s))

const protocol = import.meta.env.VITE_SERVER_PROTOCOL
export const SERVER_API_DOMAIN = import.meta.env.VITE_SERVER_HOST
export const DEFAULT_COS_DOMAIN_NAME = 'yizhao-1259410276.cos.ap-shanghai.myqcloud.com'
export const CUSTOM_COS_DOMAIN_NAME = 'assets.izhao.com.cn'
export const COS_DOMAIN_NAME = `${protocol}://${CUSTOM_COS_DOMAIN_NAME}`

export const WEB_DOMAIN = '/pages/'
export const USE_MOCK_KEY = 'use_mock_key'

export const URL_PARAM = getUrlParams()

export function getUrlParams (url) {
  const _url = url || _get(location, 'href') || ''
  const searchStr = _url ? _url.split('?')[1] : ''
  return searchStr ? QS.parse(searchStr) : {}
}

export function replaceCosDomainName (url) {
	let newUrl = url
	if (newUrl && typeof newUrl === 'string') {
    newUrl = newUrl.replace(DEFAULT_COS_DOMAIN_NAME, CUSTOM_COS_DOMAIN_NAME)
	}
	return newUrl
}