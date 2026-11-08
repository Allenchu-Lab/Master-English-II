import { NextResponse } from "next/server";
import { optionalUser } from "@/lib/auth/guard";
import { query } from "@/lib/db";

export async function GET() {
  const user = await optionalUser();
  if (!user) return NextResponse.json({ resume: null });
  const { rows } = await query<{ kind: string; year: number; detail: string | null }>(`
    with drafts as (
      select 'reading_a' kind, t.section_id, t.passage_number::text detail, a.updated_at
      from practice_attempts a join passages t on t.id=a.passage_id
      where a.user_id=$1 and a.submitted_at is null and a.answers<>'{}'::jsonb and t.status='published'
      union all
      select 'writing',t.section_id,t.part,a.updated_at from writing_attempts a join writing_tasks t on t.id=a.task_id
      where a.user_id=$1 and a.submitted_at is null and length(trim(a.answer))>0 and t.status='published'
      union all
      select 'translation',t.section_id,null,a.updated_at from translation_attempts a join translation_tasks t on t.id=a.task_id
      where a.user_id=$1 and a.submitted_at is null and length(trim(a.answer))>0 and t.status='published'
      union all
      select 'reading_b',t.section_id,null,a.updated_at from reading_b_attempts a join reading_b_tasks t on t.id=a.task_id
      where a.user_id=$1 and a.submitted_at is null and a.answers<>'{}'::jsonb and t.status='published'
      union all
      select 'cloze',t.section_id,null,a.updated_at from cloze_attempts a join cloze_tasks t on t.id=a.task_id
      where a.user_id=$1 and a.submitted_at is null and a.answers<>'{}'::jsonb and t.status='published'
    ) select d.kind,p.year,d.detail from drafts d join exam_sections s on s.id=d.section_id join exam_papers p on p.id=s.paper_id
    order by d.updated_at desc, p.year desc, d.kind, d.detail limit 1
  `, [user.id]);
  const item = rows[0];
  if (!item) return NextResponse.json({ resume: null });
  const href = item.kind === "reading_a" ? `/practice/${item.year}/${item.detail}`
    : item.kind === "writing" ? `/writing/${item.year}?part=${item.detail}`
    : `/${item.kind === "reading_b" ? "reading-b" : item.kind}/${item.year}`;
  return NextResponse.json({ resume: { ...item, href } }, { headers: { "Cache-Control": "private, no-store" } });
}
