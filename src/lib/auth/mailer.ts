import "server-only";

import { ses } from "tencentcloud-sdk-nodejs-ses";
import nodemailer from "nodemailer";

/**
 * 邮件发送：优先腾讯云 SES（HTTP API，不受云服务器 25/465 出站端口封禁影响，
 * 有送达统计与退信报告）；未配置 SES 时回退到 SMTP（nodemailer）。
 *
 * 腾讯云 SES 配置（SES_SECRET_ID / SES_SECRET_KEY / SES_REGION / SES_FROM_EMAIL）：
 * 1. 控制台开通邮件推送，完成发信域名验证（含 SPF/DKIM）；
 * 2. 在"发信地址"中创建发信地址，SES_FROM_EMAIL 填该地址（可带别名，如
 *    "Master English II <noreply@yourdomain.com>"，别名与邮箱间必须有一个空格）；
 * 3. 在访问管理 CAM 中创建子账号，授权 QcloudSESFullAccess，得到 SecretId/SecretKey。
 */

function assertSesConfigured() {
  const secretId = process.env.SES_SECRET_ID;
  const secretKey = process.env.SES_SECRET_KEY;
  const from = process.env.SES_FROM_EMAIL;
  if (!secretId || !secretKey || !from) throw new Error("SES is not configured");
  return { secretId, secretKey, from };
}

async function sendViaSes(email: string, subject: string, text: string, html: string) {
  const { secretId, secretKey, from } = assertSesConfigured();
  const region = process.env.SES_REGION ?? "ap-guangzhou";

  const client = new ses.v20201002.Client({
    credential: { secretId, secretKey },
    region,
    profile: { httpProfile: { reqTimeout: 15 } },
  });
  await client.SendEmail({
    FromEmailAddress: from,
    Destination: [email],
    Subject: subject,
    Simple: { Text: text, Html: html },
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
  await transporter.sendMail({
    from,
    to: email,
    subject,
    text,
    html,
  });
}

export async function sendLoginCode(email: string, code: string) {
  const subject = "Master English II 登录验证码";
  const text = `你的登录验证码是：${code}。验证码 10 分钟内有效，请勿转发给他人。`;
  const html = `<p>你的登录验证码是：</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>验证码 10 分钟内有效，请勿转发给他人。</p>`;

  if (process.env.SES_SECRET_ID) {
    await sendViaSes(email, subject, text, html);
    return;
  }
  await sendViaSmtp(email, subject, text, html);
}
