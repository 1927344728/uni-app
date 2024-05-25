const _userAgent = navigator ? navigator.userAgent : '';
const env = {
  isAndroid: /Android/i.test(_userAgent),
  isIos: /(iPhone|iPad|iPod)/i.test(_userAgent),
  supportTouch: (function isSupportTouch() {
    return window && !!(
      'ontouchstart' in window ||
      (window.DocumentTouch && document instanceof window.DocumentTouch)
    );
  })(),
};

const _devicePixelRatio = window && window.devicePixelRatio ? window.devicePixelRatio : null
const _screenWidth = window && window.screen && window.screen.width ? window.screen.width : null
const _screenHeight = window && window.screen && window.screen.height ? window.screen.height : null
const isIphoneX = () =>
  /iphone/gi.test(_userAgent) &&
  _devicePixelRatio &&
  _devicePixelRatio === 3 &&
  ((_screenWidth === 375 && _screenHeight === 812) ||
    (_screenHeight === 375 && _screenWidth === 812));

const isIphoneXR = () =>
  /iphone/gi.test(_userAgent) &&
  _devicePixelRatio &&
  _devicePixelRatio === 2 &&
  ((_screenWidth === 414 && _screenHeight === 896) ||
    (_screenHeight === 414 && _screenWidth === 896));

const iphoneXSMax = () =>
  /iphone/gi.test(_userAgent) &&
  _devicePixelRatio &&
  _devicePixelRatio === 3 &&
  ((_screenWidth === 414 && _screenHeight === 896) ||
    (_screenHeight === 414 && _screenWidth === 896));

export const isAfterIphoneX = () =>
  isIphoneX() || isIphoneXR() || iphoneXSMax();

export function addXSupport() {
  const $viewport = document.querySelector('meta[name=viewport]');
  if (!$viewport || !isAfterIphoneX()) {
    return false;
  }
  let content = $viewport.getAttribute('content');
  if (content.indexOf('viewport-fit') !== -1) {
    return false;
  }
  content += ',viewport-fit=cover';
  $viewport.setAttribute('content', content);
  return true;
}

export default env;
