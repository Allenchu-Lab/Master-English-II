import assert from 'node:assert/strict';
import pg from 'pg';
import { randomUUID, createHash } from 'node:crypto';
assert.equal(process.env.ALLOW_TEST_WRITES,'1');
const base=new URL(process.env.TEST_BASE_URL||'http://127.0.0.1:3000');assert.ok(['127.0.0.1','localhost'].includes(base.hostname));
const db=new pg.Client({connectionString:'postgresql://chitouen_local@127.0.0.1:55432/chitouen_local'});await db.connect();let user;
try{
 assert.equal((await (await fetch(new URL('/api/resume-practice',base))).json()).resume,null);
 user=(await db.query('insert into app_users(email,is_anonymous) values($1,false) returning id',[`resume-test-${randomUUID()}@example.invalid`])).rows[0].id;
 const token=randomUUID();await db.query("insert into user_sessions(user_id,token_hash,expires_at) values($1,$2,now()+interval '10 minutes')",[user,createHash('sha256').update(token).digest('hex')]);
 const get=async()=>{const r=await fetch(new URL('/api/resume-practice',base),{headers:{cookie:`master_english_session=${token}`}});assert.equal(r.status,200);return (await r.json()).resume;};
 assert.equal(await get(),null);
 const passage=(await db.query("select id from passages where status='published' limit 1")).rows[0].id;
 const task=(await db.query("select id from writing_tasks where status='published' limit 1")).rows[0].id;
 const reading=(await db.query('insert into practice_attempts(user_id,passage_id) values($1,$2) returning id',[user,passage])).rows[0].id;
 assert.equal(await get(),null,'empty draft hidden');
 await db.query("update practice_attempts set answers='{\"1\":0}',updated_at=now()-interval '1 minute' where id=$1",[reading]);
 assert.equal((await get()).kind,'reading_a');
 const writing=(await db.query("insert into writing_attempts(user_id,task_id,answer) values($1,$2,'Test response') returning id",[user,task])).rows[0].id;
 let result=await get();assert.equal(result.kind,'writing');assert.match(result.href,/\?part=[AB]$/);
 await db.query('update practice_attempts set updated_at=now() where id=$1',[reading]);assert.equal((await get()).kind,'reading_a','latest save wins');
 await db.query('update practice_attempts set submitted_at=now() where id=$1',[reading]);assert.equal((await get()).kind,'writing','submitted excluded');
 await db.query('update writing_attempts set submitted_at=now() where id=$1',[writing]);assert.equal(await get(),null);
 assert.equal((await (await fetch(new URL('/api/resume-practice',base))).json()).resume,null,'other sessions see no user data');
 console.log('Resume practice tests passed: empty, latest save, submitted, route and isolation.');
}finally{if(user)await db.query('delete from app_users where id=$1',[user]);await db.end();}
