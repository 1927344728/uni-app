#!/usr/bin/env bash
# 将当前目录下所有 *.izhao.com.cn_nginx 中的证书与私钥转为 PKCS12
# 用法: ./convert-pkcs12.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

shopt -s nullglob
dirs=("$SCRIPT_DIR"/*.izhao.com.cn_nginx)
[[ ${#dirs[@]} -gt 0 ]] || { echo "错误: 未找到 *.izhao.com.cn_nginx 目录" >&2; exit 1; }

for dir_path in "${dirs[@]}"; do
  base_name="$(basename "$dir_path" _nginx)"
  key_file="${dir_path}/${base_name}.key"

  if [[ -f "${dir_path}/${base_name}_bundle.crt" ]]; then
    cert_file="${dir_path}/${base_name}_bundle.crt"
  else
    cert_file="${dir_path}/${base_name}_bundle.pem"
  fi

  echo "==> 转换 ${base_name}.p12"
  openssl pkcs12 -export \
    -inkey "$key_file" \
    -in "$cert_file" \
    -out "${dir_path}/${base_name}.p12" \
    -name "tomcat" \
    -passout "pass:123456"
done

echo "完成。"
