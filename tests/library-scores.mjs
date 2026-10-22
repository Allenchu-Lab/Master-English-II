import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import pg from 'pg';

const client = new pg.Client({connectionString:'postgresql://chitouen_local@127.0.0.1:55432/chitouen_local'});
await client.connect();
try {
  // Session-local tables isolate these checks from all existing practice records.
  await client.query(`
    set timezone='UTC';
    create temp table practice_attempts(id text,user_id text,passage_id text,submitted_at timestamptz,score integer);
    create temp table writing_attempts(id text,user_id text,task_id text,submitted_at timestamptz,updated_at timestamptz,answer text,review jsonb);
    create temp table translation_attempts(id text,user_id text,task_id text,submitted_at timestamptz,answer text,review jsonb);
    create temp table translation_tasks(id text,section_id text);
    create temp table exam_sections(id text,paper_id text);
    create temp table exam_papers(id text,year integer);
    insert into practice_attempts values
      ('r1','me','p1','2026-01-01',5),('r2','me','p1','2026-01-02',0),('r3','me','p1',null,null),('r4','other','p1','2026-01-03',4);
    insert into writing_attempts values
      ('w1','me','a','2026-01-01','2026-01-01','old','{"score":8}'),
      ('w2','me','a','2026-01-02','2026-01-02','new','{"score":0}'),
      ('w3','me','a',null,'2026-01-03','draft',null),
      ('w4','other','a','2026-01-04','2026-01-04','other','{"score":9}'),
      ('w5','me','b','2026-01-01','2026-01-01','old','{"score":12}'),
      ('w6','me','b','2026-01-02','2026-01-02','pending',null);
    insert into exam_papers values ('paper','2025');
    insert into exam_sections values ('section','paper');
    insert into translation_tasks values ('task','section');
    insert into translation_attempts values
      ('t1','me','task','2026-01-01','old','{"score":14}'),
      ('t2','me','task','2026-01-02','pending',null),
      ('t3','me','task',null,'draft',null),
      ('t4','other','task','2026-01-04','other','{"score":15}');
    alter table translation_attempts add column updated_at timestamptz default '2026-01-03';
  `);
  const run = async path => {
    const source=readFileSync(new URL(`../src/app/api/${path}/route.ts`,import.meta.url),'utf8');
    return (await client.query(source.match(/`([\s\S]*?)`/)[1],['me'])).rows;
  };
  const reading=await run('attempts');
  assert.deepEqual(reading.map(({passage_id,submitted,correct_count})=>({passage_id,submitted,correct_count})),[{passage_id:'p1',submitted:true,correct_count:0}]);
  assert.equal(reading[0].completed_at.toISOString(),'2026-01-02T00:00:00.000Z');
  const writing=await run('writing-attempts');
  assert.equal(writing.find(item=>item.task_id==='a').latest_score,0);
  assert.equal(writing.find(item=>item.task_id==='a').submitted,false);
  assert.equal(writing.find(item=>item.task_id==='a').has_submission,true);
  assert.equal(writing.find(item=>item.task_id==='b').latest_score,null);
  const translation=await run('translation-attempts');
  assert.deepEqual(translation.map(({year,submitted,has_draft,latest_score})=>({year,submitted,has_draft,latest_score})),[{year:2025,submitted:true,has_draft:true,latest_score:null}]);
  assert.equal(translation[0].completed_at.toISOString(),'2026-01-02T00:00:00.000Z');
  assert.equal(writing.find(item=>item.task_id==='a').completed_at.toISOString(),'2026-01-02T00:00:00.000Z');
  await client.query("update translation_attempts set updated_at='2026-01-01' where id='t3'");
  assert.equal((await run('translation-attempts'))[0].has_draft,false,'An older draft must not override a later submission');
  const detailSource=readFileSync(new URL('../src/app/api/translation-attempts/[taskId]/route.ts',import.meta.url),'utf8');
  const detailSql=detailSource.match(/`([\s\S]*?)`/)[1];
  assert.equal((await client.query(detailSql,['me','task'])).rows[0].id,'t2','Detail page must open the submitted response, not the older draft');
  await client.query("update translation_attempts set updated_at='2026-01-03' where id='t3'");
  assert.equal((await client.query(detailSql,['me','task'])).rows[0].id,'t3','A genuine newer redo draft remains editable');
  console.log('Library scores passed: latest submission, zero score, draft coexistence, pending review, and user isolation.');
} finally { await client.end(); }
