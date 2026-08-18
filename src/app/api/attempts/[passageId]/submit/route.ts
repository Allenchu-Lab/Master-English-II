import { NextResponse } from "next/server";
import { getOrCreateSessionUser } from "@/lib/auth/session";
import { transaction } from "@/lib/db";
import { hasCompleteAnswers, KEYS_SQL, PUBLISHED_QUESTION_COUNT_SQL, toGradeResult, type KeyRow } from "@/data/grade-attempt";
import { logError, logWarn } from "@/lib/log";

/**
 * 判分过程中可预期的失败。这几种是调用方或数据状态的问题，
 * 各自对应不同的状态码；除此以外的异常都属于服务端故障。
 */
const EXPECTED = {
  ATTEMPT_NOT_FOUND: { status: 404, message: "这次练习记录已失效，请返回重新开始。" },
  KEYS_UNAVAILABLE: { status: 409, message: "这篇的答案尚未录入，暂未开放练习。" },
  INCOMPLETE: { status: 400, message: "请完成全部题目后再提交。" },
} as const;

type ExpectedCode = keyof typeof EXPECTED;

const isExpected = (value: unknown): value is ExpectedCode => typeof value === "string" && value in EXPECTED;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request, { params }: { params: Promise<{ passageId: string }> }) {
  const { passageId } = await params;
  if (!UUID_PATTERN.test(passageId)) return NextResponse.json({ error: "Invalid passage" }, { status: 400 });
  const user = await getOrCreateSessionUser();
  const { attemptId, answers } = await request.json() as { attemptId?: string; answers?: Record<string, number> };
  if (!attemptId || !answers || Array.isArray(answers)) return NextResponse.json({ error: "请完成全部题目后再提交。" }, { status: 400 });

  try {
    const result = await transaction(async (client) => {
      const attempt = await client.query("select 1 from practice_attempts where id = $1 and user_id = $2 and passage_id = $3 and submitted_at is null for update", [attemptId, user.id, passageId]);
      if (!attempt.rowCount) throw new Error("ATTEMPT_NOT_FOUND");
      const keys = await client.query<KeyRow>(KEYS_SQL, [passageId]);
      const questionCount = await client.query<{ count: string }>(PUBLISHED_QUESTION_COUNT_SQL, [passageId]);
      if (!keys.rowCount || keys.rowCount !== Number(questionCount.rows[0].count)) throw new Error("KEYS_UNAVAILABLE");
      if (!hasCompleteAnswers(keys.rows, answers)) throw new Error("INCOMPLETE");
      const result = toGradeResult(keys.rows, answers);
      await client.query("update practice_attempts set answers = $1, submitted_at = now(), score = $2 where id = $3", [answers, result.score, attemptId]);
      return result;
    });
    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (isExpected(code)) {
      // 答案缺失属于内容未录入，不是故障，但需要能看出是哪篇缺。
      if (code === "KEYS_UNAVAILABLE") logWarn("submit.keys_unavailable", { passageId });
      const { status, message } = EXPECTED[code];
      return NextResponse.json({ error: message }, { status });
    }
    // 走到这里说明是真的服务端故障，例如约束冲突或数据库不可用。
    // 之前这类错误被伪装成 400，日志里没有任何痕迹，无法排查。
    logError("submit.failed", error, { passageId, attemptId, userId: user.id });
    return NextResponse.json({ error: "判分服务出现异常，请稍后重试。" }, { status: 500 });
  }
}
