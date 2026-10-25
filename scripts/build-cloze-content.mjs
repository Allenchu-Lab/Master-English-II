import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const tasks = JSON.parse(readFileSync('content/cloze/tasks.json','utf8'));
if (tasks.length !== 17) throw Error('Expected all 17 papers');
const quote = value => "'"+JSON.stringify(value).replaceAll("'","''")+"'::jsonb";
const statements = ['begin;'];
for (const task of tasks) {
  if (task.questions.length !== 20 || task.keys.length !== 20 || !task.answerSource) throw Error(`${task.year}: invalid task`);
  const blanks = task.paragraphs.flatMap(p => [...p.matchAll(/\{\{(\d+)\}\}/g)].map(m=>Number(m[1])));
  if (blanks.join(',') !== Array.from({length:20},(_,i)=>i+1).join(',')) throw Error(`${task.year}: invalid blanks`);
  task.questions.forEach((q,i) => {
    const key=task.keys[i];
    if (q.number!==i+1 || q.options.length!==4 || q.options.some(o=>!o) || key.number!==q.number || !/^[A-D]$/.test(key.answer) || key.explanation.length<30) throw Error(`${task.year}: invalid question ${i+1}`);
  });
  const {keys,...content}=task;
  delete content.answerSource;
  statements.push(`insert into exam_sections(paper_id,type,item_count,position,status) select id,'cloze',1,1,'published' from exam_papers where year=${task.year} on conflict(paper_id,type) do update set item_count=1,status='published';`);
  statements.push(`insert into cloze_tasks(section_id,content,status) select s.id,${quote(content)},'published' from exam_sections s join exam_papers p on p.id=s.paper_id where p.year=${task.year} and s.type='cloze' on conflict(section_id) do update set content=excluded.content,status='published';`);
  statements.push(`insert into private.cloze_keys(task_id,keys) select t.id,${quote(keys)} from cloze_tasks t join exam_sections s on s.id=t.section_id join exam_papers p on p.id=s.paper_id where p.year=${task.year} on conflict(task_id) do update set keys=excluded.keys;`);
}
statements.push('commit;');
const path='deploy/postgres/023-cloze-content.sql';
const before=existsSync(path)?readFileSync(path,'utf8'):null;
const after=statements.join('\n')+'\n';
const result=spawnSync('apply_patch',{input:`*** Begin Patch\n${before===null?'*** Add File: '+path+'\n':'*** Update File: '+path+'\n@@\n'+before.trimEnd().split('\n').map(l=>'-'+l).join('\n')+'\n'}${after.trimEnd().split('\n').map(l=>'+'+l).join('\n')}\n*** End Patch\n`,encoding:'utf8'});
if(result.status)throw Error(result.stderr||result.stdout);
console.log('Validated 17 papers / 340 questions and generated cloze migration.');
