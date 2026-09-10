#!/bin/bash
APP_NAME="yizhao-spring-boot-1.0.5.jar"
APP_HOME="/opt/yizhao"
JAR_DIR="$APP_HOME/jars"
APP_JAR="$JAR_DIR/$APP_NAME"
APP_PORT="9443"
JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
LOG_FILE="$APP_HOME/logs/app.log"
PID_FILE="$APP_HOME/app.pid"
KEYSTORE_FILE="/opt/ssl/app.izhao.com.cn_nginx/app.izhao.com.cn.p12"

echo "========================================"
echo "🔐 启动 Spring Boot HTTPS 应用"
echo "应用: $APP_JAR"
echo "端口: $APP_PORT (HTTPS)"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# 检查是否已运行
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  应用已在运行，PID: $PID"
        exit 1
    fi
fi

# 检查 JAR
if [ ! -f "$APP_JAR" ]; then
    echo "❌ 错误: 未找到 JAR 文件 $APP_JAR"
    exit 1
fi

# 检查证书文件
if [ ! -f "$KEYSTORE_FILE" ]; then
    echo "❌ 错误: 未找到证书文件 $KEYSTORE_FILE"
    exit 1
fi

echo "✅ 证书文件存在: $(ls -lh "$KEYSTORE_FILE")"

# 创建日志目录
mkdir -p "$APP_HOME/logs"

# 备份旧日志
if [ -f "$LOG_FILE" ]; then
    mv "$LOG_FILE" "${LOG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
fi

echo "🚀 启动应用..."
cd "$APP_HOME"

# 启动命令
nohup java $JAVA_OPTS -jar "$APP_JAR" \
    --spring.profiles.active=prod \
    --spring.config.additional-location="file:$APP_HOME/" \
    --server.port="$APP_PORT" \
    > "$LOG_FILE" 2>&1 &

# 等待并获取进程 ID
sleep 3
APP_PID=$(ps -ef | grep "$APP_NAME" | grep -v grep | awk '{print $2}')

if [ -n "$APP_PID" ]; then
    echo $APP_PID > "$PID_FILE"
    echo ""
    echo "✅ 启动成功！"
    echo "   PID: $APP_PID"
    echo "   端口: https://服务器IP:$APP_PORT"
    echo "   日志: $LOG_FILE"
    echo ""
    echo "📋 常用命令:"
    echo "   查看日志: tail -f $LOG_FILE"
    echo "   实时日志: tail -100f $LOG_FILE"
    echo "   停止应用: ./stop.sh"
    echo "   重启应用: ./restart.sh"
    echo "   检查状态: ps -ef | grep $APP_NAME"
else
    echo "❌ 启动失败！"
    echo "查看错误日志:"
    tail -30 "$LOG_FILE"
    exit 1
fi
