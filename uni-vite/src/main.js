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
  // 仅开发构建打开微信 vConsole；build:mp-weixin 正式包必须关掉
  try {
    wx.setEnableDebug({ enableDebug: !!import.meta.env.DEV })
  } catch (e) {}
  // #endif

  return {
    app,
  };
}
