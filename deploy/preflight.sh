#!/usr/bin/env bash
# 部署前环境变量自检。
#
# 用法：bash deploy/preflight.sh [env 文件，默认 .env]
#
# 检查内容：必填项是否存在、是否仍是占位符、compose 插值所需的 POSTGRES_*
# 是否齐全、以及 DATABASE_URL 里的密码段与 POSTGRES_PASSWORD 是否一致。
# 全程只输出键名与判定结果，不打印任何变量值。

set -uo pipefail

ENV_FILE="${1:-.env}"
FAILED=0

fail() { printf '  [FAIL] %s\n' "$1"; FAILED=1; }
warn() { printf '  [WARN] %s\n' "$1"; }
pass() { printf '  [ OK ] %s\n' "$1"; }

if [ ! -f "$ENV_FILE" ]; then
  printf '找不到环境变量文件：%s\n' "$ENV_FILE" >&2
  exit 1
fi

# 只取形如 KEY=VALUE 的行，忽略注释与空行。不 source，避免执行文件内容。
get() {
  awk -F= -v key="$1" '
    /^[[:space:]]*#/ { next }
    $1 == key { sub("^" key "=", ""); print; exit }
  ' "$ENV_FILE"
}

# 占位符特征：模板里常见的英文占位、以及中文说明性占位。
is_placeholder() {
  case "$1" in
    ""|*replace-with*|*your-*|*example.com*|*你的*|*请填*|*填写*|*changeme*|*CHANGEME*) return 0 ;;
    *) return 1 ;;
  esac
}

printf '检查 %s\n\n' "$ENV_FILE"

printf 'compose 插值所需（缺失会让 db 用空密码初始化）：\n'
for key in POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD; do
  value="$(get "$key")"
  if [ -z "$value" ]; then
    fail "$key 缺失或为空"
  elif is_placeholder "$value"; then
    fail "$key 仍是占位符"
  else
    pass "$key"
  fi
done

printf '\n应用运行所需：\n'
for key in OTP_SECRET DEEPSEEK_API_KEY; do
  value="$(get "$key")"
  if [ -z "$value" ]; then
    warn "$key 缺失（相关功能会返回 503）"
  elif is_placeholder "$value"; then
    fail "$key 仍是占位符"
  else
    pass "$key"
  fi
done

printf '\n密码一致性：\n'
database_url="$(get DATABASE_URL)"
if [ -z "$database_url" ]; then
  pass "未在此文件定义 DATABASE_URL，由 compose 从 POSTGRES_* 拼装"
else
  # 从 postgresql://user:password@host 中取出 password 段。
  url_password="$(printf '%s' "$database_url" | sed -n 's#^[a-z+]*://[^:]*:\(.*\)@[^@]*$#\1#p')"
  pg_password="$(get POSTGRES_PASSWORD)"
  if [ -z "$url_password" ]; then
    warn "DATABASE_URL 里未解析出密码段，请人工确认"
  elif [ "$url_password" = "$pg_password" ]; then
    pass "DATABASE_URL 密码段与 POSTGRES_PASSWORD 一致"
  else
    fail "DATABASE_URL 密码段与 POSTGRES_PASSWORD 不一致（app 会连库失败）"
  fi
fi

printf '\n提醒：Postgres 密码在数据卷首次初始化时固化。若数据卷已存在，\n'
printf '改这里的密码不会改变库里已有的密码，需要 docker compose down -v 重建。\n\n'

if [ "$FAILED" -ne 0 ]; then
  printf '自检未通过，先修上面标 FAIL 的项再部署。\n'
  exit 1
fi

printf '自检通过。\n'
