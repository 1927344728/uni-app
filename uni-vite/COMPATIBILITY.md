# uni-vite 三端兼容性说明

本项目一套代码需同时运行在 **H5**、**安卓 App（APP-PLUS）**、**微信小程序（MP-WEIXIN）** 三端。
本文记录各端已知的兼容性差异、踩过的坑及对应解法，改动前请先查阅。

平台差异一律用条件编译隔离，不要用运行时嗅探代替：

```js
// #ifdef H5
window.speechSynthesis.speak(utterance)
// #endif
// #ifdef APP-PLUS
plus.runtime.openURL(url)
// #endif
// #ifdef MP-WEIXIN
wx.setEnableDebug({ enableDebug: true })
// #endif
```

---

## 一、微信小程序（MP-WEIXIN）

> 本项目小程序主体为**个人**，能力受限明显（无 web-view、无法使用需企业主体的插件），下列多条限制由此而来。

### 1. 运行环境：没有 DOM / BOM

小程序逻辑层是纯 JS 沙箱，以下全局对象**均不存在**，直接使用会报 undefined：

`window`、`document`、`localStorage`、`speechSynthesis`、`Blob`、`FileReader`、`atob` / `btoa`、`XMLHttpRequest`

一律改走 `uni.*` 等价 API（`uni.setStorageSync`、`uni.request`、`uni.getWindowInfo` 等）。

注意 `uni.getSystemInfo` / `uni.getSystemInfoSync` 在小程序端已被微信标记废弃，控制台会打印 deprecated 警告。按需改用拆分后的接口：窗口尺寸用 `uni.getWindowInfo()`，系统/机型用 `uni.getDeviceInfo()`，宿主 App 信息用 `uni.getAppBaseInfo()`。

### 2. 调试面板：用 `wx.setEnableDebug` 代替 vconsole

vconsole 依赖 DOM，在小程序里无法运行。改用微信自带的 vConsole 面板，体验版和正式版都能打开。

```13:17:src/main.js
// #ifdef MP-WEIXIN
// 微信自带 vConsole 面板：体验版/正式版也能打开，便于自测
try {
  wx.setEnableDebug({ enableDebug: true })
} catch (e) {}
```

### 3. 字体图标必须本地化

小程序**不支持远程 URL 的 `@font-face`**，用 CDN 地址会导致图标全部不显示。字体文件已下载到 `src/static/font/iconfont.ttf`，用绝对路径引用。

```4:8:src/common/css/common.less
@font-face {
  font-family: 'iconfont';
  /* 小程序优先本地字体，避免远程 @font-face 不显示 */
  src: url('/static/font/iconfont.ttf') format('truetype');
}
```

### 4. 不支持动态 `import()`

模块一律静态引入，动态导入在小程序端会直接报错。TTS 原本用 `await import('./XfTTS.js')` 按需加载，已改为静态：

```1:3:src/common/tts/XfTTSService.js
import { TTSBaseService } from './base.js'
import XfTTS from './XfTTS.js'
```

### 5. 文本转语音：走讯飞，不走系统 TTS

小程序**没有 `window.speechSynthesis` 的等价 API**。官方的「微信同声传译」插件需要企业主体，个人主体用不了。因此小程序端统一走讯飞 TTS，音频用 `InnerAudioContext` 播放。

三端分发逻辑在 `src/common/tts/index.js`：H5 用 `H5TTSService`（`speechSynthesis`），App 用 `AppTTSService`（原生能力），小程序用 `XfTTSService`（讯飞）。

```23:27:src/common/tts/index.js
// #ifdef MP
this.ttsService = new XfTTSService(config)
console.log('TTSService', 'XfTTSService')
// #endif
```

### 6. 后台音频：必须用 `getBackgroundAudioManager`

`InnerAudioContext` 在息屏或切到其他应用时会被暂停。音乐播放器在小程序端改用后台音频管理器，并在 manifest 里声明后台模式。

```574:578:src/components/music-player/MusicPlayer.vue
// #ifdef MP-WEIXIN
// 后台音频：息屏/切应用后继续播放（需在微信公众平台开通「背景音频」）
this.createBackgroundAudio();
return;
// #endif
```

```70:70:src/manifest.json
"requiredBackgroundModes" : [ "audio" ]
```

注意两点：后台音频管理器**没有 `destroy()`**，销毁时要调 `stop()`，代码里用 `__isBgAudio` 标记区分；设置 `bg.src` 会**自动开始播放**，无需再调 `play()`。

### 7. 音频解锁逻辑仅限 H5

`unlockAudio` / `adoptUnlockedAudio` 是为绕过浏览器自动播放策略而写的，只有 H5 需要。在其他端会凭空创建多余的 `InnerAudioContext`，导致**两首歌同时播放**。已加条件编译提前返回：

```78:82:src/common/js/audioUnlock.js
export function unlockAudio (url) {
  // 仅 H5 需要在手势内解锁自动播放；其它端会额外起一路音频，造成同时播放
  // #ifndef H5
  return
  // #endif
```

### 8. 无法使用 web-view，降级为复制链接

个人主体小程序不支持 `<web-view>`。所有外链改为复制到剪贴板并提示用户在浏览器打开。

```174:179:src/common/js/common.js
// #ifdef MP
// 个人主体小程序无法使用 web-view，复制链接引导浏览器打开
openExternalUrlOnMp(item.url)
return
// #endif
```

`src/pages/webview/index.vue` 也做了同样的分端处理：小程序渲染降级提示页 + 复制按钮，其他端保留 `<web-view>`。

### 9. 自定义组件会多出一层节点，flex 会失效

**这是最容易误判的一条。** H5 上 Vue 组件不产生真实 DOM 节点，组件根节点直接就是父容器的子元素；小程序的自定义组件则必然生成一个真实节点，凭空多一层：

```
.search_bar_module      ← display: flex（flex 容器）
  <uni-data-picker>     ← 自定义组件节点，真正的 flex 项
    .uni-data-tree      ← 组件内部根节点，父级不是 flex 容器
```

所以给 `.uni-data-tree` 写 `flex: 1` 在小程序上完全无效。**凡是依赖父子关系的属性（flex、`:last-child` 等），都必须挂在组件标签自己的 class 上**：

```vue
<uni-data-picker class="type_picker" ... />
```

```61:69:src/components/search_bar/index.vue
  & .type_picker {
    flex: 1 1 0;
    max-width: 42%;
    min-width: 0;
  }
```

同理，`margin-right` + `:last-child` 归零的写法也会失效——组件内部根节点永远是独生子，`:last-child` 对所有项都成立。

另外注意 `flex-basis`：`flex: 0 1 auto` 的基准宽度取内容宽度，下拉框会随选中文案伸缩；要稳定的比例布局须用 `flex: 1 1 0`，并配 `min-width: 0` 抵消 flex 项的自动最小尺寸。

### 10. 样式隔离：颜色字号优先走 props

uni-app 给所有组件设了 `addGlobalClass: true`，所以**页面的类选择器样式能穿进组件内部**，`::v-deep` 编译出的普通类选择器是生效的。但涉及组件内部结构或需要覆盖内联样式时仍不可靠，颜色、字号这类建议直接通过 props 传：

```14:19:src/components/footer_bar/index.vue
<uni-icons
  :class="[item.key]"
  :type="`${item.icon}${item.key === currentKey ? '-filled' : ''}`"
  :size="item.key === 'study' ? 24 : 20"
  :color="item.key === currentKey ? activeColor : normalColor"
/>
```

### 11. 慎用 `uni-swiper-dot`

该组件把默认的 `backgroundColor`（`rgba(0, 0, 0, .3)`）当作 `wx:key` 使用，多个指示点会产生重复 key，触发渲染层报错：

```
[渲染层错误] Expect FLOW_MINIPULATE_CHILD but get another
[pages/index/index] Do not set same key "rgba(0, 0, 0, .3)" in wx:key.
[渲染层网络层错误] Failed to load image .../uni-swiper-dot/e0_0
```

首页已改用原生 `swiper` 的 `indicator-dots`：

```10:20:src/pages/index/index.vue
<swiper
  class="swiper_box"
  :current="currentBanner"
  :indicator-dots="bannerList.length > 1"
  indicator-color="rgba(0, 0, 0, .3)"
  indicator-active-color="#333333"
  :autoplay="bannerList.length > 1"
  :interval="4000"
  :circular="bannerList.length > 1"
  @change="onBannerChange"
>
```

### 12. 触摸事件会吞掉点击

在元素上同时写 `@touchstart.stop` 和 `@touchend.stop`，小程序会因事件链被打断而无法触发点击。音乐/视频页的类型 tab 曾因此完全点不动。改为 `@tap.stop`，只在容器上保留 `@touchmove.stop` 防止滚动冲突：

```25:34:src/pages/music/index.vue
<view class="tabs" :class="[isFixedNavBar ? 'fixed' : '']" @touchmove.stop>
  ...
  @tap.stop="onClickTab(m)"
```

### 13. swiper 节点复用导致视频错位

原本的「三页跑马灯」写法（prev / current / next 循环复用）在小程序上会出现**播放的视频和显示的不是同一个**，且滑到第三个后无法继续下滑。已重写为线性播放列表：用递增的 `currentIndex` 索引 `playList`，每项带稳定 `uid` 作 key，只对邻近页加载封面以控制内存。

```123:127:src/components/video-player/VideoPlayer.vue
playList: [],
currentIndex: 0,
uidSeed: 0,
isFetchingNext: false,
```

### 14. 内嵌视频弹窗不稳，App/小程序改跳全屏页

阅读详情里的视频，H5 仍用弹窗；App 和小程序改为跳转到独立的全屏播放页，视频列表通过 storage 传递：

```257:262:src/components/article_detail/index.vue
// #ifdef APP-PLUS || MP
uni.setStorageSync('tempVideoCache', videos)
uni.navigateTo({
  url: `/pages/video/play?mode=menu&id=${video.id}&key=tempVideoCache`
})
// #endif
```

### 15. 域名白名单

所有 request / socket / downloadFile / uploadFile 的域名都必须在小程序后台配置。真机的体验版和正式版**不能跳过校验**，只有开发者工具能勾选「不校验合法域名」。新接了第三方服务（如讯飞）记得同步加白名单。

---

## 二、H5

### 1. 只有 H5 有 DOM / BOM，用前必须条件编译

`window`、`document`、`speechSynthesis` 等只在 H5 存在。目前项目内所有此类调用都已包在 `#ifdef H5` 内（`src/common/js/common.js:162`、`src/common/tts/index.js:16`、`src/components/article_detail/index.vue:164` 与 `:176`），新增代码请保持同样约束。

### 2. 自动播放策略：音频需在用户手势内解锁

浏览器禁止无手势的音频自动播放。`unlockAudio` 的作用是在用户点击的同步上下文里先 `play()` 一个 Audio 实例，随后由 `adoptUnlockedAudio` 接管复用。

这套机制**仅 H5 需要**，其他端会额外创建一路音频导致两首歌同时播放，因此加了 `#ifndef H5` 提前返回（见小程序章节第 7 条）。App 端原生没有自动播放限制，退化为 `uni.createInnerAudioContext()` 是正常路径。

### 3. `::v-deep` 与 `!important` 只在 H5 可靠

穿透组件内部样式的写法在 H5 上有效，在小程序上受渲染层结构限制（详见小程序章节第 9、10 条）。需要三端一致的样式，优先通过 props 传递。

### 4. 全局 reset 已大幅精简，注意浏览器默认样式回流

`src/common/css/reset.less` 现在只针对 uni-app 组件标签（`page`、`view`、`text`、`button`、`image` 等）做盒模型重置，原先那份覆盖全部 HTML 标签的 reset 已被移除。**H5 上以下默认样式会回来**：

| 失去的重置 | H5 上的表现 |
|---|---|
| `*, *::before, *::after { box-sizing: border-box }` | 白名单外的元素回到 `content-box` |
| `ol, ul { list-style: none }` | 列表恢复项目符号与缩进 |
| `h1`~`h6`、`p`、`blockquote` 的 margin / font-size 重置 | 恢复浏览器默认字号与外边距 |
| `:focus { outline: none }` | 输入框出现聚焦轮廓 |
| `:link, :visited { text-decoration: none }` | 链接恢复下划线 |
| `a { -webkit-tap-highlight-color: transparent }` | 移动端点击出现高亮闪烁 |
| `table { border-collapse: collapse }` | 表格恢复边框间距 |
| `textarea { resize: none }` | 出现右下角拖拽手柄 |
| `body { line-height: 1.5 }` | 全局行高改变（`line-height` 是继承属性） |

影响最大的是**富文本、文章详情等会出现原生 HTML 标签的位置**。改动全局样式前请先在 H5 上回归这些页面。

同时 `common.less` 里原有的 `::v-deep .uni-swiper-wrapper ... img { max-height: none !important }` 也已移除，若 H5 轮播图出现被限高的情况，从这里查。

### 5. 图标字体目前靠 base64 内联，注意 4KB 阈值

`common.less` 里写的是绝对路径 `src: url('/static/font/iconfont.ttf')`，但**构建时会被内联成 base64**，编译产物里是 `src: url('data:font/ttf;base64,...')`。原因是 `iconfont.ttf` 只有 3776 字节，低于 Vite 默认的 `assetsInlineLimit`（4096 字节）。

所以当前三端都不存在路径解析问题。**但这个平衡很脆弱**：一旦往字体里加图标使体积超过 4KB，Vite 就会改为输出独立文件并保留 `/static/...` 绝对路径，届时会同时出问题——H5 部署在子路径下会 404，App 端页面运行在 `file://` 协议下，`/static/...` 会被解析到设备文件系统根目录而必然失败。

真要扩充图标时，请改成让构建工具重写的写法（`~@/static/font/iconfont.ttf`），或显式调大 `assetsInlineLimit`。当前 `vite.config.js` 未设 `base`，`manifest.json` 也没有 h5 段的 `router.base`，默认根路径。

### 6. `height: 100%` 用在 scroll-view 根节点上，H5 有塌陷风险

`pages/book/index.vue`、`pages/video/index.vue`、`pages/music/index.vue` 三个页面的根节点都是 `<scroll-view>`，对应 less 里用的是 `height: 100%`：

```5:7:src/pages/book/index.less
.book_page {
  height: 100%;
  box-sizing: border-box;
```

`height: 100%` 要求祖先链每一级都有确定高度。小程序的 `page` 天然满屏所以没问题；H5 的 DOM 链是 `uni-page > uni-page-wrapper > uni-page-body`，而 `reset.less` 里的 `page` 规则（H5 下编译为 `uni-page-body`）**并未设置 `height: 100%`**。父级高度为 auto 时该声明会退化成 `auto`，`scroll-view` 被内容撑开，表现为内部不滚动、`@scrolltolower` 不触发、上拉加载失效。

改动 tab 页高度时请在 H5 上实测滚动与加载更多是否正常。

### 7. 底部安全区：页面预留与底栏实际高度要对齐

底栏自身已经处理了安全区：

```10:12:src/components/footer_bar/index.less
  padding: 8rpx 16rpx;
  padding-bottom: calc(8rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(8rpx + env(safe-area-inset-bottom));
```

算下来底栏总高约 `8 + 92 + 8 = 108rpx` 再加安全区（iPhone 上约 68rpx），合计约 176rpx。而 study / life 页面的页面级预留只有 `padding-bottom: 144rpx`，**不含安全区**。

好在这两页的列表区另有一套计算，把两者都减掉了，所以列表不会被压：

```47:53:src/pages/study/index.less
.study_page.with_footer_bar {
  padding-bottom: 144rpx;
  box-sizing: border-box;
  & .with_tab_module {
    height: calc(100vh - 144rpx - constant(safe-area-inset-bottom));
    height: calc(100vh - 144rpx - env(safe-area-inset-bottom));
```

但**不在 `.with_tab_module` 内、仅依赖页面 padding 的内容，在有安全区的机型上会差约 32rpx**。首页的写法是对的，可作参照（`src/pages/index/index.less:11` 用了 `calc(160rpx + env(safe-area-inset-bottom))`）。新增底部内容时请在刘海屏机型实测。

### 8. H5 保留了内嵌能力

`<web-view>` 在 H5 正常可用（`src/pages/webview/index.vue` 的 `#ifndef MP` 分支）。阅读详情里的视频，H5 仍走内嵌弹窗，只有 App 和小程序改跳全屏页（见小程序章节第 14 条）。

---

## 三、安卓 App（APP-PLUS）

### 1. `plus.*` 仅 App 可用

所有 `plus.` 开头的调用必须包在 `#ifdef APP-PLUS` 内，例如用系统浏览器打开外链：

```js
// #ifdef APP-PLUS
plus.runtime.openURL(url)
// #endif
```

### 2. App 端同样不能用动态 `import()`

这条容易被忽略，原因和小程序不同但结论一致。App 端的 AppService 被 uni-app 内部写死为 **iife** 输出格式，而 Rollup 一旦触发 code-splitting（动态 `import()`、某些插件的分包逻辑）就会报错：

```
Invalid value "iife" for option "output.format" ... not supported for code-splitting builds.
```

项目通过 `vite.config.js` 里的 `fixIifeCodeSplittingForApp` 插件规避：保留 iife（否则基座按 script 加载时会报 `import ... outside a module` 白屏），同时强制 `inlineDynamicImports: true` 并清空 `manualChunks`，让构建退化为单 chunk。插件用了 `enforce: 'post'`，因为 uni 的插件会在更后面覆盖这些选项。

**结论：三端都请使用静态 import。**

### 3. TTS 走原生实现

App 端使用 `AppTTSService`（`src/common/tts/index.js` 的 `#ifdef APP-PLUS` 分支），不走 H5 的 `speechSynthesis`，也不走小程序的讯飞方案。

### 4. 音频与后台播放

App 端使用 `uni.createInnerAudioContext()`。小程序专用的 `getBackgroundAudioManager` 分支由 `#ifdef MP-WEIXIN` 隔离，不影响 App；`manifest.json` 里新增的 `requiredBackgroundModes` 也只在 mp-weixin 段内，未波及 app-plus 配置。

### 5. `pages.json` 里有 App 专属配置，删改前先确认归属

`globalStyle` 中的 `transparentTitle: "auto"` 是 **app-plus 原生标题栏（titleNView）专属属性**，作用是让标题栏随滚动从透明渐变为不透明。它曾在 `5598e39` 中被误删，导致 App 端导航栏变成始终不透明的白底、首页 banner 的沉浸式效果消失，现已恢复。

改 `pages.json` 时请留意：`globalStyle` 里混放着三端通用属性和平台专属属性，删任何一条之前先确认它归谁管。平台专属的配置也可以用嵌套写法明确归属，文件里已有先例（`"h5": { "titleNView": false }`）。

同一次改动还把 `navigationBarTextStyle` 从 `#666` 改成了 `black`。这是因为小程序只接受 `black` / `white` 两个值，而 H5 与 App 支持任意颜色——**为迁就小程序把三端的标题色一起改深了**。类似的「小程序只认枚举值」的配置项，改之前先确认是否会连累另外两端。

### 6. nvue 组件走独立编译管线

`src/ncomponents/video_swiper/` 下是 `.nvue` 文件，样式与编译规则和 vue 页面不同（例如不支持部分 CSS 选择器）。改动时不要照搬 vue 页面的写法，`<style>` 也不要套用第四章的 `src` 引入结论。

### 7. 离线打包

App 的最终产物由仓库根目录的 `uni-android/` 壳工程完成：HBuilderX 生成本地打包资源后，由 Android Studio 打成 apk（uni-app 离线 SDK 4.75）。前端改动若涉及原生能力或权限，需同步检查该工程。

---

## 四、工程与构建

### 1. 外部 less 要用 `src` 引入，不要用 `@import`

`<style lang="less">` 里写 `@import './index.less'` 时，**外部 less 文件不会被登记为构建依赖**。改动它不会让缓存失效，dev server 即使被其他文件触发重编，也会复用旧的 CSS，表现为「样式改了但完全没生效」，且没有任何报错。

改用 `src` 属性，Vite 会把它当成真正的模块依赖：

```vue
<style lang="less" src="./index.less"></style>
```

带 `scoped` 时写成 `<style lang="less" src="./index.less" scoped></style>`。

目前除 `src/ncomponents/video_swiper/index.nvue`（nvue 走另一套编译管线）外，其余页面与组件均已转换。

**排查手法**：怀疑样式没生效时，先去 `dist/dev/mp-weixin/` 下找对应的 `.wxss`，确认规则是否真的编译进去了，再怀疑选择器写法。必要时停掉 dev server，删掉 `dist/dev/mp-weixin` 重新编译。

### 2. `src/utils/` 已迁移到 `src/common/js/`，旧路径是转发桩

`src/utils/` 下除 `color.js` 外均已改为一行转发：

```js
export * from '@/common/js/common.js'
```

目前仍有三处 nvue 文件引用旧路径（`ncomponents/video_swiper/index.nvue`、`swiper_item.nvue`），靠转发桩维持可用。**新代码请一律从 `@/common/js/` 引入**，旧引用待后续清理。

### 3. 请求参数会被全局改写，注意 POST body

`src/api/request.js` 里的 `normalizeRequestParams` **没有平台限定，三端所有接口都会经过它**：

```86:88:src/api/request.js
    const { baseURL, url, method, data, params, timeout, showLoading, login } = options
    const rawParams = data || params
    const requestData = normalizeRequestParams(rawParams)
```

它做三件事：数组 `[1,2,3]` 被拍平成字符串 `"1,2,3"`；`"[1,2]"` 形式的字符串会被 JSON 解析后同样拍平；值为 `null`、`undefined`、`'null'`、`'undefined'` 或空数组的键**会被整个删掉**。初衷是迁就 Spring 的 `@RequestParam List<Long>`（它认 `ids=1,2,3`，不认 `ids=[1,2,3]`）。

由于 `data` 和 `params` 共用同一个变量，这套改写原本会**同时作用在 POST 的 JSON body 上**——后端用 `@RequestBody` 接收、字段是 `List<...>` 的接口会收到逗号字符串而反序列化失败。现已按请求方法做了隔离，只有 GET 才改写：

```88:91:src/api/request.js
  const httpMethod = (method || 'GET').toLocaleUpperCase()
  // GET 的 data 会被序列化成查询串，需要迁就 Spring 的参数格式；
  // POST/PUT 的 data 是 JSON body，拍平数组会让 @RequestBody 的 List 字段反序列化失败
  const requestData = httpMethod === 'GET' ? normalizeRequestParams(rawParams) : rawParams
```

仍需留意的是：在 GET 请求里，「键被删掉」和「键传 null」对后端可能是不同语义（例如「清空某字段」）。新增接口时先确认 `uni-spring-boot` 对应 controller 的接收方式。

### 4. 模块目录约定

- `src/common/js/` — 通用工具（common、platform、variables、cookie、dictation、audioUnlock）
- `src/common/tts/` — 语音合成，按端分实现（index 负责分发，base 为基类）
- `src/common/css/` — 全局样式（reset、common、color、variable、apply）
