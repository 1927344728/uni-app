<template>
  <view>
    <web-view :src="localHtmlPath"></web-view>
  </view>
</template>

<script>
import { get as _get } from 'lodash'
export default {
  data() {
    return {
      localHtmlPath: _get(this.getCurrentPageParams(), 'url')
    }
  },
	methods: {
		getCurrentPageParams() {
		  const pages = getCurrentPages();
		  if (pages.length === 0) return {};
		  
		  const currentPage = pages[pages.length - 1];
		  return currentPage.$page.options || {};
		}
	}
}
</script>

<style>
</style>