import "server-only";

/**
 * 进程内滑动窗口限流。
 *
 * 适用场景：单实例自托管部署（本项目 docker-compose 单副本）。
 * 多实例 / Serverless 部署时应替换为共享存储（Redis / Postgres）实现，
 * 否则各实例独立计数，限流会被实例数稀释。
 *
 * 注意：进程内限流不是安全边界，只用于防滥用、控成本；
 * 真正的鉴权（邮箱登录）由数据库 + session 承担。
 */

const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const BUCKET_CAP = 20_000;

type Bucket = { timestamps: number[]; lastSeen: number };

const buckets = new Map<string, Bucket>();

let lastCleanup = 0;

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastSeen > CLEANUP_INTERVAL_MS) buckets.delete(key);
  }
  // 兜底：极端情况下 Map 仍异常膨胀时整体重置，避免内存泄漏拖垮进程
  if (buckets.size > BUCKET_CAP) buckets.clear();
}

/**
 * 为 key 记一次访问。若窗口内已超过 max 次则返回 true（调用方应返回 429）。
 */
export function rateLimit(key: string, { max, windowMs }: { max: number; windowMs: number }): boolean {
  const now = Date.now();
  cleanup(now);
  const bucket = buckets.get(key) ?? { timestamps: [], lastSeen: now };
  const windowStart = now - windowMs;
  bucket.timestamps = bucket.timestamps.filter((time) => time > windowStart);
  const limited = bucket.timestamps.length >= max;
  if (!limited) bucket.timestamps.push(now);
  bucket.lastSeen = now;
  buckets.set(key, bucket);
  return limited;
}

/**
 * 从请求头提取客户端标识，用于限流 key。
 *
 * 只取 X-Forwarded-For 的最后一跳：前置反向代理（Nginx / Caddy）必须
 * 覆盖该头（proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for），
 * 此时最后一跳是真实客户端 IP；直接取第一跳会允许客户端伪造绕过限流。
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const entries = forwarded.split(",").map((part) => part.trim()).filter(Boolean);
    const last = entries.at(-1);
    if (last) return last;
  }
  return "unknown";
}
