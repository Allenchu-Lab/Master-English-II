import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: { params: Promise<{ passageId: string }> }) {
  const { passageId } = await params;
  if (!UUID_PATTERN.test(passageId)) return NextResponse.json({ error: "Invalid passage" }, { status: 400 });
  const user = await getSessionUser();
  if (!user || user.isAnonymous) return NextResponse.json({ error: "Please sign in to practice." }, { status: 401 });
  const result = await query("select 1 from practice_attempts where user_id = $1 and passage_id = $2 and submitted_at is not null limit 1", [user.id, passageId]);
  return NextResponse.json({ allowed: Boolean(result.rowCount) });
}
