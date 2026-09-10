[1mdiff --git a/uni-spring-boot/deploy/start.sh b/uni-spring-boot/deploy/start.sh[m
[1mindex 4ab642a..1664441 100644[m
[1m--- a/uni-spring-boot/deploy/start.sh[m
[1m+++ b/uni-spring-boot/deploy/start.sh[m
[36m@@ -4,7 +4,7 @@[m [mAPP_PORT="9443"[m
 JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -Dspring.profiles.active=prod -Dserver.port=$APP_PORT"[m
 LOG_FILE="/opt/yizhao/logs/app.log"[m
 PID_FILE="/opt/yizhao/app.pid"[m
[31m-KEYSTORE_FILE="/opt/yizhao/ssl/keystore.p12"[m
[32m+[m[32mKEYSTORE_FILE="/opt/ssl/app.izhao.com.cn_nginx/app.izhao.com.cn.p12"[m
 [m
 echo "========================================"[m
 echo "🔐 启动 Spring Boot HTTPS 应用"[m
[36m@@ -67,4 +67,4 @@[m [melse[m
     echo "查看错误日志:"[m
     tail -30 "$LOG_FILE"[m
     exit 1[m
[31m-fi[m
\ No newline at end of file[m
[32m+[m[32mfi[m
[1mdiff --git a/uni-spring-boot/src/main/resources/application.properties b/uni-spring-boot/src/main/resources/application.properties[m
[1mindex 07426d0..2e88291 100644[m
[1m--- a/uni-spring-boot/src/main/resources/application.properties[m
[1m+++ b/uni-spring-boot/src/main/resources/application.properties[m
[36m@@ -2,21 +2,21 @@[m [mspring.application.name=yizhao-spring-boot[m
 server.address=0.0.0.0[m
 server.port=9443[m
 server.ssl.enabled=true[m
[31m-server.ssl.key-store=file:///D:/MyCode/uni-app/ssl/dev.izhao.com.cn_nginx/dev.izhao.com.cn.p12[m
[32m+[m[32mserver.ssl.key-store=/opt/ssl/app.izhao.com.cn_nginx/app.izhao.com.cn.p12[m
 server.ssl.key-alias=tomcat[m
 server.ssl.key-password=123456[m
 server.ssl.key-store-password=123456[m
 server.ssl.key-store-type=PKCS12[m
 [m
[31m-server.tomcat.connection-timeout=10s[m
[32m+[m[32mserver.tomcat.connection-timeout=30s[m
 [m
[31m-spring.datasource.url=jdbc:mysql://localhost:3306/yizhao?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true[m
[32m+[m[32mspring.datasource.url=jdbc:mysql://localhost:3306/yizhao?useSSL=true&serverTimezone=Asia/Shanghai[m
 spring.datasource.username=lizhao[m
 spring.datasource.password=lizh1234[m
 spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver[m
 [m
[31m-spring.jpa.show-sql=true[m
[31m-spring.jpa.hibernate.ddl-auto=update[m
[32m+[m[32mspring.jpa.show-sql=false[m
[32m+[m[32mspring.jpa.hibernate.ddl-auto=validate[m
 spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect[m
 [m
 security.public-paths=/api/login/**,/api/hello/**,/api/public/**,/api/test/**[m
