import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guard";
import { isUuid } from "@/lib/uuid";
import { query } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ passageId: string }> }) {
  const { passageId } = await params;
  if (!isUuid(passageId)) return NextResponse.json({ error: "Invalid passage" }, { status: 400 });
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const result = await query("select 1 from practice_attempts where user_id = $1 and passage_id = $2 and submitted_at is not null limit 1", [user.id, passageId]);
  return NextResponse.json({ allowed: Boolean(result.rowCount) });
}
