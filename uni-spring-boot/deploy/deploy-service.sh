#!/bin/bash

# 用法:
#   ./deploy-service.sh                              # 自动选用 jars/ 下版本最高的 jar
#   ./deploy-service.sh yizhao-spring-boot-1.0.6.jar  # 指定 jar
# 作用:
# 1. 确定要启用的 JAR（无参数时按 semver 选最新）
# 2. 在 start.sh / stop.sh / yizhao-app.service 中替换 JAR 名
# 3. 拷贝 yizhao-app.service 到 /etc/systemd/system 并重启服务

set -e

SERVICE_NAME="yizhao-app"
SERVICE_FILE="yizhao-app.service"
DEPLOY_DIR="/opt/yizhao/deploy"
JAR_DIR="/opt/yizhao/jars"
SYSTEMD_DIR="/etc/systemd/system"

pick_latest_jar() {
  local f base
  local candidates=()
  for f in "$JAR_DIR"/yizhao-spring-boot-*.jar; do
    [ -e "$f" ] || continue
    base=$(basename "$f")
    if [[ "$base" =~ ^yizhao-spring-boot-[0-9]+\.[0-9]+\.[0-9]+\.jar$ ]]; then
      candidates+=("$base")
    fi
  done
  if [ ${#candidates[@]} -eq 0 ]; then
    echo "错误: $JAR_DIR 下没有 yizhao-spring-boot-x.y.z.jar"
    exit 1
  fi
  printf '%s\n' "${candidates[@]}" | sort -V | tail -1
}

NEW_JAR_NAME="$1"

if [ -z "$NEW_JAR_NAME" ]; then
  NEW_JAR_NAME=$(pick_latest_jar)
  echo "未指定 JAR，自动选用最新: $NEW_JAR_NAME"
else
  NEW_JAR_NAME=$(basename "$NEW_JAR_NAME")
fi

cd "$DEPLOY_DIR"

if [ ! -f "$SERVICE_FILE" ]; then
  echo "错误: 找不到 $DEPLOY_DIR/$SERVICE_FILE"
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

NEW_JAR_PATH="$JAR_DIR/$NEW_JAR_NAME"

echo "当前 JAR 路径: $OLD_JAR_PATH"
echo "当前 JAR 名: $OLD_JAR_NAME"
echo "新的 JAR 路径: $NEW_JAR_PATH"

if [ ! -f "$NEW_JAR_PATH" ]; then
  echo "错误: 未在 $JAR_DIR 下找到 $NEW_JAR_NAME"
  echo "请确认已上传新 JAR 文件后再运行本脚本。"
  exit 1
fi

for f in start.sh stop.sh; do
  if [ -f "$f" ]; then
    echo "更新 $f 中的 APP_NAME..."
    sed -i "s#^APP_NAME=.*#APP_NAME=\"$NEW_JAR_NAME\"#g" "$f"
  fi
done

echo "更新 $SERVICE_FILE 中的 JAR 路径..."
sed -i -E "s#(-jar[[:space:]]+)[^[:space:]]+#\1$NEW_JAR_PATH#" "$SERVICE_FILE"

echo "拷贝 systemd 服务文件到 $SYSTEMD_DIR..."
cp "$SERVICE_FILE" "$SYSTEMD_DIR/$SERVICE_FILE"

echo "重新加载 systemd 配置并重启服务 $SERVICE_NAME..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

echo "当前服务状态:"
systemctl status "$SERVICE_NAME" --no-pager

echo "完成。"
