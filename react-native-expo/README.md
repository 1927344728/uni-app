# 一兆窗含 · Expo

`react-native-expo` 是将 `uni-vite`（uni-app + Vue）迁移至 Expo React Native 的跨平台项目，支持 Android、iOS 与 Web。

## 技术栈

- Expo SDK 57、React 19、React Native 0.86、Expo Router
- TypeScript 与 React Native `StyleSheet`
- `@react-native-vector-icons/ionicons`：底部导航等 UI 图标（[图标列表](https://oblador.github.io/react-native-vector-icons/)）
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
npm run start      # Metro 开发服务（:9000）
npm run web        # Web
npm run android    # 构建调试包并安装到 Android 设备 / 模拟器
```

| 命令 | 用途 |
| --- | --- |
| `npm run start` | 启动 Metro（改 JS 后热更新；手机需已安装调试包） |
| `npm run web` | 浏览器 Web 开发 |
| `npm run android` | 原生构建 + 安装 APK + 启动 Metro（`expo run:android`） |
| `npm run ios` | 原生构建并安装到 iOS 模拟器（需 macOS） |
| `npm run lint` | 代码检查 |

端口统一为 **9000**（与 `android/gradle.properties` 中 `reactNativeDevServerPort` 一致）。

Android 说明：

- 首次或原生依赖变更：`npm run android`
- 日常只改 JS：保持 `npm run android` 的 Metro，或另开 `npm start`，再打开手机 App
- 手机与电脑需同一局域网；USB 调试时可先执行：`adb reverse tcp:9000 tcp:9000`

## Expo Go 联调

本项目使用 **Expo SDK 57**，手机端需安装 **对应版本的 Expo Go**（Play Store / App Store 升级到支持 SDK 57 的版本）。若提示 `Project is incompatible with this version of Expo Go`，说明手机上的 Expo Go 过旧，升级后即可。

### 启动方式

Expo Go 通过 `exp://` 连接本地 Metro（HTTP）。业务 API 的 HTTPS（`https://app.izhao.com.cn:9443`）不受影响。

```bash
npm start
```

启动后日志应出现 `Waiting on http://localhost:9000`。在 Expo Go 中选择「输入地址」，填入局域网地址，例如：

```text
exp://192.168.31.157:9000
```

将 `192.168.31.157` 换成你电脑在 WiFi 下的真实 IP（在 Windows 中查看 **WLAN** 网卡地址）。

**代理虚拟网卡：** Clash / Clash Verge 等开启「虚拟网卡 / TUN」模式后，本机会多出 `198.18.x.x`、`192.168.137.x` 等虚拟网卡。Expo 可能把二维码生成到这些 IP 上（日志里类似 `Metro: exp://192.168.137.1:9000`），手机扫码后无法连通，Expo Go 报 **Something went wrong**。处理：关闭代理的虚拟网卡/TUN，或在 Expo Go 里手动输入 WLAN IP（如 `exp://192.168.31.157:9000`），也可用 `REACT_NATIVE_PACKAGER_HOSTNAME=你的WLAN_IP` 强制指定。

### 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `incompatible with this version of Expo Go` | 手机 Expo Go 版本低于 SDK 57 | 升级 Expo Go 到支持 SDK 57 的版本 |
| 扫码报 Something went wrong；Metro 为 `198.18.x.x` / `192.168.137.x` | 代理软件开启了虚拟网卡（TUN）模式，Expo 选错网卡 | 关闭 TUN / 虚拟网卡，或手动输入 WLAN IP；必要时设 `REACT_NATIVE_PACKAGER_HOSTNAME` |
| 地址用了 `198.18.x.x` 连不上 | 代理软件虚拟网卡 IP | 改用 WLAN 的 `192.168.x.x` |
| 终端没有二维码 | Git Bash 等非 TTY 终端 | 用 PowerShell / Windows Terminal，或手动输入 `exp://` 地址 |
| 手机与电脑已同 WiFi 仍连不上 | Windows 防火墙拦截入站 | 放行 TCP 9000，或临时关闭防火墙测试 |
| 调试包打开白屏 | 未启动 Metro，或手机连不上电脑 | 运行 `npm start` 或 `npm run android`；USB 可执行 `adb reverse tcp:9000 tcp:9000` |

### Android / iOS 原生构建

```bash
npm run android   # expo run:android --port 9000
npm run ios       # expo run:ios --port 9000（需 macOS）
```

首次执行会生成本地 `android/` / `ios/` 工程并编译安装。之后日常改 JS 可只开 `npm start`，再打开已安装的调试 App。

### Android USB 安装 Expo Go

若商店版本暂时不支持 SDK 57，可用 USB 调试，由 Expo CLI 安装匹配版本的 APK：

```bash
npm start
# 另开终端，或启动后按 a
npx expo start --port 9000 --android
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
