import assert from "node:assert/strict";

assert.equal(process.env.ALLOW_TEST_WRITES, "1", "Set ALLOW_TEST_WRITES=1 to acknowledge that this test creates practice records.");

const baseUrl = (process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const year = process.env.TEST_YEAR ?? "2026";
const text = process.env.TEST_TEXT ?? "1";
let cookie = "";

async function request(path, init = {}) {
  const headers = new Headers(init.headers);
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers, signal: AbortSignal.timeout(20_000) });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";", 1)[0];
  return response;
}

async function json(path, init = {}, expectedStatus = 200) {
  const response = await request(path, init);
  assert.equal(response.status, expectedStatus, `${init.method ?? "GET"} ${path} returned ${response.status}`);
  return response.json();
}

const page = await request(`/practice/${year}/${text}?lang=en`);
assert.equal(page.status, 200, "Practice page did not open");
const html = await page.text();
const passageId = html.match(/\\"passage\\":\{\\"id\\":\\"([0-9a-f-]{36})\\"/i)?.[1];
assert.ok(passageId, "Could not find the passage ID in the practice page");

const attemptPath = `/api/attempts/${passageId}`;
const opened = await json(attemptPath);
assert.ok(opened.attempt?.id, "Opening practice did not create an attempt");
assert.equal(opened.attempt.submitted_at, null);

const accessBefore = await json(`${attemptPath}/access`);
assert.equal(accessBefore.allowed, false, "Intensive reading unlocked before submission");

const answers = Object.fromEntries([21, 22, 23, 24, 25].map((number) => [String(number), 0]));
await json(attemptPath, {
  method: "PATCH",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ attemptId: opened.attempt.id, answers }),
});

const restored = await json(attemptPath);
assert.deepEqual(restored.attempt.answers, answers, "Saved answers were not restored");

const grade = await json(`${attemptPath}/submit`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ attemptId: opened.attempt.id, answers }),
});
assert.equal(grade.total, 5, "Submission did not grade all five questions");
assert.equal(grade.questions?.length, 5, "Submission did not return five question results");

const accessAfter = await json(`${attemptPath}/access`);
assert.equal(accessAfter.allowed, true, "Intensive reading did not unlock after submission");

const submitted = await json(attemptPath);
assert.equal(submitted.attempt.id, opened.attempt.id);
assert.equal(submitted.grade?.total, 5, "Submitted review did not restore the grade");

const redo = await json(attemptPath, { method: "POST" });
assert.ok(redo.attempt?.id && redo.attempt.id !== opened.attempt.id, "Redo did not create a fresh attempt");
assert.equal(redo.attempt.submitted_at, null);

const latest = await json(attemptPath);
assert.equal(latest.attempt.id, redo.attempt.id, "Refresh did not keep the latest Redo attempt");

console.log(`Core learning flow passed for ${year} Text ${text} against ${baseUrl}`);
