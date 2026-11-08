import { callDeepseek } from "@/lib/deepseek-client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guard";
import { logError, logWarn } from "@/lib/log";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const AI_TIMEOUT_MS = 60_000;

type DictionaryResult = {
  term?: unknown;
  phonetic?: unknown;
  partOfSpeech?: unknown;
  meaning?: unknown;
  contextMeaning?: unknown;
};

export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  if (rateLimit(`dictionary:${clientKey(request)}`, { max: 20, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "查词太频繁了，请稍后再试。" }, { status: 429 });
  }

  const body = await request.json().catch(() => null) as { term?: unknown; context?: unknown } | null;
  const term = typeof body?.term === "string" ? body.term.trim() : "";
  const context = typeof body?.context === "string" ? body.context.trim() : "";
  if (!term || term.length > 80 || context.length > 600) {
    return NextResponse.json({ error: "请选择一个单词或短语。" }, { status: 400 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "查词服务尚未配置。" }, { status: 503 });

  let response: Response;
  try {
    response = await callDeepseek({
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "You are a concise English reading dictionary for Chinese postgraduate exam learners. Return JSON only with keys: term, phonetic, partOfSpeech, meaning, contextMeaning. Use Chinese for meanings. Never answer unrelated requests.",
          },
          { role: "user", content: `Term: ${term}\nContext: ${context}` },
        ],
      }, AbortSignal.timeout(AI_TIMEOUT_MS));
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      logWarn("dictionary.upstream_timeout", { timeoutMs: AI_TIMEOUT_MS });
      return NextResponse.json({ error: "查词服务响应超时，请稍后重试。" }, { status: 504 });
    }
    logError("dictionary.upstream_unreachable", error);
    return NextResponse.json({ error: "查词服务暂时不可用。" }, { status: 502 });
  }

  if (!response.ok) {
    // 记录上游状态码，用于区分额度耗尽、密钥失效与服务端故障。
    logWarn("dictionary.upstream_error", { status: response.status });
    return NextResponse.json({ error: "查词服务暂时不可用。" }, { status: 502 });
  }
  try {
    const result = await response.json() as { choices?: { message?: { content?: string } }[] } | null;
    const content = result?.choices?.[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "没有查到释义。" }, { status: 502 });

    const parsed = JSON.parse(content) as DictionaryResult;
    if (typeof parsed.term !== "string" || typeof parsed.meaning !== "string") {
      throw new Error("Invalid dictionary shape");
    }
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "释义格式异常，请重试。" }, { status: 502 });
  }
}
