#!/usr/bin/env bash
# 将 uni-spring-boot 的 JAR、deploy 脚本、生产配置和 README 上传到腾讯云轻量服务器，
# 并远程执行 deploy-service.sh（切到最新 JAR 后 systemctl restart yizhao-app）。
# 用法: npm run upload-spring-boot，或 ./scripts/upload-spring-boot.sh（Git Bash / WSL / Linux）
#
# 远程目录:
#   target/*.jar                              -> /opt/yizhao/jars/
#   deploy/*                                  -> /opt/yizhao/deploy/
#   src/main/resources/application-prod.properties -> /opt/yizhao/
#   README.md                                 -> /opt/yizhao/
#
# 上传前会把 application-local.properties 的配置追加进 application-prod.properties，
# 无论成功失败，脚本结束时都会还原该文件。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../uni-spring-boot" && pwd)"
TARGET_DIR="${PROJECT_DIR}/target"
DEPLOY_DIR="${PROJECT_DIR}/deploy"
PROD_FILE="${PROJECT_DIR}/src/main/resources/application-prod.properties"
LOCAL_FILE="${PROJECT_DIR}/src/main/resources/application-local.properties"
README_FILE="${PROJECT_DIR}/README.md"
ENV_FILE="/d/tencent-cloud-credentials.env"

REMOTE_BASE="/opt/yizhao"
REMOTE_JAR_DIR="${REMOTE_BASE}/jars"
REMOTE_DEPLOY_DIR="${REMOTE_BASE}/deploy"

PROD_BACKUP=""

restore_prod() {
  if [[ -n "${PROD_BACKUP}" && -f "${PROD_BACKUP}" ]]; then
    cp -f "${PROD_BACKUP}" "${PROD_FILE}"
    rm -f "${PROD_BACKUP}"
    echo "==> 已还原 ${PROD_FILE}"
  fi
}

trap restore_prod EXIT

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

if ! command -v scp >/dev/null 2>&1; then
  echo "错误: 未找到 scp 命令，请先安装 OpenSSH 客户端。" >&2
  exit 1
fi

shopt -s nullglob
JARS=("${TARGET_DIR}"/*.jar)
shopt -u nullglob

if [[ ${#JARS[@]} -eq 0 ]]; then
  echo "错误: 找不到 JAR 包 ${TARGET_DIR}/*.jar，请先在 uni-spring-boot 下执行 mvn package" >&2
  exit 1
fi

if [[ ! -d "$DEPLOY_DIR" ]]; then
  echo "错误: 找不到目录 ${DEPLOY_DIR}" >&2
  exit 1
fi

if [[ ! -f "$PROD_FILE" ]]; then
  echo "错误: 找不到 ${PROD_FILE}" >&2
  exit 1
fi

if [[ ! -f "$LOCAL_FILE" ]]; then
  echo "错误: 找不到 ${LOCAL_FILE}" >&2
  exit 1
fi

if [[ ! -f "$README_FILE" ]]; then
  echo "错误: 找不到 ${README_FILE}" >&2
  exit 1
fi

echo "==> 将 application-local.properties 的配置复制到 application-prod.properties"
PROD_BACKUP="$(mktemp)"
cp -f "$PROD_FILE" "$PROD_BACKUP"
{
  printf '\n'
  printf '# ---- copied from application-local.properties for upload ----\n'
  cat "$LOCAL_FILE"
} >> "$PROD_FILE"

echo "==> 创建远程目录"
ssh "${SSH_OPTS[@]}" "$REMOTE" "mkdir -p '${REMOTE_JAR_DIR}' '${REMOTE_DEPLOY_DIR}'"

echo "==> 上传 JAR -> ${REMOTE}:${REMOTE_JAR_DIR}/"
scp "${SCP_OPTS[@]}" "${JARS[@]}" "${REMOTE}:${REMOTE_JAR_DIR}/"

echo "==> 上传 deploy -> ${REMOTE}:${REMOTE_DEPLOY_DIR}/"
scp "${SCP_OPTS[@]}" "${DEPLOY_DIR}/." "${REMOTE}:${REMOTE_DEPLOY_DIR}/"

echo "==> 上传 application-prod.properties -> ${REMOTE}:${REMOTE_BASE}/"
scp "${SCP_OPTS[@]}" "$PROD_FILE" "${REMOTE}:${REMOTE_BASE}/application-prod.properties"

echo "==> 上传 README.md -> ${REMOTE}:${REMOTE_BASE}/"
scp "${SCP_OPTS[@]}" "$README_FILE" "${REMOTE}:${REMOTE_BASE}/README.md"

echo "==> 设置生产配置权限 (chmod 600)"
ssh "${SSH_OPTS[@]}" "$REMOTE" "chmod 600 '${REMOTE_BASE}/application-prod.properties'"

echo "==> 远程安装并重启 yizhao-app"
ssh "${SSH_OPTS[@]}" "$REMOTE" "chmod +x '${REMOTE_DEPLOY_DIR}'/*.sh && '${REMOTE_DEPLOY_DIR}/deploy-service.sh'"

echo "完成。已上传至 ${REMOTE} 并重启 yizhao-app:"
echo "  JAR:    ${REMOTE_JAR_DIR}/"
echo "  deploy: ${REMOTE_DEPLOY_DIR}/"
echo "  配置:   ${REMOTE_BASE}/application-prod.properties"
echo "  说明:   ${REMOTE_BASE}/README.md"
