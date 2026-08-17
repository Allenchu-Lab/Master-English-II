#!/usr/bin/env bash
# 数据库备份。在服务器项目根目录运行：bash deploy/backup.sh
#
# 配合 cron 每天执行，保留最近 14 份。备份文件只有本机 root 可读，
# 因为里面包含用户邮箱和练习记录。
#
# 恢复方法见 deploy/README.md。

set -uo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/master-english}"
KEEP_DAYS=14
ENV_FILE=".env"

[ -f docker-compose.yml ] || { echo "当前目录不是项目根目录" >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "找不到 $ENV_FILE" >&2; exit 1; }

PG_USER="$(awk -F= '/^POSTGRES_USER=/{print $2}' "$ENV_FILE")"
PG_DB="$(awk -F= '/^POSTGRES_DB=/{print $2}' "$ENV_FILE")"
[ -n "$PG_USER" ] && [ -n "$PG_DB" ] || { echo "$ENV_FILE 中 POSTGRES_USER 或 POSTGRES_DB 为空" >&2; exit 1; }

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="$BACKUP_DIR/master-english-$STAMP.sql.gz"

# 先写临时文件，成功后再改名，避免 cron 中途失败留下半个可用的备份。
if docker compose exec -T db pg_dump -U "$PG_USER" -d "$PG_DB" | gzip > "$TARGET.partial"; then
  mv "$TARGET.partial" "$TARGET"
  chmod 600 "$TARGET"
else
  rm -f "$TARGET.partial"
  echo "备份失败：pg_dump 未成功完成" >&2
  exit 1
fi

# 空文件说明导出实际失败，直接判为失败而不是留下一个无用备份。
if [ ! -s "$TARGET" ]; then
  rm -f "$TARGET"
  echo "备份失败：导出内容为空" >&2
  exit 1
fi

find "$BACKUP_DIR" -name 'master-english-*.sql.gz' -type f -mtime "+$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name '*.partial' -type f -mtime +1 -delete

echo "备份完成：$TARGET（$(du -h "$TARGET" | cut -f1)）"
echo "现有备份 $(find "$BACKUP_DIR" -name 'master-english-*.sql.gz' -type f | wc -l | tr -d ' ') 份，保留最近 $KEEP_DAYS 天"
