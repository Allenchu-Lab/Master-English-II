# 国内测试环境部署

服务器只需保留 Nginx、Docker 和 Git。PostgreSQL 不开放公网端口，应用仅通过本机 `127.0.0.1:3000` 提供给 Nginx。

```bash
cd /opt/master-english
cp .env.production.example .env.production
nano .env.production
docker compose up -d --build
sudo cp deploy/nginx/master-english.conf /etc/nginx/sites-available/master-english
sudo ln -sf /etc/nginx/sites-available/master-english /etc/nginx/sites-enabled/master-english
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

更新版本：

```bash
cd /opt/master-english
git pull --ff-only
docker compose up -d --build
```

检查状态：

```bash
docker compose ps
curl http://127.0.0.1:3000/api/health
```

`.env.production` 不得提交到 GitHub。测试环境使用公网 IP 时设置 `COOKIE_SECURE=false`；绑定域名并启用 HTTPS 后改为 `true`。
