import QS from 'qs'

const _hostname = location ? location.hostname : ''

export const IS_PRODUCT_ENV = _hostname.includes('app.yizhao.com')
export const IS_LOCALHOST_ENV = ['localhost', '192.168', '172.0.0.1', 'dev.lizhao.com'].some(s => _hostname.includes(s))

const VITE_SERVER_PROTOCOL = import.meta.env.VITE_SERVER_PROTOCOL
export const SERVER_API_DOMAIN = import.meta.env.VITE_SERVER_HOST
// export const SERVER_API_DOMAIN = `${VITE_SERVER_PROTOCOL}://[::1]`
// export const SERVER_API_DOMAIN = `${VITE_SERVER_PROTOCOL}://[2409:8a28:8c4:2e52::79b]`
// export const SERVER_API_DOMAIN = ${VITE_SERVER_PROTOCOL}://127.0.0.1`
// export const SERVER_API_DOMAIN = `${VITE_SERVER_PROTOCOL}://192.168.31.146`
export const COS_ASSET_PATH = `${VITE_SERVER_PROTOCOL}://app-1259410276.cos.ap-shanghai.myqcloud.com/uni/`
export const WEB_DOMAIN = '/pages/'

export function getUrlParams () {
	const hash = location ? location.hash : ''
	const searchStr = hash ? hash.split('?')[1] : ''
	return searchStr ? QS.parse(searchStr) : {}
}
export const URL_PARAM = getUrlParams()