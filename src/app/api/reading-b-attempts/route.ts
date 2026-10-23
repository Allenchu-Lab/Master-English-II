import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getOrCreateSessionUser } from '@/lib/auth/session';

export async function GET() {
  const user = await getOrCreateSessionUser();
  const result = await query(`
    select distinct on (task_id) task_id, submitted_at, score,
      answers <> '{}'::jsonb as has_answers
    from reading_b_attempts where user_id=$1
    order by task_id, (submitted_at is null) desc, updated_at desc, id desc
  `, [user.id]);
  return NextResponse.json({ attempts: result.rows });
}
