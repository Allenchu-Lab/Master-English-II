# 国内测试环境部署

服务器只需保留 Nginx、Docker 和 Git。PostgreSQL 不开放公网端口，应用仅通过本机 `127.0.0.1:3000` 提供给 Nginx。

## 两个环境变量文件的分工

这一点最容易配错，先看清楚：

- `.env`：只服务于 `docker-compose.yml` 里的 `${POSTGRES_DB}` / `${POSTGRES_USER}` / `${POSTGRES_PASSWORD}` 插值。compose 做插值时**只读 shell 环境和同目录的 `.env`**，服务里的 `env_file:` 不参与插值。这三个值缺失或是占位符，db 会用空密码初始化，app 随后连库报 `auth_failed`。
- `.env.production`：通过 `env_file:` 注入 app 容器，提供 `OTP_SECRET`、`DEEPSEEK_API_KEY`、`SES_*`、`COOKIE_SECURE` 等运行期变量。

`DATABASE_URL` 不需要写在 `.env.production` 里。compose 在服务的 `environment:` 中用 `POSTGRES_*` 拼装并注入，服务级 `environment` 优先级高于 `env_file`，所以文件里写的那份会被忽略。若仍保留，务必让密码段与 `.env` 中的 `POSTGRES_PASSWORD` 一致，否则容易误判故障来源。

## 首次部署

```bash
cd /opt/master-english
cp .env.production.example .env.production
nano .env.production

# 单独准备 compose 插值用的 .env
cat > .env <<'EOF'
POSTGRES_DB=master_english
POSTGRES_USER=master_english
POSTGRES_PASSWORD=
EOF
nano .env                      # 填入真实密码

bash deploy/preflight.sh .env  # 自检：占位符、缺失项、密码一致性
docker compose up -d --build

sudo cp deploy/nginx/master-english.conf /etc/nginx/sites-available/master-english
sudo ln -sf /etc/nginx/sites-available/master-english /etc/nginx/sites-enabled/master-english
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 更新版本

```bash
cd /opt/master-english
git pull --ff-only
docker compose up -d --build
```

## 检查状态

```bash
bash deploy/verify.sh
```

这个脚本依次检查容器状态、应用与数据库连通、导入答案（幂等）、打印每篇文章的答案覆盖情况、验证限流是否生效。任一步失败会说明原因并停下，不会重建容器或删除数据。

也可以单独看连通性：

```bash
docker compose ps
curl -s http://127.0.0.1:3000/api/health   # 期望 {"ok":true}
```

`/api/health` 会真的执行一次 `select 1`，返回 `ok` 即表示应用与数据库都通。密码配错时这里会返回异常而不是 `ok`。

## 备案通过后切换域名与 HTTPS

前置条件：备案已通过，域名解析已指向本机公网 IP（A 记录），且用域名访问 80 端口能打开站点。解析未生效前不要签发证书，验证会失败。

先确认解析已经生效：

```bash
DOMAIN=你的域名
dig +short A "$DOMAIN"            # 应返回本机公网 IP
curl -sI "http://$DOMAIN" | head -1   # 应返回 200
```

签发证书。`--webroot` 方式不需要停 Nginx，验证文件走 `deploy/nginx/master-english.conf` 里已经预留的 `/.well-known/acme-challenge/` 路径：

```bash
sudo apt update && sudo apt install -y certbot
sudo mkdir -p /var/www/certbot
sudo certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" -d "www.$DOMAIN" --agree-tos -m 你的邮箱 --no-eff-email
```

证书签发成功后再换配置。`__DOMAIN__` 是占位符，必须先替换：

```bash
cd /opt/master-english
sed "s/__DOMAIN__/$DOMAIN/g" deploy/nginx/master-english-https.conf | sudo tee /etc/nginx/sites-available/master-english > /dev/null
sudo nginx -t && sudo systemctl reload nginx
```

`nginx -t` 必须通过再 reload。如果它报证书文件不存在，说明上一步签发没成功，此时旧配置仍在运行，站点不会中断。

最后把 cookie 切成仅 HTTPS 传输：

```bash
sed -i 's/^COOKIE_SECURE=.*/COOKIE_SECURE=true/' .env.production
docker compose up -d
```

这一步不能漏。`COOKIE_SECURE=true` 会给会话 cookie 加上 `Secure` 标记，浏览器便不再通过明文 HTTP 发送它。反过来说，**在还没有 HTTPS 时不要提前设成 true**，那样登录态会完全失效。

验证：

```bash
curl -sI "http://$DOMAIN" | head -1                    # 应为 301
curl -sI "https://$DOMAIN/api/health" | head -1        # 应为 200
curl -s "https://$DOMAIN/api/health"                   # 应为 {"ok":true}
```

启用 HTTPS 后，公网 IP 直接访问会被拒绝（返回 444），这是配置里刻意为之：备案要求站点通过备案域名访问。

证书有效期 90 天。certbot 安装时会自带续期定时任务，确认一下并做一次演练：

```bash
systemctl list-timers | grep -i certbot
sudo certbot renew --dry-run
```

HSTS 的 `max-age` 目前故意设成 300 秒。稳定运行一两周后，可在 `master-english-https.conf` 里改成 `31536000` 再重新部署。**在确认证书续期正常之前不要调大**，HSTS 生效期间浏览器会强制走 HTTPS，证书一旦出问题无法临时退回 HTTP。

## 数据库备份

```bash
bash deploy/backup.sh
```

导出到 `/var/backups/master-english/`，gzip 压缩，文件权限 600，保留最近 14 天。脚本先写 `.partial` 再改名，中途失败不会留下半个可用的备份；导出为空也判为失败。

加到每天凌晨 3 点自动执行：

```bash
( crontab -l 2>/dev/null; echo "0 3 * * * cd /opt/master-english && bash deploy/backup.sh >> /var/log/master-english-backup.log 2>&1" ) | crontab -
crontab -l
```

腾讯云的自动快照是整机级别的，和这个不冲突，建议都开：快照防机器故障，这个备份防误删数据、且恢复速度快得多。

从备份恢复（会覆盖现有数据，确认清楚再执行）：

```bash
gunzip -c /var/backups/master-english/master-english-20260817-030000.sql.gz \
  | docker compose exec -T db psql -U "$(awk -F= '/^POSTGRES_USER=/{print $2}' .env)" \
      -d "$(awk -F= '/^POSTGRES_DB=/{print $2}' .env)"
```

## 页面能打开但完全没有交互

症状是页面正常显示，但点击切换语言、题型、年份都没有反应。原因通常是浏览器加载脚本时连接被截断，Turbopack 运行时脚本不完整，后续所有脚本都不会执行。

判断方法（`curl` 单次请求测不出来，因为它不复用连接）：

```bash
bash deploy/check-stability.sh http://你的地址
```

该脚本用无头 Chrome 打开页面并收集控制台错误与失败请求，出现 `ERR_INCOMPLETE_CHUNKED_ENCODING` 即为此问题。

已知成因是 Nginx 配置里声明了 `proxy_http_version 1.1` 却没有清空 `Connection` 头、也没有配置上游连接池。仓库中的两份配置都已修正，确认服务器上生效：

```bash
grep -A2 "upstream master_english_app" /etc/nginx/sites-available/master-english
grep 'proxy_set_header Connection' /etc/nginx/sites-available/master-english
```

两条都应有输出。缺失则重新部署配置：

```bash
sudo cp deploy/nginx/master-english.conf /etc/nginx/sites-available/master-english
sudo nginx -t && sudo systemctl reload nginx
```

## 查看错误日志

应用的错误日志是单行 JSON，输出到容器的标准错误，用 Docker 查看：

```bash
docker compose logs app | grep '"level":"error"'      # 只看故障
docker compose logs app | grep '"level":"warn"'       # 只看外部服务异常
docker compose logs -f app | grep '"event":'          # 实时跟踪
docker compose logs app | grep '"event":"submit.failed"'   # 按事件筛选
```

常见事件名与含义：

| 事件 | 含义 | 处理方向 |
|---|---|---|
| `submit.failed` | 判分出现非预期故障 | 看 `pgCode` 和 `pgConstraint`，通常是数据库约束冲突 |
| `submit.keys_unavailable` | 该篇答案未录全 | 不是故障，按 `passageId` 补答案 |
| `auth.send_code_failed` | 验证码发送失败 | 看 `channel` 区分 SES 还是 SMTP，再看 `errorMessage` |
| `dictionary.upstream_error` / `intensive.upstream_error` | DeepSeek 返回非 200 | 看 `status`，401 是密钥失效，429 是额度耗尽 |
| `*.upstream_timeout` | DeepSeek 超时 | 偶发可忽略，频繁出现说明上游不稳 |
| `*.upstream_unreachable` | 连不上 DeepSeek | 检查服务器出网 |

日志刻意不记录密码、密钥、会话 token 和验证码原文。邮箱以 `a***@example.com` 的形式记录，能区分是哪个用户报错，但无法还原完整地址。

## 清理过期数据

```bash
bash deploy/cleanup.sh
```

删除已过期的会话、24 小时以前的验证码、以及从未作答过的陈旧匿名账号，执行完会打印各表剩余行数。这两张表只增不减，长期不清理会让登录时的查询变慢。

验证码保留 24 小时而不是一过期就删，是因为发码接口用 24 小时内的记录数来限制单个邮箱的发送次数，删太早这道防轰炸的闸门就失效了。

加到每周日凌晨 4 点：

```bash
( crontab -l 2>/dev/null; echo "0 4 * * 0 cd /opt/master-english && bash deploy/cleanup.sh >> /var/log/master-english-cleanup.log 2>&1" ) | crontab -
```

## 修改数据库密码

Postgres 密码在数据卷**首次初始化时固化**，之后改 `.env` 不会改变库里已有的密码。若密码已经配错并且已经初始化过，测试环境可直接清卷重建（会清掉全部练习记录）：

```bash
docker compose down -v && docker compose up -d --build
```

## 录入答案与解析

判分数据不写在代码里，来源是 `content/answer-keys/<年份>.json`。新增年份不需要改任何代码：

1. 在 `content/answer-keys/` 下新建或编辑该年份的 JSON 文件。每道题填五项：`number`（题号）、`answer`（A/B/C/D）、`promptZh`（题干中译）、`optionsZh`（四条选项中译，顺序对应 A、B、C、D）、`explanation`（解析）。
2. 本地运行 `npm run build:keys` 生成 `deploy/postgres/003-grading.sql`。生成前会校验答案字母、选项条数、题号重复、空字段，任一项不合格就中止且不产出文件。
3. 提交这两个文件，服务器 `git pull` 后应用 SQL。

生成的 SQL 是幂等的：同一题重复导入会更新而不是报错，所以改完错别字可以直接重跑，不需要先删数据。

已经初始化过的数据库应用增量：

```bash
docker compose exec -T db psql \
  -U "$(awk -F= '/^POSTGRES_USER=/{print $2}' .env)" \
  -d "$(awk -F= '/^POSTGRES_DB=/{print $2}' .env)" < deploy/postgres/003-grading.sql
```

答案只写入 `private` 库中的 `question_keys` 表，不写入应用渲染题目时读取的 `questions` 表，避免答案随题目一起下发到浏览器。前端在提交后才会拿到正确选项与解析。

只要某篇文章的答案没有录全，首页会把它标为「答案待录入 / 暂未开放」并且不允许作答，因为提交时会因缺少答案而无法判分。录入并应用 SQL 后，该篇自动变为可练习，不需要改代码或重启。

## 重新灌题库数据

`deploy/postgres/*.sql` 和 `supabase/seed.sql` 挂在 `docker-entrypoint-initdb.d`，只在数据卷为空时执行一次。补充答案或题目数据时，`docker compose up -d --build` 不会重跑这些脚本，需要清卷重建，或直接灌增量 SQL：

```bash
docker compose exec -T db psql -U master_english -d master_english < 增量文件.sql
```

## 其他注意事项

- `.env` 与 `.env.production` 都不得提交到 GitHub，`.dockerignore` 已排除 `.env*`，不会进镜像。
- 测试环境使用公网 IP 时设置 `COOKIE_SECURE=false`；绑定域名并启用 HTTPS 后改为 `true`。
- 安全组只放 80。compose 未发布 db 端口，app 只绑 `127.0.0.1:3000`，不要额外开放 5432。
- `deploy/nginx/master-english.conf` 里的 `X-Forwarded-For $proxy_add_x_forwarded_for` 与应用限流取「最后一跳」的逻辑配套，不要改动。若后续在 Nginx 前再加一层 CLB，最后一跳会变成 CLB 内网 IP，届时限流实现需同步调整。
- 应用是匿名优先的，不登录即可做题与精读，因此 SES 未配置不影响内测主流程。
