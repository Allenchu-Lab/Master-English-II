import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser, replaceSession } from "@/lib/auth/session";
import { transaction } from "@/lib/db";

const codeHash = (email: string, code: string) => createHmac("sha256", process.env.OTP_SECRET ?? "").update(`${email}:${code}`).digest("hex");

export async function POST(request: Request) {
  const { email: rawEmail, code: rawCode } = await request.json().catch(() => ({})) as { email?: string; code?: string };
  const email = rawEmail?.trim().toLowerCase() ?? "";
  const code = rawCode?.trim() ?? "";
  if (!email || !/^\d{6}$/.test(code) || !process.env.OTP_SECRET) return NextResponse.json({ error: "验证码错误或已过期。" }, { status: 400 });
  const previousUser = await getSessionUser();

  const userId = await transaction(async (client) => {
    const result = await client.query<{ id: string; code_hash: string }>(
      "select id, code_hash from email_login_codes where lower(email) = $1 and consumed_at is null and expires_at > now() and attempts < 5 order by created_at desc limit 1 for update",
      [email],
    );
    const record = result.rows[0];
    if (!record) return null;
    const expected = Buffer.from(record.code_hash, "hex");
    const actual = Buffer.from(codeHash(email, code), "hex");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      await client.query("update email_login_codes set attempts = attempts + 1 where id = $1", [record.id]);
      return null;
    }
    await client.query("update email_login_codes set consumed_at = now() where id = $1", [record.id]);
    const existing = await client.query<{ id: string }>("select id from app_users where lower(email) = $1 limit 1", [email]);
    if (existing.rows[0]) return existing.rows[0].id;
    const created = await client.query<{ id: string }>("insert into app_users (email, is_anonymous) values ($1, false) returning id", [email]);
    return created.rows[0].id;
  });
  if (!userId) return NextResponse.json({ error: "验证码错误或已过期。" }, { status: 400 });
  await replaceSession(userId, previousUser?.isAnonymous ? previousUser.id : undefined);
  return NextResponse.json({ user: { email, isAnonymous: false }, recordsMigrated: true });
}
