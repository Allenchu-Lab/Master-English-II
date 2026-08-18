#!/usr/bin/env bash
# 前端稳定性检查：用无头 Chrome 打开页面，收集控制台错误与失败的资源请求。
#
# 用法：bash deploy/check-stability.sh http://115.159.64.112
#
# 为什么需要它：连接复用引起的响应截断只在浏览器行为下出现，curl 每次新建
# 连接，单发请求一切正常，因此这类"页面能打开但完全没有交互"的故障用 curl
# 测不出来。本脚本重复加载多次，用于确认稳定性而不是只看一次成功。

set -uo pipefail

TARGET="${1:-http://127.0.0.1}"
ROUNDS="${2:-3}"
PORT=9333
PROFILE="$(mktemp -d)"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || CHROME="$(command -v google-chrome || command -v chromium || true)"
[ -n "$CHROME" ] && [ -x "$CHROME" ] || { echo "未找到 Chrome，无法执行本检查" >&2; exit 1; }
command -v node >/dev/null || { echo "需要 node" >&2; exit 1; }

"$CHROME" --headless=new --disable-gpu --remote-debugging-port=$PORT \
  --user-data-dir="$PROFILE" --no-first-run about:blank >/dev/null 2>&1 &
CHROME_PID=$!
# 先等 Chrome 退出再删配置目录，否则它仍在写文件会导致删除失败。
trap 'kill $CHROME_PID 2>/dev/null; wait $CHROME_PID 2>/dev/null; rm -rf "$PROFILE" 2>/dev/null' EXIT

for _ in $(seq 1 20); do
  curl -s --max-time 2 "http://127.0.0.1:$PORT/json/version" >/dev/null 2>&1 && break
  sleep 0.5
done

FAILED=0
for round in $(seq 1 "$ROUNDS"); do
  printf '\n=== 第 %s/%s 次加载 %s ===\n' "$round" "$ROUNDS" "$TARGET"
  # 每次用新标签页并禁用缓存，确保真的重新走一遍网络。
  OUT="$(PORT=$PORT TARGET="$TARGET" node -e '
    const port = process.env.PORT, target = process.env.TARGET;
    (async () => {
      const t = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(target)}`, { method: "PUT" })).json();
      const ws = new WebSocket(t.webSocketDebuggerUrl);
      const urls = new Map(); const problems = [];
      let id = 0; const send = (m, p = {}) => ws.send(JSON.stringify({ id: ++id, method: m, params: p }));
      ws.onopen = () => { send("Network.enable"); send("Network.setCacheDisabled", { cacheDisabled: true }); send("Runtime.enable"); };
      ws.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (m.method === "Network.requestWillBeSent") urls.set(m.params.requestId, m.params.request.url);
        if (m.method === "Network.loadingFailed") problems.push(`${m.params.errorText}  ${urls.get(m.params.requestId) ?? "?"}`);
        if (m.method === "Runtime.exceptionThrown") problems.push(`页面异常: ${(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text ?? "").slice(0, 200)}`);
      };
      await new Promise((r) => setTimeout(r, 9000));
      await fetch(`http://127.0.0.1:${port}/json/close/${t.id}`);
      console.log(problems.length ? problems.join("\n") : "OK");
      process.exit(0);
    })();
  ' 2>&1)"
  if [ "$OUT" = "OK" ]; then
    echo "  未发现问题"
  else
    echo "$OUT" | sed 's/^/  /'
    FAILED=1
  fi
done

printf '\n'
if [ "$FAILED" -ne 0 ]; then
  printf '检查未通过。出现 ERR_INCOMPLETE_CHUNKED_ENCODING 时，参见 deploy/README.md\n'
  printf '中「页面能打开但完全没有交互」一节。\n'
  exit 1
fi
printf '%s 次加载均无控制台错误与失败请求。\n' "$ROUNDS"
