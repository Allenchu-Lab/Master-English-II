import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { gradeReadingB, validReadingBAnswers } from '../src/lib/reading-b.ts';

const tasks = JSON.parse(readFileSync(new URL('../content/reading-b/tasks.json', import.meta.url), 'utf8'));
assert.deepEqual(tasks.map(task => task.year), Array.from({length:17},(_,index)=>2010+index));
for (const task of tasks) {
  assert.equal(task.options.length, task.kind === 'true_false' ? 2 : 7);
  assert.deepEqual(task.questions.map(q => q.number), [41,42,43,44,45]);
  assert.equal(task.keys.length, 5);
  for (const key of task.keys) {
    assert.ok(task.options.some(option => option.letter === key.answer));
    assert.ok(task.paragraphs.some(paragraph => paragraph.text.includes(key.evidence)));
  }
  if (task.kind === 'headings') assert.deepEqual(task.paragraphs.filter(p => p.number).map(p => p.number), [41,42,43,44,45]);
  assert.equal(validReadingBAnswers({}, task), true);
  assert.equal(validReadingBAnswers({'41':'A','42':'A'}, task), false);
  assert.equal(validReadingBAnswers(task.kind === 'true_false' ? {'41':'T','42':'T'} : {'41':'A','42':'B'}, task), true);
  for (const value of [null, [], {'40':'A'}, {'41':'H'}, {'41':1}, {'41':'<script>'}]) assert.equal(validReadingBAnswers(value, task), false);
  assert.equal(gradeReadingB(Object.fromEntries(task.keys.map(key => [key.number, key.answer])), task.keys), 10);
  assert.equal(gradeReadingB({}, task.keys), 0);
  assert.equal(gradeReadingB({'41':task.keys[0].answer}, task.keys), 2);
}

const db = new pg.Client({connectionString:'postgresql://chitouen_local@127.0.0.1:55432/chitouen_local'});
await db.connect();
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
assert.match(base, /^http:\/\/127\.0\.0\.1:\d+$/);
const users = new Set();
try {
  assert.equal((await db.query('show data_directory')).rows[0].data_directory, `${process.cwd()}/.local-db/data`);
  const task = (await db.query(`select t.id,t.content,k.keys from reading_b_tasks t join private.reading_b_keys k on k.task_id=t.id order by t.content->>'year' desc limit 1`)).rows[0];
  let cookie = '';
  async function api(path, body, ownCookie) {
    const response = await fetch(base + path, { method:body ? 'POST':'GET', headers:{'Content-Type':'application/json',Cookie:ownCookie ?? cookie}, ...(body ? {body:JSON.stringify(body)}:{}) });
    if (ownCookie === undefined && response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
    return {status:response.status, data:await response.json()};
  }
  const path = `/api/reading-b-attempts/${task.id}`;
  assert.equal((await api(path)).data.attempt, null);
  const invalid = await api(path, {action:'save',attemptId:null,answers:{'41':'H'},elapsedSeconds:0});
  assert.equal(invalid.status, 400);
  for (const action of ['save', 'submit']) {
    assert.equal((await api(path, {action,attemptId:null,answers:{'41':'A','42':'A'},elapsedSeconds:0})).status, 400, 'Duplicate choices must be rejected server-side');
  }
  const draft = await api(path, {action:'save',attemptId:null,answers:{'41':'A'},elapsedSeconds:12});
  assert.equal(draft.status, 200);
  assert.equal(draft.data.attempt.feedback, null);
  assert.equal(draft.data.attempt.score, null);
  users.add(draft.data.attempt.user_id);
  const answers = Object.fromEntries(task.keys.slice(0,2).map(key => [key.number,key.answer]));
  const submitted = await api(path, {action:'submit',attemptId:draft.data.attempt.id,answers,elapsedSeconds:15,score:10});
  assert.equal(submitted.status, 200);
  assert.equal(submitted.data.attempt.score, 4, 'Client-supplied score must be ignored');
  assert.equal(submitted.data.attempt.feedback.length, 5);
  assert.equal((await api(path,{action:'save',attemptId:draft.data.attempt.id,answers:{'41':'B'},elapsedSeconds:16})).status,409,'Late autosave cannot overwrite a submission');
  assert.equal((await api(path,{action:'submit',attemptId:draft.data.attempt.id,answers,elapsedSeconds:15})).data.attempt.id,submitted.data.attempt.id,'Submit retry is idempotent');
  const list = await api('/api/reading-b-attempts');
  assert.equal(list.data.attempts.find(item=>item.task_id===task.id).score, 4);
  const stranger = await api(path, undefined, '');
  assert.equal(stranger.data.attempt, null, 'Other users cannot see saved answers');
  const redo = await api(path,{action:'redo',attemptId:submitted.data.attempt.id,answers:{},elapsedSeconds:0});
  assert.equal(redo.status,200);
  assert.deepEqual(redo.data.attempt.answers,{});
  assert.equal(redo.data.attempt.score,null);
  assert.equal(redo.data.attempt.feedback,null);
  assert.equal((await api(path,{action:'save',attemptId:submitted.data.attempt.id,answers,elapsedSeconds:20})).status,409,'Stale tab cannot overwrite a newer redo');
  const after = (await api('/api/reading-b-attempts')).data.attempts.find(item=>item.task_id===task.id);
  assert.equal(after.submitted_at,null);
  assert.equal(after.score,null);
  assert.equal((await db.query('select count(*) from reading_b_attempts where user_id=$1 and submitted_at is not null',[draft.data.attempt.user_id])).rows[0].count,'1');
  for (const year of tasks.map(task => task.year)) {
    const page = await fetch(`${base}/reading-b/${year}`);
    assert.equal(page.status,200);
    const html = await page.text();
    assert.ok(!html.includes('answerSource'));
    assert.ok(!html.includes('"explanation"'), 'Private explanations must not be in the initial page');
    if (year !== 2026) {
      const item = (await db.query(`select t.id,k.keys from reading_b_tasks t join private.reading_b_keys k on k.task_id=t.id where t.content->>'year'=$1`, [String(year)])).rows[0];
      const allAnswers = Object.fromEntries(item.keys.map(key => [key.number,key.answer]));
      const started = await api(`/api/reading-b-attempts/${item.id}`,{action:'save',attemptId:null,answers:allAnswers,elapsedSeconds:10});
      assert.equal(started.status,200,`${year}: can save all answers`);
      const finished = await api(`/api/reading-b-attempts/${item.id}`,{action:'submit',attemptId:started.data.attempt.id,answers:allAnswers,elapsedSeconds:20});
      assert.equal(finished.data.attempt.score,10,`${year}: full answer key scores ten`);
    }
  }
  console.log('Reading B passed: source integrity, grading, validation, autosave races, idempotency, privacy, redo and page availability.');
} finally {
  for (const id of users) await db.query('delete from app_users where id=$1 and is_anonymous=true',[id]);
  await db.end();
}
