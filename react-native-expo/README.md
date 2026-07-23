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
npm run start        # Web / 默认 HTTPS
npm run start:http   # 手机 Expo Go（HTTP）
```

| 命令 | 协议 | 用途 |
| --- | --- | --- |
| `npm run start` | HTTPS | 浏览器 Web 开发（`https://dev.izhao.com.cn:9000`，需 hosts） |
| `npm run start:http` | HTTP | 手机 Expo Go 真机调试 |
| `npm run web` | HTTPS | 打开 Web 开发服务 |
| `npm run android` | HTTPS | 连接 Android 设备 / 模拟器 |
| `npm run ios` | HTTPS | 连接 iOS 模拟器（macOS） |

HTTPS 说明：

- `metro.config.js` 在存在 `certs/` 证书时默认启用 TLS；`start:http` 通过 `EXPO_USE_HTTP=1` 关闭 TLS。
- 证书由 `mkcert` 生成，位于 `certs/`，不提交到 Git。

其他命令：

```bash
npm run lint
```

## Expo Go 联调

本项目使用 **Expo SDK 57**，手机端需安装 **对应版本的 Expo Go**（Play Store / App Store 升级到支持 SDK 57 的版本）。若提示 `Project is incompatible with this version of Expo Go`，说明手机上的 Expo Go 过旧，升级后即可。

### 启动方式

Expo Go 通过 `exp://` 连接本地 Metro，**只支持 HTTP**，与业务 API 的 HTTPS（`https://app.izhao.com.cn:9443`）无关——接口仍可正常走 HTTPS。

```bash
npm run start:http
```

启动后日志应出现 `Waiting on http://localhost:9000`（注意是 **http**）。在 Expo Go 中选择「输入地址」，填入局域网地址，例如：

```text
exp://192.168.31.157:9000
```

将 `192.168.31.157` 换成你电脑在 WiFi 下的真实 IP（在 Windows 中查看 WLAN 网卡地址）。不要使用代理/VPN 虚拟网卡地址（如 `198.18.0.1`）。

### 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `incompatible with this version of Expo Go` | 手机 Expo Go 版本低于 SDK 57 | 升级 Expo Go 到支持 SDK 57 的版本 |
| 扫码 / 输入地址无法连接 | 使用了 `npm run start`（HTTPS Metro） | 改用 `npm run start:http` |
| 地址用了 `198.18.x.x` 连不上 | 代理软件（如 Clash）虚拟网卡 IP | 改用 WLAN 的 `192.168.x.x` |
| 终端没有二维码 | Git Bash 等非 TTY 终端 | 用 PowerShell / Windows Terminal，或手动输入 `exp://` 地址 |
| 手机与电脑已同 WiFi 仍连不上 | Windows 防火墙拦截入站 | 放行 TCP 9000，或临时关闭防火墙测试 |
| `npm run start` 能开 Web，Expo Go 不行 | HTTPS 与 `exp://` 不兼容 | 属预期行为；Web 用 `start`，手机用 `start:http` |

### Android USB 安装 Expo Go

若商店版本暂时不支持 SDK 57，可用 USB 调试，由 Expo CLI 安装匹配版本的 APK：

```bash
npm run start:http
# 另开终端，或启动后按 a
set EXPO_USE_HTTP=1&& npx expo start --port 9000 --android
```

### iOS 说明

若 App Store 的 Expo Go 尚未支持 SDK 57，需使用 [eas go](https://docs.expo.dev/develop/tools/#eas-go) 或 development build 进行真机调试。

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
