import qs from 'qs'
import { get as _get } from 'lodash'
import { getUrlParams, replaceCosDomainName } from './variables'

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

export function scaleImageWidthInCOS (url, w = 750) {
	const newUrl = replaceCosDomainName(url)
  const scaleString = `imageMogr2/thumbnail/${w}x`
  let _paramString = qs.stringify(getUrlParams(newUrl))
  _paramString = _paramString ? `?${_paramString}&${scaleString}` : `?${scaleString}`
  return `${newUrl}${_paramString}`
}

export function openUrl(item) {
	if (item && item.url) {
		if (item.jumpTo === 'navigate') {
			uni.navigateTo({
				url: item.url
			});
      return
		}
		if (item.jumpTo === 'webview') {
			uni.navigateTo({
				url: `/pages/webview/index?url=${encodeURIComponent(item.url)}`
			});
      return
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
      return
		}
    uni.navigateTo({
      url: item.url
    });
	}
}
