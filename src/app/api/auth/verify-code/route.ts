import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser, replaceSession } from "@/lib/auth/session";
import { transaction } from "@/lib/db";
import { emailLoginEnabled } from "@/lib/auth/config";
import { isValidEmail } from "@/lib/auth/email-validation";

const codeHash = (email: string, code: string) => createHmac("sha256", process.env.OTP_SECRET ?? "").update(`${email}:${code}`).digest("hex");

export async function POST(request: Request) {
  if (!emailLoginEnabled()) return NextResponse.json({ error: "登录服务尚未开放。" }, { status: 503 });
  const body = await request.json().catch(() => null) as { email?: unknown; code?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!isValidEmail(email) || !/^\d{6}$/.test(code) || !process.env.OTP_SECRET) return NextResponse.json({ error: "验证码错误或已过期。" }, { status: 400 });
  const previousUser = await getSessionUser();

  const userId = await transaction(async (client) => {
    const result = await client.query<{ id: string; code_hash: string; usable: boolean }>(
      "select id, code_hash, (consumed_at is null and expires_at > now() and attempts < 5) as usable from email_login_codes where lower(email) = $1 order by created_at desc limit 1 for update",
      [email],
    );
    const record = result.rows[0];
    if (!record?.usable) return null;
    const expected = Buffer.from(record.code_hash, "hex");
    const actual = Buffer.from(codeHash(email, code), "hex");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      await client.query("update email_login_codes set attempts = attempts + 1 where id = $1", [record.id]);
      return null;
    }
    await client.query("update email_login_codes set consumed_at = now() where id = $1", [record.id]);
    const created = await client.query<{ id: string }>("insert into app_users (email, is_anonymous) values ($1, false) on conflict (lower(email)) where email is not null do update set email = excluded.email returning id", [email]);
    return created.rows[0].id;
  });
  if (!userId) return NextResponse.json({ error: "验证码错误或已过期。" }, { status: 400 });
  await replaceSession(userId, previousUser?.isAnonymous ? previousUser.id : undefined);
  return NextResponse.json({ user: { email, isAnonymous: false }, recordsMigrated: true });
}
