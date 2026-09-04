# SSL 证书说明

本目录存放 `izhao.com.cn` 域名下各环境的 SSL 证书，每个子目录（或对应 zip 包）包含一套完整的 Nginx 格式证书文件：

| 文件 | 说明 |
|------|------|
| `*.key` | 私钥 |
| `*_bundle.crt` / `*_bundle.pem` | 证书链（含域名证书及中间证书） |
| `*.csr` | 证书签名请求（申请/续期时使用） |

---

## 证书清单

### assets.izhao.com.cn_nginx

**用途：** 腾讯云 CDN 静态资源加速域名证书。

**部署方式：** 登录 [腾讯云控制台](https://console.cloud.tencent.com/) → **内容分发网络 CDN** → **证书管理** → **证书配置**，选择并上传新证书即可。

---

### app.izhao.com.cn_nginx

**用途：** 腾讯云轻量应用服务器上 Java 应用及 Nginx 反向代理所用证书。

**部署方式：** 将证书文件上传至轻量应用服务器的 `/opt/ssl` 目录，并在 Nginx / Java 服务配置中引用对应路径。

---

### www.izhao.com.cn_nginx

**用途：** 腾讯云轻量应用服务器上 Nginx 主站证书。

**部署方式：** 将证书文件上传至轻量应用服务器的 `/opt/ssl` 目录，并在 Nginx 配置中引用对应路径。

---

### dev.izhao.com.cn_nginx

**用途：** 本地开发环境证书，可能用于本地 Java 项目启动时的 HTTPS 调试。

**部署方式：** 按需配置到本地项目的 SSL 证书路径（具体路径参考项目启动配置）。

