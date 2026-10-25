import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as validation from '../src/lib/translation-review.ts';

const source=readFileSync('src/app/api/translation-attempts/[taskId]/review/route.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const id='00000000-0000-4000-8000-000000000001';
const original='Clothes can improve confidence.';
const answer='衣服会降低信心。';
const valid={score:10,summary:'词义颠倒。',reference:'衣服能增强信心。',sentences:[{original,translation:answer,suggestion:'衣服能增强信心。',deductions:[{source:'improve',quote:'降低',category:'meaning',severity:'major',reason:'把增强译成降低。'}]}],patterns:[],vocabulary:[]};
let stored=null;
let saved=null;
const modules={
  '@/lib/review-rubrics':{TRANSLATION_RUBRIC:'UNCHANGED_RUBRIC'},
  '@/lib/translation-review':validation,
  'next/server':{NextResponse:{json:(value,options)=>Response.json(value,options)}},
  '@/lib/db':{query:async(sql,values)=>{if(sql.startsWith('update')){saved=JSON.parse(values[0]);return {rows:[]};}return {rows:[{id,passage:original,answer,review:stored}]};}},
  '@/lib/auth/session':{getOrCreateSessionUser:async()=>({id})},
  '@/lib/rate-limit':{rateLimit:()=>false,clientKey:()=> 'local-test'},
};
const exports={};
new Function('require','exports',js)(name=>{assert.ok(modules[name],name);return modules[name];},exports);
const realFetch=globalThis.fetch;
const realKey=process.env.DEEPSEEK_API_KEY;
process.env.DEEPSEEK_API_KEY='test-only';
const request=()=>exports.POST(new Request('http://localhost/review',{method:'POST',body:JSON.stringify({attemptId:id})}),{params:Promise.resolve({taskId:id})});
try {
  const calls=[];
  globalThis.fetch=async(_url,options)=>{calls.push(JSON.parse(options.body));return Response.json({choices:[{message:{content:JSON.stringify(valid)}}]});};
  assert.equal((await request()).status,200);
  assert.equal(calls.length,1);
  assert.ok(calls[0].messages[0].content.includes('UNCHANGED_RUBRIC'));
  assert.equal(saved.sentences[0].reason,valid.sentences[0].deductions[0].reason);
  stored=saved;
  assert.equal((await request()).status,200);assert.equal(calls.length,1,'Cached review must avoid a model call');
  stored=null;saved=null;calls.length=0;
  const bad=structuredClone(valid);bad.sentences[0].deductions[0].quote='invented';
  globalThis.fetch=async(_url,options)=>{calls.push(JSON.parse(options.body));return Response.json({choices:[{message:{content:JSON.stringify(calls.length===1?bad:valid)}}]});};
  assert.equal((await request()).status,200);assert.equal(calls.length,2);
  const repair=JSON.parse(calls[1].messages[1].content);
  assert.equal(repair.previousReview,JSON.stringify(bad));assert.match(repair.repairInstruction,/answer-quote/);
  calls.length=0;saved=null;
  globalThis.fetch=async()=>{calls.push({});return Response.json({error:'unavailable'},{status:503});};
  assert.equal((await request()).status,502);assert.equal(calls.length,1,'Provider errors must not trigger a blind regeneration');assert.equal(saved,null);
  globalThis.fetch=async()=>Response.json({choices:[{message:{content:JSON.stringify({...valid,score:15,sentences:[]})}}]});
  const perfect=await (await request()).json();assert.equal(perfect.review.score,15);assert.deepEqual(perfect.review.sentences,[]);
  console.log('Translation route passed: unchanged rubric, compact review, cache, targeted repair, provider failure and no-issue review.');
}finally{
  globalThis.fetch=realFetch;
  if(realKey===undefined)delete process.env.DEEPSEEK_API_KEY;else process.env.DEEPSEEK_API_KEY=realKey;
}
