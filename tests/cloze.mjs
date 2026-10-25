import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import pg from 'pg';
import { gradeCloze, validClozeAnswers } from '../src/lib/cloze.ts';

const tasks=JSON.parse(readFileSync('content/cloze/tasks.json','utf8'));
assert.deepEqual(tasks.map(t=>t.year),Array.from({length:17},(_,i)=>2010+i));
for(const task of tasks) {
  assert.deepEqual(task.questions.map(q=>q.number),Array.from({length:20},(_,i)=>i+1));
  assert.deepEqual(task.paragraphs.flatMap(p=>[...p.matchAll(/\{\{(\d+)\}\}/g)].map(m=>Number(m[1]))),Array.from({length:20},(_,i)=>i+1));
  assert.equal(task.keys.length,20);
  for(const q of task.questions)assert.equal(q.options.length,4);
  for(const k of task.keys){assert.match(k.answer,/^[A-D]$/);assert.ok(k.explanation.length>=30);}
  assert.equal(gradeCloze(Object.fromEntries(task.keys.map(k=>[k.number,k.answer])),task.keys),10);
  assert.equal(gradeCloze({'1':task.keys[0].answer},task.keys),0.5);
  assert.equal(gradeCloze({},task.keys),0);
  assert.equal(validClozeAnswers({'1':'A','2':'A'},task),true,'Options are independent across questions');
  for(const value of [null,[],{'0':'A'},{'21':'A'},{'01':'A'},{'1':'E'},{'1':1},{'1':['A']},{'1':'a'}])assert.equal(validClozeAnswers(value,task),false);
}
const db=new pg.Client({connectionString:'postgresql://chitouen_local@127.0.0.1:55432/chitouen_local'});
await db.connect();
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3000';
assert.match(base,/^http:\/\/127\.0\.0\.1:\d+$/);
let cookie='';
const tokens=new Set();
async function api(path,body,ownCookie) {
  const response=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Cookie:ownCookie??cookie},...(body?{body:JSON.stringify(body)}:{})});
  const setCookie=response.headers.get('set-cookie');
  if(setCookie){const next=setCookie.split(';')[0];tokens.add(next.split('=')[1]);if(ownCookie===undefined)cookie=next;}
  return {status:response.status,data:await response.json()};
}
try {
  assert.equal((await db.query('show data_directory')).rows[0].data_directory,`${process.cwd()}/.local-db/data`);
  const task=(await db.query(`select t.id,k.keys from cloze_tasks t join private.cloze_keys k on k.task_id=t.id where t.content->>'year'='2026'`)).rows[0];
  const path=`/api/cloze-attempts/${task.id}`;
  assert.equal((await api(path)).data.attempt,null);
  for(const answers of [{'1':'E'},{'21':'A'}])assert.equal((await api(path,{action:'save',answers,attemptId:null,elapsedSeconds:0})).status,400);
  assert.equal((await api(path,{action:'submit',answers:{},attemptId:null,elapsedSeconds:0})).status,400);
  const draft=await api(path,{action:'save',answers:{'1':'A','2':'A'},attemptId:null,elapsedSeconds:10});
  assert.equal(draft.status,200);assert.equal(draft.data.attempt.feedback,null);assert.equal(draft.data.attempt.score,null);
  assert.deepEqual((await api(path)).data.attempt.answers,{'1':'A','2':'A'});
  const one={'1':task.keys[0].answer};
  const submitted=await api(path,{action:'submit',answers:one,attemptId:draft.data.attempt.id,elapsedSeconds:20,score:10});
  assert.equal(submitted.status,200);assert.equal(submitted.data.attempt.score,0.5,'Client score ignored');assert.equal(submitted.data.attempt.feedback.length,20);
  assert.equal((await api(path,{action:'submit',answers:one,attemptId:draft.data.attempt.id,elapsedSeconds:20})).data.attempt.id,submitted.data.attempt.id);
  assert.equal((await api(path,{action:'save',answers:one,attemptId:draft.data.attempt.id,elapsedSeconds:21})).status,409);
  assert.equal((await api(path,undefined,'')).data.attempt,null,'Private responses must not leak between users');
  assert.equal((await api('/api/cloze-attempts')).data.attempts.find(a=>a.task_id===task.id).score,0.5);
  const redo=await api(path,{action:'redo',answers:{},attemptId:draft.data.attempt.id,elapsedSeconds:0});
  assert.equal(redo.status,200);assert.equal(redo.data.attempt.score,null);assert.equal(redo.data.attempt.feedback,null);assert.deepEqual(redo.data.attempt.answers,{});
  assert.equal((await api(path,{action:'save',answers:one,attemptId:draft.data.attempt.id,elapsedSeconds:20})).status,409);
  const row=(await api('/api/cloze-attempts')).data.attempts.find(a=>a.task_id===task.id);
  assert.equal(row.score,null);assert.equal(row.submitted_at,null);
  for(const year of tasks.map(t=>t.year)) {
    const response=await fetch(`${base}/cloze/${year}`);
    assert.equal(response.status,200);
    const html=await response.text();assert.ok(!html.includes('answerSource'));assert.ok(!html.includes('"explanation"'));
    const item=(await db.query(`select t.id,k.keys from cloze_tasks t join private.cloze_keys k on k.task_id=t.id where t.content->>'year'=$1`,[String(year)])).rows[0];
    const previous=await api(`/api/cloze-attempts/${item.id}`);
    const result=await api(`/api/cloze-attempts/${item.id}`,{action:'submit',answers:Object.fromEntries(item.keys.map(k=>[k.number,k.answer])),attemptId:previous.data.attempt?.id??null,elapsedSeconds:30});
    assert.equal(result.status,200);assert.equal(result.data.attempt.score,10,`${year}: full key scores 10`);
  }
  assert.equal((await fetch(`${base}/cloze/2009`)).status,404);
  console.log('Cloze passed: 17 papers, 340 questions, half-point grading, validation, privacy, save/submit/redo concurrency and page availability.');
} finally {
  for(const token of tokens) {
    const hash=createHash('sha256').update(decodeURIComponent(token)).digest('hex');
    await db.query('delete from app_users where is_anonymous=true and id in (select user_id from user_sessions where token_hash=$1)',[hash]);
  }
  await db.end();
}
