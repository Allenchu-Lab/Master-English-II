import "server-only";

import { ses } from "tencentcloud-sdk-nodejs-ses";
import nodemailer from "nodemailer";
import { appendFile, mkdir } from "node:fs/promises";
import { emailLoginEnabled, localMailEnabled, sesSelected, sesTemplateId } from "@/lib/auth/config";
import { query } from "@/lib/db";

/**
 * 邮件发送：优先腾讯云 SES（HTTP API，不受云服务器 25/465 出站端口封禁影响，
 * 有送达统计与退信报告）；未配置 SES 时回退到 SMTP（nodemailer）。
 *
 * 腾讯云 SES 配置（SES_SECRET_ID / SES_SECRET_KEY / SES_REGION / SES_FROM_EMAIL / SES_TEMPLATE_ID）：
 * 1. 控制台开通邮件推送，完成发信域名验证（含 SPF/DKIM）；
 * 2. 在"发信地址"中创建发信地址，SES_FROM_EMAIL 填该地址（可带别名，如
 *    "ChiTouEN II <noreply@yourdomain.com>"，别名与邮箱间必须有一个空格）；
 * 3. 创建并审核包含 {{code}} 的模板；使用仅允许 ses:SendEmail 的专用凭证。
 * 4. 核实账号剩余免费额度后再设置 email_send_budget.send_limit；默认 0 禁止真实发送。
 */

function assertSesConfigured() {
  const secretId = process.env.SES_SECRET_ID;
  const secretKey = process.env.SES_SECRET_KEY;
  const from = process.env.SES_FROM_EMAIL;
  const region = process.env.SES_REGION;
  const templateId = sesTemplateId();
  if (!secretId || !secretKey || !from || !region || !templateId) throw new Error("SES is not configured");
  return { secretId, secretKey, from, region, templateId };
}

async function reserveEmailBudget() {
  // Commit the reservation BEFORE calling the provider. Never refund ambiguous failures/timeouts.
  const reserved = await query(
    `update email_send_budget set reserved_count = reserved_count + 1
     where id = 1 and reserved_count < send_limit and send_limit between 1 and 1000
     returning reserved_count`,
  );
  if (!reserved.rowCount) throw new Error("Email sending budget exhausted or disabled");
}

async function sendViaSes(email: string, subject: string, code: string) {
  const { secretId, secretKey, from, region, templateId } = assertSesConfigured();

  const client = new ses.v20201002.Client({
    credential: { secretId, secretKey },
    region,
    profile: { httpProfile: { reqTimeout: 15 } },
  });
  await reserveEmailBudget();
  await client.SendEmail({
    FromEmailAddress: from,
    Destination: [email],
    Subject: subject,
    Template: { TemplateID: templateId, TemplateData: JSON.stringify({ code }) },
    TriggerType: 1,
  });
}

async function sendViaSmtp(email: string, subject: string, text: string, html: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  if (!host || !user || !pass || !from) throw new Error("SMTP is not configured");

  const port = Number(process.env.SMTP_PORT ?? 465);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  await reserveEmailBudget();
  await transporter.sendMail({
    from,
    to: email,
    subject,
    text,
    html,
  });
}

export async function sendLoginCode(email: string, code: string) {
  if (!emailLoginEnabled()) throw new Error("Email login is disabled or not configured");
  if (process.env.LOCAL_AUTH_MAIL === "1") {
    if (!localMailEnabled()) throw new Error("Local mail is only allowed with the isolated development database");
    await mkdir(".local-db", { recursive: true });
    await appendFile(".local-db/mail.jsonl", JSON.stringify({ email, code, sentAt: new Date().toISOString() }) + "\n", { mode: 0o600 });
    return;
  }
  const subject = "ChiTouEN II 登录验证码";
  const text = `你的登录验证码是：${code}。验证码 10 分钟内有效，请勿转发给他人。`;
  const html = `<p>你的登录验证码是：</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>验证码 10 分钟内有效，请勿转发给他人。</p>`;

  if (sesSelected()) {
    await sendViaSes(email, subject, code);
    return;
  }
  await sendViaSmtp(email, subject, text, html);
}
