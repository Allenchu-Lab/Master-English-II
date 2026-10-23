import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const tasks = JSON.parse(readFileSync('content/reading-b/tasks.json','utf8')).filter(task => task.year < 2025);
if (tasks.length !== 15) throw Error('Expected all fifteen older papers');
const quote = value => "'" + JSON.stringify(value).replaceAll("'", "''") + "'::jsonb";
const statements = ['begin;'];
for (const task of tasks) {
  if (task.questions.length !== 5 || task.keys.length !== 5 || task.options.length !== (task.kind === 'true_false' ? 2 : 7)) throw Error(`${task.year}: invalid task shape`);
  for (const question of task.questions) {
    const key = task.keys.find(key => key.number === question.number);
    if (!key || !key.explanation || !key.evidence || !task.paragraphs.some(paragraph => paragraph.text.includes(key.evidence)) || !task.options.some(option => option.letter === key.answer)) throw Error(`${task.year}: missing grounded answer ${question.number}`);
  }
  const {keys,answerSource,...content} = task;
  if (!answerSource) throw Error('Missing answer provenance');
  statements.push(`insert into exam_sections(paper_id,type,item_count,position,status) select id,'reading_b',1,3,'published' from exam_papers where year=${task.year} on conflict(paper_id,type) do update set item_count=1,status='published';`);
  statements.push(`insert into reading_b_tasks(section_id,content,status) select s.id,${quote(content)},'published' from exam_sections s join exam_papers p on p.id=s.paper_id where p.year=${task.year} and s.type='reading_b' on conflict(section_id) do update set content=excluded.content,status='published';`);
  statements.push(`insert into private.reading_b_keys(task_id,keys) select t.id,${quote(keys)} from reading_b_tasks t join exam_sections s on s.id=t.section_id join exam_papers p on p.id=s.paper_id where p.year=${task.year} on conflict(task_id) do update set keys=excluded.keys;`);
}
statements.push('commit;');
const path = 'deploy/postgres/021-reading-b-older-content.sql';
const before = existsSync(path) ? readFileSync(path,'utf8') : null;
const after = statements.join('\n')+'\n';
const patch = `*** Begin Patch\n${before === null ? '*** Add File: '+path+'\n' : '*** Update File: '+path+'\n@@\n'+before.trimEnd().split('\n').map(line=>'-'+line).join('\n')+'\n'}${after.trimEnd().split('\n').map(line=>'+'+line).join('\n')}\n*** End Patch\n`;
const result = spawnSync('apply_patch',{input:patch,encoding:'utf8'});
if (result.status !== 0) throw Error(result.stderr || result.stdout);
console.log('Validated and built publication migration for 2010–2024.');
