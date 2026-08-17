#!/usr/bin/env bash
# 清理过期会话与验证码。在服务器项目根目录运行：bash deploy/cleanup.sh
#
# 执行 deploy/postgres/010-cleanup.sql，可反复运行。
# 该 SQL 不随容器初始化自动执行，只由本脚本按计划触发。

set -uo pipefail

ENV_FILE=".env"
CLEANUP_SQL="deploy/postgres/010-cleanup.sql"

[ -f docker-compose.yml ] || { echo "当前目录不是项目根目录" >&2; exit 1; }
[ -f "$CLEANUP_SQL" ] || { echo "找不到 $CLEANUP_SQL" >&2; exit 1; }

PG_USER="$(awk -F= '/^POSTGRES_USER=/{print $2}' "$ENV_FILE")"
PG_DB="$(awk -F= '/^POSTGRES_DB=/{print $2}' "$ENV_FILE")"
[ -n "$PG_USER" ] && [ -n "$PG_DB" ] || { echo "$ENV_FILE 中 POSTGRES_USER 或 POSTGRES_DB 为空" >&2; exit 1; }

docker compose exec -T db psql -U "$PG_USER" -d "$PG_DB" -v ON_ERROR_STOP=1 -q < "$CLEANUP_SQL" \
  || { echo "清理失败" >&2; exit 1; }

docker compose exec -T db psql -U "$PG_USER" -d "$PG_DB" -q -c "
select 'user_sessions' as 表, count(*) as 剩余行数 from user_sessions
union all select 'email_login_codes', count(*) from email_login_codes
union all select 'app_users', count(*) from app_users
union all select 'practice_attempts', count(*) from practice_attempts;"
