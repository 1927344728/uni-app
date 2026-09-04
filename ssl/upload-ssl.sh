#!/usr/bin/env bash
# 将 app.izhao.com.cn_nginx、www.izhao.com.cn_nginx 上传到腾讯云轻量服务器 /opt/ssl/
# 用法: 在 ssl 目录下执行 ./upload-ssl.sh（Git Bash / WSL / Linux）
# 上传前如需生成 PKCS12，请先执行 ./convert-pkcs12.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="/d/tencent-cloud-credentials.env"
CERT_DIRS=(app.izhao.com.cn_nginx www.izhao.com.cn_nginx)

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # 去掉 Windows 编辑器可能写入的 UTF-8 BOM
  # shellcheck source=/dev/null
  source <(sed '1s/^\xEF\xBB\xBF//' "$ENV_FILE")
  set +a
fi

: "${SERVER_HOST:?请在 /d/tencent-cloud-credentials.env 中设置 SERVER_HOST}"
SERVER_USER="${SERVER_USER:-root}"
REMOTE_DIR="/opt/ssl"
SSH_PORT="${SSH_PORT:-22}"

SSH_OPTS=(-p "$SSH_PORT")
SCP_OPTS=(-P "$SSH_PORT" -r)
if [[ -n "${SSH_KEY:-}" ]]; then
  SSH_OPTS+=(-i "$SSH_KEY")
  SCP_OPTS+=(-i "$SSH_KEY")
fi

REMOTE="${SERVER_USER}@${SERVER_HOST}"

for dir in "${CERT_DIRS[@]}"; do
  if [[ ! -d "${SCRIPT_DIR}/${dir}" ]]; then
    echo "错误: 找不到目录 ${SCRIPT_DIR}/${dir}" >&2
    exit 1
  fi
done

if ! command -v scp >/dev/null 2>&1; then
  echo "错误: 未找到 scp 命令，请先安装 OpenSSH 客户端。" >&2
  exit 1
fi

echo "==> 创建远程目录 ${REMOTE_DIR}"
ssh "${SSH_OPTS[@]}" "$REMOTE" "mkdir -p '${REMOTE_DIR}'"

for dir in "${CERT_DIRS[@]}"; do
  echo "==> 上传 ${dir} -> ${REMOTE}:${REMOTE_DIR}/"
  scp "${SCP_OPTS[@]}" "${SCRIPT_DIR}/${dir}" "${REMOTE}:${REMOTE_DIR}/"
done

echo "==> 设置私钥与 PKCS12 权限 (chmod 600)"
ssh "${SSH_OPTS[@]}" "$REMOTE" "find '${REMOTE_DIR}' \( -name '*.key' -o -name '*.p12' \) -exec chmod 600 {} +"

echo "完成。证书已上传至 ${REMOTE}:${REMOTE_DIR}/"
