# 腾讯云轻量应用服务器部署指南

本文说明如何将本 Spring Boot 应用部署到腾讯云轻量应用服务器。

---

## 一、部署前准备

### 1. 本地打包

在项目根目录执行：

```bash
mvn clean package -DskipTests
```

生成的 jar 位于：`target/uni-spring-boot-0.0.1-SNAPSHOT.jar`。

### 2. 生产环境配置

- 复制示例配置并填写真实值（**不要提交到 Git**）：
  ```bash
  cp src/main/resources/application-prod.properties.example src/main/resources/application-prod.properties
  ```
- 编辑 `application-prod.properties`，修改：
  - `server.ssl.key-store-password`：keystore 密码
  - `spring.datasource.url` / `username` / `password`：生产库地址与账号

若使用**环境变量**或**服务器上的外部配置文件**，可不在 jar 内放 `application-prod.properties`，见下文「运行方式」部分。

### 3. 上传到服务器

- 将以下内容上传到轻量服务器（如 `/opt/uni-spring-boot/`）：
  - `target/uni-spring-boot-0.0.1-SNAPSHOT.jar`
  - 若 keystore 放服务器：`keystore.p12`（推荐与 jar 同目录或统一目录，并在配置里用 `file:` 路径）
- 若使用外部配置，在同一目录放 `application-prod.properties`。

上传方式示例（在本地执行，替换为你的 IP 和路径）：

```bash
scp target/uni-spring-boot-0.0.1-SNAPSHOT.jar root@你的服务器IP:/opt/uni-spring-boot/
```

---

## 二、服务器环境（腾讯云轻量 Linux）

### 1. 安装 Java 17

本应用需要 **Java 17**。

```bash
# 以 Ubuntu/Debian 为例
sudo apt update
sudo apt install openjdk-17-jdk -y
java -version
```

### 2. MySQL

- **方式 A：轻量服务器本机安装**
  ```bash
  sudo apt install mysql-server -y
  sudo mysql_secure_installation
  sudo mysql -e "CREATE DATABASE yizhao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  sudo mysql -e "CREATE USER '你的用户'@'localhost' IDENTIFIED BY '你的密码';"
  sudo mysql -e "GRANT ALL ON yizhao.* TO '你的用户'@'localhost'; FLUSH PRIVILEGES;"
  ```
- **方式 B：使用腾讯云数据库 MySQL**  
  在控制台创建实例，记下内网地址、端口、库名、用户名、密码，在 `application-prod.properties` 中修改 `spring.datasource.*`。

### 3. 防火墙（轻量控制台）

在腾讯云轻量应用服务器控制台 → 防火墙中放行：

- **443**（HTTPS）
- **80**（HTTP，你当前配置会重定向到 443）

若应用只监听 8080 且前面用 Nginx 代理，则只需对 Nginx 放行 80/443，应用端口可不对外开放。

---

## 三、运行应用

### 方式 A：使用 systemd（推荐）

1. 将 `deploy/uni-spring-boot.service` 放到服务器：
   ```bash
   sudo cp deploy/uni-spring-boot.service /etc/systemd/system/
   ```
2. 按实际路径修改服务文件中的 `WorkingDirectory`、`ExecStart` 中的 jar 路径，以及 `spring.profiles.active=prod` 等。
3. 启动并设置开机自启：
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable uni-spring-boot
   sudo systemctl start uni-spring-boot
   sudo systemctl status uni-spring-boot
   ```

### 方式 B：命令行直接运行

```bash
cd /opt/uni-spring-boot
java -jar -Dspring.profiles.active=prod uni-spring-boot-0.0.1-SNAPSHOT.jar
```

后台运行示例：

```bash
nohup java -jar -Dspring.profiles.active=prod uni-spring-boot-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

### 使用外部配置文件（不把密码打进 jar）

把 `application-prod.properties` 放在 jar 同目录或指定目录，例如：

```bash
java -jar -Dspring.profiles.active=prod -Dspring.config.additional-location=file:./application-prod.properties uni-spring-boot-0.0.1-SNAPSHOT.jar
```

或：

```bash
java -jar -Dspring.profiles.active=prod -Dspring.config.location=file:./application-prod.properties uni-spring-boot-0.0.1-SNAPSHOT.jar
```

这样打包时可以不包含 `application-prod.properties`，更安全。

---

## 四、HTTPS 与域名（可选）

- 当前应用已内置 443 + keystore，可直接在轻量服务器监听 443。  
- 若希望用**域名 + 云厂商 SSL 证书**，可在服务器上装 Nginx，用 Nginx 做 80/443 并反向代理到本机 8080（此时应用可改为只开 8080，关闭内置 SSL）。  

如需 Nginx 配置示例，可在 `deploy/` 下增加 `nginx.conf.example`。

---

## 五、简要检查清单

- [ ] 本地 `mvn clean package -DskipTests` 成功
- [ ] 已配置 `application-prod.properties`（或等效环境变量/外部配置）
- [ ] 服务器已安装 Java 17
- [ ] MySQL 已安装或已使用云数据库，并创建数据库/用户
- [ ] 轻量防火墙已放行 80、443（或 Nginx 对应端口）
- [ ] jar、keystore、配置路径与 systemd/启动命令一致

完成以上步骤后，通过 `https://你的服务器IP或域名` 访问即可。
