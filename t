[1mdiff --git a/uni-vite/src/pages/study/arithmetic/play.less b/uni-vite/src/pages/study/arithmetic/play.less[m
[1mindex 9118f3f..8f83654 100644[m
[1m--- a/uni-vite/src/pages/study/arithmetic/play.less[m
[1m+++ b/uni-vite/src/pages/study/arithmetic/play.less[m
[36m@@ -80,65 +80,37 @@[m
   position: relative;[m
 }[m
 [m
[31m-.ring_conic {[m
[32m+[m[32m.ring_conic,[m
[32m+[m[32m.ring_track {[m
   width: 140rpx;[m
   height: 140rpx;[m
   border-radius: 50%;[m
[31m-}[m
[31m-[m
[31m-.ring_clip {[m
[31m-  width: 140rpx;[m
[31m-  height: 140rpx;[m
[31m-  position: relative;[m
[32m+[m[32m  box-sizing: border-box;[m
 }[m
 [m
 .ring_track {[m
   position: absolute;[m
   left: 0;[m
   top: 0;[m
[31m-  width: 140rpx;[m
[31m-  height: 140rpx;[m
[31m-  border-radius: 50%;[m
[32m+[m[32m  z-index: 0;[m
   border: 12rpx solid #d7ece9;[m
[31m-  box-sizing: border-box;[m
[31m-}[m
[31m-[m
[31m-.ring_half {[m
[31m-  position: absolute;[m
[31m-  top: 0;[m
[31m-  width: 70rpx;[m
[31m-  height: 140rpx;[m
[31m-  overflow: hidden;[m
[31m-}[m
[31m-[m
[31m-.ring_right {[m
[31m-  right: 0;[m
[31m-}[m
[31m-[m
[31m-.ring_left {[m
[31m-  left: 0;[m
 }[m
 [m
[31m-.ring_bar {[m
[32m+[m[32m.tick {[m
   position: absolute;[m
[31m-  top: 0;[m
[31m-  width: 140rpx;[m
[31m-  height: 140rpx;[m
[32m+[m[32m  z-index: 1;[m
[32m+[m[32m  width: 12rpx;[m
[32m+[m[32m  height: 12rpx;[m
   border-radius: 50%;[m
[31m-  border: 12rpx solid #3cbf6a;[m
[31m-  box-sizing: border-box;[m
[31m-}[m
[31m-[m
[31m-.ring_right .ring_bar {[m
[31m-  right: 0;[m
[32m+[m[32m  background: transparent;[m
 }[m
 [m
[31m-.ring_left .ring_bar {[m
[31m-  left: 0;[m
[32m+[m[32m.tick.on {[m
[32m+[m[32m  background: #3cbf6a;[m
 }[m
 [m
[31m-.ring_bar.warn {[m
[31m-  border-color: #e85d5d;[m
[32m+[m[32m.tick.on.warn {[m
[32m+[m[32m  background: #e85d5d;[m
 }[m
 [m
 .ring_inner {[m
[36m@@ -147,16 +119,19 @@[m
   top: 12rpx;[m
   right: 12rpx;[m
   bottom: 12rpx;[m
[32m+[m[32m  z-index: 2;[m
   border-radius: 50%;[m
   background: #d7f0e4;[m
   display: flex;[m
   align-items: center;[m
   justify-content: center;[m
[32m+[m[32m  text-align: center;[m
 }[m
 [m
 .timer_num {[m
   font-size: 48rpx;[m
   font-weight: 800;[m
[32m+[m[32m  line-height: 116rpx;[m
   color: #3cbf6a;[m
 }[m
 [m
[1mdiff --git a/uni-vite/src/pages/study/arithmetic/play.vue b/uni-vite/src/pages/study/arithmetic/play.vue[m
[1mindex fc0db13..7920814 100644[m
[1m--- a/uni-vite/src/pages/study/arithmetic/play.vue[m
[1m+++ b/uni-vite/src/pages/study/arithmetic/play.vue[m
[36m@@ -24,26 +24,17 @@[m
       <view class="ring_conic" :style="conicStyle"></view>[m
       <!-- #endif -->[m
       <!-- #ifdef MP -->[m
[31m-      <view class="ring_clip">[m
[31m-        <view class="ring_track"></view>[m
[31m-        <view class="ring_half ring_right">[m
[31m-          <view[m
[31m-            class="ring_bar"[m
[31m-            :class="{ warn: remainCeil <= 3 }"[m
[31m-            :style="{ transform: 'rotate(' + rightRotate + 'deg)' }"[m
[31m-          ></view>[m
[31m-        </view>[m
[31m-        <view class="ring_half ring_left">[m
[31m-          <view[m
[31m-            class="ring_bar"[m
[31m-            :class="{ warn: remainCeil <= 3 }"[m
[31m-            :style="{ transform: 'rotate(' + leftRotate + 'deg)' }"[m
[31m-          ></view>[m
[31m-        </view>[m
[31m-      </view>[m
[32m+[m[32m      <view class="ring_track"></view>[m
[32m+[m[32m      <view[m
[32m+[m[32m        v-for="(pos, i) in tickStyles"[m
[32m+[m[32m        :key="i"[m
[32m+[m[32m        class="tick"[m
[32m+[m[32m        :class="{ on: i < remainTicks, warn: remainCeil <= 3 }"[m
[32m+[m[32m        :style="pos"[m
[32m+[m[32m      ></view>[m
       <!-- #endif -->[m
       <view class="ring_inner">[m
[31m-        <text class="timer_num" :class="{ warn: remainCeil <= 3 }">{{ remainCeil }}</text>[m
[32m+[m[32m        <text :key="'t-' + remainCeil" class="timer_num" :class="{ warn: remainCeil <= 3 }">{{ remainCeil }}</text>[m
       </view>[m
     </view>[m
 [m
[36m@@ -126,13 +117,26 @@[m [mexport default {[m
       if (!total) return 0[m
       return Math.max(0, Math.min(1, this.remainMs / total))[m
     },[m
[31m-    leftRotate () {[m
[31m-      const deg = this.remainRatio * 360[m
[31m-      return deg > 180 ? deg - 360 : -180[m
[32m+[m[32m    remainTicks () {[m
[32m+[m[32m      return Math.round(this.remainRatio * 48)[m
     },[m
[31m-    rightRotate () {[m
[31m-      const deg = this.remainRatio * 360[m
[31m-      return deg > 180 ? 0 : deg - 180[m
[32m+[m[32m    tickStyles () {[m
[32m+[m[32m      const n = 48[m
[32m+[m[32m      const cx = uni.upx2px(70)[m
[32m+[m[32m      const cy = uni.upx2px(70)[m
[32m+[m[32m      const r = uni.upx2px(64)[m
[32m+[m[32m      const size = uni.upx2px(12)[m
[32m+[m[32m      const list = [][m
[32m+[m[32m      for (let i = 0; i < n; i++) {[m
[32m+[m[32m        const rad = (i / n) * Math.PI * 2 - Math.PI / 2[m
[32m+[m[32m        list.push({[m
[32m+[m[32m          left: (cx + r * Math.cos(rad) - size / 2) + 'px',[m
[32m+[m[32m          top: (cy + r * Math.sin(rad) - size / 2) + 'px',[m
[32m+[m[32m          width: size + 'px',[m
[32m+[m[32m          height: size + 'px'[m
[32m+[m[32m        })[m
[32m+[m[32m      }[m
[32m+[m[32m      return list[m
     },[m
     conicStyle () {[m
       const deg = this.remainRatio * 360[m
