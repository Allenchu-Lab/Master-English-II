import { NextResponse } from "next/server";
import { getOrCreateSessionUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

type Context = { params: Promise<{ passageId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { passageId } = await params;
  const user = await getOrCreateSessionUser();
  const latest = await query<{ id: string; answers: Record<string, number>; submitted_at: string | null }>(
    "select id, answers, submitted_at from practice_attempts where user_id = $1 and passage_id = $2 order by created_at desc limit 1",
    [user.id, passageId],
  );
  if (latest.rows[0] && !latest.rows[0].submitted_at) return NextResponse.json({ attempt: latest.rows[0] });
  const created = await query<{ id: string; answers: Record<string, number>; submitted_at: string | null }>(
    "insert into practice_attempts (user_id, passage_id) values ($1, $2) returning id, answers, submitted_at",
    [user.id, passageId],
  );
  return NextResponse.json({ attempt: created.rows[0] });
}

export async function PATCH(request: Request, { params }: Context) {
  const { passageId } = await params;
  const user = await getOrCreateSessionUser();
  const { attemptId, answers } = await request.json() as { attemptId?: string; answers?: Record<string, number> };
  if (!attemptId || !answers || Array.isArray(answers)) return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  const result = await query(
    "update practice_attempts set answers = $1 where id = $2 and user_id = $3 and passage_id = $4 and submitted_at is null",
    [answers, attemptId, user.id, passageId],
  );
  return result.rowCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Attempt not found" }, { status: 404 });
}
