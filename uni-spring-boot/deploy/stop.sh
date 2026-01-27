#!/bin/bash
APP_NAME="yizhao-spring-boot-0.0.1.jar"
PID_FILE="/opt/yizhao/app.pid"

echo "停止 Spring Boot 应用..."

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    echo "找到进程 PID: $PID"

    # 优雅停止
    kill -15 $PID 2>/dev/null
    sleep 3

    # 检查是否停止
    if ps -p $PID > /dev/null 2>&1; then
        echo "强制停止..."
        kill -9 $PID 2>/dev/null
    fi

    rm -f "$PID_FILE"
    echo "✅ 应用已停止"
else
    echo "⚠️  未找到 PID 文件，尝试通过名称停止..."
    PIDS=$(ps -ef | grep "$APP_NAME" | grep -v grep | awk '{print $2}')

    if [ -z "$PIDS" ]; then
        echo "应用未运行"
    else
        echo "停止进程: $PIDS"
        kill -15 $PIDS 2>/dev/null
        sleep 2
        kill -9 $PIDS 2>/dev/null 2>/dev/null
        echo "✅ 应用已停止"
    fi
fi