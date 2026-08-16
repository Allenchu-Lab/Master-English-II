import { NextResponse } from "next/server";
import { getOrCreateSessionUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ passageId: string }> }) {
  const { passageId } = await params;
  const user = await getOrCreateSessionUser();
  const result = await query("select 1 from practice_attempts where user_id = $1 and passage_id = $2 and submitted_at is not null limit 1", [user.id, passageId]);
  return NextResponse.json({ allowed: Boolean(result.rowCount) });
}
