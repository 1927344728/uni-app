[1mdiff --git a/uni-vite/src/pages/video/componets/VideoPopup.less b/uni-vite/src/pages/video/componets/VideoPopup.less[m
[1mindex 8e18de0..f9a27bc 100644[m
[1m--- a/uni-vite/src/pages/video/componets/VideoPopup.less[m
[1m+++ b/uni-vite/src/pages/video/componets/VideoPopup.less[m
[36m@@ -1,6 +1,7 @@[m
 @import '@/common/css/color.less';[m
[32m+[m[41m[m
 @font-face {[m
[31m-  font-family: 'iconfont';  /* Project id 5075020 */[m
[32m+[m[32m  font-family: 'iconfont';[m[41m[m
   src: url('//at.alicdn.com/t/c/font_5075020_dvsb5eed4rh.woff2?t=1764604111574') format('woff2'),[m
        url('//at.alicdn.com/t/c/font_5075020_dvsb5eed4rh.woff?t=1764604111574') format('woff'),[m
        url('//at.alicdn.com/t/c/font_5075020_dvsb5eed4rh.ttf?t=1764604111574') format('truetype');[m
[36m@@ -26,26 +27,13 @@[m
   width: 100vw;[m
   height: calc(100vh - var(--window-top));[m
   max-height: 100vh;[m
[31m-  background: #fff;[m
[31m-  border-radius: 0; /* full screen */[m
[32m+[m[32m  background: #000;[m[41m[m
[32m+[m[32m  border-radius: 0;[m[41m[m
   overflow: hidden;[m
   display: flex;[m
   flex-direction: column;[m
 }[m
 [m
[31m-.video_play_popup__close {[m
[31m-  font-family: iconfont;[m
[31m-  position: absolute;[m
[31m-  top: 28rpx;[m
[31m-  right: 32rpx;[m
[31m-  background: transparent;[m
[31m-  border: none;[m
[31m-  font-size: 20px;[m
[31m-  font-weight: normal;[m
[31m-  line-height: normal;[m
[31m-  color: @text-patch2-color;[m
[31m-}[m
[31m-[m
 .video_play_popup__viewer {[m
   position: relative;[m
   width: 100%;[m
[36m@@ -55,13 +43,12 @@[m
 [m
 .video_popup_topbar {[m
   position: absolute;[m
[31m-  top: 18rpx;[m
[32m+[m[32m  top: 22rpx;[m[41m[m
   left: 16rpx;[m
[31m-  right: 16rpx;[m
[31m-  z-index: 40;[m
[32m+[m[32m  z-index: 1200;[m[41m[m
   display: flex;[m
   align-items: center;[m
[31m-  justify-content: space-between;[m
[32m+[m[32m  gap: 12rpx;[m[41m[m
   color: #fff;[m
 }[m
 .video_popup_back {[m
[36m@@ -76,42 +63,62 @@[m
   font-size: 32rpx;[m
 }[m
 .video_popup_title {[m
[31m-  flex: 1;[m
[31m-  margin: 0 16rpx;[m
[31m-  text-align: center;[m
[31m-  font-size: 30rpx;[m
[31m-  color: #fff;[m
[31m-  opacity: 0.95;[m
[31m-}[m
[31m-.video_popup_share {[m
[31m-  width: 64rpx;[m
[31m-  height: 64rpx;[m
[31m-  display: flex;[m
[31m-  align-items: center;[m
[31m-  justify-content: center;[m
   color: #fff;[m
[32m+[m[32m  font-size: 28rpx;[m[41m[m
[32m+[m[32m  font-weight: 600;[m[41m[m
 }[m
 [m
[31m-.video_popup_actions {[m
[32m+[m[32m.video_popup_actions_right {[m[41m[m
   position: absolute;[m
   right: 20rpx;[m
[31m-  bottom: 160rpx;[m
[31m-  z-index: 40;[m
[32m+[m[32m  top: 28%;[m[41m[m
   display: flex;[m
   flex-direction: column;[m
[31m-  gap: 24rpx;[m
[32m+[m[32m  gap: 20rpx;[m[41m[m
   align-items: center;[m
[32m+[m[32m  z-index: 1200;[m[41m[m
 }[m
[31m-.video_popup_actions .action {[m
[32m+[m[32m.video_popup_actions_right .action{[m[41m[m
[32m+[m[32m  color: #fff;[m[41m[m
[32m+[m[32m  font-size: 30rpx;[m[41m[m
   display: flex;[m
   flex-direction: column;[m
   align-items: center;[m
[31m-  color: #fff;[m
[31m-  font-size: 34rpx;[m
 }[m
[31m-.video_popup_actions .action text {[m
[32m+[m[32m.video_popup_actions_right .action text{[m[41m[m
[32m+[m[32m  font-size: 22rpx;[m[41m[m
[32m+[m[32m  margin-top: 8rpx;[m[41m[m
[32m+[m[32m  color: rgba(255,255,255,0.9);[m[41m[m
[32m+[m[32m}[m[41m[m
[32m+[m[41m[m
[32m+[m[32m.video_popup_info_bottom{[m[41m[m
[32m+[m[32m  position: absolute;[m[41m[m
[32m+[m[32m  left: 0;[m[41m[m
[32m+[m[32m  right: 0;[m[41m[m
[32m+[m[32m  bottom: 0;[m[41m[m
[32m+[m[32m  padding: 24rpx 28rpx 40rpx;[m[41m[m
[32m+[m[32m  display: flex;[m[41m[m
[32m+[m[32m  align-items: center;[m[41m[m
[32m+[m[32m  justify-content: space-between;[m[41m[m
[32m+[m[32m  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 60%);[m[41m[m
[32m+[m[32m  z-index: 1100;[m[41m[m
[32m+[m[32m}[m[41m[m
[32m+[m[32m.video_info_text .title{[m[41m[m
[32m+[m[32m  color: #fff;[m[41m[m
[32m+[m[32m  font-size: 30rpx;[m[41m[m
[32m+[m[32m  font-weight: 600;[m[41m[m
   display: block;[m
[31m-  font-size: 20rpx;[m
[32m+[m[32m}[m[41m[m
[32m+[m[32m.video_info_text .author{[m[41m[m
[32m+[m[32m  color: rgba(255,255,255,0.85);[m[41m[m
[32m+[m[32m  font-size: 22rpx;[m[41m[m
   margin-top: 8rpx;[m
 }[m
[32m+[m[32m.video_info_actions .btn.follow{[m[41m[m
[32m+[m[32m  background: #ff2d55;[m[41m[m
[32m+[m[32m  color: #fff;[m[41m[m
[32m+[m[32m  padding: 10rpx 20rpx;[m[41m[m
[32m+[m[32m  border-radius: 20rpx;[m[41m[m
[32m+[m[32m  font-size: 24rpx;[m[41m[m
[32m+[m[32m}[m[41m[m
 [m
[1mdiff --git a/uni-vite/src/pages/video/componets/VideoPopup.vue b/uni-vite/src/pages/video/componets/VideoPopup.vue[m
[1mindex 39c8bc4..f5b8502 100644[m
[1m--- a/uni-vite/src/pages/video/componets/VideoPopup.vue[m
[1m+++ b/uni-vite/src/pages/video/componets/VideoPopup.vue[m
[36m@@ -17,30 +17,41 @@[m
       role="dialog"[m
       aria-modal="true"[m
     >[m
[31m-        <view class="video_play_popup__viewer">[m
[31m-          <VideoPlayer[m
[31m-            ref="player"[m
[31m-            :mode="mode"[m
[31m-            :menuId="menuId"[m
[31m-            :video="video"[m
[31m-            :videos="videos"[m
[31m-            v-bind="$attrs"[m
[31m-            v-on="forwardedListeners"[m
[31m-          />[m
[32m+[m[32m      <view class="video_play_popup__viewer">[m[41m[m
[32m+[m[32m        <VideoPlayer[m[41m[m
[32m+[m[32m          ref="player"[m[41m[m
[32m+[m[32m          :mode="mode"[m[41m[m
[32m+[m[32m          :menuId="menuId"[m[41m[m
[32m+[m[32m          :video="video"[m[41m[m
[32m+[m[32m          :videos="videos"[m[41m[m
[32m+[m[32m          v-bind="$attrs"[m[41m[m
[32m+[m[32m          v-on="forwardedListeners"[m[41m[m
[32m+[m[32m        />[m[41m[m
 [m
[31m-          <view class="video_popup_topbar">[m
[31m-            <view class="video_popup_back" @click.stop="close">✕</view>[m
[31m-            <view class="video_popup_title">{{ (video && video.title) || '' }}</view>[m
[31m-            <view class="video_popup_share">⤴</view>[m
[31m-          </view>[m
[32m+[m[32m        <view class="video_popup_topbar">[m[41m[m
[32m+[m[32m          <view class="video_popup_back" @click.stop="close">✕</view>[m[41m[m
[32m+[m[32m          <view class="video_popup_title">{{ (video && video.title) || '' }}</view>[m[41m[m
[32m+[m[32m        </view>[m[41m[m
 [m
[31m-          <view class="video_popup_actions">[m
[31m-            <view class="action like">❤<text>1.2k</text></view>[m
[31m-            <view class="action comment">💬<text>234</text></view>[m
[31m-            <view class="action share">🔗<text>分享</text></view>[m
[32m+[m[32m        <view class="video_popup_actions_right">[m[41m[m
[32m+[m[32m          <view class="action avatar">[m[41m [m
[32m+[m[32m            <image src="https://i.pravatar.cc/80" style="width:56rpx;height:56rpx;border-radius:28rpx;" />[m[41m[m
           </view>[m
[32m+[m[32m          <view class="action like">❤<text>1.2k</text></view>[m[41m[m
[32m+[m[32m          <view class="action comment">💬<text>234</text></view>[m[41m[m
[32m+[m[32m          <view class="action share">🔗<text>分享</text></view>[m[41m[m
[32m+[m[32m        </view>[m[41m[m
 [m
[32m+[m[32m        <view class="video_popup_info_bottom">[m[41m[m
[32m+[m[32m          <view class="video_info_text">[m[41m[m
[32m+[m[32m            <text class="title">{{ (video && video.title) || '' }}</text>[m[41m[m
[32m+[m[32m            <text class="author">@示例作者</text>[m[41m[m
[32m+[m[32m          </view>[m[41m[m
[32m+[m[32m          <view class="video_info_actions">[m[41m[m
[32m+[m[32m            <view class="btn follow">关注</view>[m[41m[m
[32m+[m[32m          </view>[m[41m[m
         </view>[m
[32m+[m[32m      </view>[m[41m[m
     </view>[m
   </UniPopup>[m
 </template>[m
[1mdiff --git a/uni-vite/src/pages/video/index.less b/uni-vite/src/pages/video/index.less[m
[1mindex 6e18209..ac9b0ac 100644[m
[1m--- a/uni-vite/src/pages/video/index.less[m
[1m+++ b/uni-vite/src/pages/video/index.less[m
[36m@@ -66,7 +66,7 @@[m
 [m
   .video-playlist-list {[m
     display: grid;[m
[31m-    grid-template-columns: repeat(3, 1fr);[m
[32m+[m[32m    grid-template-columns: repeat(2, 1fr);[m[41m[m
     gap: 28rpx;[m
     align-items: start;[m
   }[m
[36m@@ -76,12 +76,38 @@[m
     display: flex;[m
     flex-direction: column;[m
     gap: 12rpx;[m
[31m-    .video-playlist-card__cover {[m
[32m+[m[32m    .video-playlist-card__thumb {[m[41m[m
[32m+[m[32m      position: relative;[m[41m[m
       width: 100%;[m
[31m-      height: 420rpx;[m
[32m+[m[32m      overflow: hidden;[m[41m[m
       border-radius: 12rpx;[m
[31m-      object-fit: cover;[m
[32m+[m[32m      height: 420rpx;[m[41m[m
[32m+[m[32m    }[m[41m[m
[32m+[m[32m    .video-playlist-card__cover {[m[41m[m
[32m+[m[32m      width: 100%;[m[41m[m
[32m+[m[32m      height: 100%;[m[41m[m
       display: block;[m
[32m+[m[32m      object-fit: cover;[m[41m[m
[32m+[m[32m      border-radius: 12rpx;[m[41m[m
[32m+[m[32m    }[m[41m[m
[32m+[m[32m    .video-playlist-card__overlay {[m[41m[m
[32m+[m[32m      position: absolute;[m[41m[m
[32m+[m[32m      inset: 0;[m[41m[m
[32m+[m[32m      display: flex;[m[41m[m
[32m+[m[32m      align-items: center;[m[41m[m
[32m+[m[32m      justify-content: center;[m[41m[m
[32m+[m[32m      background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 60%);[m[41m[m
[32m+[m[32m    }[m[41m[m
[32m+[m[32m    .play-icon {[m[41m[m
[32m+[m[32m      width: 88rpx;[m[41m[m
[32m+[m[32m      height: 88rpx;[m[41m[m
[32m+[m[32m      line-height: 88rpx;[m[41m[m
[32m+[m[32m      text-align: center;[m[41m[m
[32m+[m[32m      font-size: 40rpx;[m[41m[m
[32m+[m[32m      color: #fff;[m[41m[m
[32m+[m[32m      background: rgba(0,0,0,0.4);[m[41m[m
[32m+[m[32m      border-radius: 44rpx;[m[41m[m
[32m+[m[32m      box-shadow: 0 6rpx 18rpx rgba(0,0,0,0.18);[m[41m[m
     }[m
     &__body {[m
       display: flex;[m
[36m@@ -97,9 +123,18 @@[m
       -webkit-box-orient: vertical;[m
       overflow: hidden;[m
     }[m
[32m+[m[32m    &__meta {[m[41m[m
[32m+[m[32m      display: flex;[m[41m[m
[32m+[m[32m      gap: 12rpx;[m[41m[m
[32m+[m[32m      align-items: center;[m[41m[m
[32m+[m[32m    }[m[41m[m
     &__desc {[m
       font-size: 22rpx;[m
       color: @text-patch1-color;[m
[32m+[m[32m      flex: 1;[m[41m[m
[32m+[m[32m      white-space: nowrap;[m[41m[m
[32m+[m[32m      text-overflow: ellipsis;[m[41m[m
[32m+[m[32m      overflow: hidden;[m[41m[m
     }[m
     &__meta {[m
       display: flex;[m
[1mdiff --git a/uni-vite/src/pages/video/index.vue b/uni-vite/src/pages/video/index.vue[m
[1mindex cfec2e2..c1feaaa 100644[m
[1m--- a/uni-vite/src/pages/video/index.vue[m
[1m+++ b/uni-vite/src/pages/video/index.vue[m
[36m@@ -28,10 +28,18 @@[m
           class="video-playlist-card"[m
           @click="onClickVideo(item)"[m
         >[m
[31m-          <image class="video-playlist-card__cover" :src="item.cover" mode="aspectFill" />[m
[32m+[m[32m          <view class="video-playlist-card__thumb">[m[41m[m
[32m+[m[32m            <image class="video-playlist-card__cover" :src="item.cover" mode="aspectFill" />[m[41m[m
[32m+[m[32m            <view class="video-playlist-card__overlay">[m[41m[m
[32m+[m[32m              <view class="play-icon">▶</view>[m[41m[m
[32m+[m[32m            </view>[m[41m[m
[32m+[m[32m          </view>[m[41m[m
[32m+[m[41m[m
           <view class="video-playlist-card__body">[m
             <text class="video-playlist-card__title">{{ item.title }}</text>[m
[31m-            <text class="video-playlist-card__desc">{{ item.desc }}</text>[m
[32m+[m[32m            <view class="video-playlist-card__meta">[m[41m[m
[32m+[m[32m              <text class="video-playlist-card__desc">{{ item.desc }}</text>[m[41m[m
[32m+[m[32m            </view>[m[41m[m
           </view>[m
         </view>[m
       </view>[m
