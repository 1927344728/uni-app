function getLocation () {
  try {
    const loc = typeof globalThis !== 'undefined' ? globalThis.location : null
    if (loc) {
      return loc
    }
  } catch (e) {}
  return null
}

const currentLocation = getLocation()
const _hostname = (currentLocation && currentLocation.hostname) || ''

export const IS_PRODUCT_ENV = _hostname.includes('app.yizhao.com')
export const IS_LOCALHOST_ENV = ['localhost', '192.168', '172.0.0.1', 'dev.lizhao.com'].some(item => _hostname.includes(item))

const protocol = import.meta.env.VITE_SERVER_PROTOCOL || 'https'
export const SERVER_API_DOMAIN = import.meta.env.VITE_SERVER_HOST
export const DEFAULT_COS_DOMAIN_NAME = 'yizhao-1259410276.cos.ap-shanghai.myqcloud.com'
export const CUSTOM_COS_DOMAIN_NAME = 'assets.izhao.com.cn'
export const COS_DOMAIN_NAME = `${protocol}://${CUSTOM_COS_DOMAIN_NAME}`

export const WEB_DOMAIN = '/pages/'
export const PUBLIC_WEB_DOMAIN = 'https://app.izhao.com.cn/index.html#'
export const USE_MOCK_KEY = 'use_mock_key'

export const URL_PARAM = getUrlParams()

export function getUrlParams (url) {
  const loc = getLocation()
  const _url = url || (loc && loc.href) || ''
  const searchStr = _url.includes('?') ? _url.split('?')[1].split('#')[0] : ''
  if (!searchStr) return {}

  return searchStr.split('&').reduce((params, item) => {
    const [rawKey, ...rawValue] = item.split('=')
    if (!rawKey) return params

    const key = decodeURIComponent(rawKey)
    params[key] = decodeURIComponent(rawValue.join('=') || '')
    return params
  }, {})
}

export function replaceCosDomainName (url) {
  let newUrl = url
  if (newUrl && typeof newUrl === 'string') {
    newUrl = newUrl.replace(DEFAULT_COS_DOMAIN_NAME, CUSTOM_COS_DOMAIN_NAME)
  }
  return newUrl
}
