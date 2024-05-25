import Vue from 'vue';
import App from './app.vue'; 
import Mixin from '@/mixins/index.js';

Vue.config.productionTip = false;

Vue.mixin(Mixin);
new Vue({
  el: '#app',
  render: h => h(App),
});
