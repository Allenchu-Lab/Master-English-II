import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import pg from 'pg';

assert.equal(process.env.ALLOW_TEST_WRITES, '1');
const base = new URL(process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000');
assert.ok(base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname));
const db = new pg.Client({ connectionString: 'postgresql://chitouen_local@127.0.0.1:55432/chitouen_local' });
await db.connect();
let userId;
try {
  assert.equal((await db.query('show data_directory')).rows[0].data_directory, new URL('../.local-db/data', import.meta.url).pathname);
  userId = (await db.query('insert into app_users(email,is_anonymous) values($1,false) returning id', [`partial-${randomUUID()}@example.invalid`])).rows[0].id;
  const token = randomUUID();
  await db.query("insert into user_sessions(user_id,token_hash,expires_at) values($1,$2,now()+interval '1 day')", [userId, createHash('sha256').update(token).digest('hex')]);
  const headers = { cookie: `master_english_session=${token}`, 'content-type': 'application/json' };
  const key = (await db.query(`select q.passage_id,q.question_number,k.correct_option from questions q join private.question_keys k on k.question_id=q.id where q.status='published' order by q.passage_id,q.question_number limit 1`)).rows[0];
  const path = `/api/attempts/${key.passage_id}`;
  const call = (url, body, method = 'POST') => fetch(new URL(url, base), { headers, method, body: JSON.stringify(body) });
  const opened = await fetch(new URL(path, base), { headers });
  const { attempt } = await opened.json();
  for (const answers of [{ [key.question_number]: 4 }, { [key.question_number]: null }, { 999: 0 }]) {
    assert.equal((await call(`${path}/submit`, { attemptId: attempt.id, answers })).status, 400);
  }
  const partial = await call(`${path}/submit`, { attemptId: attempt.id, answers: { [key.question_number]: key.correct_option } });
  assert.equal(partial.status, 200);
  const grade = await partial.json();
  assert.equal(grade.score, 1);
  assert.equal(grade.questions.filter(question => question.selectedOption === -1).length, grade.total - 1);
  const restored = await (await fetch(new URL(path, base), { headers })).json();
  assert.ok(restored.attempt.submitted_at);
  assert.deepEqual(restored.grade, grade);
  const fresh = await (await call(path, {})).json();
  const blank = await call(`${path}/submit`, { attemptId: fresh.attempt.id, answers: {} });
  assert.equal(blank.status, 200);
  assert.equal((await blank.json()).score, 0);
  assert.equal((await db.query('select count(*) from practice_attempts where user_id=$1 and submitted_at is not null', [userId])).rows[0].count, '2');
  console.log('PASS: partial and blank submissions grade missing answers as incorrect, survive reload, retain history, and reject invalid choices.');
} finally {
  if (userId) await db.query('delete from app_users where id=$1', [userId]);
  await db.end();
}
