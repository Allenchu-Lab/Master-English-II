import { NextResponse } from "next/server";
import { getOrCreateSessionUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { isWritingReview } from "@/lib/writing-review";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const user = await getOrCreateSessionUser();
  const attemptId = new URL(request.url).searchParams.get("attemptId");
  if (attemptId && !UUID_PATTERN.test(attemptId)) return NextResponse.json({ error: "Invalid attempt" }, { status: 400 });
  const result = await query<{
    id: string; original: string; rewrite: string; pattern: string; use_cases: string[];
    status: string; created_at: string; year: number; part: "A" | "B";
  }>(`
    select e.id, e.original, e.rewrite, e.pattern, e.use_cases, e.status, e.created_at, p.year, t.part
    from writing_expressions e
    join writing_attempts a on a.id = e.source_attempt_id
    join writing_tasks t on t.id = a.task_id
    join exam_sections s on s.id = t.section_id
    join exam_papers p on p.id = s.paper_id
    where e.user_id = $1 and ($2::uuid is null or e.source_attempt_id = $2)
    order by e.created_at desc limit 200
  `, [user.id, attemptId]);
  return NextResponse.json({ expressions: result.rows });
}

export async function POST(request: Request) {
  const user = await getOrCreateSessionUser();
  const body = await request.json().catch(() => null) as { attemptId?: unknown; expressionIndex?: unknown } | null;
  if (typeof body?.attemptId !== "string" || typeof body.expressionIndex !== "number" || !Number.isInteger(body.expressionIndex)) {
    return NextResponse.json({ error: "Invalid expression" }, { status: 400 });
  }
  const result = await query<{ review: unknown; points: number }>(`
    select a.review, t.points from writing_attempts a join writing_tasks t on t.id = a.task_id
    where a.id = $1 and a.user_id = $2 and a.review is not null
  `, [body.attemptId, user.id]);
  const row = result.rows[0];
  if (!row || !isWritingReview(row.review, row.points) || !row.review.expressions[body.expressionIndex]) {
    return NextResponse.json({ error: "Expression not found" }, { status: 404 });
  }
  const expression = row.review.expressions[body.expressionIndex];
  await query(`
    insert into writing_expressions (user_id, source_attempt_id, original, rewrite, pattern, use_cases)
    values ($1, $2, $3, $4, $5, $6::jsonb)
    on conflict (user_id, source_attempt_id, pattern) do nothing
  `, [user.id, body.attemptId, expression.original, expression.rewrite, expression.pattern, JSON.stringify(expression.useCases)]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await getOrCreateSessionUser();
  const body = await request.json().catch(() => null) as { expressionId?: unknown; attemptId?: unknown; expressionIndex?: unknown } | null;
  if (typeof body?.expressionId === "string" && UUID_PATTERN.test(body.expressionId)) {
    const deleted = await query("delete from writing_expressions where id = $1 and user_id = $2", [body.expressionId, user.id]);
    return deleted.rowCount
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Expression not found" }, { status: 404 });
  }
  if (typeof body?.attemptId !== "string" || !UUID_PATTERN.test(body.attemptId)
    || typeof body.expressionIndex !== "number" || !Number.isInteger(body.expressionIndex)) {
    return NextResponse.json({ error: "Invalid expression" }, { status: 400 });
  }
  const result = await query<{ review: unknown; points: number }>(`
    select a.review, t.points from writing_attempts a join writing_tasks t on t.id = a.task_id
    where a.id = $1 and a.user_id = $2 and a.review is not null
  `, [body.attemptId, user.id]);
  const row = result.rows[0];
  if (!row || !isWritingReview(row.review, row.points) || !row.review.expressions[body.expressionIndex]) {
    return NextResponse.json({ error: "Expression not found" }, { status: 404 });
  }
  await query(`
    delete from writing_expressions
    where user_id = $1 and source_attempt_id = $2 and pattern = $3
  `, [user.id, body.attemptId, row.review.expressions[body.expressionIndex].pattern]);
  return NextResponse.json({ ok: true });
}
