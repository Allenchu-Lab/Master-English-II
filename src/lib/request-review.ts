import { runtimeTokens } from "@/styles/runtime-tokens";
import type { ReviewStage } from "@/lib/review-stream";

type ReviewResponse = { ok: boolean; data: unknown };
type ProgressListener = (stage: ReviewStage) => void;
type PendingReview = { promise: Promise<ReviewResponse>; listeners: Set<ProgressListener>; stage?: ReviewStage };
const pending = new Map<string, PendingReview>();

function notify(listener: ProgressListener, stage: ReviewStage) {
  // A detached view must not break another subscriber's shared request.
  try { listener(stage); } catch { /* The result is still delivered. */ }
}

export function requestReview(path: string, body: string | Record<string, unknown>, onProgress: ProgressListener): Promise<ReviewResponse> {
  const json = JSON.stringify(typeof body === "string" ? { attemptId: body } : body);
  const key = `${path}:${json}`;
  const existing = pending.get(key);
  if (existing) {
    existing.listeners.add(onProgress);
    if (existing.stage !== undefined) notify(onProgress, existing.stage);
    return existing.promise;
  }
  const listeners = new Set([onProgress]);
  const entry: PendingReview = { listeners, promise: Promise.resolve({ ok: false, data: null }) };
  entry.promise = runReview(path, json, stage => {
    entry.stage = stage;
    for (const listener of listeners) notify(listener, stage);
  }).finally(() => {
    if (pending.get(key) === entry) pending.delete(key);
    listeners.clear();
  });
  pending.set(key, entry);
  return entry.promise;
}

async function runReview(path: string, json: string, onProgress: ProgressListener): Promise<ReviewResponse> {
  try {
    const response = await fetch(path, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" },
      body: json, signal: AbortSignal.timeout(90_000),
    });
    if (!response.headers.get("content-type")?.includes("application/x-ndjson")) return { ok: response.ok, data: await response.json() };
    if (!response.body) throw new Error("Missing review stream");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let result: ReviewResponse | undefined;
    try {
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (Number.isInteger(event.stage) && event.stage >= 0 && event.stage <= 4) onProgress(event.stage);
          if (typeof event.ok === "boolean") result = { ok: event.ok, data: event.data };
        }
        if (done) break;
      }
    } finally { reader.releaseLock(); }
    if (!result) throw new Error("Incomplete review stream");
    if (result.ok) {
      // Let the completed bar paint before replacing it with the result.
      const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reducedMotion) await new Promise(resolve => setTimeout(resolve, runtimeTokens.motion.duration.reviewComplete * 1000));
    }
    return result;
  } catch (error) {
    const timedOut = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
    return { ok: false, data: { error: timedOut ? "AI 请求超时，请稍后重试。" : "AI 连接中断，请重试。" } };
  }
}
