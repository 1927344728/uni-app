import Vue from 'vue'
import { TextEncoder, TextDecoder } from 'text-encoding'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
console.log('text-encoding')
import App from './App'
import './uni.promisify.adaptor'

Vue.config.productionTip = false
App.mpType = 'app'



const app = new Vue({
  ...App
})
app.$mount()
