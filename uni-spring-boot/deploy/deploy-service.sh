#!/bin/bash

# 用法: ./deploy-service.sh yizhao-spring-boot-0.0.1.jar
# 作用:
# 1. 自动识别当前使用的 JAR 名
# 2. 在 start.sh / stop.sh / yizhao-app.service 中替换为新的 JAR 名
# 3. 拷贝 yizhao-app.service 到 /etc/systemd/system 并重启服务

set -e

SERVICE_NAME="yizhao-app"
SERVICE_FILE="yizhao-app.service"
BASE_DIR="/opt/yizhao/deploy"
SYSTEMD_DIR="/etc/systemd/system"

NEW_JAR_NAME="$1"

if [ -z "$NEW_JAR_NAME" ]; then
  echo "用法: $0 <新JAR文件名，例如: yizhao-spring-boot-0.0.1.jar>"
  exit 1
fi

cd "$BASE_DIR"

if [ ! -f "$SERVICE_FILE" ]; then
  echo "错误: 找不到 $BASE_DIR/$SERVICE_FILE"
  exit 1
fi
 
# 从 ExecStart 行中解析当前 JAR 的完整路径和文件名
EXEC_LINE=$(grep '^ExecStart=' "$SERVICE_FILE")
OLD_JAR_PATH=$(echo "$EXEC_LINE" | sed -E 's/.*-jar[[:space:]]+([^[:space:]]+).*/\1/')
OLD_JAR_NAME=$(basename "$OLD_JAR_PATH")

if [ -z "$OLD_JAR_NAME" ] || [ -z "$OLD_JAR_PATH" ]; then
  echo "错误: 无法从 $SERVICE_FILE 的 ExecStart 中解析当前 JAR 名"
  exit 1
fi

echo "当前 JAR 路径: $OLD_JAR_PATH"
echo "当前 JAR 名: $OLD_JAR_NAME"
echo "新的 JAR 名: $NEW_JAR_NAME"

if [ ! -f "$BASE_DIR/$NEW_JAR_NAME" ]; then
  echo "警告: 未在 $BASE_DIR 下找到 $NEW_JAR_NAME"
  echo "请确认已上传新 JAR 文件后再运行本脚本。"
fi

for f in start.sh stop.sh; do
  if [ -f "$f" ]; then
    echo "更新 $f 中的 APP_NAME..."
    sed -i "s#APP_NAME=\"$OLD_JAR_NAME\"#APP_NAME=\"$NEW_JAR_NAME\"#g" "$f"
  fi
done

echo "更新 $SERVICE_FILE 中的 JAR 名..."
NEW_JAR_PATH="$BASE_DIR/$NEW_JAR_NAME"
sed -i "s#$OLD_JAR_PATH#$NEW_JAR_PATH#g" "$SERVICE_FILE"

echo "拷贝 systemd 服务文件到 $SYSTEMD_DIR..."
cp "$SERVICE_FILE" "$SYSTEMD_DIR/$SERVICE_FILE"


echo "重新加载 systemd 配置并重启服务 $SERVICE_NAME..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

echo "当前服务状态:"
systemctl status "$SERVICE_NAME" --no-pager

echo "完成。"