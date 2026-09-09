import { SERVER_API_DOMAIN, gotoLogin } from '@/common/js/index.js'
import {
  saveCookiesFromResponse,
  getCookieHeader,
  clearAuthCookies
} from '@/common/js/cookie.js'

function buildUploadHeader () {
  const header = {
    'X-Requested-With': 'XMLHttpRequest'
  }
  // #ifdef MP
  const cookie = getCookieHeader()
  if (cookie) {
    header.Cookie = cookie
  }
  // #endif
  return header
}

function parseUploadBody (data) {
  if (data && typeof data === 'object') return data
  if (typeof data !== 'string' || !data) return {}
  try {
    return JSON.parse(data)
  } catch (e) {
    return {}
  }
}

export function uploadCosFile (filePath, options = {}) {
  const { dir, fileName, key, overwrite, name = 'file', timeout, login } = options
  const formData = {}
  if (dir) formData.dir = dir
  if (fileName) formData.fileName = fileName
  if (key) formData.key = key
  if (overwrite) formData.overwrite = 'true'

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${SERVER_API_DOMAIN}/api/cos/upload`,
      filePath,
      name,
      timeout: timeout || 60000,
      withCredentials: true,
      formData,
      header: buildUploadHeader(),
      success (res) {
        // #ifdef MP
        saveCookiesFromResponse(res)
        // #endif

        const body = parseUploadBody(res.data)
        if (login !== 0 && (res.statusCode === 401 || body.code === 401)) {
          // #ifdef MP
          clearAuthCookies()
          // #endif
          gotoLogin()
          return reject({ code: 401, silent: true, message: '未登录' })
        }

        const { success, code, message, data } = body
        if (success && code === 200) {
          return resolve(data)
        }
        uni.showToast({
          title: message || '上传失败',
          icon: 'error'
        })
        return reject({ code, message: message || '上传失败', silent: false })
      },
      fail (err) {
        uni.showToast({
          title: err ? err.errMsg : '上传失败',
          icon: 'error'
        })
        return reject(err)
      }
    })
  })
}
