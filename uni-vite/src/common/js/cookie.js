const AUTH_COOKIE_KEY = 'AUTH_COOKIE_JAR'

function readJar () {
  try {
    const jar = uni.getStorageSync(AUTH_COOKIE_KEY)
    return jar && typeof jar === 'object' ? jar : {}
  } catch (e) {
    return {}
  }
}

function writeJar (jar) {
  try {
    uni.setStorageSync(AUTH_COOKIE_KEY, jar || {})
  } catch (e) {}
}

function applyCookieLine (jar, line) {
  if (!line || typeof line !== 'string') return
  const parts = line.split(';')
  const pair = (parts[0] || '').trim()
  const eq = pair.indexOf('=')
  if (eq <= 0) return

  const name = pair.slice(0, eq).trim()
  const value = pair.slice(eq + 1).trim()
  const attrs = parts.slice(1).join(';')
  const expired = /max-age\s*=\s*0\b/i.test(attrs) || /expires\s*=\s*thu,\s*01[-\s]jan[-\s]1970/i.test(attrs)

  if (!value || expired) {
    delete jar[name]
    return
  }
  jar[name] = value
}

/**
 * 从小程序响应中提取并持久化 cookie（微信不会自动管理 Set-Cookie）
 */
export function saveCookiesFromResponse (res) {
  if (!res) return
  const jar = readJar()
  let changed = false

  const cookieList = Array.isArray(res.cookies) ? res.cookies : []
  if (cookieList.length) {
    cookieList.forEach((line) => {
      applyCookieLine(jar, line)
      changed = true
    })
  } else {
    const header = res.header || res.headers || {}
    const setCookie = header['Set-Cookie'] || header['set-cookie'] || header['SET-COOKIE']
    if (setCookie) {
      const lines = Array.isArray(setCookie) ? setCookie : [setCookie]
      lines.forEach((line) => {
        applyCookieLine(jar, line)
        changed = true
      })
    }
  }

  if (changed) writeJar(jar)
}

export function getCookieHeader () {
  const jar = readJar()
  return Object.keys(jar)
    .filter((name) => jar[name])
    .map((name) => `${name}=${jar[name]}`)
    .join('; ')
}

export function clearAuthCookies () {
  writeJar({})
}

export function getAuthToken () {
  const jar = readJar()
  return jar.token || ''
}
