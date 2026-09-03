import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";

assert.equal(process.env.ALLOW_TEST_WRITES, "1");
const base = new URL(process.env.TEST_BASE_URL ?? "http://127.0.0.1:3101");
assert.ok(base.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(base.hostname), "Auth tests only run locally");
const db = new pg.Client({ connectionString: "postgresql://chitouen_local@127.0.0.1:55432/chitouen_local" });
await db.connect();
const root = fileURLToPath(new URL("../", import.meta.url));
const prefix = `auth-${randomUUID()}`;
const emailA = `${prefix}.a+test@example.invalid`;
const emailB = `${prefix}-b@example.invalid`;

function browser(initialCookie = "") {
  let cookie = initialCookie;
  return {
    cookie: () => cookie,
    async request(path, body, expected = 200, method = "POST") {
      const response = await fetch(new URL(path, base), {
        method: body === undefined ? "GET" : method,
        headers: { cookie, "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: "error", signal: AbortSignal.timeout(20_000),
      });
      assert.equal(response.status, expected, `${path}: ${await response.clone().text()}`);
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        cookie = setCookie.split(";", 1)[0];
        if (path.endsWith("verify-code") && expected === 200) {
          assert.match(setCookie, /HttpOnly/i);
          assert.match(setCookie, /SameSite=lax/i);
        }
      }
      return response.json();
    },
  };
}

async function sendCode(device, email) {
  const result = await device.request("/api/auth/request-code", { email });
  assert.deepEqual(result, { ok: true }, "The API must not expose the OTP");
  const mail = readFileSync(`${root}.local-db/mail.jsonl`, "utf8").trim().split("\n").map(JSON.parse)
    .findLast((entry) => entry.email === email.trim().toLowerCase());
  assert.match(mail?.code ?? "", /^\d{6}$/);
  return mail.code;
}
const verify = (device, email, code, status = 200) => device.request("/api/auth/verify-code", { email, code }, status);
const session = (device) => device.request("/api/auth/session");

try {
  const directory = await db.query("show data_directory");
  assert.equal(directory.rows[0].data_directory, `${root}.local-db/data`, "Refusing a different database");
  const a = browser();
  const b = browser();
  const other = browser();
  const config = await session(a);
  assert.equal(config.localMail, true, "Never send real mail during this test");
  assert.equal(config.signInEnabled, true);
  for (const body of [null, { email: 123 }, { email: "invalid" }]) {
    await a.request("/api/auth/request-code", body, 400);
  }
  await a.request("/api/auth/verify-code", { email: [], code: {} }, 400);
  for (const email of ["中文@gmail.com", "user@中文.com", "user name@gmail.com", "user＠gmail.com",
    "user@@gmail.com", "user@gmail", ".user@gmail.com", "user..name@gmail.com", "user@-gmail.com",
    "user@gmail..com", "user@g_mail.com", `${"a".repeat(65)}@gmail.com`, `user@${"a".repeat(64)}.com`]) {
    await a.request("/api/auth/request-code", { email }, 400);
    await a.request("/api/auth/verify-code", { email, code: "123456" }, 400);
  }

  const passages = await db.query("select id from passages where status = 'published' order by id limit 2");
  assert.equal(passages.rowCount, 2);
  const path = `/api/attempts/${passages.rows[0].id}`;
  const secondPath = `/api/attempts/${passages.rows[1].id}`;
  const guest = (await a.request(path)).attempt;
  const oldGuestCookie = a.cookie();
  const questions = await db.query("select question_number from questions where passage_id = $1", [passages.rows[0].id]);
  const answers = Object.fromEntries(questions.rows.map((row) => [String(row.question_number), 0]));
  await a.request(path, { attemptId: guest.id, answers }, 200, "PATCH");
  const submitted = await a.request(`${path}/submit`, { attemptId: guest.id, answers });
  const draft = (await a.request(secondPath)).attempt;
  const codeA = await sendCode(a, ` ${emailA.toUpperCase()} `);
  await a.request("/api/auth/request-code", { email: emailA }, 429);
  await verify(a, emailA, codeA === "000000" ? "000001" : "000000", 400);
  await verify(a, emailA, codeA);
  assert.notEqual(a.cookie(), oldGuestCookie, "Login must rotate the session");
  assert.equal((await session(browser(oldGuestCookie))).user, null, "Guest session must be revoked after migration");
  await verify(browser(), emailA, codeA, 400);
  const restored = await a.request(path);
  assert.equal(restored.attempt.id, guest.id);
  assert.deepEqual(restored.attempt.answers, answers);
  assert.equal(restored.grade.score, submitted.score);
  assert.equal((await a.request(`${path}/access`)).allowed, true);
  assert.equal((await a.request(secondPath)).attempt.id, draft.id);

  // Advance only this run's OTP timestamp instead of waiting for the resend cooldown.
  await db.query("update email_login_codes set created_at = now() - interval '2 minutes' where email = $1", [emailA]);
  const guestB = (await b.request(path)).attempt;
  await verify(b, emailA, await sendCode(b, emailA));
  assert.equal((await session(a)).user.email, emailA, "Second device must not log out the first");
  assert.equal((await session(b)).user.email, emailA);
  assert.equal((await b.request(path)).attempt.id, guestB.id);
  assert.equal((await b.request(`${path}/access`)).allowed, true, "Existing submission survives guest merge");
  assert.equal((await b.request(secondPath)).attempt.id, draft.id, "Draft must sync across devices");
  const history = await db.query("select count(*)::int as count from practice_attempts p join app_users u on u.id=p.user_id where u.email=$1", [emailA]);
  assert.equal(history.rows[0].count, 3, "Guest merge must preserve both histories without duplication");

  await verify(other, emailB, await sendCode(other, emailB));
  assert.deepEqual((await other.request("/api/attempts")).attempts, []);
  await other.request(secondPath, { attemptId: draft.id, answers: {} }, 404, "PATCH");
  assert.equal((await other.request(`${path}/access`)).allowed, false);
  const loggedOutCookie = a.cookie();
  await a.request("/api/auth/logout", {});
  assert.equal((await session(browser(loggedOutCookie))).user, null);
  assert.equal((await session(b)).user.email, emailA, "Logout is device-local");
  assert.deepEqual((await a.request("/api/attempts")).attempts, []);

  const expiredEmail = `${prefix}-expired@example.invalid`;
  const expired = await sendCode(browser(), expiredEmail);
  await db.query("update email_login_codes set expires_at = now() - interval '1 minute' where email = $1", [expiredEmail]);
  await verify(browser(), expiredEmail, expired, 400);
  const lockedEmail = `${prefix}-locked@example.invalid`;
  const correct = await sendCode(browser(), lockedEmail);
  for (let i = 0; i < 5; i++) await verify(browser(), lockedEmail, correct === "000000" ? "000001" : "000000", 400);
  await verify(browser(), lockedEmail, correct, 400);
  const concurrentEmail = `${prefix}-concurrent@example.invalid`;
  const concurrentCode = await sendCode(browser(), concurrentEmail);
  const results = await Promise.all([1, 2].map(() => fetch(new URL("/api/auth/verify-code", base), {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: concurrentEmail, code: concurrentCode }),
    redirect: "error", signal: AbortSignal.timeout(20_000),
  })));
  assert.deepEqual(results.map((response) => response.status).sort(), [200, 400], "Concurrent OTP use must succeed only once");
  const supersededEmail = `${prefix}-superseded@example.invalid`;
  const first = await sendCode(browser(), supersededEmail);
  await db.query("update email_login_codes set created_at = now() - interval '2 minutes' where email = $1", [supersededEmail]);
  const second = await sendCode(browser(), supersededEmail);
  if (first !== second) await verify(browser(), supersededEmail, first, 400);
  await verify(browser(), supersededEmail, second);
  await verify(browser(), supersededEmail, first, 400);
  console.log("Auth flow passed: local mail, OTP validation, guest merge, cross-device access, account isolation and logout.");
} finally {
  await db.end();
}
