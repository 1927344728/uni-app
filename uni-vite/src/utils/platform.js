import { Buffer } from 'buffer';
import iconv from 'iconv-lite';

export function stringToBase64(str) {
  // #ifdef H5
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(str)));
  }
  // #endif
  
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

export function ArrayBufferToGBK (arrayBuffer) {
  try {
    if (typeof Blob !== 'undefined' && typeof FileReader !== 'undefined') {
      return new Promise((resolve) => {
        const blob = new Blob([arrayBuffer], { type: 'text/plain;charset=gbk' })
        const reader = new FileReader()
        reader.onload = () => {
          resolve(reader.result)
        }
        reader.onerror = () => {
          resolve('')
        }
        reader.readAsText(blob, 'gbk')
      })
    }

    if (typeof plus !== 'undefined' && plus.io) {
      const buffer = Buffer.from(arrayBuffer);
      const gbkText = iconv.decode(buffer, 'gbk')
      console.log('Buffer + iconv-lite，解码！')
      return gbkText
    }
  } catch (err) {
    console.error('ArrayBufferToGBK error', err)
  }
  return ''
}