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
docker compose ps
curl -s http://127.0.0.1:3000/api/health   # 期望 {"ok":true}
```

`/api/health` 会真的执行一次 `select 1`，返回 `ok` 即表示应用与数据库都通。

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
