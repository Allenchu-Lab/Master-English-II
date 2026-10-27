import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import pg from 'pg';

assert.equal(process.env.ALLOW_TEST_WRITES, '1');
const base = new URL(process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000');
assert.ok(base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname));
const db = new pg.Client({ connectionString: 'postgresql://chitouen_local@127.0.0.1:55432/chitouen_local' });
await db.connect();
const email = `practice-auth-${randomUUID()}@example.invalid`;
let cookie = '';
let guestId;
async function request(path, body) {
  return fetch(new URL(path, base), { method: body ? 'POST' : 'GET', headers: { cookie, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
}
try {
  const directory = (await db.query('show data_directory')).rows[0].data_directory;
  assert.equal(directory, new URL('../.local-db/data', import.meta.url).pathname);
  const config = await (await request('/api/auth/session')).json();
  assert.equal(config.localMail, true, 'Do not send real email');
  const before = (await db.query('select count(*) from app_users where is_anonymous')).rows[0].count;
  for (const type of ['attempts', 'writing-attempts', 'translation-attempts', 'reading-b-attempts', 'cloze-attempts']) {
    const response = await request(`/api/${type}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.deepEqual(await response.json(), { attempts: [] });
  }
  assert.equal((await db.query('select count(*) from app_users where is_anonymous')).rows[0].count, before);
  const paths = [];
  for (const [table, route] of [['passages', 'attempts'], ['writing_tasks', 'writing-attempts'], ['translation_tasks', 'translation-attempts'], ['reading_b_tasks', 'reading-b-attempts'], ['cloze_tasks', 'cloze-attempts']]) {
    const { id } = (await db.query(`select id from ${table} where status='published' limit 1`)).rows[0];
    paths.push(`/api/${route}/${id}`);
    assert.equal((await request(paths.at(-1))).status, 401);
  }
  for (const route of ['dictionary', 'intensive-reading']) assert.equal((await request(`/api/${route}`, {})).status, 401);
  guestId = (await db.query('insert into app_users(is_anonymous) values(true) returning id')).rows[0].id;
  const token = randomUUID();
  await db.query("insert into user_sessions(user_id,token_hash,expires_at) values($1,$2,now()+interval '1 day')", [guestId, createHash('sha256').update(token).digest('hex')]);
  cookie = `master_english_session=${token}`;
  for (const path of paths) assert.equal((await request(path)).status, 401, 'Legacy guest cannot bypass login');
  const taskId = paths[2].split('/').at(-1);
  await db.query("insert into translation_attempts(user_id,task_id,answer,submitted_at) values($1,$2,'已提交的游客译文',now()),($1,$2,'游客翻译草稿',null)", [guestId, taskId]);
  assert.equal((await request('/api/auth/request-code', { email })).status, 200);
  const mail = readFileSync(new URL('../.local-db/mail.jsonl', import.meta.url), 'utf8').trim().split('\n').map(JSON.parse).findLast(entry => entry.email === email);
  const signedIn = await request('/api/auth/verify-code', { email, code: mail.code });
  assert.equal(signedIn.status, 200);
  cookie = signedIn.headers.get('set-cookie').split(';')[0];
  const translated = await db.query('select answer from translation_attempts where user_id=(select id from app_users where email=$1)', [email]);
  assert.deepEqual(translated.rows.map(row => row.answer).sort(), ['已提交的游客译文', '游客翻译草稿'].sort());
  for (const path of paths) assert.equal((await request(path)).status, 200, path);
  assert.equal((await request('/api/auth/logout', {})).status, 200);
  assert.equal((await request(paths[0])).status, 401);
  console.log('PASS: browsing creates no guests; five practice APIs require login; OTP login and logout enforce access.');
} finally {
  await db.query('delete from app_users where email=$1', [email]);
  if (guestId) await db.query('delete from app_users where id=$1', [guestId]);
  await db.query('delete from email_login_codes where email=$1', [email]);
  await db.end();
}
