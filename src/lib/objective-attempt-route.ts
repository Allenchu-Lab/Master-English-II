import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guard";
import { isUuid } from "@/lib/uuid";
import { query, transaction } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/rate-limit";

type ObjectiveAttempt<TKey> = {
  id: string; answers: Record<string, string>; elapsed_seconds: number;
  score: number | null; submitted_at: string | null; feedback: TKey[] | null;
};

type ObjectiveRouteConfig<TContent, TKey> = {
  table: string;
  taskTable: string;
  keysTable: string;
  prefix: string;
  expectedKeys: number;
  validate: (value: unknown, content: TContent) => boolean;
  grade: (answers: Record<string, string>, keys: TKey[]) => number;
};

// Cloze and Reading B share one objective-question attempt lifecycle; only the
// tables, key count, validation and grading differ. Table identifiers are trusted
// constants from the route config, never request input.
export function createObjectiveAttemptRoute<TContent, TKey>(config: ObjectiveRouteConfig<TContent, TKey>) {
  type Attempt = ObjectiveAttempt<TKey>;
  type Context = { params: Promise<{ taskId: string }> };

  async function GET(_request: Request, { params }: Context) {
    const { taskId } = await params;
    if (!isUuid(taskId)) return NextResponse.json({ error: "Invalid task" }, { status: 400 });
    const user = await requireUser();
    if (user instanceof NextResponse) return user;
    const result = await query<Attempt>(`
      select id, answers, elapsed_seconds, score, submitted_at, feedback
      from ${config.table} where user_id=$1 and task_id=$2
      order by (submitted_at is null) desc, updated_at desc, id desc limit 1
    `, [user.id, taskId]);
    return NextResponse.json({ attempt: result.rows[0] ?? null });
  }

  async function POST(request: Request, { params }: Context) {
    if (rateLimit(`${config.prefix}:${clientKey(request)}`, { max: 180, windowMs: 60000 })) {
      return NextResponse.json({ error: "操作过于频繁，请稍后重试。" }, { status: 429 });
    }
    const { taskId } = await params;
    const body = await request.json().catch(() => null);
    if (!isUuid(taskId) || !body || !["save", "submit", "redo"].includes(body.action)
      || (body.attemptId !== null && (typeof body.attemptId !== "string" || !isUuid(body.attemptId)))
      || !Number.isInteger(body.elapsedSeconds) || body.elapsedSeconds < 0 || body.elapsedSeconds > 604800) {
      return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
    }
    const user = await requireUser();
    if (user instanceof NextResponse) return user;
    return transaction(async client => {
      // Serialize draft saves, submissions and retries for this user/task pair.
      await client.query("select pg_advisory_xact_lock(hashtext($1))", [`${config.prefix}:${user.id}:${taskId}`]);
      const task = (await client.query<{ content: TContent; keys: TKey[] }>(`
        select t.content,k.keys from ${config.taskTable} t
        join ${config.keysTable} k on k.task_id=t.id
        join exam_sections s on s.id=t.section_id join exam_papers p on p.id=s.paper_id
        where t.id=$1 and t.status='published' and s.status='published' and p.status='published'
      `, [taskId])).rows[0];
      if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
      if (!config.validate(body.answers, task.content)) return NextResponse.json({ error: "Invalid choices" }, { status: 400 });
      if (task.keys.length !== config.expectedKeys) return NextResponse.json({ error: "答案尚未就绪。" }, { status: 503 });
      const latest = (await client.query<Attempt>(`
        select * from ${config.table} where user_id=$1 and task_id=$2
        order by (submitted_at is null) desc, updated_at desc, id desc limit 1 for update
      `, [user.id, taskId])).rows[0];
      if ((latest?.id ?? null) !== body.attemptId) {
        return NextResponse.json({ error: "作答已在其他页面更新，请刷新后继续。" }, { status: 409 });
      }
      if (latest?.submitted_at && body.action === "submit") return NextResponse.json({ attempt: latest });
      if ((latest?.submitted_at && body.action === "save") || (body.action === "redo" && !latest?.submitted_at)) {
        return NextResponse.json({ error: "Invalid attempt state" }, { status: 409 });
      }
      if (body.action === "submit" && Object.keys(body.answers).length === 0) {
        return NextResponse.json({ error: "请至少作答一题。" }, { status: 400 });
      }
      const answers = body.action === "redo" ? {} : body.answers;
      const seconds = body.action === "redo" ? 0 : body.elapsedSeconds;
      const score = body.action === "submit" ? config.grade(answers, task.keys) : null;
      const feedback = body.action === "submit" ? JSON.stringify(task.keys) : null;
      const values = [JSON.stringify(answers), seconds, score, feedback, body.action === "submit"];
      const result = latest && body.action !== "redo"
        ? await client.query<Attempt>(`update ${config.table} set answers=$1::jsonb,elapsed_seconds=$2,score=$3,feedback=$4::jsonb,submitted_at=case when $5 then now() else null end,updated_at=now() where id=$6 returning *`, [...values, latest.id])
        : await client.query<Attempt>(`insert into ${config.table}(answers,elapsed_seconds,score,feedback,submitted_at,user_id,task_id) values($1::jsonb,$2,$3,$4::jsonb,case when $5 then now() else null end,$6,$7) returning *`, [...values, user.id, taskId]);
      return NextResponse.json({ attempt: result.rows[0] });
    });
  }

  return { GET, POST };
}