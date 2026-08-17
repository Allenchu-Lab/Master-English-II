#!/usr/bin/env bash
# 部署后通路验证。在服务器项目根目录运行：bash deploy/verify.sh
#
# 只做检查和一次幂等的答案导入，不会重建容器、不会删除数据。
# 任一步失败会打印原因并停下，不继续往后跑。

set -uo pipefail

ENV_FILE=".env"
GRADING_SQL="deploy/postgres/003-grading.sql"
HEALTH_URL="http://127.0.0.1:3000/api/health"

step() { printf '\n=== %s ===\n' "$1"; }
ok()   { printf '  [ OK ] %s\n' "$1"; }
bad()  { printf '  [FAIL] %s\n' "$1"; }

die() { bad "$1"; printf '\n验证中断。修复后重新运行。\n'; exit 1; }

[ -f docker-compose.yml ] || die "当前目录不是项目根目录，找不到 docker-compose.yml"
[ -f "$ENV_FILE" ] || die "找不到 $ENV_FILE，compose 插值会拿到空值"

PG_USER="$(awk -F= '/^POSTGRES_USER=/{print $2}' "$ENV_FILE")"
PG_DB="$(awk -F= '/^POSTGRES_DB=/{print $2}' "$ENV_FILE")"
[ -n "$PG_USER" ] && [ -n "$PG_DB" ] || die "$ENV_FILE 里 POSTGRES_USER 或 POSTGRES_DB 为空"

psql_run() { docker compose exec -T db psql -U "$PG_USER" -d "$PG_DB" -v ON_ERROR_STOP=1 "$@"; }

step "1/5 容器状态"
docker compose ps || die "docker compose ps 执行失败"

step "2/5 应用与数据库连通"
health="$(curl -s --max-time 10 "$HEALTH_URL" || true)"
case "$health" in
  *'"ok":true'*) ok "$HEALTH_URL 返回 $health" ;;
  "") die "$HEALTH_URL 无响应。app 容器可能未启动，看 docker compose logs app" ;;
  *) die "$HEALTH_URL 返回异常：$health（数据库密码不匹配通常是这个表现）" ;;
esac

step "3/5 导入答案与解析（幂等，可重复运行）"
[ -f "$GRADING_SQL" ] || die "找不到 $GRADING_SQL，先在本地跑 npm run build:keys 并提交"
if psql_run < "$GRADING_SQL"; then
  ok "已应用 $GRADING_SQL"
else
  die "应用 $GRADING_SQL 失败，错误见上方输出"
fi

step "4/5 答案覆盖情况"
psql_run -c "
select p.year,
       g.passage_number as text_no,
       count(distinct q.id) as questions,
       count(distinct k.question_id) as answer_keys,
       case when count(distinct q.id) > 0
             and count(distinct q.id) = count(distinct k.question_id)
            then '可练习' else '待录入' end as status
from passages g
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
left join questions q on q.passage_id = g.id and q.status = 'published'
left join private.question_keys k on k.question_id = q.id
group by p.year, g.passage_number
order by p.year, g.passage_number;" || die "查询答案覆盖失败"

step "5/5 限流是否生效"
printf '  连续请求查词接口 22 次，前 20 次应为 400，之后应出现 429\n'
codes=""
for _ in $(seq 1 22); do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 \
    -X POST http://127.0.0.1/api/dictionary \
    -H 'Content-Type: application/json' -d '{}' || echo 000)"
  codes="$codes $code"
done
printf '  返回码：%s\n' "$codes"
case "$codes" in
  *429*) ok "限流生效，出现 429" ;;
  *000*) bad "请求未送达 80 端口，确认 Nginx 已配置并在运行" ;;
  *) bad "未出现 429。若本机 IP 的额度已在 10 分钟内用掉，可 docker compose restart app 后重试" ;;
esac

printf '\n检查完成。接下来在浏览器里走一遍：2026 Text 1 应可作答并判分，\n'
printf '其余篇目应显示「答案待录入」且点不进去。\n'
