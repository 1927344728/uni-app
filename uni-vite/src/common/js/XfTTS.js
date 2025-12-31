/**
 * 讯飞语音合成工具类
 * 使用前请先申请API密钥：https://console.xfyun.cn/services/tts
 * 在线语音合成API文档：https://www.xfyun.cn/doc/tts/online_tts/API.html#%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E
 */

import CryptoJS from 'crypto-js';
import qs from 'qs'
import { checkFileExists, getFileInfo, listDocFiles, clearDirectory, deleteFile } from '@/common/NativeJs/file.js'
import { stringToBase64 } from '@/utils/platform.js'

export default class XfTTS {
  constructor(options = {}) {
    const APPID = "a7eda721";
    const API_SECRET = "NmQ1ODJkODZiZmZhZWRiMjI2NWY0OWY0";
    const API_KEY = "ce7d0bfd8139fe55bc544c6b9e59be3c";
    this.config = {
      // 从讯飞控制台获取
      APPID: APPID,
      APISecret: API_SECRET,
      APIKey: API_KEY,

      // API接口地址
      baseURL: 'wss://tts-api.xfyun.cn/v2/tts',

      // 默认参数配置
      defaultParams: {
        aue: 'lame',      // 音频编码，lame为mp3格式
        sfl: 1,           // 流式返回
        auf: 'audio/L16; rate=16000',
        vcn: 'x4_xiaoyan',   // 发音人
        speed: 50,        // 语速 [0,100]
        volume: 50,       // 音量 [0,100]
        pitch: 50,        // 音高 [0,100]
        bgs: 0,           // 背景音 0:无 1:有
        tte: 'UTF8',      // 文本编码
        reg: '0',         // 英文发音方式 0:自动 1:英文 2:中文
        rdn: '0'          // 随机数
      },

      ...options
    };
    this.cacheMap = {}
  }

  generateWebSocketUrl() {
    const { APIKey, APISecret, baseURL } = this.config;
    const host = 'tts-api.xfyun.cn';
    const date = new Date().toUTCString();
    const algorithm = 'hmac-sha256';
    const headers = 'host date request-line';

    // 构造签名原始字符串
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/tts HTTP/1.1`;

    // 计算签名
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, APISecret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha);

    // 构造授权参数
    const authorizationOrigin = `api_key="${APIKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
    const authorization = stringToBase64(authorizationOrigin);
    const urlParams = {
      host,
      date,
      authorization
    }
    return `${baseURL}?${qs.stringify(urlParams)}`;
  }

  async getXfTTSBase64(text, options = {}) {
    const { config, cacheMap } = this
    const { APPID, APISecret, APIKey, defaultParams } = config
    const cacheKey = stringToBase64(text)
    if (cacheMap[cacheKey]) {
      return Promise.resolve(cacheMap[cacheKey])
    }

    return new Promise((resolve, reject) => {
      if (!APPID || !APISecret || !APIKey) {
        reject(new Error('请先配置APPID、APIKey和APISecret'));
        return;
      }

      if (!text || text.trim() === '') {
        reject(new Error('文本内容不能为空'));
        return;
      }

      let isCompleted = false;
      const audioChunks = [];
      const wsUrl = this.generateWebSocketUrl();
      uni.connectSocket({
        url: wsUrl
      });

      uni.onSocketOpen(() => {
        if (!cacheMap[cacheKey]) {
          uni.sendSocketMessage({
            data: JSON.stringify({
              common: {
                app_id: APPID
              },
              business: {
                ...defaultParams,
                ...options
              },
              data: {
                status: 2,
                text: cacheKey
              }
            })
          });
        }
      });

      uni.onSocketMessage((res) => {
        if (!cacheMap[cacheKey]) {
          const response = JSON.parse(res.data) || {};
          const { code, data, message } = response
          if (code !== 0) {
            reject(new Error(`语音合成失败: ${message}`));
            uni.closeSocket();
            return;
          }

          if (data && data.audio) {
            audioChunks.push(data.audio);
          }

          // 检查是否完成
          if (data && data.status === 2) {
            isCompleted = true;
            uni.closeSocket();
          }
        }
      });

      uni.onSocketClose(() => {
        if (!isCompleted) {
          reject(new Error('WebSocket连接意外关闭'));
          return;
        }
        cacheMap[cacheKey] = audioChunks
        resolve(audioChunks)
      });

      uni.onSocketError((error) => {
        reject(new Error(`WebSocket错误: ${error}`));
      });

      // 设置超时
      setTimeout(() => {
        if (!isCompleted) {
          uni.closeSocket();
          reject(new Error('请求超时'));
        }
      }, 30000);
    });
  }

  /**
   * 将文本转换为音频文件并返回URL
   * @param {string} text - 要合成的文本
   * @param {Object} options - 合成选项
   * @returns {Promise<string>} 音频临时URL
   */
  createAudioUrl(text, options = {}) {
    // #ifdef H5
    return this.createAudioUrlInH5(text, options)
    // #endif

    // #ifdef APP-PLUS
    return this.createAudioUrlInApp(text, options)
    // #endif

    return ''
  }

  async createAudioUrlInH5(text, options = {}) {
    return new Promise(async (resolve, reject) => {
      const base64Chunks = await this.getXfTTSBase64(text, options) || []
      if (base64Chunks && base64Chunks.length) {
        const arrayBufferChunks = base64Chunks.map(chunk => {
          const audioData = atob(chunk);
          const arrayBuffer = new ArrayBuffer(audioData.length);
          const view = new Uint8Array(arrayBuffer);
          for (let i = 0; i < audioData.length; i++) {
            view[i] = audioData.charCodeAt(i);
          }
          return arrayBuffer
        })

        let offset = 0;
        const totalLength = arrayBufferChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
        const uint8Array = new Uint8Array(totalLength);
        arrayBufferChunks.forEach(chunk => {
          uint8Array.set(new Uint8Array(chunk), offset);
          offset += chunk.byteLength;
        });

        const blob = new Blob([uint8Array], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(blob);
        resolve(audioUrl);
        return
      }
      reject(new Error('未收到音频数据'));
    });
  }

  async createAudioUrlInApp(text, options) {
    // await clearDirectory()
    // await listDocFiles()
    const base64Chunks = await this.getXfTTSBase64(text, options) || []
    return new Promise((resolve, reject) => {
      const dirName = plus.io.PRIVATE_DOC;
      const fileName = 'tts_temp_audio.mp3'
      plus.io.requestFileSystem(dirName, (fs) => {
        fs.root.getFile(fileName, { create: true, exclusive: false }, function (entry) {
          const absolutePath = entry.fullPath;
          try {
            const Base64 = plus.android.importClass("android.util.Base64");
            const FileOutputStream = plus.android.importClass("java.io.FileOutputStream");
            const out = new FileOutputStream(absolutePath);

            for (let i = 0; i < base64Chunks.length; i++) {
              const bytes = Base64.decode(base64Chunks[i], Base64.DEFAULT);
              out.write(bytes);
            }

            out.close();
            resolve(entry.toLocalURL());
          } catch (e) {
            const error = new Error('文件写入失败: ' + e.message)
            console.error(error)
            reject(error);
          }
        }, (e) => {
          const error = new Error('创建文件失败: ' + JSON.stringify(e))
          console.error(error)
          reject(error);
        });
      }, (e) => {
        const error = new Error('请求文件系统失败: ' + JSON.stringify(e))
        console.error(error)
        reject(error);
      });
    });
  }
}