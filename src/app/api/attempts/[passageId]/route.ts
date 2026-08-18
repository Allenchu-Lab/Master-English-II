import { NextResponse } from "next/server";
import { getOrCreateSessionUser } from "@/lib/auth/session";
import { loadGradeResult } from "@/data/grade-attempt";
import { isPassageGradable } from "@/data/passage-gradable";
import { query } from "@/lib/db";

type Context = { params: Promise<{ passageId: string }> };

const MAX_ANSWER_COUNT = 10;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type AttemptRow = { id: string; answers: Record<string, number>; submitted_at: string | null };

const LATEST_ATTEMPT_SQL = "select id, answers, submitted_at from practice_attempts where user_id = $1 and passage_id = $2 order by created_at desc limit 1";

async function createAttempt(userId: string, passageId: string) {
  return query<AttemptRow>(
    "insert into practice_attempts (user_id, passage_id) values ($1, $2) returning id, answers, submitted_at",
    [userId, passageId],
  );
}

export async function GET(_request: Request, { params }: Context) {
  const { passageId } = await params;
  // 非 uuid 会让 Postgres 直接抛类型错误，先挡掉以免返回 500。
  if (!UUID_PATTERN.test(passageId)) return NextResponse.json({ error: "Invalid passage" }, { status: 400 });
  const user = await getOrCreateSessionUser();
  const latest = await query<AttemptRow>(LATEST_ATTEMPT_SQL, [user.id, passageId]);
  const current = latest.rows[0];

  if (current && !current.submitted_at) return NextResponse.json({ attempt: current });

  /**
   * 已提交的记录要连同判分结果一起返回，用于刷新后恢复复盘视图。
   * 之前这里直接新建一条空记录，导致刷新后复盘丢失、退回空白答题页。
   * 重做必须由用户显式发起，走下面的 POST。
   */
  if (current?.submitted_at) {
    const grade = await loadGradeResult(passageId, current.answers ?? {});
    if (grade) return NextResponse.json({ attempt: current, grade });
  }

  // 答案未录入的文章不建练习记录，否则用户答完才在提交环节失败。
  if (!await isPassageGradable(passageId)) {
    return NextResponse.json({ error: "这篇的答案尚未录入，暂未开放练习。" }, { status: 409 });
  }
  const created = await createAttempt(user.id, passageId);
  return NextResponse.json({ attempt: created.rows[0] });
}

/** 重做：显式新建一条练习记录，不影响已提交的历史记录。 */
export async function POST(_request: Request, { params }: Context) {
  const { passageId } = await params;
  if (!UUID_PATTERN.test(passageId)) return NextResponse.json({ error: "Invalid passage" }, { status: 400 });
  const user = await getOrCreateSessionUser();
  if (!await isPassageGradable(passageId)) {
    return NextResponse.json({ error: "这篇的答案尚未录入，暂未开放练习。" }, { status: 409 });
  }
  const created = await createAttempt(user.id, passageId);
  return NextResponse.json({ attempt: created.rows[0] });
}

function isValidAnswers(value: unknown): value is Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  const keys = Object.keys(answers);
  if (keys.length > MAX_ANSWER_COUNT) return false;
  return keys.every((key) => /^\d{1,3}$/.test(key)
    && typeof answers[key] === "number"
    && Number.isInteger(answers[key])
    && answers[key] >= 0
    && answers[key] <= 3);
}

export async function PATCH(request: Request, { params }: Context) {
  const { passageId } = await params;
  if (!UUID_PATTERN.test(passageId)) return NextResponse.json({ error: "Invalid passage" }, { status: 400 });
  const user = await getOrCreateSessionUser();
  const body = await request.json().catch(() => null) as { attemptId?: unknown; answers?: unknown } | null;
  const { attemptId, answers } = body ?? {};
  if (typeof attemptId !== "string" || !isValidAnswers(answers)) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }
  const result = await query(
    "update practice_attempts set answers = $1 where id = $2 and user_id = $3 and passage_id = $4 and submitted_at is null",
    [answers, attemptId, user.id, passageId],
  );
  return result.rowCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Attempt not found" }, { status: 404 });
}
