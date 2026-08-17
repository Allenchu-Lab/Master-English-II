import "server-only";

/**
 * 服务端结构化日志。
 *
 * 每条日志是单行 JSON，输出到 stderr，由 Docker 收集，
 * 用 `docker compose logs app` 查看，可直接 grep event 名筛选。
 *
 * 只记录排查所需的最小信息。禁止写入密码、密钥、会话 token、
 * 验证码原文和完整邮箱地址；邮箱一律用 maskEmail 处理后再记录。
 */

type LogContext = Record<string, string | number | boolean | null | undefined>;

/**
 * 把邮箱转成可用于排查但无法还原的形式：a***@example.com。
 * 日志需要能区分"是哪个用户在报错"，但没必要留存完整地址。
 */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at <= 0) return "***";
  return `${email[0]}***${email.slice(at)}`;
}

function write(level: "error" | "warn", event: string, context: LogContext, error?: unknown) {
  const entry: Record<string, unknown> = {
    time: new Date().toISOString(),
    level,
    event,
    ...context,
  };

  if (error !== undefined) {
    if (error instanceof Error) {
      entry.errorName = error.name;
      entry.errorMessage = error.message;
      // Postgres 的错误码是定位约束冲突、类型错误的关键线索。
      const code = (error as { code?: unknown }).code;
      if (typeof code === "string") entry.pgCode = code;
      const constraint = (error as { constraint?: unknown }).constraint;
      if (typeof constraint === "string") entry.pgConstraint = constraint;
      if (error.stack) entry.stack = error.stack.split("\n").slice(0, 6).join(" | ");
    } else {
      entry.errorMessage = String(error);
    }
  }

  // 单行输出，避免多行堆栈在日志聚合时被切碎。
  process.stderr.write(`${JSON.stringify(entry)}\n`);
}

/** 记录意料之外的故障。这类日志出现就代表服务端有问题，需要人去看。 */
export function logError(event: string, error: unknown, context: LogContext = {}) {
  write("error", event, context, error);
}

/** 记录预期内但值得关注的情况，例如外部服务不可用、配置缺失。 */
export function logWarn(event: string, context: LogContext = {}, error?: unknown) {
  write("warn", event, context, error);
}
