import { get as _get } from 'lodash'

export function getTimeStr(time) {
  const second = Math.round((new Date() - time) / 1000)
  if (second < 60) {
    return `${second}秒前`
  }
  if (second >= 60 && second < 60 * 60) {
    return `${Math.round(second / 60)}分钟前`
  }
  if (second >= 60 * 60 && second < 60 * 60 * 24) {
    return `${Math.round(second / 60 / 60)}小时前`
  }
  if (second >= 60 * 60 * 24 && second < 60 * 60 * 24 * 30) {
    return `${Math.round(second / 60 / 60 / 24)}天前`
  }
}

export function numberToChinese(number) {
  var units = '个十百千万@#%亿^&~';
  var chars = '零一二三四五六七八九';
  var a = (number + '').split(''),
    s = [],
    t = this;

  if (a.length > 12) {
    throw new Error('too big');
  } else {
    for (var i = 0, j = a.length - 1; i <= j; i++) {
      if (j == 1 || j == 5 || j == 9) { // 两位数 处理特殊的 1*
        if (i == 0) {
          if (a[i] != '1') {
            s.push(chars.charAt(a[i]));
          }
        } else {
          s.push(chars.charAt(a[i]));
        }
      } else {
        s.push(chars.charAt(a[i]));
      }
      if (i != j) {
        s.push(units.charAt(j - i));
      }
    }
  }
  return s.join('').replace(/零([十百千万亿@#%^&~])/g, function (m, d, b) { // 优先处理 零百 零千 等
    b = units.indexOf(d);
    if (b != -1) {
      if (d == '亿') {
        return d;
      }
      if (d == '万') {
        return d;
      }
      if (a[j - b] == '0') {
        return '零'
      }
    }
    return '';
  }).replace(/零+/g, '零').replace(/零([万亿])/g, function (m, b) { // 零百 零千处理后 可能出现 零零相连的 再处理结尾为零的
    return b;
  }).replace(/亿[万千百]/g, '亿').replace(/[零]$/, '').replace(/[@#%^&~]/g, function (m) {
    return {
      '@': '十',
      '#': '百',
      '%': '千',
      '^': '十',
      '&': '百',
      '~': '千'
    }[m];
  }).replace(/([亿万])([一-九])/g, function (m, d, b, c) {
    c = units.indexOf(d);
    if (c != -1) {
      if (a[j - c] == '0') {
        return d + '零' + b
      }
    }
    return m;
  });
}

export function gotoLogin() {
	uni.redirectTo({
		url: '/pages/login/index'
	});
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

export function openUrl(item) {
	if (item && item.url) {
		if (item.jumpTo === 'navigate') {
			uni.navigateTo({
				url: item.url
			});
		}
		if (item.jumpTo === 'webview') {
			uni.navigateTo({
				url: `/pages/webview/index?url=${encodeURIComponent(item.url)}`
			});
		}
		if (item.jumpTo === 'web') {
			// #ifdef H5
			window.location.href = item.url
			// #endif
			
			// #ifdef APP-PLUS
			plus.runtime.openURL(item.url);
			// #endif
			
			// #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
			uni.navigateTo({
					url: `/pages/webview/index?url=${encodeURIComponent(item.url)}`
			});
			// #endif
		}
	}
}

export function decodeLyricBuffer (buffer) {
  if (!buffer) return ''
  
  // 检测是否包含乱码字符
  const hasGarbledText = (text) => {
    // 检测常见的乱码字符模式
    return /[^\x00-\x7F\u4E00-\u9FA5\u3000-\u303F\uFF00-\uFFEF\s\[\]:\d\.\-]/.test(text) || 
           //.test(text) ||
           (text.length > 0 && text.match(/[^\x00-\x7F]/g) && text.match(/[^\x00-\x7F]/g).length / text.length > 0.3)
  }
  
  // 先尝试 UTF-8 解码
  let utf8Text = ''
  try {
    if (typeof TextDecoder !== 'undefined') {
      const decoder = new TextDecoder('utf-8')
      utf8Text = decoder.decode(buffer)
      // 如果没有乱码，直接返回
      if (!hasGarbledText(utf8Text)) {
        return utf8Text
      }
    }
  } catch (err) {
    console.warn('UTF-8 decode failed', err)
  }
  
  // 如果 UTF-8 解码有乱码，尝试 GBK 解码
  try {
    if (typeof TextDecoder !== 'undefined') {
      // 尝试 gbk 编码
      try {
        const gbkDecoder = new TextDecoder('gbk')
        const gbkText = gbkDecoder.decode(buffer)
        if (!hasGarbledText(gbkText)) {
          return gbkText
        }
      } catch (e) {
        // gbk 不支持，尝试 gb2312
        try {
          const gb2312Decoder = new TextDecoder('gb2312')
          const gb2312Text = gb2312Decoder.decode(buffer)
          if (!hasGarbledText(gb2312Text)) {
            return gb2312Text
          }
        } catch (e2) {
          console.warn('GBK/GB2312 decode not supported')
        }
      }
    }
  } catch (err) {
    console.warn('GBK decode failed', err)
  }
  
  // 如果 TextDecoder 不支持 GBK，使用手动转换
  try {
    const gbkText = convertGBKToUTF8(buffer)
    if (gbkText && !hasGarbledText(gbkText)) {
      return gbkText
    }
  } catch (err) {
    console.warn('Manual GBK conversion failed', err)
  }
  
  // 如果都失败了，返回 UTF-8 的结果（即使有乱码）
  return utf8Text || ''
}

// 简单的 GBK 到 UTF-8 转换（使用 uni-app 的 API）
export function convertGBKToUTF8 (buffer) {
  try {
    // 在 uni-app 中，可以使用 plus 对象进行编码转换
    if (typeof plus !== 'undefined' && plus.io) {
      // 将 ArrayBuffer 转换为 Base64
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      // 使用 plus 的编码转换
      return decodeURIComponent(escape(binary))
    }
    
    // 如果没有 plus，尝试使用 Blob 和 FileReader
    if (typeof Blob !== 'undefined' && typeof FileReader !== 'undefined') {
      return new Promise((resolve) => {
        const blob = new Blob([buffer], { type: 'text/plain;charset=gbk' })
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => resolve('')
        reader.readAsText(blob, 'gbk')
      })
    }
  } catch (err) {
    console.error('convertGBKToUTF8 error', err)
  }
  return ''
}
	
	
