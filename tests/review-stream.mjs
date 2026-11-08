import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
function load(path) {
  const exports = {};
  const js = ts.transpileModule(readFileSync(path, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('exports', 'require', js)(exports, name => { if (name === '@/styles/runtime-tokens') return load('src/styles/runtime-tokens.ts'); throw Error(name); });
  return exports;
}
const {reviewStream} = load('src/lib/review-stream.ts');
const {requestReview} = load('src/lib/request-review.ts');
const request = () => new Request('http://localhost/review', {headers:{accept:'application/x-ndjson'}});
const realFetch = globalThis.fetch;
try {
  const stages = [];
  globalThis.fetch = async () => reviewStream(request(), async report => {
    report(0);report(1);report(2);report(1);report(3);
    return Response.json({review:{summary:'中文批阅'}});
  });
  assert.deepEqual(await requestReview('/review','id',stage=>stages.push(stage)), {ok:true,data:{review:{summary:'中文批阅'}}});
  assert.deepEqual(stages,[0,1,2,2,3,4], 'repair attempts must not move progress backwards');
  stages.length=0;
  globalThis.fetch=async()=>reviewStream(request(),async report=>{report(1);return Response.json({error:'failed'},{status:502});});
  assert.equal((await requestReview('/review','id',stage=>stages.push(stage))).ok,false);
  assert.ok(!stages.includes(4),'failure must never report completion');
  globalThis.fetch=async()=>reviewStream(request(),async()=>Response.json({review:{cached:true}}));
  assert.equal((await requestReview('/review','id',()=>{})).ok,true);
  const bytes=new TextEncoder().encode('{"stage":1}\n{"ok":true,"data":{"review":"中文"}}\n');
  globalThis.fetch=async()=>new Response(new ReadableStream({start(c){for(const b of bytes)c.enqueue(Uint8Array.of(b));c.close();}}),{headers:{'content-type':'application/x-ndjson'}});
  assert.deepEqual((await requestReview('/review','id',()=>{})).data,{review:'中文'},'fragmented UTF-8 must survive');
  globalThis.fetch=async()=>new Response('{"stage":1}\n',{headers:{'content-type':'application/x-ndjson'}});
  assert.equal((await requestReview('/review','id',()=>{})).ok,false,'truncated stream must fail');
  let resolveRequest;
  let calls=0;
  globalThis.fetch=()=>{calls++;return new Promise(resolve=>{resolveRequest=resolve;});};
  const firstStages=[],secondStages=[];
  const first=requestReview('/same-review','same-attempt',stage=>firstStages.push(stage));
  const second=requestReview('/same-review',{attemptId:'same-attempt'},stage=>secondStages.push(stage));
  assert.equal(calls,1,'Repeated clicks must share the same in-flight review');
  resolveRequest(new Response('{"stage":1}\n{"ok":true,"data":{"review":"shared"}}\n',{headers:{'content-type':'application/x-ndjson'}}));
  assert.deepEqual(await first,await second);assert.deepEqual(firstStages,[1]);assert.deepEqual(secondStages,[1]);
  calls=0;
  globalThis.fetch=async()=>{calls++;return Response.json({error:'retry'},{status:502});};
  await requestReview('/same-review','same-attempt',()=>{});
  await requestReview('/same-review','same-attempt',()=>{});
  assert.equal(calls,2,'Completed/failed requests must be evicted so retry is possible');
  calls=0;
  await Promise.all([requestReview('/review-a','id',()=>{}),requestReview('/review-b','id',()=>{}),requestReview('/review-a','different',()=>{})]);
  assert.equal(calls,3,'Different task/attempt context must never be deduplicated');
  const legacy=await reviewStream(new Request('http://localhost'),async()=>Response.json({error:'unauthorized'},{status:401}));
  assert.equal(legacy.status,401,'JSON clients preserve HTTP status');
} finally {globalThis.fetch=realFetch;}
console.log('Review stream tests passed.');
