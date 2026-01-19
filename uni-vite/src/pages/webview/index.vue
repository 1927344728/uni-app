<template>
  <view>
    <web-view v-if="localHtmlPath" :src="localHtmlPath"></web-view>
  </view>
</template>

<script>
import { get as _get } from 'lodash'
export default {
  data() {
    return {
      localHtmlPath: null
    }
  },
  onLoad (options = {}) {
    this.localHtmlPath = options.url ? decodeURIComponent(options.url) : ''
  }
}
</script>

<style>
</style>