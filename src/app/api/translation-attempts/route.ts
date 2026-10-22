import { NextResponse } from 'next/server';
import { getOrCreateSessionUser } from '@/lib/auth/session';
import { query } from '@/lib/db';
export async function GET() {
  const user=await getOrCreateSessionUser();
  const result=await query<{year:number;submitted:boolean;has_draft:boolean;has_redo:boolean;latest_score:number|null;completed_at:string|null}>(`select p.year,(bool_or(a.submitted_at is not null) and not bool_or(a.submitted_at is null and not exists(select 1 from translation_attempts newer where newer.user_id=a.user_id and newer.task_id=a.task_id and newer.submitted_at>=a.updated_at))) submitted,bool_or(a.submitted_at is null and length(trim(a.answer))>0 and not exists(select 1 from translation_attempts newer where newer.user_id=a.user_id and newer.task_id=a.task_id and newer.submitted_at>=a.updated_at)) has_draft,(bool_or(a.submitted_at is null and not exists(select 1 from translation_attempts newer where newer.user_id=a.user_id and newer.task_id=a.task_id and newer.submitted_at>=a.updated_at) and length(trim(a.answer))=0) and bool_or(a.submitted_at is not null)) has_redo,(array_agg(a.review->'score' order by a.submitted_at desc,a.id desc) filter (where a.submitted_at is not null))[1] latest_score,max(a.submitted_at) completed_at from translation_attempts a join translation_tasks t on t.id=a.task_id join exam_sections s on s.id=t.section_id join exam_papers p on p.id=s.paper_id where a.user_id=$1 group by p.year`,[user.id]);
  return NextResponse.json({attempts:result.rows});
}
