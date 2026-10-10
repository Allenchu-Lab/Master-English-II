import { NextResponse } from "next/server";
import { getOrCreateSessionUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

type Context = { params: Promise<{ taskId: string }> };
type AttemptRow = { id: string; answer: string; elapsed_seconds: number; submitted_at: string | null };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ANSWER_LENGTH = 12_000;

export async function GET(_request: Request, { params }: Context) {
  const { taskId } = await params;
  if (!UUID_PATTERN.test(taskId)) return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  const user = await getOrCreateSessionUser();
  const result = await query<AttemptRow>(`
    insert into writing_attempts (user_id, task_id)
    select $1, id from writing_tasks where id = $2 and status = 'published'
    on conflict (user_id, task_id) do update set user_id = excluded.user_id
    returning id, answer, elapsed_seconds, submitted_at
  `, [user.id, taskId]);
  return result.rows[0]
    ? NextResponse.json({ attempt: result.rows[0] })
    : NextResponse.json({ error: "Task not found" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: Context) {
  const { taskId } = await params;
  if (!UUID_PATTERN.test(taskId)) return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  const user = await getOrCreateSessionUser();
  const body = await request.json().catch(() => null) as { answer?: unknown; elapsedSeconds?: unknown } | null;
  if (typeof body?.answer !== "string" || body.answer.length > MAX_ANSWER_LENGTH
    || typeof body.elapsedSeconds !== "number" || !Number.isInteger(body.elapsedSeconds) || body.elapsedSeconds < 0) {
    return NextResponse.json({ error: "Invalid draft" }, { status: 400 });
  }
  const result = await query(`
    update writing_attempts set answer = $1, elapsed_seconds = $2, updated_at = now()
    where user_id = $3 and task_id = $4 and submitted_at is null
  `, [body.answer, body.elapsedSeconds, user.id, taskId]);
  return result.rowCount
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Draft not found" }, { status: 404 });
}

export async function POST(request: Request, { params }: Context) {
  const { taskId } = await params;
  if (!UUID_PATTERN.test(taskId)) return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  const user = await getOrCreateSessionUser();
  const body = await request.json().catch(() => null) as { answer?: unknown; elapsedSeconds?: unknown } | null;
  if (typeof body?.answer !== "string" || !body.answer.trim() || body.answer.length > MAX_ANSWER_LENGTH
    || typeof body.elapsedSeconds !== "number" || !Number.isInteger(body.elapsedSeconds) || body.elapsedSeconds < 0) {
    return NextResponse.json({ error: "Complete the draft before submitting." }, { status: 400 });
  }
  const result = await query<AttemptRow>(`
    update writing_attempts set answer = $1, elapsed_seconds = $2, submitted_at = now(), updated_at = now()
    where user_id = $3 and task_id = $4 and submitted_at is null
    returning id, answer, elapsed_seconds, submitted_at
  `, [body.answer, body.elapsedSeconds, user.id, taskId]);
  return result.rows[0]
    ? NextResponse.json({ attempt: result.rows[0] })
    : NextResponse.json({ error: "Draft not found" }, { status: 404 });
}
