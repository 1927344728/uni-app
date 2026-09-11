# 「一兆窗含」管理后台需求稿

> 日期：2026-09-11  
> 范围：后台前端 `arco-admin`；服务端在 `uni-spring-boot` 增加 `/api/admin/**`。

开发前若有变更，先改本文再动代码。

---

## 1. 概述

管理后台供运营在浏览器中维护「一兆窗含」的内容与用户。改完后，H5 / App / 微信小程序读取同一份数据。

客户端现有查询接口保持只读；后台增删改走 `/api/admin/**`，不混在客户端接口上。

---

## 2. 架构

| 项 | 说明 |
|---|---|
| 后台前端 | 仓库根目录新建 `arco-admin/`：Vite + **React** + [Arco Design React](https://arco.design/react/docs/start) |
| 本地开发 | 端口 **9010**，origin `http://localhost:9010` |
| 生产地址 | nginx 静态托管，路径 **`/admin/`**（例如 `https://app.izhao.com.cn/admin/`） |
| 后台后端 | 不新开 Spring Boot 项目。在现有 `uni-spring-boot` 增加 `/api/admin/**` |
| 用户 | 与客户端共用 `user` 表，用 `role` 区分 |
| 密码 | 明文存储、明文校验，与现网一致，不做哈希或其他变换 |
| 素材上传 | 继续用现有 `POST /api/cos/upload`。请求方授权成功即可调用，不限管理员 |
| 文章类型 | `article.type` 继续用逗号拼接字符串（如 `"2,7"`） |
| 浏览器 | 只保证 Chrome 桌面版 |

CORS 增加 `http://localhost:9010`，以及生产环境后台所在 origin（`https://app.izhao.com.cn` 等已有项可复用）。

后台请求使用 `Authorization: Bearer <jwt>`。JWT 与客户端 token 分离（例如 `aud = admin`），同一账号在 App 与后台可同时登录，互不踢下线。不把后台会话写进 `user.token`。

响应格式沿用 `CommonResponse`（`code`、`success`、`message`、`data`）。分页沿用 Spring Data `Page`。

---

## 3. 角色

`user.role`：

| role | 名称 | 客户端 | 管理后台 |
|------|------|--------|----------|
| 1 | 超级管理员 | 可登录 | 可登录，全部页面与按钮 |
| 4 | 管理员 | 可登录 | 可登录，仅已授权的页面与按钮 |
| 2 | 家长 | 可登录 | 不可登录 |
| 3 | 学生 | 可登录 | 不可登录 |

客户端「我的」页角色文案与上表一致。

约束：

- 后台登录：`role` 为 `1` 或 `4`，否则失败。
- 仅超级管理员可把用户设为超级管理员或管理员，可改他人的页面/按钮权限。
- 管理员不可把用户提为超级管理员，不可进入权限管理。
- 库中至少保留一名未删除的超级管理员；不可删除或降权「当前登录的自己」。

---

## 4. 登录与鉴权

- 登录页；`POST /api/admin/login`（公开）。账号为手机号或姓名，密码明文比对，且 `role ∈ {1, 4}`。
- 不提供后台注册。新管理员由已有超级管理员在用户管理中指定角色。
- `POST /api/admin/logout`；`GET /api/admin/me` 返回当前用户、角色、页面与按钮权限。
- `/api/admin/**`（登录除外）校验后台 JWT，且 `role ∈ {1, 4}`。客户端 token 调用管理接口一律拒绝。
- 前端按权限隐藏菜单和按钮；后端按权限拦截，无权限返回 403。

---

## 5. 页面与按钮权限

超级管理员拥有全部权限，不可被取消。

管理员的权限由超级管理员配置，绑定到用户（每个管理员可以不同）。

权限分两类：

- **页面**：对应后台侧栏菜单 / 路由，无页面权限则不展示该菜单，直接访问路由则跳转无权限页。
- **按钮**：对应页面内操作（新建、编辑、删除、恢复、重置密码、改角色、上传等）。无按钮权限则不渲染该按钮，对应接口返回 403。

后台提供「权限管理」页（仅超级管理员）：

- 列出所有页面、每个页面下的按钮。
- 为指定管理员勾选其可访问的页面与可操作的按钮。
- 保存后立即生效（该管理员下次请求 / 刷新后按新权限）。

---

## 6. 内容平台（多端可见范围）

所有运营内容在库中增加字段 `platform`，表示该条内容在哪些端展示，**可多选**。

取值与 uni-app 平台标识对应（本项目实际发行三端）：

| 存储值 | `__UNI_PLATFORM__` | `uni.getSystemInfoSync().uniPlatform` |
|--------|--------------------|----------------------------------------|
| `h5` | `h5` | `web` |
| `app-plus` | `app-plus` | `app` |
| `mp-weixin` | `mp-weixin` | `mp-weixin` |

存储格式与文章 `type` 相同：逗号拼接，如 `"h5,app-plus"`。

**默认为 `null`，表示所有平台可用。** 未勾选任何端时存 `null`，不要写成空字符串。现有数据保持 `null`，三端继续可见。

适用表：`article`、`book`、`music`、`music_menu`、`video`、`video_menu`、`banner`、`task`、`category`、`word_library`，以及首页快捷入口表。

客户端拉列表/详情时带上当前平台。取值：

```js
const platform = __UNI_PLATFORM__ || uni.getSystemInfoSync().uniPlatform
```

若拿到的是 `web` / `app`，分别按上表映射为 `h5` / `app-plus` 再传给接口。服务端返回未删除且满足以下之一的数据：`platform` 为 `null`，或 `platform` 包含当前端。后台列表可按平台筛选（含「全部平台」即 `null`）；编辑时多选，全不选即 `null`。

---

## 7. 后台信息架构

```
登录
数据统计
内容
  ├ 文章
  ├ 书籍
  ├ 音乐 / 歌单
  ├ 视频 / 片单
  └ 任务
运营
  ├ Banner
  ├ 首页快捷入口
  ├ 分类
  └ 词库
系统
  ├ 用户
  └ 权限管理          （仅超级管理员）
```

各内容模块通用能力：分页、关键词搜索、分类/类型/平台筛选；列表展示封面、标题、平台、排序 `seq`、更新时间、删除状态；新建 / 编辑；软删（`is_deleted = 1`）与恢复；改 `seq` 后客户端立即按新顺序展示。

---

## 8. 功能

### 8.1 数据统计

简单统计接口调用次数，**按用户汇总**。

- 已登录请求计入对应用户；未登录计入「未登录」。
- 后台页：用户（姓名/手机号）、调用总次数；可展开查看该用户各接口路径的次数。
- 统计范围：现有 `/api/**` 与 `/api/admin/**`（登录接口也计入）。

### 8.2 用户

管理 `user` 表。

列表：手机号、姓名、昵称、别名、角色、创建时间、是否删除。支持按手机号/姓名搜索、按角色筛选。

能力：新建（手机号唯一，默认家长或学生）；编辑资料（姓名、性别、生日、别名、昵称、邮箱、角色）；重置密码（不需要原密码，明文写入）；软删 / 恢复。不可改他人 `token`，不可冒充客户端登录。

`uuid` 由服务端生成；`phone` 11 位且唯一。改密码仅通过用户管理的「重置密码」。

### 8.3 Banner

表 `banner`。客户端首页轮播：未删除且平台匹配（`platform` 为 `null` 或包含当前端），按 `seq` 倒序。

字段：标题、类型、图片、`jumpTo`、`url`、`seq`、`platform`。

### 8.4 首页快捷入口

原客户端首页金刚区（`FEATURE_ICON_ENUM`）改为库表维护，客户端改为接口读取。

字段：`key`、名称、图标、`jumpTo`、`url`、`seq`、`platform`、软删。

现有四条迁入数据库，平台按下表（`null` 表示三端都可用；音乐入口与现网一致，不对小程序开放）：

| key | 名称 | platform |
|-----|------|----------|
| task | 任务中心 | `null` |
| book | 我的书单 | `null` |
| audio | 音乐收藏 | `h5,app-plus` |
| video | 视频订阅 | `null` |

### 8.5 分类

表 `category`。客户端 `getCategoryEnum` 只返回未删除且平台匹配的项（`platform` 为 `null` 或包含当前端）。

扁平三级：`categoryId` / `categoryName`（1 文章、2 书籍、3 音乐、4 视频）、`typeId` / `typeName`、`subTypeId` / `subTypeName`（可空），外加 `platform`。

增删改、软删。删除仍被内容引用的分类时需提示。

### 8.6 文章

表 `article`。

筛选：关键词、`type`、`subType`、`platform`、是否删除。

字段：标题、作者、`note`、`type`（多选后写成逗号拼接字符串）、`subType`、`className`、`seq`、封面 `thumb`、`jumpTo` / `url`、`content`、`platform`。`uuid` 服务端生成。

`content` 为 JSON 块数组。表单按块编辑（增删排序、填字段），不做 Word 式排版。已有块类型：`title`、`subTitle`、`author`、`readText`（可含 `rate`、HTML）、`image`（URL + `description`）。库中其他块类型原样支持；未识别的块以 JSON 只读展示，保存时不得丢弃。

首页「推荐内容」仍按文章 `type` 含 `2` 拉取，后台通过改类型控制，不另做推荐位。

### 8.7 书籍

表 `book`。字段：标题、作者、`owner`、类型、`score`、`seq`、封面、`description`、`tags`、`summaries`、`highlights`（后三项 JSON 列表编辑）、`platform`。

### 8.8 音乐与歌单

表 `music`、`music_menu`。

歌曲：标题、歌手、类型、简介、`seq`、音频 `url`、封面、`lyric`、文件名、`platform`。

歌单：标题、简介、图标、`songIds`（从歌曲库勾选并排序）、`platform`。

### 8.9 视频与片单

表 `video`、`video_menu`。

视频：标题、类型、简介、发布者、`seq`、视频 `url`、封面、`objectFit`、`ratio`、文件名、`platform`。

片单：标题、简介、`videoIds`、`platform`。

### 8.10 任务

表 `task`。字段：标题、状态（1 未开始 / 2 进行中 / 3 已完成 / 4 已取消）、`publisher`、`targeter`、正文、进度、`finished`、`awards`、`attachments`、`works`、发布/开始/结束时间、`seq`、`platform`。

后台只做运营录入，不含学生端打卡回写。

### 8.11 词库

表 `word_library`。按 `gradeId` 编辑词表文本，含 `platform`。

### 8.12 素材上传

腾讯云 COS（现有 bucket `yizhao-1259410276`，上海）。

- 接口：现有 `POST /api/cos/upload`。授权成功即可，管理员与已登录客户端用户都能用。
- 按目录上传图片 / 音频 / 视频，返回公网 URL，写入内容字段。
- **单文件超过 50MB 不允许上传**，前后端都拦截，提示超限。
- 表单可预览图片，音视频提供播放控件。
- 软删内容不删除 COS 文件。

---

## 9. 接口

### 9.1 路径

| 前缀 | 使用者 |
|------|--------|
| `/api/**` 现有查询 | uni-vite / react-native-expo；列表/详情按 `platform` 过滤 |
| `POST /api/cos/upload` | 授权成功的用户（客户端与后台） |
| `POST /api/admin/login` | 公开 |
| `/api/admin/**` 其余 | arco-admin，需后台 JWT + 页面/按钮权限 |

后台不复用客户端列表接口做编辑（后台需包含软删数据与完整字段）。

### 9.2 资源

```
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me

GET                    /api/admin/stats/api-calls

GET/POST/PUT/DELETE    /api/admin/users
PUT                    /api/admin/users/{id}/password
PUT                    /api/admin/users/{id}/role
GET/PUT                /api/admin/users/{id}/permissions

GET/POST/PUT/DELETE    /api/admin/banners
GET/POST/PUT/DELETE    /api/admin/home-entries
GET/POST/PUT/DELETE    /api/admin/categories
GET/POST/PUT/DELETE    /api/admin/articles
GET/POST/PUT/DELETE    /api/admin/books
GET/POST/PUT/DELETE    /api/admin/musics
GET/POST/PUT/DELETE    /api/admin/music-menus
GET/POST/PUT/DELETE    /api/admin/videos
GET/POST/PUT/DELETE    /api/admin/video-menus
GET/POST/PUT/DELETE    /api/admin/tasks
GET/POST/PUT/DELETE    /api/admin/word-libraries
```

`DELETE` 为软删；恢复用 `PUT` 将 `is_deleted` 置回 `false`。

客户端新增首页快捷入口查询（如 `GET /api/common/getHomeEntryList`），按当前 `platform` 过滤。现有 `getBannerList`、`getCategoryEnum` 及各内容分页接口增加 `platform` 查询参数。

---

## 10. 部署与非功能

- 本地：`arco-admin` 监听 **9010**。
- 生产：nginx `location /admin/` 托管构建产物；接口仍走现有 Spring Boot（HTTPS 9443）。
- 软删，不物理删库记录。
- 并发后写覆盖先写。
- 后台只保证 **Chrome** 桌面版；不考虑其他浏览器兼容性，不做移动端适配。
- 后台写入的数据须能被现有客户端读出（文章 `content` JSON、分类 id、音乐/视频 ID 列表、`type` 逗号字符串）。客户端为适配 `platform` 与快捷入口接口，需同步小改查询参数与首页读取方式。

---

## 11. 验收

1. `role = 1`、`role = 4` 可登录后台；`role = 2/3` 即使用对密码也无法登录。
2. 客户端 token 调用 `/api/admin/**` 被拒绝。
3. 同一账号 App 与后台可同时保持登录。
4. 超级管理员能给某管理员勾选页面/按钮；该管理员只能看到、操作已授权项；直接调无权限接口返回 403。
5. 新建/编辑/软删文章、Banner、分类、快捷入口后，对应端刷新可见；软删后客户端不可见。
6. 某内容 `platform` 只含 `mp-weixin` 时，H5 / App 列表不出现，小程序出现。
7. `platform` 为 `null` 的内容（含历史数据）在三端均可见。
8. 不能删除或降权库中最后一个超级管理员。
9. 文章带图片的 `content` 保存后客户端详情块不丢失。
10. 上传大于 50MB 的音视频失败并提示；`/api/cos/upload` 在登录授权成功后可用。
11. 已登录用户调用接口后，数据统计页能按该用户看到次数增加。
12. 生产构建可通过 `/admin/` 访问。

---

## 12. 仓库目录

```
uni-app/
├── arco-admin/              新建，后台前端（端口 9010）
├── uni-spring-boot/         增加 /api/admin/**，内容表增加 platform
├── uni-vite/                首页快捷入口改接口；请求带 platform
├── react-native-expo/       与 uni-vite 对齐 platform 与快捷入口
└── arco-admin-需求稿.md     本文
```
