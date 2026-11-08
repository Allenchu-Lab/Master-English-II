import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const mailPath = fileURLToPath(new URL("../.local-db/mail.jsonl", import.meta.url));

// Signs in through the local-mail OTP flow that `npm run test:local` enables
// (LOCAL_AUTH_MAIL=1). Returns the session cookie plus the email so callers can
// clean up. Each call defaults to a fresh random email, avoiding the 60-second
// per-email resend cooldown when several tests sign in during one run.
export async function login(base, { email = `login-${randomUUID()}@example.invalid` } = {}) {
  const url = (path) => new URL(path, base);
  const sent = await fetch(url("/api/auth/request-code"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  });
  assert.equal(sent.status, 200, `request-code failed: ${await sent.clone().text()}`);
  const mail = readFileSync(mailPath, "utf8").trim().split("\n").map(JSON.parse)
    .findLast((entry) => entry.email === email.trim().toLowerCase());
  assert.match(mail?.code ?? "", /^\d{6}$/, "Local mail must contain a six-digit OTP");
  const verified = await fetch(url("/api/auth/verify-code"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code: mail.code }),
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  });
  assert.equal(verified.status, 200, `verify-code failed: ${await verified.clone().text()}`);
  const setCookie = verified.headers.get("set-cookie");
  assert.ok(setCookie, "Login must set a session cookie");
  return { cookie: setCookie.split(";", 1)[0], email };
}