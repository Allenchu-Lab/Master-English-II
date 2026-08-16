import { NextResponse } from "next/server";
import { getOrCreateSessionUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

export async function GET() {
  const user = await getOrCreateSessionUser();
  const result = await query<{ passage_id: string; submitted_at: string | null }>(
    "select passage_id, submitted_at from practice_attempts where user_id = $1 order by created_at",
    [user.id],
  );
  return NextResponse.json({ attempts: result.rows });
}
