import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getOrCreateSessionUser } from '@/lib/auth/session';
type Context = {params: Promise<{taskId: string}>};
const valid = /^[0-9a-f-]{36}$/i;
export async function GET(_request: Request, {params}: Context) {
  const {taskId}=await params;
  if (!valid.test(taskId)) return NextResponse.json({error:'Invalid task'}, {status:400});
  const user=await getOrCreateSessionUser();
  const result=await query(`select a.* from translation_attempts a where a.user_id=$1 and a.task_id=$2 and (a.submitted_at is not null or not exists(select 1 from translation_attempts newer where newer.user_id=a.user_id and newer.task_id=a.task_id and newer.submitted_at>=a.updated_at)) order by (a.submitted_at is null) desc, a.updated_at desc, a.id desc limit 1`,[user.id,taskId]);
  return NextResponse.json({attempt:result.rows[0]??null});
}
export async function POST(request: Request, {params}: Context) {
  const {taskId}=await params;
  const body=await request.json().catch(()=>null);
  if (!valid.test(taskId)||typeof body?.answer!=='string'||body.answer.length>12000||!Number.isInteger(body.elapsedSeconds)||body.elapsedSeconds<0||body.elapsedSeconds>604800||!['save','submit','redo'].includes(body.action)|| (body.action==='submit'&&!body.answer.trim())) return NextResponse.json({error:'Invalid answer'}, {status:400});
  const user=await getOrCreateSessionUser();
  const result=await query(`insert into translation_attempts(user_id,task_id,answer,elapsed_seconds,submitted_at) select $1,id,$3,$5,case when $4='submit' then now() else null end from translation_tasks where id=$2 and status='published' on conflict(user_id,task_id) where submitted_at is null do update set answer=excluded.answer,elapsed_seconds=excluded.elapsed_seconds,submitted_at=excluded.submitted_at,updated_at=now() returning *`,[user.id,taskId,body.action==='redo'?'':body.answer,body.action,body.action==='redo'?0:body.elapsedSeconds]);
  return NextResponse.json({attempt:result.rows[0]}, {status:result.rows[0]?200:404});
}
