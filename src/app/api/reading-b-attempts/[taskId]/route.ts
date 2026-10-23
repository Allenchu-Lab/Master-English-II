import { NextResponse } from 'next/server';
import { getOrCreateSessionUser } from '@/lib/auth/session';
import { query, transaction } from '@/lib/db';
import { gradeReadingB, validReadingBAnswers, type ReadingBContent, type ReadingBKey, type ReadingBAttempt } from '@/lib/reading-b';
import { clientKey, rateLimit } from '@/lib/rate-limit';

type Context = { params: Promise<{ taskId: string }> };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: Context) {
  const { taskId } = await params;
  if (!uuid.test(taskId)) return NextResponse.json({ error: 'Invalid task' }, { status: 400 });
  const user = await getOrCreateSessionUser();
  const result = await query<ReadingBAttempt>(`
    select id, answers, elapsed_seconds, score, submitted_at, feedback
    from reading_b_attempts where user_id=$1 and task_id=$2
    order by (submitted_at is null) desc, updated_at desc, id desc limit 1
  `, [user.id, taskId]);
  return NextResponse.json({ attempt: result.rows[0] ?? null });
}

export async function POST(request: Request, { params }: Context) {
  if (rateLimit(`reading-b:${clientKey(request)}`, { max: 180, windowMs: 60000 })) {
    return NextResponse.json({ error: '操作过于频繁，请稍后重试。' }, { status: 429 });
  }
  const { taskId } = await params;
  const body = await request.json().catch(() => null);
  if (!uuid.test(taskId) || !body || !['save', 'submit', 'redo'].includes(body.action)
    || (body.attemptId !== null && (typeof body.attemptId !== 'string' || !uuid.test(body.attemptId)))
    || !Number.isInteger(body.elapsedSeconds) || body.elapsedSeconds < 0 || body.elapsedSeconds > 604800) {
    return NextResponse.json({ error: 'Invalid answer' }, { status: 400 });
  }
  const user = await getOrCreateSessionUser();
  return transaction(async client => {
    // Serialize draft saves, submissions and retries for this user/task pair.
    await client.query('select pg_advisory_xact_lock(hashtext($1))', [`reading-b:${user.id}:${taskId}`]);
    const task = (await client.query<{ content: ReadingBContent; keys: ReadingBKey[] }>(`
      select t.content,k.keys from reading_b_tasks t
      join private.reading_b_keys k on k.task_id=t.id
      join exam_sections s on s.id=t.section_id join exam_papers p on p.id=s.paper_id
      where t.id=$1 and t.status='published' and s.status='published' and p.status='published'
    `, [taskId])).rows[0];
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (!validReadingBAnswers(body.answers, task.content)) return NextResponse.json({ error: 'Invalid choices' }, { status: 400 });
    if (task.keys.length !== 5) return NextResponse.json({ error: '答案尚未就绪。' }, { status: 503 });
    const latest = (await client.query<ReadingBAttempt>(`
      select * from reading_b_attempts where user_id=$1 and task_id=$2
      order by (submitted_at is null) desc, updated_at desc, id desc limit 1 for update
    `, [user.id, taskId])).rows[0];
    if ((latest?.id ?? null) !== body.attemptId) {
      return NextResponse.json({ error: '作答已在其他页面更新，请刷新后继续。' }, { status: 409 });
    }
    if (latest?.submitted_at && body.action === 'submit') return NextResponse.json({ attempt: latest });
    if ((latest?.submitted_at && body.action === 'save') || (body.action === 'redo' && !latest?.submitted_at)) {
      return NextResponse.json({ error: 'Invalid attempt state' }, { status: 409 });
    }
    if (body.action === 'submit' && Object.keys(body.answers).length === 0) {
      return NextResponse.json({ error: '请至少作答一题。' }, { status: 400 });
    }
    const answers = body.action === 'redo' ? {} : body.answers;
    const seconds = body.action === 'redo' ? 0 : body.elapsedSeconds;
    const score = body.action === 'submit' ? gradeReadingB(answers, task.keys) : null;
    const feedback = body.action === 'submit' ? JSON.stringify(task.keys) : null;
    const values = [JSON.stringify(answers), seconds, score, feedback, body.action === 'submit'];
    const result = latest && body.action !== 'redo'
      ? await client.query<ReadingBAttempt>(`update reading_b_attempts set answers=$1::jsonb,elapsed_seconds=$2,score=$3,feedback=$4::jsonb,submitted_at=case when $5 then now() else null end,updated_at=now() where id=$6 returning *`, [...values, latest.id])
      : await client.query<ReadingBAttempt>(`insert into reading_b_attempts(answers,elapsed_seconds,score,feedback,submitted_at,user_id,task_id) values($1::jsonb,$2,$3,$4::jsonb,case when $5 then now() else null end,$6,$7) returning *`, [...values, user.id, taskId]);
    return NextResponse.json({ attempt: result.rows[0] });
  });
}
