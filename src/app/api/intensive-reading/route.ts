import { callDeepseek } from "@/lib/deepseek-client";
import { reviewStream, type ReportReviewProgress } from "@/lib/review-stream";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guard";
import { logError, logWarn } from "@/lib/log";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const AI_TIMEOUT_MS = 60_000;

type ParagraphAnalysis = {
  summary?: unknown;
  translation?: unknown;
  structure?: unknown;
  vocabulary?: unknown;
  examTip?: unknown;
};

export async function POST(request: Request) {
  return reviewStream(request, report => runAnalysis(request, report));
}

async function runAnalysis(request: Request, report: ReportReviewProgress) {
  report(0);
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  if (rateLimit(`intensive:${clientKey(request)}`, { max: 30, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "精读解析请求太频繁了，请稍后再试。" }, { status: 429 });
  }

  const body = await request.json().catch(() => null) as { paragraph?: unknown; year?: unknown; text?: unknown; paragraphNumber?: unknown } | null;
  const paragraph = typeof body?.paragraph === "string" ? body.paragraph.trim() : "";
  const year = typeof body?.year === "number" ? body.year : 0;
  const text = typeof body?.text === "number" ? body.text : 0;
  const paragraphNumber = typeof body?.paragraphNumber === "number" ? body.paragraphNumber : 0;
  if (!paragraph || paragraph.length > 4000 || !Number.isInteger(year) || !Number.isInteger(text) || !Number.isInteger(paragraphNumber)) {
    return NextResponse.json({ error: "精读段落参数无效。" }, { status: 400 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI 精读服务尚未配置。" }, { status: 503 });

  report(1);
  let response: Response;
  let result: { choices?: { message?: { content?: string } }[] };
  const signal = AbortSignal.timeout(AI_TIMEOUT_MS);
  try {
    for (let retry = 0; ; retry++) {
    response = await callDeepseek({
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "你是一名严谨的考研英语二阅读精读老师。只分析用户给出的原文，不补造背景事实。返回 JSON，字段必须为 summary（中文段意，一句话）、translation（准确自然的中文译文）、structure（数组，每项含 original 和 explanation，选择最多2个关键长难句并讲清主干与从句关系）、vocabulary（数组，每项含 term 和 meaning，最多6个本段重要词或短语，释义需结合语境）、examTip（中文命题提示；若本段没有明显命题点，说明其篇章作用）。不要使用 Markdown。",
          },
          { role: "user", content: `${year} 年英语二 Text ${text}，第 ${paragraphNumber} 段：\n${paragraph}` },
        ],
      }, signal);
    if (retry === 0 && [500, 502, 503, 504].includes(response.status)) {
      logWarn("intensive.upstream_retry", { status: response.status, year, text });
      await response.body?.cancel();
      continue;
    }
    break;
    }
    if (!response.ok) {
      logWarn("intensive.upstream_error", { status: response.status, year, text });
      const error = response.status === 402 ? "AI 服务账户额度不足，请联系管理员。"
        : response.status === 401 ? "AI 服务密钥验证失败，请检查配置。"
        : response.status === 429 ? "AI 服务请求较多，请稍后重试。"
        : "AI 服务暂时异常，请稍后重试。";
      return NextResponse.json({ error }, { status: 502 });
    }
    result = await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      logWarn("intensive.upstream_timeout", { timeoutMs: AI_TIMEOUT_MS, year, text });
      return NextResponse.json({ error: "AI 服务响应超时，请稍后重试。" }, { status: 504 });
    }
    logError("intensive.upstream_unreachable", error, { year, text });
    return NextResponse.json({ error: "AI 精读服务暂时不可用。" }, { status: 502 });
  }

  report(2);
  const content = result.choices?.[0]?.message?.content;
  if (!content) return NextResponse.json({ error: "AI 没有返回精读内容。" }, { status: 502 });

  try {
    const analysis = JSON.parse(content) as ParagraphAnalysis;
    const structureValid = Array.isArray(analysis.structure)
      && analysis.structure.every((item) => typeof item === "object" && item !== null
        && typeof (item as { original?: unknown }).original === "string"
        && typeof (item as { explanation?: unknown }).explanation === "string");
    const vocabularyValid = Array.isArray(analysis.vocabulary)
      && analysis.vocabulary.every((item) => typeof item === "object" && item !== null
        && typeof (item as { term?: unknown }).term === "string"
        && typeof (item as { meaning?: unknown }).meaning === "string");
    if (typeof analysis.summary !== "string" || typeof analysis.translation !== "string" || !structureValid || !vocabularyValid || typeof analysis.examTip !== "string") {
      throw new Error("Invalid analysis shape");
    }
    report(3);
    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json({ error: "精读内容格式异常，请重试。" }, { status: 502 });
  }
}
