[1mdiff --git a/uni-vite/src/components/footer_bar/index.vue b/uni-vite/src/components/footer_bar/index.vue[m
[1mindex d82f90e..a07c1e5 100644[m
[1m--- a/uni-vite/src/components/footer_bar/index.vue[m
[1m+++ b/uni-vite/src/components/footer_bar/index.vue[m
[36m@@ -30,7 +30,7 @@[m [mexport default {[m
   data () {[m
     return {[m
       tabList: [[m
[31m-        { key: 'home', name: '首页', icon: 'home', url: `${WEB_DOMAIN}home/index` },[m
[32m+[m[32m        { key: 'home', name: '首页', icon: 'home', url: `${WEB_DOMAIN}index/index` },[m[41m[m
         { key: 'task', name: '任务', icon: 'wallet', url: `${WEB_DOMAIN}task/index` },[m
         { key: 'study', name: '学习', icon: 'color', url: `${WEB_DOMAIN}study/index`, type: 'primary' },[m
         { key: 'life ', name: '生活', icon: 'gift', url: `${WEB_DOMAIN}life/index` },[m
[1mdiff --git a/uni-vite/src/pages.json b/uni-vite/src/pages.json[m
[1mindex 4174cfb..49db446 100644[m
[1m--- a/uni-vite/src/pages.json[m
[1m+++ b/uni-vite/src/pages.json[m
[36m@@ -7,7 +7,7 @@[m
 	},[m
 	"pages": [[m
 		{[m
[31m-			"path": "pages/home/index",[m
[32m+[m			[32m"path": "pages/index/index",[m
 			"style": {[m
 				"navigationBarTitleText": "首页"[m
 			}[m
[1mdiff --git a/uni-vite/src/pages/home/index.less b/uni-vite/src/pages/home/index.less[m
[1mdeleted file mode 100644[m
[1mindex 6105287..0000000[m
[1m--- a/uni-vite/src/pages/home/index.less[m
[1m+++ /dev/null[m
[36m@@ -1,149 +0,0 @@[m
[31m-@import '@/common/css/color.less';[m
[31m-page {[m
[31m-  height: 100%;[m
[31m-}[m
[31m-.home-page {[m
[31m-  display: flex;[m
[31m-  flex-direction: column;[m
[31m-  height: 100%;[m
[31m-  background: #ffffff;[m
[31m-[m
[31m-  .nav-header {[m
[31m-    position: fixed;[m
[31m-    top: 0;[m
[31m-    left: 0;[m
[31m-    right: 0;[m
[31m-    padding: 0 32rpx;[m
[31m-    height: 88rpx;[m
[31m-    z-index: 1000;[m
[31m-[m
[31m-    .nav-content {[m
[31m-      display: flex;[m
[31m-      justify-content: space-between;[m
[31m-      align-items: center;[m
[31m-      height: 100%;[m
[31m-[m
[31m-      .nav-icons {[m
[31m-        display: flex;[m
[31m-        gap: 32rpx;[m
[31m-      }[m
[31m-    }[m
[31m-  }[m
[31m-[m
[31m-  .content {[m
[31m-    flex: 1;[m
[31m-    padding-bottom: 120rpx;[m
[31m-  }[m
[31m-[m
[31m-  .banner-img {[m
[31m-    width: 100%;[m
[31m-    height: 360rpx;[m
[31m-  }[m
[31m-[m
[31m-  .grid-section {[m
[31m-    margin-top: 48rpx;[m
[31m-    padding: 0 32rpx;[m
[31m-    display: grid;[m
[31m-    grid-template-columns: repeat(4, 1fr);[m
[31m-    gap: 32rpx;[m
[31m-  }[m
[31m-[m
[31m-  .grid-item {[m
[31m-    display: flex;[m
[31m-    flex-direction: column;[m
[31m-    align-items: center;[m
[31m-  }[m
[31m-[m
[31m-  .grid-icon-wrapper {[m
[31m-    width: 112rpx;[m
[31m-    height: 112rpx;[m
[31m-    border-radius: 56rpx;[m
[31m-    overflow: hidden;[m
[31m-  }[m
[31m-[m
[31m-  .grid-icon {[m
[31m-    width: 100%;[m
[31m-    height: 100%;[m
[31m-  }[m
[31m-[m
[31m-  .grid-text {[m
[31m-    margin-top: 16rpx;[m
[31m-    font-size: 24rpx;[m
[31m-    color: #666666;[m
[31m-    white-space: nowrap;[m
[31m-  }[m
[31m-[m
[31m-  .recommend-section {[m
[31m-    margin-top: 48rpx;[m
[31m-    padding: 0 32rpx;[m
[31m-  }[m
[31m-[m
[31m-  .recommend-header {[m
[31m-    display: flex;[m
[31m-    justify-content: space-between;[m
[31m-    align-items: center;[m
[31m-    margin-bottom: 32rpx;[m
[31m-  }[m
[31m-[m
[31m-  .recommend-title {[m
[31m-    font-size: 36rpx;[m
[31m-    font-weight: 500;[m
[31m-  }[m
[31m-[m
[31m-  .recommend-more {[m
[31m-    font-size: 28rpx;[m
[31m-    color: rgb(20,200,165);[m
[31m-  }[m
[31m-[m
[31m-  .recommend-list {[m
[31m-    display: flex;[m
[31m-    flex-direction: column;[m
[31m-    gap: 32rpx;[m
[31m-  }[m
[31m-[m
[31m-  .recommend-item {[m
[31m-    display: flex;[m
[31m-    padding: 24rpx;[m
[31m-    background: #ffffff;[m
[31m-    border-radius: 16rpx;[m
[31m-    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);[m
[31m-  }[m
[31m-[m
[31m-  .recommend-image {[m
[31m-    width: 160rpx;[m
[31m-    height: 160rpx;[m
[31m-    border-radius: 16rpx;[m
[31m-  }[m
[31m-[m
[31m-  .recommend-content {[m
[31m-    flex: 1;[m
[31m-    margin-left: 24rpx;[m
[31m-  }[m
[31m-[m
[31m-  .recommend-item-title {[m
[31m-    font-size: 32rpx;[m
[31m-    font-weight: 500;[m
[31m-  }[m
[31m-[m
[31m-  .recommend-desc {[m
[31m-    font-size: 28rpx;[m
[31m-    color: #999999;[m
[31m-    margin-top: 8rpx;[m
[31m-  }[m
[31m-[m
[31m-  .recommend-stats {[m
[31m-    display: flex;[m
[31m-    align-items: center;[m
[31m-    margin-top: 16rpx;[m
[31m-  }[m
[31m-[m
[31m-  .stats-text {[m
[31m-    font-size: 24rpx;[m
[31m-    color: #999999;[m
[31m-  }[m
[31m-[m
[31m-  .stats-dot {[m
[31m-    margin: 0 16rpx;[m
[31m-    color: #999999;[m
[31m-  }[m
[31m-}[m
[1mdiff --git a/uni-vite/src/pages/home/index.vue b/uni-vite/src/pages/home/index.vue[m
[1mdeleted file mode 100644[m
[1mindex 8b6901c..0000000[m
[1m--- a/uni-vite/src/pages/home/index.vue[m
[1m+++ /dev/null[m
[36m@@ -1,106 +0,0 @@[m
[31m-<template>[m
[31m-  <view class="home-page">[m
[31m-    <view class="nav-header">[m
[31m-      <view class="nav-content">[m
[31m-        <view class="logo">[m
[31m-					<image :src="logoWhiteImage" mode="heightFix" style="display: block; height: 60rpx;"></image>[m
[31m-				</view>[m
[31m-        <view class="nav-icons">[m
[31m-          <uni-icons type="search" size="24" color="#ffffff" />[m
[31m-          <uni-icons type="notification" size="24" color="#ffffff" />[m
[31m-        </view>[m
[31m-      </view>[m
[31m-    </view>[m
[31m-[m
[31m-    <view class="content">[m
[31m-      <view class="banner-wrapper">[m
[31m-        <image class="banner-img" :src="bannerImage" mode="aspectFill"></image>[m
[31m-      </view>[m
[31m-[m
[31m-      <view class="grid-section">[m
[31m-        <view class="grid-item">[m
[31m-          <view class="grid-icon-wrapper">[m
[31m-            <image class="grid-icon" src="https://ai-public.mastergo.com/ai/img_res/d502c279bba37f3dfe78158803cfff37.jpg" mode="aspectFill"></image>[m
[31m-          </view>[m
[31m-          <text class="grid-text">任务中心</text>[m
[31m-        </view>[m
[31m-        <view class="grid-item">[m
[31m-          <view class="grid-icon-wrapper">[m
[31m-            <image class="grid-icon" src="https://ai-public.mastergo.com/ai/img_res/d4f59adc3c18b9289aef1f340a93357e.jpg" mode="aspectFill"></image>[m
[31m-          </view>[m
[31m-          <text class="grid-text">我的书单</text>[m
[31m-        </view>[m
[31m-        <view class="grid-item">[m
[31m-          <view class="grid-icon-wrapper">[m
[31m-            <image class="grid-icon" src="https://ai-public.mastergo.com/ai/img_res/d055efbe683f9117949d5fa4088f0d55.jpg" mode="aspectFill"></image>[m
[31m-          </view>[m
[31m-          <text class="grid-text">音乐收藏</text>[m
[31m-        </view>[m
[31m-        <view class="grid-item">[m
[31m-          <view class="grid-icon-wrapper">[m
[31m-            <image class="grid-icon" src="https://ai-public.mastergo.com/ai/img_res/147d5438ef903fcbbac27fc51b5627c8.jpg" mode="aspectFill"></image>[m
[31m-          </view>[m
[31m-          <text class="grid-text">视频订阅</text>[m
[31m-        </view>[m
[31m-      </view>[m
[31m-[m
[31m-      <view class="recommend-section">[m
[31m-        <view class="recommend-header">[m
[31m-          <text class="recommend-title">推荐内容</text>[m
[31m-          <text class="recommend-more">查看更多</text>[m
[31m-        </view>[m
[31m-        <view class="recommend-list">[m
[31m-          <view class="recommend-item">[m
[31m-            <image class="recommend-image" src="https://ai-public.mastergo.com/ai/img_res/7e963e9932be6f9b684f7bb0e7c374e4.jpg" mode="aspectFill"></image>[m
[31m-            <view class="recommend-content">[m
[31m-              <text class="recommend-item-title">高效学习技巧分享</text>[m
[31m-              <text class="recommend-desc">10 个实用的学习方法，助你事半功倍</text>[m
[31m-              <view class="recommend-stats">[m
[31m-                <text class="stats-text">2.1k 阅读</text>[m
[31m-                <text class="stats-dot">·</text>[m
[31m-                <text class="stats-text">185 收藏</text>[m
[31m-              </view>[m
[31m-            </view>[m
[31m-          </view>[m
[31m-          <view class="recommend-item">[m
[31m-            <image class="recommend-image" src="https://ai-public.mastergo.com/ai/img_res/1dc7228cba03f2eb84dd9a53ecf84d12.jpg" mode="aspectFill"></image>[m
[31m-            <view class="recommend-content">[m
[31m-              <text class="recommend-item-title">周末户外摄影指南</text>[m
[31m-              <text class="recommend-desc">专业摄影师教你拍出完美自然风光</text>[m
[31m-              <view class="recommend-stats">[m
[31m-                <text class="stats-text">1.8k 阅读</text>[m
[31m-                <text class="stats-dot">·</text>[m
[31m-                <text class="stats-text">142 收藏</text>[m
[31m-              </view>[m
[31m-            </view>[m
[31m-          </view>[m
[31m-        </view>[m
[31m-      </view>[m
[31m-    </view>[m
[31m-[m
[31m-		<FooterBar />[m
[31m-  </view>[m
[31m-</template>[m
[31m-[m
[31m-<script>[m
[31m-import { COS_ASSET_PATH } from '@/utils/variables'[m
[31m-import { LOGO_WHITE_IMAGE } from '@/config/index.js'[m
[31m-import FooterBar from '@/components/footer_bar/index.vue'[m
[31m-export default {[m
[31m-	components: {[m
[31m-		FooterBar[m
[31m-	},[m
[31m-	data () {[m
[31m-		return {[m
[31m-			bannerImage: `${COS_ASSET_PATH}images/uni_20250313204613.jpg`[m
[31m-		}[m
[31m-	},[m
[31m-	created () {[m
[31m-		this.logoWhiteImage = LOGO_WHITE_IMAGE[m
[31m-	}[m
[31m-}[m
[31m-</script>[m
[31m-[m
[31m-<style lang="less">[m
[31m-@import './index.less';[m
[31m-</style>[m
\ No newline at end of file[m
[1mdiff --git a/uni-vite/src/pages/login/index.vue b/uni-vite/src/pages/login/index.vue[m
[1mindex 663d4d9..99d0eb8 100644[m
[1m--- a/uni-vite/src/pages/login/index.vue[m
[1m+++ b/uni-vite/src/pages/login/index.vue[m
[36m@@ -60,7 +60,7 @@[m
               icon: 'success'[m
             });[m
             uni.redirectTo({[m
[31m-              url: requestUrl || '/pages/home/index'[m
[32m+[m[32m              url: requestUrl || '/pages/index/index'[m[41m[m
             });[m
           })[m
         }[m
[1mdiff --git a/uni-vite/src/pages/me/index.vue b/uni-vite/src/pages/me/index.vue[m
[1mindex 9e60af8..5b0c423 100644[m
[1m--- a/uni-vite/src/pages/me/index.vue[m
[1m+++ b/uni-vite/src/pages/me/index.vue[m
[36m@@ -65,7 +65,7 @@[m [mexport default {[m
         })[m
       }).then(() => {[m
         uni.redirectTo({[m
[31m-          url: '/pages/home/index'[m
[32m+[m[32m          url: '/pages/index/index'[m[41m[m
         });[m
       })[m
       .catch(error => {[m
[1mdiff --git a/uni-vite/src/store/index.js b/uni-vite/src/store/index.js[m
[1mindex bb5ad90..87b9b51 100644[m
[1m--- a/uni-vite/src/store/index.js[m
[1m+++ b/uni-vite/src/store/index.js[m
[36m@@ -2,7 +2,7 @@[m [mimport { createStore } from 'vuex'[m
 [m
 export default createStore({[m
   state: {[m
[31m-    activeTabBar: 'home'[m
[32m+[m[32m    activeTabBar: 'index'[m[41m[m
   },[m
   mutations: {[m
     setActiveTabBar(state, str) {[m
[1mdiff --git a/uni-vite/src/utils/common.js b/uni-vite/src/utils/common.js[m
[1mindex 7ef511d..11ca93d 100644[m
[1m--- a/uni-vite/src/utils/common.js[m
[1m+++ b/uni-vite/src/utils/common.js[m
[36m@@ -1,4 +1,5 @@[m
 import { get as _get } from 'lodash'[m
[32m+[m[32mimport VConsole from 'vconsole';[m[41m[m
 import { isAfterIphoneX } from '@/common/js/env'[m
 [m
 [m
[36m@@ -232,6 +233,7 @@[m [mexport function initBasicConfig(options = {}) {[m
   setHTMLFontSize()[m
   setThinnerBorder()[m
   patchIOSViewportOffset()[m
[32m+[m	[32m// new VConsole()[m[41m[m
   if (options.documentTitle) {[m
     setDocumentAndViewportTitle(options.documentTitle)[m
   }[m
[1mdiff --git a/uni-vite/src/utils/variables.js b/uni-vite/src/utils/variables.js[m
[1mindex 7c75018..4567c55 100644[m
[1m--- a/uni-vite/src/utils/variables.js[m
[1m+++ b/uni-vite/src/utils/variables.js[m
[36m@@ -6,7 +6,10 @@[m [mexport const IS_PRODUCT_ENV = _hostname.search(/yizhao\.cn/) !== -1[m
 export const IS_TEST_ENV = _hostname.search(/yizhao\.cn/) !== -1[m
 export const IS_LOCALHOST_ENV = _hostname.search(/localhost|192\.168|127\.0\.0\.1|dev\.yizhao\.cn/) !== -1[m
 [m
[31m-export const APP_HOSTNAME = IS_LOCALHOST_ENV ? 'http://localhost:8080' : `https://app.yizhao.cn`[m
[32m+[m[32m// export const APP_HOSTNAME = IS_LOCALHOST_ENV ? 'http://localhost' : `https://app.yizhao.cn`[m[41m[m
[32m+[m[32mexport const APP_HOSTNAME = import.meta.env.VITE_SERVE_HOST[m[41m[m
[32m+[m[32m// export const APP_HOSTNAME = 'http://[::1]'[m[41m[m
[32m+[m[32mconsole.log(import.meta.env.VITE_SERVE_HOST)[m[41m[m
 [m
 export const COS_ASSET_PATH = 'https://app-1259410276.cos.ap-shanghai.myqcloud.com/uni/'[m
 export const WEB_DOMAIN = '/pages/'[m
