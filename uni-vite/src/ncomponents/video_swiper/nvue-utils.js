const COS_HOST_OLD = 'yizhao-1259410276.cos.ap-shanghai.myqcloud.com'
const COS_HOST_NEW = 'assets.izhao.com.cn'

export function get (target, path) {
  if (target == null) return undefined
  const keys = String(path || '').split('.')
  let value = target
  for (let i = 0; i < keys.length; i++) {
    if (value == null) return undefined
    value = value[keys[i]]
  }
  return value
}

export function replaceCosDomainName (url) {
  if (!url || typeof url !== 'string') return ''
  return url.replace(COS_HOST_OLD, COS_HOST_NEW)
}

export function encodeMediaUrl (url) {
  const replaced = replaceCosDomainName(url)
  if (!replaced) return ''

  const qIndex = replaced.indexOf('?')
  const hashIndex = replaced.indexOf('#')
  let suffixIndex = -1
  if (qIndex >= 0 && hashIndex >= 0) suffixIndex = Math.min(qIndex, hashIndex)
  else if (qIndex >= 0) suffixIndex = qIndex
  else if (hashIndex >= 0) suffixIndex = hashIndex

  const base = suffixIndex >= 0 ? replaced.slice(0, suffixIndex) : replaced
  const suffix = suffixIndex >= 0 ? replaced.slice(suffixIndex) : ''
  const protoMatch = base.match(/^(https?:\/\/[^/]+)(\/.*)?$/i)
  if (!protoMatch) return replaced

  const encodedPath = (protoMatch[2] || '').split('/').map((seg) => {
    if (!seg) return seg
    try {
      return encodeURIComponent(decodeURIComponent(seg))
    } catch (e) {
      return encodeURIComponent(seg)
    }
  }).join('/')
  return protoMatch[1] + encodedPath + suffix
}

export function stripHtml (value) {
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

export function textEllipsis (text, maxLength) {
  const value = String(text || '')
  if (value.length <= maxLength) return value
  return value.slice(0, maxLength) + '...'
}
