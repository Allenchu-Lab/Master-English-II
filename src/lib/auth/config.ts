import "server-only";

export function localMailEnabled() {
  return process.env.NODE_ENV === "development"
    && process.env.LOCAL_AUTH_MAIL === "1"
    && process.env.DATABASE_URL === "postgresql://chitouen_local@127.0.0.1:55432/chitouen_local";
}

export function sesSelected() {
  return Boolean(process.env.SES_SECRET_ID || process.env.SES_SECRET_KEY || process.env.SES_FROM_EMAIL);
}

export function sesTemplateId() {
  const value = process.env.SES_TEMPLATE_ID ?? "";
  const id = Number(value);
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(id) ? id : null;
}

export function emailLoginEnabled() {
  if (process.env.LOCAL_AUTH_MAIL === "1" && !localMailEnabled()) return false;
  return process.env.EMAIL_LOGIN_ENABLED === "true"
    && Boolean(process.env.OTP_SECRET)
    && (localMailEnabled() || Boolean(
      sesSelected()
        ? (process.env.SES_SECRET_ID && process.env.SES_SECRET_KEY && process.env.SES_FROM_EMAIL
          && process.env.SES_REGION && sesTemplateId())
        : (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM),
    ));
}
