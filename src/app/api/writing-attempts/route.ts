import { NextResponse } from "next/server";
import { getOrCreateSessionUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

export async function GET() {
  const user = await getOrCreateSessionUser();
  const result = await query<{ task_id: string; submitted: boolean; has_draft: boolean; latest_score: number | null; has_submission: boolean; completed_at: string | null }>(`
    select distinct on (a.task_id) a.task_id, a.submitted_at is not null submitted, length(trim(a.answer)) > 0 has_draft,
      latest.review->'score' latest_score, latest.id is not null has_submission, latest.submitted_at completed_at
    from writing_attempts a
    left join lateral (
      select id, review, submitted_at from writing_attempts where user_id=$1 and task_id=a.task_id and submitted_at is not null
      order by submitted_at desc, id desc limit 1
    ) latest on true
    where a.user_id = $1
    order by a.task_id, (a.submitted_at is null) desc, a.updated_at desc, a.id desc
  `, [user.id]);
  return NextResponse.json({ attempts: result.rows });
}
