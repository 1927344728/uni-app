// #ifdef APP-PLUS || MP-WEIXIN
import { Buffer } from 'buffer';
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
    const bytes = new Uint8Array(arrayBuffer);
    const chunkSize = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return decodeURIComponent(escape(binary));
  } catch (e) {}
  return '';
}

function isValidUtf8 (bytes) {
  let i = 0;
  while (i < bytes.length) {
    const byte1 = bytes[i];
    if (byte1 <= 0x7f) {
      i += 1;
      continue;
    }

    let needed = 0;
    let min = 0;
    if (byte1 >= 0xc2 && byte1 <= 0xdf) {
      needed = 1;
      min = 0x80;
    } else if (byte1 >= 0xe0 && byte1 <= 0xef) {
      needed = 2;
      min = 0x800;
    } else if (byte1 >= 0xf0 && byte1 <= 0xf4) {
      needed = 3;
      min = 0x10000;
    } else {
      return false;
    }

    if (i + needed >= bytes.length) return false;
    let codePoint = byte1 & (needed === 1 ? 0x1f : needed === 2 ? 0x0f : 0x07);
    for (let j = 1; j <= needed; j++) {
      const byte = bytes[i + j];
      if ((byte & 0xc0) !== 0x80) return false;
      codePoint = (codePoint << 6) | (byte & 0x3f);
    }
    if (codePoint < min) return false;
    if (codePoint >= 0xd800 && codePoint <= 0xdfff) return false;
    if (codePoint > 0x10ffff) return false;
    i += needed + 1;
  }
  return true;
}

function decodeUtf8IfValid (arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  if (!bytes.length) return '';
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return decodeUtf8(arrayBuffer);
  }
  return isValidUtf8(bytes) ? decodeUtf8(arrayBuffer) : null;
}

function decodeGbk (arrayBuffer) {
  try {
    return iconv.decode(Buffer.from(arrayBuffer), 'gbk');
  } catch (e) {
    return decodeUtf8(arrayBuffer);
  }
}

/**
 * 将 ArrayBuffer 按 GBK 解码为字符串。
 * H5：FileReader（返回 Promise）
 * App：iconv-lite（同步字符串）
 * 小程序：iconv-lite（同步字符串）
 * 调用方使用 Promise.resolve(...) 统一处理即可。
 */
export function ArrayBufferToGBK (arrayBuffer) {
  try {
    const utf8Text = decodeUtf8IfValid(arrayBuffer);
    if (utf8Text !== null) return utf8Text;

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

    // #ifdef APP-PLUS
    return decodeGbk(arrayBuffer);
    // #endif

    // #ifdef MP-WEIXIN
    return decodeGbk(arrayBuffer);
    // #endif

    return decodeUtf8(arrayBuffer);
  } catch (err) {
    console.error('ArrayBufferToGBK error', err);
    return decodeUtf8(arrayBuffer);
  }
}
