# 一兆窗含 · Expo

`react-native-expo` 是将 `uni-vite`（uni-app + Vue）迁移至 Expo React Native 的跨平台项目，支持 Android、iOS 与 Web。

## 技术栈

- Expo SDK 57、React 19、React Native 0.86、Expo Router
- TypeScript 与 React Native `StyleSheet`
- `@react-native-vector-icons/ionicons`：底部导航等 UI 图标
- `expo-audio`、`expo-video`、`expo-speech`、`expo-clipboard`
- `react-native-webview`、AsyncStorage、`pinyin-pro`

## 目录约定

```text
src/
├── app/          # Expo Router 路由出口，仅负责导出页面
├── pages/        # 页面实现；tsx 与同名 *.styles.ts 并列
├── components/   # 共享组件（包括 AppFooter）
└── lib/          # API 客户端
```

Expo Router 会将 `src/app` 内所有 TypeScript 文件识别为路由。因此页面实现和样式放在 `src/pages`，例如：

```text
src/app/article/detail.tsx             # 路由出口
src/pages/article/detail.tsx           # 页面实现
src/pages/article/detail.styles.ts     # 页面样式
```

## 启动

```bash
npm install
npm run start
```

默认开发地址为 `https://dev.izhao.com.cn:9000`：

- Expo/Metro 在 `http://localhost:9011` 启动。
- `local-ssl-proxy` 在 9000 端口提供 HTTPS 转发。
- 本机证书位于 `certs/`，由 `mkcert` 生成且不提交到 Git。

其他命令：

```bash
npm run start:http  # 仅 HTTP Metro 服务
npm run web         # HTTPS Web 开发服务
npm run android
npm run ios
npm run lint
```

## 页面与路由

共 23 个页面；下表逐页对应原 uni-vite 路径：

| Expo 路由 | 页面 | 原 uni-vite 页面 |
| --- | --- | --- |
| `/` | 首页 | `pages/index/index` |
| `/task` | 任务列表 | `pages/task/index` |
| `/study` | 学习主页 | `pages/study/index` |
| `/study/dictation` | 听写小助手 | `pages/study/dictation/index` |
| `/study/gen-dictation` | 听写链接生成器 | `pages/study/gen-dictation/index` |
| `/study/rhyme` | 前后鼻韵母练习 | `pages/study/rhyme/index` |
| `/life` | 生活主页 | `pages/life/index` |
| `/me` | 个人中心 | `pages/me/index` |
| `/me/about` | 关于 | `pages/me/about` |
| `/login` | 登录 | `pages/login/index` |
| `/login/password` | 修改密码 | `pages/login/password` |
| `/task/detail?id=:id` | 任务详情 | `pages/task/detail` |
| `/recommend/hanyupinyin` | 汉语拼音发音学习 | `pages/recommend/hanyupinyin` |
| `/webview?url=:url` | WebView | `pages/webview/index` |
| `/book` | 书籍列表 | `pages/book/index` |
| `/book/detail?id=:id` | 书籍详情 | `pages/book/detail` |
| `/music` | 音乐列表 | `pages/music/index` |
| `/music/play?id=:id` | 音乐播放器 | `pages/music/play` |
| `/video` | 视频列表 | `pages/video/index` |
| `/video/play?id=:id` | 视频播放器 | `pages/video/play` |
| `/article` | 文章列表 | `pages/article/index` |
| `/article/detail?id=:id` | 文章详情 | `pages/article/detail` |
| `/debug` | 调试页 | `pages/debug/index` |

## API 与登录态

默认 API 地址为 `https://app.izhao.com.cn:9443`，可通过 `EXPO_PUBLIC_API_URL` 覆盖。请求使用 `credentials: 'include'`，Web 端需要服务端正确配置跨域 Cookie：

- `Access-Control-Allow-Credentials: true`
- 明确的 `Access-Control-Allow-Origin`，不能为 `*`
- Cookie 使用 `SameSite=None; Secure`
