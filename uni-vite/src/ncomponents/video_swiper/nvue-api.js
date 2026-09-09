const API_BASE = 'https://app.izhao.com.cn:9443'

function flatten (val) {
  if (Array.isArray(val)) {
    return val.filter((item) => item !== null && item !== undefined && item !== '').map(String).join(',')
  }
  return val
}

function clean (obj) {
  if (!obj || typeof obj !== 'object') return {}
  const next = {}
  Object.keys(obj).forEach((key) => {
    const raw = obj[key]
    if (raw === null || raw === undefined || raw === '') return
    next[key] = flatten(raw)
  })
  return next
}

function request (url, params) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}/${url}`,
      method: 'GET',
      data: clean(params),
      sslVerify: false,
      timeout: 15000,
      success (res) {
        const body = res.data || {}
        if (body.success && body.code === 200) {
          resolve(body.data)
          return
        }
        reject(body)
      },
      fail (err) {
        reject(err)
      }
    })
  })
}

export function getVideoById (params) {
  return request('api/video/getVideoById', params)
}

export function getVideoByIds (params) {
  return request('api/video/getVideoByIds', params)
}

export function getVideoPageList (params) {
  return request('api/video/getVideoPageList', params)
}

export function getVideoByRandom (params) {
  return request('api/video/getVideoByRandom', params)
}
