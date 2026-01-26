
#!/bin/bash
APP_NAME="uni-spring-boot-0.0.1-SNAPSHOT.jar"
APP_PORT="443"
JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -Dspring.profiles.active=prod -Dserver.port=$APP_PORT"
LOG_FILE="/opt/yizhao/logs/app.log"
PID_FILE="/opt/yizhao/app.pid"
KEYSTORE_FILE="/opt/yizhao/keystore.p12"

echo "========================================"
echo "🔐 启动 Spring Boot HTTPS 应用"
echo "应用: $APP_NAME"
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

# 检查证书文件
if [ ! -f "$KEYSTORE_FILE" ]; then
    echo "❌ 错误: 未找到证书文件 $KEYSTORE_FILE"
    exit 1
fi

echo "✅ 证书文件存在: $(ls -lh "$KEYSTORE_FILE")"

# 创建日志目录
mkdir -p /opt/yizhao/logs

# 备份旧日志
if [ -f "$LOG_FILE" ]; then
    mv "$LOG_FILE" "${LOG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# 由于使用 443 端口，需要 root 权限或特殊配置
echo "🔧 配置端口 443 权限..."

# 方法1：检查是否有绑定低端口的权限
if [ "$APP_PORT" -lt 1024 ]; then
    echo "⚠️  端口 $APP_PORT < 1024，需要特殊权限"
    
    # 检查是否已经设置了 CAP_NET_BIND_SERVICE 能力
    if command -v getcap >/dev/null 2>&1; then
        JAVA_PATH=$(which java)
        if sudo getcap "$JAVA_PATH" | grep -q "cap_net_bind_service"; then
            echo "✅ Java 已有绑定低端口权限"
            SUDO_CMD=""
        else
            echo "📝 为 Java 添加绑定低端口权限..."
            sudo_cmd="sudo"
        fi
    else
        echo "📝 使用 sudo 运行（需要输入密码）"
        sudo_cmd="sudo"
    fi
else
    sudo_cmd=""
fi

echo "🚀 启动应用..."
cd /opt/yizhao

# 启动命令
nohup $sudo_cmd java $JAVA_OPTS -jar $APP_NAME > "$LOG_FILE" 2>&1 &

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