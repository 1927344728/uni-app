#!/usr/bin/env bash
# 将 dist/build/h5 上传到腾讯云轻量服务器 /opt/www/yizhao/
# 用法: npm run upload

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BUILD_DIR="${PROJECT_DIR}/dist/build/h5"
ENV_FILE="/d/tencent-cloud-credentials.env"
REMOTE_DIR="/opt/www/yizhao"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # 去掉 Windows 编辑器可能写入的 UTF-8 BOM
  # shellcheck source=/dev/null
  source <(sed '1s/^\xEF\xBB\xBF//' "$ENV_FILE")
  set +a
fi

: "${SERVER_HOST:?请在 /d/tencent-cloud-credentials.env 中设置 SERVER_HOST}"
SERVER_USER="${SERVER_USER:-root}"
SSH_PORT="${SSH_PORT:-22}"

SSH_OPTS=(-p "$SSH_PORT")
SCP_OPTS=(-P "$SSH_PORT" -r)
if [[ -n "${SSH_KEY:-}" ]]; then
  SSH_OPTS+=(-i "$SSH_KEY")
  SCP_OPTS+=(-i "$SSH_KEY")
fi

REMOTE="${SERVER_USER}@${SERVER_HOST}"

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "错误: 找不到构建目录 ${BUILD_DIR}，请先执行 npm run build:h5" >&2
  exit 1
fi

if ! command -v scp >/dev/null 2>&1; then
  echo "错误: 未找到 scp 命令，请先安装 OpenSSH 客户端。" >&2
  exit 1
fi

echo "==> 创建远程目录 ${REMOTE_DIR}"
ssh "${SSH_OPTS[@]}" "$REMOTE" "mkdir -p '${REMOTE_DIR}'"

echo "==> 上传 ${BUILD_DIR} -> ${REMOTE}:${REMOTE_DIR}/"
scp "${SCP_OPTS[@]}" "${BUILD_DIR}/." "${REMOTE}:${REMOTE_DIR}/"

echo "完成。H5 已上传至 ${REMOTE}:${REMOTE_DIR}/"
