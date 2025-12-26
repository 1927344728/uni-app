// utils/xf-tts.js
/**
 * 讯飞语音合成工具类
 * 使用前请先申请API密钥：https://console.xfyun.cn/services/tts
 * 在线语音合成API文档：https://www.xfyun.cn/doc/tts/online_tts/API.html#%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E
 */

import CryptoJS from 'crypto-js';
import qs from 'qs'
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
    // 使用 uni-app 兼容的 Base64 编码
    const authorization = this.stringToBase64(authorizationOrigin);
    
    // 构造URL参数
    const urlParams = {
      host,
      date,
      authorization
    }
    return `${baseURL}?${qs.stringify(urlParams)}`;
  }

  /**
   * 将文本转换为音频文件并返回临时URL
   * @param {string} text - 要合成的文本
   * @param {Object} options - 合成选项
   * @returns {Promise<string>} 音频临时URL
   */
  async textToAudioUrl(text, options = {}) {
    const { APPID, APISecret, APIKey, defaultParams } = this.config
    const cacheKey = this.stringToBase64(text)
    console.log('textToAudioUrl', text)
    return new Promise((resolve, reject) => {
      if (!APPID|| !APISecret || !APIKey ) {
        reject(new Error('请先配置APPID、APIKey和APISecret'));
        return;
      }

      if (!text || text.trim() === '') {
        reject(new Error('文本内容不能为空'));
        return;
      }

      if (this.cacheMap[cacheKey]) {
        return this.saveAudioToFile(this.cacheMap[cacheKey]).then(audioUrl => {
          resolve(audioUrl);
        }).catch(error => {
          console.error(error.message)
          reject(error);
        });
      }

      const wsUrl = this.generateWebSocketUrl();
      
      let audioChunks = [];
      let isCompleted = false;

      uni.connectSocket({
        url: wsUrl
      });

      uni.onSocketOpen(() => {
        if (!this.cacheMap[cacheKey]) {
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
                text: this.stringToBase64(text)
              }
            })
          });
        }
      });

      uni.onSocketMessage((res) => {
        try {
          const response = JSON.parse(res.data);
          if (response.code !== 0) {
            reject(new Error(`语音合成失败: ${response.message}`));
            uni.closeSocket();
            return;
          }
          
          if (response.data && response.data.audio) {
            let arrayBuffer;
            // #ifdef H5
            const audioData = atob(response.data.audio);
            arrayBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < audioData.length; i++) {
              view[i] = audioData.charCodeAt(i);
            }
            // #endif

            // #ifndef H5
            arrayBuffer = uni.base64ToArrayBuffer(response.data.audio);
            // #endif
            audioChunks.push(arrayBuffer);
          }
          
          // 检查是否完成
          if (response.data && response.data.status === 2) {
            isCompleted = true;
            uni.closeSocket();
          }
        } catch (error) {
          reject(new Error('解析响应数据失败'));
        }
      });

      uni.onSocketClose(() => {
        if (!isCompleted) {
          reject(new Error('WebSocket连接意外关闭'));
          return;
        }
        
        if (audioChunks.length > 0) {
          const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
          const combinedArray = new Uint8Array(totalLength);
          let offset = 0;
          
          audioChunks.forEach(chunk => {
            combinedArray.set(new Uint8Array(chunk), offset);
            offset += chunk.byteLength;
          });
          
          this.cacheMap[cacheKey] = combinedArray
          this.saveAudioToFile(combinedArray).then(audioUrl => {
            resolve(audioUrl);
          }).catch(error => {
            console.error(error.message)
            reject(error);
          });
        } else {
          reject(new Error('未收到音频数据'));
        }
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

  stringToBase64(str) {
    // #ifdef H5
    // H5 平台可以使用 btoa
    if (typeof btoa === 'function') {
      return btoa(unescape(encodeURIComponent(str)));
    }
    // #endif
    
    // uni-app 跨平台 Base64 编码
    try {
      // 将字符串转换为 UTF-8 字节数组
      const utf8Bytes = [];
      for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);
        if (charCode < 0x80) {
          utf8Bytes.push(charCode);
        } else if (charCode < 0x800) {
          utf8Bytes.push(0xc0 | (charCode >> 6));
          utf8Bytes.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0xd800 || charCode >= 0xe000) {
          utf8Bytes.push(0xe0 | (charCode >> 12));
          utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f));
          utf8Bytes.push(0x80 | (charCode & 0x3f));
        } else {
          // 代理对
          i++;
          charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
          utf8Bytes.push(0xf0 | (charCode >> 18));
          utf8Bytes.push(0x80 | ((charCode >> 12) & 0x3f));
          utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f));
          utf8Bytes.push(0x80 | (charCode & 0x3f));
        }
      }
      
      // 将字节数组转换为 ArrayBuffer
      const arrayBuffer = new ArrayBuffer(utf8Bytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < utf8Bytes.length; i++) {
        uint8Array[i] = utf8Bytes[i];
      }
      
      return uni.arrayBufferToBase64(arrayBuffer);
    } catch (error) {
      console.error('Base64编码失败:', error);
      throw new Error('Base64编码失败：环境不支持');
    }
  }

  /**
   * 将音频数据保存为临时文件
   */
  saveAudioToFile(arrayBuffer) {
    return new Promise((resolve, reject) => {
      // #ifdef H5
      try {
        const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(blob);
        resolve(audioUrl);
        return;
      } catch (error) {
        console.warn('H5 平台 Blob 创建失败:', error);
        reject(new Error('H5 平台保存音频失败: ' + (error.message || error)));
      }
      // #endif
      
      reject(new Error('当前平台不支持文件保存'));
    });
  }
}