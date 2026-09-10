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

会把 JAR 传到 `/opt/yizhao/jars/`，脚本传到 `/opt/yizhao/deploy/`，配置和本说明传到 `/opt/yizhao/`。

注意：上传**不会**改 `/etc/systemd/system/yizhao-app.service`。换 JAR 文件名、或刚改过 unit 文件后，必须在服务器上再跑一次 `deploy-service.sh`，只执行 `systemctl restart` 仍会用旧路径。

---

## 首次启动

SSH 登录服务器后：

```bash
cd /opt/yizhao/deploy
chmod +x *.sh
./deploy-service.sh yizhao-spring-boot-1.0.5.jar
```

脚本会：核对 `jars/` 下已有该 JAR → 写入 `yizhao-app.service` → 安装到 systemd → `enable` 并 `restart`。

之后开机自动拉起。查看状态：

```bash
systemctl status yizhao-app --no-pager
journalctl -u yizhao-app -f
```

---

## JAR 更新后如何重启

先在本地上传新包，再 SSH 到服务器操作。分两种情况。

### 1. 文件名变了（换版本，例如 `1.0.3` → `1.0.5`）

必须跑 `deploy-service.sh`，否则 systemd 仍指向旧 JAR：

```bash
cd /opt/yizhao/deploy
./deploy-service.sh yizhao-spring-boot-1.0.5.jar
```

把参数换成实际上传到 `/opt/yizhao/jars/` 的文件名。

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
