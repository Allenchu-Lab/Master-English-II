import { deepseekFailure } from "@/lib/deepseek-error";
import { callDeepseek } from "@/lib/deepseek-client";
import { deepseekModel } from "@/lib/deepseek-config";
import { reviewStream, type ReportReviewProgress } from "@/lib/review-stream";
import { WRITING_RUBRIC } from '@/lib/review-rubrics';
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guard";
import { isUuid } from "@/lib/uuid";
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

const AI_TIMEOUT_MS = 75_000;

export async function POST(request: Request, context: Context) {
  return reviewStream(request, report => runReview(request, context, report));
}

async function runReview(request: Request, { params }: Context, report: ReportReviewProgress) {
  if (rateLimit(`writing-review:${clientKey(request)}`, { max: 10, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "批改请求较多，请稍后再试。" }, { status: 429 });
  }
  const { taskId } = await params;
  if (!isUuid(taskId)) return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  const body = await request.json().catch(() => null) as { attemptId?: unknown } | null;
  if (typeof body?.attemptId !== "string" || !isUuid(body.attemptId)) {
    return NextResponse.json({ error: "Invalid attempt" }, { status: 400 });
  }
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  report(0);
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

  report(1);
  let response: Response;
  let data: { choices?: { message?: { content?: string } }[] };
  try {
    response = await callDeepseek({
        temperature: 0.15,
        messages: [
          {
            role: "system",
            content: `你是严谨的考研英语二写作阅卷老师。根据五档评分法批改，不生成独立范文，只基于考生原文做最小必要修改。${WRITING_RUBRIC}返回纯JSON：score（数字，可含0.5）、maxScore、band（1-5，5为最高档）、summary（中文一句话）、nextBandGap（中文，说明升到上一档最优先改什么）、deductions（最多8项，每项含original原文片段、category且只能为task/grammar/wording/cohesion/format/length、reason中文扣分原因、suggestion推荐改法、impact预计失分数字）、revisedAnswer（保留原观点和结构的提分版本；Part A按题目文体保留应用文格式；书信用换行明确区分称呼、正文段落、结束语和署名）、expressions（3-5项，每项含original、rewrite、pattern可迁移句型骨架、useCases中文主题数组）。不得虚构原文中不存在的错误；表达建议应自然、可记忆、可跨主题复用。`,
          },
          {
            role: "user",
            content: `题型：Part ${attempt.part}\n满分：${attempt.points}\n目标词数：${attempt.target_words}\n题目：\n${attempt.prompt}\n图表信息：${JSON.stringify(attempt.chart)}\n\n考生原文：\n${attempt.answer}`,
          },
        ],
      }, AbortSignal.timeout(AI_TIMEOUT_MS));
    if (!response.ok) {
      const failure = await deepseekFailure(response);
      logWarn("writing_review.upstream_error", { ...failure, model: deepseekModel, taskId });
      return NextResponse.json({ error: failure.message }, { status: 502 });
    }
    data = await response.json();
  } catch (error) {
    logError("writing_review.upstream_unreachable", error, { taskId });
    return NextResponse.json({ error: "AI 批改暂时不可用，请稍后重试。" }, { status: 502 });
  }
  report(2);
  try {
    const review = JSON.parse(data.choices?.[0]?.message?.content ?? "") as unknown;
    if (!isWritingReview(review, attempt.points)) throw new Error("Invalid review shape");
    report(3);
    await query("update writing_attempts set review = $1::jsonb, reviewed_at = now(), updated_at = now() where id = $2", [JSON.stringify(review), attempt.id]);
    return NextResponse.json({ review });
  } catch {
    logWarn("writing_review.invalid_response", { taskId });
    return NextResponse.json({ error: "批改结果格式异常，请重试。" }, { status: 502 });
  }
}
