import { createSSRApp } from "vue";
import App from "./App.vue";
import store from './store'
import './uni.promisify.adaptor';

export function createApp() {
  const app = createSSRApp(App);
  app.use(store)
  if (typeof global !== 'undefined') {
    global.store = store
  }

  // #ifdef MP-WEIXIN
  // 微信自带 vConsole 面板：体验版/正式版也能打开，便于自测
  try {
    wx.setEnableDebug({ enableDebug: true })
  } catch (e) {}
  // #endif

  return {
    app,
  };
}
