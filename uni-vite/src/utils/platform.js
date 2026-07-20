import { Buffer } from 'buffer';
// #ifndef H5
import iconv from 'iconv-lite';
// #endif

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

function decodeUtf8 (arrayBuffer) {
  try {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(new Uint8Array(arrayBuffer));
    }
  } catch (e) {}
  try {
    return Buffer.from(arrayBuffer).toString('utf8');
  } catch (e) {}
  return '';
}

/**
 * 将 ArrayBuffer 按 GBK 解码为字符串。
 * H5：FileReader（返回 Promise）
 * App：iconv-lite（同步字符串）
 * 调用方使用 Promise.resolve(...) 统一处理即可。
 */
export function ArrayBufferToGBK (arrayBuffer) {
  try {
    // #ifdef H5
    if (typeof Blob !== 'undefined' && typeof FileReader !== 'undefined') {
      return new Promise((resolve) => {
        try {
          const blob = new Blob([arrayBuffer], { type: 'text/plain;charset=gbk' });
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result || '');
          };
          reader.onerror = () => {
            resolve(decodeUtf8(arrayBuffer));
          };
          reader.readAsText(blob, 'gbk');
        } catch (e) {
          resolve(decodeUtf8(arrayBuffer));
        }
      });
    }
    return decodeUtf8(arrayBuffer);
    // #endif

    // #ifndef H5
    try {
      return iconv.decode(Buffer.from(arrayBuffer), 'gbk');
    } catch (e) {
      return decodeUtf8(arrayBuffer);
    }
    // #endif
  } catch (err) {
    console.error('ArrayBufferToGBK error', err);
    return decodeUtf8(arrayBuffer);
  }
}
