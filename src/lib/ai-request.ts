type AiResponse = { ok: boolean; data: unknown };
const pending = new Map<string, Promise<AiResponse>>();

// Share only in-flight requests with identical content, including the word's context.
export function requestAi(path: "/api/dictionary" | "/api/intensive-reading", body: Record<string, unknown>): Promise<AiResponse> {
  const json = JSON.stringify(body);
  const key = `${path}:${json}`;
  const existing = pending.get(key);
  if (existing) return existing;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 75_000);
  const request = Promise.resolve().then(async () => {
    try {
      const response = await fetch(path, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: json, signal: controller.signal,
      });
      const data: unknown = await response.json();
      return { ok: response.ok, data };
    } finally {
      clearTimeout(timeout);
      pending.delete(key);
    }
  });
  pending.set(key, request);
  return request;
}
