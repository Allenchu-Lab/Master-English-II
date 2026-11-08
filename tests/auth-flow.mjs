import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
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
    setCookie: (value) => { cookie = value; },
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

let guestId;
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
  // Browsing never creates a guest; the practice APIs reject anonymous callers.
  await a.request(path, undefined, 401);
  assert.deepEqual((await a.request("/api/attempts")).attempts, []);

  // The app no longer creates guests, but verify-code still migrates a pre-existing
  // anonymous session. Seed one directly (as practice-auth does) to cover that path.
  guestId = (await db.query("insert into app_users(is_anonymous) values(true) returning id")).rows[0].id;
  const guestToken = randomUUID();
  await db.query("insert into user_sessions(user_id,token_hash,expires_at) values($1,$2,now()+interval '1 day')",
    [guestId, createHash("sha256").update(guestToken).digest("hex")]);
  a.setCookie(`master_english_session=${guestToken}`);
  const oldGuestCookie = a.cookie();
  const questions = await db.query("select question_number from questions where passage_id = $1 and status='published'", [passages.rows[0].id]);
  const answers = Object.fromEntries(questions.rows.map((row) => [String(row.question_number), 0]));
  const guestAttempt = (await db.query(
    "insert into practice_attempts(user_id,passage_id,answers,score,submitted_at) values($1,$2,$3,0,now()) returning id",
    [guestId, passages.rows[0].id, JSON.stringify(answers)])).rows[0].id;
  const guestDraft = (await db.query(
    "insert into practice_attempts(user_id,passage_id,answers) values($1,$2,$3) returning id",
    [guestId, passages.rows[1].id, JSON.stringify(answers)])).rows[0].id;
  const clozeTasks = await db.query("select id from cloze_tasks where status='published' order by id limit 2");
  const clozePath = `/api/cloze-attempts/${clozeTasks.rows[0].id}`;
  const clozeDraftPath = `/api/cloze-attempts/${clozeTasks.rows[1].id}`;
  const guestCloze = (await db.query(
    "insert into cloze_attempts(user_id,task_id,answers,score,submitted_at) values($1,$2,$3,0,now()) returning id",
    [guestId, clozeTasks.rows[0].id, JSON.stringify({ '1': 'A' })])).rows[0].id;
  await db.query("insert into cloze_attempts(user_id,task_id,answers,elapsed_seconds) values($1,$2,$3,15)",
    [guestId, clozeTasks.rows[1].id, JSON.stringify({ '2': 'B' })]);

  const codeA = await sendCode(a, ` ${emailA.toUpperCase()} `);
  await a.request("/api/auth/request-code", { email: emailA }, 429);
  await verify(a, emailA, codeA === "000000" ? "000001" : "000000", 400);
  await verify(a, emailA, codeA);
  assert.notEqual(a.cookie(), oldGuestCookie, "Login must rotate the session");
  assert.equal((await session(browser(oldGuestCookie))).user, null, "Guest session must be revoked after migration");
  await verify(browser(), emailA, codeA, 400);
  const restored = await a.request(path);
  assert.equal(restored.attempt.id, guestAttempt, "Guest submission survives login");
  assert.deepEqual(restored.attempt.answers, answers);
  assert.ok(restored.grade, "Submitted review must be restored after migration");
  assert.equal((await a.request(`${path}/access`)).allowed, true);
  assert.equal((await a.request(secondPath)).attempt.id, guestDraft, "Guest draft survives login");
  assert.equal((await a.request(clozePath)).attempt.id, guestCloze, "Guest cloze submission survives login");
  assert.deepEqual((await a.request(clozeDraftPath)).attempt.answers, { '2': 'B' }, "Guest cloze draft survives login");

  // Advance only this run's OTP timestamp instead of waiting for the resend cooldown.
  await db.query("update email_login_codes set created_at = now() - interval '2 minutes' where email = $1", [emailA]);
  await verify(b, emailA, await sendCode(b, emailA));
  assert.equal((await session(a)).user.email, emailA, "Second device must not log out the first");
  assert.equal((await session(b)).user.email, emailA);
  assert.equal((await b.request(path)).attempt.id, guestAttempt, "Merged submission syncs across devices");
  assert.equal((await b.request(`${path}/access`)).allowed, true);
  assert.equal((await b.request(secondPath)).attempt.id, guestDraft, "Draft must sync across devices");
  assert.deepEqual((await b.request(clozeDraftPath)).attempt.answers, { '2': 'B' }, "Cloze draft syncs across devices");
  const history = await db.query("select count(*)::int as count from practice_attempts p join app_users u on u.id=p.user_id where u.email=$1", [emailA]);
  assert.equal(history.rows[0].count, 2, "Cross-device login must not duplicate the merged history");

  await verify(other, emailB, await sendCode(other, emailB));
  assert.deepEqual((await other.request("/api/attempts")).attempts, []);
  await other.request(secondPath, { attemptId: guestDraft, answers: {} }, 404, "PATCH");
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
  console.log("Auth flow passed: local mail, OTP validation, guest rejection, legacy guest merge, cross-device access, account isolation and logout.");
} finally {
  await db.query("delete from app_users where email like $1", [`${prefix}%`]);
  if (guestId) await db.query("delete from app_users where id=$1", [guestId]);
  await db.query("delete from email_login_codes where email like $1", [`${prefix}%`]);
  await db.end();
}
