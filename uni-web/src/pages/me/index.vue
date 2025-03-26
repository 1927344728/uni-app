<template>
  <view>
    <view class="me_page" v-if="isLoaded">
			{{message}}
    </view>
		<FooterBar />
  </view>
</template>

<script>
import QS from 'qs';
import 'text-encoding'
import { getSimpleMessage } from '@/api';
import { initBasicConfig } from '@/utils/index.js';
import { APP_HOSTNAME, URL_PARAM, COMMON_PARAM, WX_GUANJIA_MP_ID } from '@/utils/variables.js';
import FooterBar from '@/components/footer_bar/index.vue'
// #ifdef WEB
console.log('WEB')
// #endif


export default {
  components: {
		FooterBar
  },
  data() {
    return {
      isLoaded: false,
			message: ''
    };
  },
  async created() {
    initBasicConfig({
      statSDKPageId: 'LIZHAO_ME',
      pageWrapperDom: document ? document.body : '',
    });
		
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.isLoaded = false;
			return getSimpleMessage().then((data) => {
				this.message = data
			}).catch(error => {
				console.log(error)
			}).finally(() => {
				this.isLoaded = true
			})
    }
	}
};
</script>

<style lang="less">
@import './index.less';
</style>