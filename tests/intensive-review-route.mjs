import { loadTs } from './load-ts.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
function load(path,modules={}) {
 const exports={};
 const js=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','exports',js)(name=>{assert.ok(modules[name],name);return modules[name];},exports);return exports;
}
const stream=load('src/lib/review-stream.ts');
const route=load('src/app/api/intensive-reading/route.ts',{
 '@/lib/review-stream':stream,
 '@/lib/deepseek-config':{deepseekModel:'deepseek-flash',deepseekThinking:{type:'disabled'}},
  '@/lib/deepseek-client':loadTs('src/lib/deepseek-client.ts',{'./deepseek-config':{deepseekModel:'deepseek-flash',deepseekThinking:{type:'disabled'}}}),
 'next/server':{NextResponse:class NextResponse{static json(data,options){return Response.json(data,options);}}},
 '@/lib/auth/guard':{requireUser:async()=>({id:'test',isAnonymous:false})},
 '@/lib/log':{logError(){},logWarn(){}},
 '@/lib/rate-limit':{clientKey:()=> 'test',rateLimit:()=>false},
});
const valid={summary:'段意',translation:'译文',structure:[],vocabulary:[],examTip:'提示'};
const request=()=>new Request('http://localhost/api/intensive-reading',{method:'POST',headers:{Accept:'application/x-ndjson','Content-Type':'application/json'},body:JSON.stringify({paragraph:'A short paragraph.',year:2026,text:1,paragraphNumber:1})});
const realFetch=globalThis.fetch,realKey=process.env.DEEPSEEK_API_KEY;
process.env.DEEPSEEK_API_KEY='test';
async function events(){return (await (await route.POST(request())).text()).trim().split('\n').map(JSON.parse);}
try {
 let calls=0;
 globalThis.fetch=async()=>++calls===1?Response.json({error:'server'},{status:500}):Response.json({choices:[{message:{content:JSON.stringify(valid)}}]});
 let output=await events();assert.equal(calls,2);assert.deepEqual(output.at(-1),{ok:true,data:valid});assert.deepEqual(output.filter(x=>'stage'in x).map(x=>x.stage),[0,1,2,3,4]);
 calls=0;globalThis.fetch=async()=>{calls++;return Response.json({error:'server'},{status:500});};
 output=await events();assert.equal(calls,2);assert.equal(output.at(-1).ok,false);assert.match(output.at(-1).data.error,/服务暂时异常/);assert.ok(!output.some(x=>x.stage===4));
 calls=0;globalThis.fetch=async()=>{calls++;return Response.json({},{status:401});};
 output=await events();assert.equal(calls,1);assert.match(output.at(-1).data.error,/密钥/);
 globalThis.fetch=async()=>({ok:true,json:async()=>{throw new DOMException('timeout','TimeoutError');}});
 output=await events();assert.match(output.at(-1).data.error,/超时/,'timeout while consuming provider body must be caught');
}finally{globalThis.fetch=realFetch;if(realKey===undefined)delete process.env.DEEPSEEK_API_KEY;else process.env.DEEPSEEK_API_KEY=realKey;}
console.log('Intensive route retry, failure and streaming tests passed.');
