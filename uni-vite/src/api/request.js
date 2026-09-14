import { mockData } from '/mock/index.js';
import { SERVER_API_DOMAIN, gotoLogin, USE_MOCK_KEY, getClientPlatform, getValue as _get } from '@/common/js/index.js';
import {
  saveCookiesFromResponse,
  getCookieHeader,
  clearAuthCookies
} from '@/common/js/cookie.js';

function isUseMock () {
  try {
    const mockState = uni.getStorageSync(USE_MOCK_KEY)
    return !!(
      mockState &&
      _get(mockState, 'value') === 1 &&
      new Date().getTime() - _get(mockState, 'timestamp') <= 3 * 24 * 60 * 60 * 1000
    )
  } catch (e) {
    return false
  }
}

function isUnauthorized (res) {
  if (!res) return false
  if (res.statusCode === 401) return true
  const body = res.data
  if (!body || typeof body !== 'object') return false
  return body.code === 401
}

function buildHeader () {
  const header = {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  }
  // #ifdef MP
  // 方案A：小程序手动回传 Cookie，服务端逻辑不用改
  const cookie = getCookieHeader()
  if (cookie) {
    header.Cookie = cookie
  }
  // #endif
  return header
}

function normalizeParamValue (val) {
  // Spring @RequestParam List<Long> 认 ids=1,2,3，不认 ids=[1,2,3]
  if (Array.isArray(val)) {
    return val
      .filter((item) => item !== null && item !== undefined && item !== '')
      .map((item) => String(item))
      .join(',')
  }
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (/^\[.*\]$/.test(trimmed)) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return normalizeParamValue(parsed)
        }
      } catch (e) {}
    }
  }
  return val
}

function normalizeRequestParams (obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj
  const next = {}
  Object.keys(obj).forEach((key) => {
    const raw = obj[key]
    // 避免 JS null 被编成查询串 "null"，导致 Integer 等类型转换 500
    if (raw === null || raw === undefined) return
    if (raw === 'null' || raw === 'undefined') return
    if (Array.isArray(raw) && raw.length === 0) return

    const val = normalizeParamValue(raw)
    if (val === null || val === undefined) return
    if (val === 'null' || val === 'undefined') return
    next[key] = val
  })
  return next
}

function withClientPlatform (url, params) {
  if (!url || !url.startsWith('api/') || url.startsWith('api/admin/')) return params
  if (params && typeof params === 'object' && !Array.isArray(params) && params.platform !== undefined) return params
  return {
    ...(params && typeof params === 'object' && !Array.isArray(params) ? params : {}),
    platform: getClientPlatform()
  }
}

export default function (options) {
  const { baseURL, url, method, data, params, timeout, showLoading, login } = options
  const rawParams = data || params
  const httpMethod = (method || 'GET').toLocaleUpperCase()
  // GET 的 data 会被序列化成查询串，需要迁就 Spring 的参数格式；
  // POST/PUT 的 data 是 JSON body，拍平数组会让 @RequestBody 的 List 字段反序列化失败
  const requestData = httpMethod === 'GET' ? normalizeRequestParams(withClientPlatform(url, rawParams)) : rawParams
  if (isUseMock() && mockData?.[url]) {
    console.log(`[Mock]: ${url}`)
    return new Promise((resolve) => {
      const mockResponse = mockData[url](rawParams)
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
      method: httpMethod,
      timeout: timeout || 15000,
      withCredentials: true,
      sslVerify: false,
      data: requestData,
      header: buildHeader(),
      success (res) {
        // #ifdef MP
        saveCookiesFromResponse(res)
        // #endif

        if (isUnauthorized(res)) {
          if (login !== 0) {
            // #ifdef MP
            clearAuthCookies()
            // #endif
            gotoLogin();
          }
          return reject({ code: 401, silent: true, message: '未登录' });
        }

        const body = res.data || {}
        const { success, code, message, data } = body
        if (success && code === 200) {
          return resolve(data);
        }
        uni.showToast({
          title: message || '请求异常',
          icon: 'error'
        });
        return reject({ code, message: message || '请求异常', silent: false })
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
