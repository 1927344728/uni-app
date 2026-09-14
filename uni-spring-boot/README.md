# 腾讯云轻量服务器：启动与更新 JAR

服务器目录：`/opt/yizhao/`。日常用 **systemd 服务 `yizhao-app`** 管理进程，不要和 `start.sh` 混用。

```
/opt/yizhao/
├── application-prod.properties   # 生产配置
├── jars/                         # JAR 包
├── deploy/                       # 启停脚本与 systemd unit
└── logs/                         # 日志（手工 start.sh 才会写 app.log）
```

证书在 `/opt/ssl/app.izhao.com.cn_nginx/`，HTTPS 端口 **9443**。

本地打包并上传：

```bash
# 在仓库根目录
mvn -f uni-spring-boot/pom.xml -DskipTests package
npm run upload-spring-boot
```

会把 JAR 传到 `/opt/yizhao/jars/`，脚本传到 `/opt/yizhao/deploy/`，配置和本说明传到 `/opt/yizhao/`，然后远程执行 `deploy-service.sh`（自动选最新 jar 并 `systemctl restart yizhao-app`）。

---

## 首次启动

SSH 登录服务器后：

```bash
cd /opt/yizhao/deploy
chmod +x *.sh
./deploy-service.sh
```

脚本会：在 `jars/` 里按 semver 选最新的 `yizhao-spring-boot-x.y.z.jar` → 写入 `start.sh` / `stop.sh` / `yizhao-app.service` → 安装到 systemd → `enable` 并 `restart`。也可显式传入文件名：`./deploy-service.sh yizhao-spring-boot-1.0.6.jar`。

之后开机自动拉起。查看状态：

```bash
systemctl status yizhao-app --no-pager
journalctl -u yizhao-app -f
```

---

## JAR 更新后如何重启

本地执行 `npm run upload-spring-boot` 后会自动远程跑 `deploy-service.sh`，一般不必再 SSH。若只想在服务器上手动操作，分两种情况。

### 1. 文件名变了（换版本，例如 `1.0.5` → `1.0.6`）

必须跑 `deploy-service.sh`，否则只 `systemctl restart` 仍指向旧 JAR：

```bash
cd /opt/yizhao/deploy
./deploy-service.sh
```

无参数时自动选 `jars/` 下版本最高的包。要钉死某一个文件时再传文件名。

### 2. 文件名没变（覆盖同一个 JAR）

路径不用改，重启即可：

```bash
systemctl restart yizhao-app
systemctl status yizhao-app --no-pager
```

---

## 常用命令

```bash
systemctl start yizhao-app      # 启动
systemctl stop yizhao-app       # 停止
systemctl restart yizhao-app    # 重启（同名 JAR 覆盖后用这个）
systemctl status yizhao-app     # 状态
journalctl -u yizhao-app -n 100 --no-pager   # 最近日志
journalctl -u yizhao-app -f                  # 跟踪日志
```

---

## 备用：手工脚本（不要和 systemd 同时用）

仅在未安装 `yizhao-app` 服务、需要临时拉起时使用。`start.sh` / `stop.sh` 用 PID 文件，和 systemd 会抢端口。

```bash
cd /opt/yizhao/deploy
./start.sh      # 前台检查证书后后台启动
./stop.sh
./restart.sh
tail -f /opt/yizhao/logs/app.log
```

`start.sh` 里的 `APP_NAME` 须与 `jars/` 中的文件名一致。换版本时优先走 `deploy-service.sh`，它会一并改 `start.sh` / `stop.sh` / unit 文件。
