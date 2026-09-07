/**
 * 讯飞在线语音合成。
 * 文档：https://www.xfyun.cn/doc/tts/online_tts/API.html
 */
import CryptoJS from 'crypto-js'
import { stringToBase64 } from '@/common/js/platform.js'
import { stringifyQuery } from '@/common/js/common.js'

const DEFAULT_XF_CONFIG = {
  APPID: 'a7eda721',
  APISecret: 'NmQ1ODJkODZiZmZhZWRiMjI2NWY0OWY0',
  APIKey: 'ce7d0bfd8139fe55bc544c6b9e59be3c',
  baseURL: 'wss://tts-api.xfyun.cn/v2/tts',
  defaultParams: {
    aue: 'lame',
    sfl: 1,
    auf: 'audio/L16; rate=16000',
    vcn: 'x4_xiaoyan',
    speed: 50,
    volume: 50,
    pitch: 50,
    bgs: 0,
    tte: 'UTF8',
    reg: '0',
    rdn: '0'
  }
}

export default class XfTTS {
  constructor(options = {}) {
    this.config = {
      ...DEFAULT_XF_CONFIG,
      ...options,
      defaultParams: {
        ...DEFAULT_XF_CONFIG.defaultParams,
        ...(options.defaultParams || {})
      }
    }
    this.cacheMap = {}
  }

  createAudioUrl (text, options = {}) {
    // #ifdef H5
    return this.createAudioUrlInH5(text, options)
    // #endif

    // #ifdef MP
    return this.createAudioUrlInMp(text, options)
    // #endif

    // #ifdef APP-PLUS
    return this.createAudioUrlInApp(text, options)
    // #endif

    return Promise.reject(new Error('当前平台暂不支持语音合成播放'))
  }

  async getAudioChunks (text, options = {}) {
    this.validateConfig()
    const content = String(text || '').trim()
    if (!content) throw new Error('文本内容不能为空')

    const cacheKey = stringToBase64(content)
    if (this.cacheMap[cacheKey]) {
      return this.cacheMap[cacheKey]
    }

    const chunks = await this.requestAudioChunks(cacheKey, options)
    this.cacheMap[cacheKey] = chunks
    return chunks
  }

  requestAudioChunks (base64Text, options = {}) {
    return new Promise((resolve, reject) => {
      const chunks = []
      const socketTask = uni.connectSocket({
        url: this.generateWebSocketUrl()
      })
      let completed = false
      let settled = false
      let cleanup = () => {}

      const settle = (fn, payload) => {
        if (settled) return
        settled = true
        cleanup()
        try {
          closeSocket(socketTask)
        } catch (e) {}
        fn(payload)
      }

      const onOpen = () => {
        sendSocketMessage(socketTask, {
          data: JSON.stringify(this.createRequestPayload(base64Text, options))
        })
      }

      const onMessage = (res) => {
        const response = this.parseSocketMessage(res)
        if (response.code !== 0) {
          settle(reject, new Error(`语音合成失败: ${response.message || response.code}`))
          return
        }

        const data = response.data || {}
        if (data.audio) {
          chunks.push(data.audio)
        }
        if (data.status === 2) {
          completed = true
          settle(resolve, chunks)
        }
      }

      const onClose = () => {
        if (!completed) {
          settle(reject, new Error('WebSocket连接意外关闭'))
        }
      }

      const onError = (error) => {
        settle(reject, new Error(`WebSocket错误: ${error && error.errMsg ? error.errMsg : error}`))
      }

      cleanup = bindSocketEvents(socketTask, {
        open: onOpen,
        message: onMessage,
        close: onClose,
        error: onError
      })

      setTimeout(() => {
        if (!completed) {
          settle(reject, new Error('请求超时'))
        }
      }, 30000)
    })
  }

  generateWebSocketUrl () {
    const { APIKey, APISecret, baseURL } = this.config
    const host = 'tts-api.xfyun.cn'
    const date = new Date().toUTCString()
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/tts HTTP/1.1`
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, APISecret)
    const signature = CryptoJS.enc.Base64.stringify(signatureSha)
    const authorization = stringToBase64(
      `api_key="${APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
    )

    return `${baseURL}?${stringifyQuery({ host, date, authorization })}`
  }

  createRequestPayload (base64Text, options = {}) {
    const { APPID, defaultParams } = this.config
    return {
      common: {
        app_id: APPID
      },
      business: {
        ...defaultParams,
        ...options
      },
      data: {
        status: 2,
        text: base64Text
      }
    }
  }

  parseSocketMessage (res) {
    try {
      return JSON.parse(res.data) || {}
    } catch (e) {
      return {
        code: -1,
        message: '语音合成响应解析失败'
      }
    }
  }

  validateConfig () {
    const { APPID, APISecret, APIKey } = this.config
    if (!APPID || !APISecret || !APIKey) {
      throw new Error('请先配置APPID、APIKey和APISecret')
    }
  }

  async createAudioUrlInH5 (text, options = {}) {
    const chunks = await this.getAudioChunks(text, options)
    const audioBytes = mergeArrayBuffers(chunks.map(base64ToArrayBufferInH5))
    const blob = new Blob([audioBytes], { type: 'audio/mp3' })
    return URL.createObjectURL(blob)
  }

  async createAudioUrlInMp (text, options = {}) {
    const chunks = await this.getAudioChunks(text, options)
    const audioBytes = mergeArrayBuffers(chunks.map(chunk => uni.base64ToArrayBuffer(chunk)))
    return writeMpTempFile(audioBytes)
  }

  async createAudioUrlInApp (text, options = {}) {
    const chunks = await this.getAudioChunks(text, options)
    return writeAppPrivateFile(chunks)
  }
}

function bindSocketEvents (socketTask, handlers) {
  const unbinders = [
    bindSocketEvent(socketTask, 'Open', handlers.open),
    bindSocketEvent(socketTask, 'Message', handlers.message),
    bindSocketEvent(socketTask, 'Close', handlers.close),
    bindSocketEvent(socketTask, 'Error', handlers.error)
  ]

  return () => {
    unbinders.forEach(unbind => unbind())
  }
}

function bindSocketEvent (socketTask, eventName, handler) {
  const taskMethod = `on${eventName}`
  if (socketTask && typeof socketTask[taskMethod] === 'function') {
    socketTask[taskMethod](handler)
    return () => {}
  }

  const onMethod = `onSocket${eventName}`
  const offMethod = `offSocket${eventName}`
  if (typeof uni[onMethod] === 'function') {
    uni[onMethod](handler)
    return () => {
      if (typeof uni[offMethod] === 'function') {
        uni[offMethod](handler)
      }
    }
  }

  return () => {}
}

function sendSocketMessage (socketTask, options) {
  if (socketTask && typeof socketTask.send === 'function') {
    socketTask.send(options)
    return
  }
  uni.sendSocketMessage(options)
}

function closeSocket (socketTask) {
  if (socketTask && typeof socketTask.close === 'function') {
    socketTask.close()
    return
  }
  uni.closeSocket()
}

function base64ToArrayBufferInH5 (base64) {
  const binary = atob(base64)
  const buffer = new ArrayBuffer(binary.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i)
  }
  return buffer
}

function mergeArrayBuffers (buffers = []) {
  if (!buffers.length) {
    throw new Error('未收到音频数据')
  }

  const totalLength = buffers.reduce((total, buffer) => total + buffer.byteLength, 0)
  const bytes = new Uint8Array(totalLength)
  let offset = 0
  buffers.forEach((buffer) => {
    bytes.set(new Uint8Array(buffer), offset)
    offset += buffer.byteLength
  })
  return bytes
}

function writeMpTempFile (audioBytes) {
  return new Promise((resolve, reject) => {
    const fs = typeof uni.getFileSystemManager === 'function' ? uni.getFileSystemManager() : null
    const userDataPath = getMiniProgramUserDataPath()

    if (!fs || !userDataPath) {
      reject(new Error('当前小程序环境不支持临时音频文件写入'))
      return
    }

    const filePath = `${userDataPath}/tts_temp_audio_${Date.now()}.mp3`
    fs.writeFile({
      filePath,
      data: audioBytes.buffer,
      success: () => resolve(filePath),
      fail: reject
    })
  })
}

function getMiniProgramUserDataPath () {
  const env = (typeof wx !== 'undefined' && wx.env) ||
    (typeof tt !== 'undefined' && tt.env) ||
    (typeof my !== 'undefined' && my.env) ||
    uni.env ||
    {}
  return env.USER_DATA_PATH
}

function writeAppPrivateFile (base64Chunks) {
  return new Promise((resolve, reject) => {
    const dirName = plus.io.PRIVATE_DOC
    const fileName = 'tts_temp_audio.mp3'
    plus.io.requestFileSystem(dirName, (fs) => {
      fs.root.getFile(fileName, { create: true, exclusive: false }, (entry) => {
        try {
          const absolutePath = entry.fullPath
          const Base64 = plus.android.importClass('android.util.Base64')
          const FileOutputStream = plus.android.importClass('java.io.FileOutputStream')
          const out = new FileOutputStream(absolutePath)

          base64Chunks.forEach((chunk) => {
            const bytes = Base64.decode(chunk, Base64.DEFAULT)
            out.write(bytes)
          })

          out.close()
          resolve(entry.toLocalURL())
        } catch (e) {
          reject(new Error('文件写入失败: ' + e.message))
        }
      }, (e) => {
        reject(new Error('创建文件失败: ' + JSON.stringify(e)))
      })
    }, (e) => {
      reject(new Error('请求文件系统失败: ' + JSON.stringify(e)))
    })
  })
}
