import { getUrlParams, replaceCosDomainName } from './variables'

export * from './variables'

function normalizePath (path) {
  if (Array.isArray(path)) return path
  return String(path || '')
    .replace(/\[(\w+)\]/g, '.$1')
    .replace(/^\./, '')
    .split('.')
    .filter(Boolean)
}

function parseVersion (version) {
  const matched = String(version || '').match(/\d+(?:\.\d+)*/)
  if (!matched) return null

  return matched[0]
    .split('.')
    .map(item => Number(item))
}

export function getValue (target, path, defaultValue) {
  const keys = normalizePath(path)
  let value = target

  for (const key of keys) {
    if (value == null) return defaultValue
    value = value[key]
  }

  return value === undefined ? defaultValue : value
}

export function cloneDeep (value) {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch (e) {}
  }

  if (value == null) return value
  return JSON.parse(JSON.stringify(value))
}

export function getWindowSize () {
  const pick = (info) => ({
    width: Number(info && (info.windowWidth || info.screenWidth)) || 0,
    height: Number(info && (info.windowHeight || info.screenHeight)) || 0
  })
  try {
    if (typeof uni.getWindowInfo === 'function') {
      const size = pick(uni.getWindowInfo())
      if (size.width > 0 && size.height > 0) return size
    }
  } catch (e) {}
  try {
    if (typeof uni.getSystemInfoSync === 'function') {
      const size = pick(uni.getSystemInfoSync())
      if (size.width > 0 && size.height > 0) return size
    }
  } catch (e) {}
  return { width: 0, height: 0 }
}

export function stringifyQuery (params = {}) {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
}

export function openVideoPlayPage (query) {
  const q = typeof query === 'string' ? String(query).replace(/^\?/, '') : stringifyQuery(query || {})
  let path = '/pages/video/play'
  const url = q ? `${path}?${q}` : path
  console.log('[openVideoPlayPage]', url)
  uni.navigateTo({
    url,
    success () {
      console.log('[openVideoPlayPage] success')
    },
    fail (err) {
      console.log('[openVideoPlayPage] fail', err)
      uni.showToast({
        title: (err && (err.errMsg || err.message)) || '打开播放页失败',
        icon: 'none',
        duration: 3000
      })
    }
  })
}

export function stripHtml (value = '') {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function isVersionLt (version, targetVersion) {
  const current = parseVersion(version)
  const target = parseVersion(targetVersion)
  if (!current || !target) return false

  const length = Math.max(current.length, target.length)
  for (let i = 0; i < length; i++) {
    const currentValue = current[i] || 0
    const targetValue = target[i] || 0
    if (currentValue < targetValue) return true
    if (currentValue > targetValue) return false
  }

  return false
}

export function gotoLogin () {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  const route = (current && (current.route || (current.$page && current.$page.fullPath))) || ''
  if (route.indexOf('pages/login/') !== -1) return
  if (gotoLogin._pending) return
  gotoLogin._pending = true
  uni.redirectTo({
    url: '/pages/login/index',
    complete () {
      setTimeout(() => {
        gotoLogin._pending = false
      }, 800)
    }
  })
}

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null;
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;
  if (time === null) {
    return;
  } else if (typeof time === 'object') {
    date = time;
  } else {
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };
  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return value || 0;
  });
  return timeStr;
}

export function textEllipsis(text, maxLength) {
  text = String(text);
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function scaleImageWidthInCOS (url, w = 750) {
  const newUrl = replaceCosDomainName(url)
  const scaleString = `imageMogr2/thumbnail/${w}x`
  let _paramString = stringifyQuery(getUrlParams(newUrl))
  _paramString = _paramString ? `?${_paramString}&${scaleString}` : `?${scaleString}`
  return `${newUrl}${_paramString}`
}

export function openUrl (item) {
  if (item && item.url) {
    if (item.jumpTo === 'navigate') {
      uni.navigateTo({
        url: item.url
      })
      return
    }
    if (item.jumpTo === 'webview' || item.jumpTo === 'web') {
      // #ifdef H5
      if (item.jumpTo === 'web' && typeof window !== 'undefined') {
        window.location.href = item.url
        return
      }
      // #endif

      // #ifdef APP-PLUS
      if (item.jumpTo === 'web') {
        plus.runtime.openURL(item.url)
        return
      }
      // #endif

      // #ifdef MP
      // 个人主体小程序无法使用 web-view，复制链接引导浏览器打开
      openExternalUrlOnMp(item.url)
      return
      // #endif

      // #ifndef MP
      uni.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(item.url)}`
      })
      return
      // #endif
    }
    uni.navigateTo({
      url: item.url
    })
  }
}

export function openExternalUrlOnMp (url) {
  if (!url) return
  uni.setClipboardData({
    data: String(url),
    success () {
      uni.showModal({
        title: '提示',
        content: '当前小程序无法直接打开网页，链接已复制，请粘贴到手机浏览器中打开。',
        showCancel: false
      })
    },
    fail () {
      uni.showModal({
        title: '请在浏览器打开',
        content: String(url),
        showCancel: false
      })
    }
  })
}
