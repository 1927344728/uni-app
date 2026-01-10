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
  return {
    app,
  };
}