#!/usr/bin/env bash
# 将 uni-vite/unpackage/resources 下所有内容复制到 uni-android 的 assets/apps
# 用法: npm run copy-android-resources，或 ./scripts/copy-android-resources.sh（Git Bash / WSL / Linux）

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SRC_DIR="${ROOT_DIR}/uni-vite/unpackage/resources"
DEST_DIR="${ROOT_DIR}/uni-android/app/src/main/assets/apps"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "错误: 找不到本地打包资源目录 ${SRC_DIR}，请先在 HBuilderX 中生成本地打包 App 资源。" >&2
  exit 1
fi

# 创建目标目录（如果不存在）
mkdir -p "$DEST_DIR"

# 清空目标目录下所有内容
rm -rf "${DEST_DIR:?}"/*

# 复制所有内容（包括隐藏文件和目录）
cp -rf "$SRC_DIR"/* "$DEST_DIR"/

echo "完成。App 资源已复制至 ${DEST_DIR}"
