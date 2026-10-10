import { NextResponse } from "next/server";
import { getOrCreateSessionUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

export async function GET() {
  const user = await getOrCreateSessionUser();
  const result = await query<{ task_id: string; submitted: boolean; has_draft: boolean }>(`
    select task_id, submitted_at is not null submitted, length(trim(answer)) > 0 has_draft
    from writing_attempts where user_id = $1
  `, [user.id]);
  return NextResponse.json({ attempts: result.rows });
}
