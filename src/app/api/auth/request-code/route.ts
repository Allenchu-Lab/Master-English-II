import { createHmac, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { sendLoginCode } from "@/lib/auth/mailer";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { query } from "@/lib/db";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 每个邮箱每天最多发送的验证码数量，防止验证码轰炸
const DAILY_CODE_LIMIT = 10;
const codeHash = (email: string, code: string) => createHmac("sha256", process.env.OTP_SECRET ?? "").update(`${email}:${code}`).digest("hex");

export async function POST(request: Request) {
  const { email: rawEmail } = await request.json().catch(() => ({ email: "" })) as { email?: string };
  const email = rawEmail?.trim().toLowerCase() ?? "";
  if (!emailPattern.test(email)) return NextResponse.json({ error: "请输入正确的邮箱地址。" }, { status: 400 });
  if (!process.env.OTP_SECRET) return NextResponse.json({ error: "登录服务尚未配置。" }, { status: 503 });

  // 每个 IP 每小时最多 20 次发码请求（进程内限流，单实例部署）
  if (rateLimit(`otp:${clientKey(request)}`, { max: 20, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "请求过于频繁，请稍后再试。" }, { status: 429 });
  }

  const recent = await query("select 1 from email_login_codes where lower(email) = $1 and created_at > now() - interval '60 seconds' limit 1", [email]);
  if (recent.rowCount) return NextResponse.json({ error: "请稍候一分钟再重新发送。" }, { status: 429 });

  const daily = await query<{ count: string }>(
    "select count(*) from email_login_codes where lower(email) = $1 and created_at > now() - interval '24 hours'",
    [email],
  );
  if (Number(daily.rows[0].count) >= DAILY_CODE_LIMIT) {
    return NextResponse.json({ error: "今日验证码发送次数已达上限，请明天再试。" }, { status: 429 });
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const inserted = await query<{ id: string }>("insert into email_login_codes (email, code_hash, expires_at) values ($1, $2, now() + interval '10 minutes') returning id", [email, codeHash(email, code)]);
  try {
    await sendLoginCode(email, code);
  } catch {
    await query("delete from email_login_codes where id = $1", [inserted.rows[0].id]);
    return NextResponse.json({ error: "验证码发送失败，请稍后重试。" }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
