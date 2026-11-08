export async function deepseekFailure(response: Response) {
  const payload = await response.json().catch(() => null) as { error?: { code?: unknown; message?: unknown } } | null;
  const error = payload?.error;
  const code = typeof error?.code === "string" && /^[a-z0-9_-]{1,64}$/i.test(error.code) ? error.code : "unknown";
  const requestId = typeof error?.message === "string" ? error.message.match(/request_id:\s*([a-z0-9-]{8,80})/i)?.[1] : undefined;
  const message = response.status === 401 ? "AI 服务密钥验证失败，请检查配置。"
    : response.status === 402 ? "AI 服务账户额度不足，请联系管理员。"
    : response.status === 429 ? "AI 服务请求较多，请稍后重试。"
    : `DeepSeek 生成服务返回 ${response.status}（${code}），请稍后重试。`;
  return { message, status: response.status, code, requestId };
}
