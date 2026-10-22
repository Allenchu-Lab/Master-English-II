import { NextResponse } from "next/server";
import { getOrCreateSessionUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { logError, logWarn } from "@/lib/log";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { isWritingReview, type WritingReview } from "@/lib/writing-review";

type Context = { params: Promise<{ taskId: string }> };
type ReviewRow = {
  id: string;
  answer: string;
  review: WritingReview | null;
  part: "A" | "B";
  prompt: string;
  points: number;
  target_words: number;
  chart: unknown;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AI_TIMEOUT_MS = 75_000;

export async function POST(request: Request, { params }: Context) {
  if (rateLimit(`writing-review:${clientKey(request)}`, { max: 10, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "批改请求较多，请稍后再试。" }, { status: 429 });
  }
  const { taskId } = await params;
  if (!UUID_PATTERN.test(taskId)) return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  const body = await request.json().catch(() => null) as { attemptId?: unknown } | null;
  if (typeof body?.attemptId !== "string" || !UUID_PATTERN.test(body.attemptId)) {
    return NextResponse.json({ error: "Invalid attempt" }, { status: 400 });
  }
  const user = await getOrCreateSessionUser();
  const result = await query<ReviewRow>(`
    select a.id, a.answer, a.review, t.part, t.prompt, t.points, t.target_words, t.chart
    from writing_attempts a join writing_tasks t on t.id = a.task_id
    where a.user_id = $1 and a.task_id = $2 and a.id = $3 and a.submitted_at is not null
  `, [user.id, taskId, body.attemptId]);
  const attempt = result.rows[0];
  if (!attempt) return NextResponse.json({ error: "Submitted writing not found" }, { status: 404 });
  if (attempt.review) return NextResponse.json({ review: attempt.review });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI 批改服务尚未配置。" }, { status: 503 });

  let response: Response;
  try {
    response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.15,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `你是严谨的考研英语二写作阅卷老师。根据五档评分法批改，不生成独立范文，只基于考生原文做最小必要修改。A节满分10分：第五档9-10，第四档7至不足9，第三档5至不足7，第二档3至不足5，第一档不足3。B节满分15分：第五档13-15，第四档10至不足13，第三档7至不足10，第二档4至不足7，第一档不足4。先按各档标准评估，再给档内分数；若给0.5分，必须使用对应的档次，A节7.5属于第四档，B节7.5属于第三档。重点考察任务完成、语言准确与丰富、组织连贯、格式与语域。返回纯JSON：score（数字，可含0.5）、maxScore、band（1-5，5为最高档）、summary（中文一句话）、nextBandGap（中文，说明升到上一档最优先改什么）、deductions（最多8项，每项含original原文片段、category且只能为task/grammar/wording/cohesion/format/length、reason中文扣分原因、suggestion推荐改法、impact预计失分数字）、revisedAnswer（保留原观点和结构的提分版本；Part A必须保留应用文格式，用换行明确区分称呼、正文段落、结束语和署名）、expressions（3-5项，每项含original、rewrite、pattern可迁移句型骨架、useCases中文主题数组）。扣分总量与最终得分应大致一致；不得虚构原文中不存在的错误；表达建议应自然、可记忆、可跨主题复用。`,
          },
          {
            role: "user",
            content: `题型：Part ${attempt.part}\n满分：${attempt.points}\n目标词数：${attempt.target_words}\n题目：\n${attempt.prompt}\n图表信息：${JSON.stringify(attempt.chart)}\n\n考生原文：\n${attempt.answer}`,
          },
        ],
      }),
    });
  } catch (error) {
    logError("writing_review.upstream_unreachable", error, { taskId });
    return NextResponse.json({ error: "AI 批改暂时不可用，请稍后重试。" }, { status: 502 });
  }
  if (!response.ok) {
    logWarn("writing_review.upstream_error", { status: response.status, taskId });
    return NextResponse.json({ error: "AI 批改暂时不可用，请稍后重试。" }, { status: 502 });
  }
  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  try {
    const review = JSON.parse(data.choices?.[0]?.message?.content ?? "") as unknown;
    if (!isWritingReview(review, attempt.points)) throw new Error("Invalid review shape");
    await query("update writing_attempts set review = $1::jsonb, reviewed_at = now(), updated_at = now() where id = $2", [JSON.stringify(review), attempt.id]);
    return NextResponse.json({ review });
  } catch {
    logWarn("writing_review.invalid_response", { taskId });
    return NextResponse.json({ error: "批改结果格式异常，请重试。" }, { status: 502 });
  }
}
