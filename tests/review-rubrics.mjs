import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TRANSLATION_RUBRIC, WRITING_RUBRIC } from '../src/lib/review-rubrics.ts';
import { writingBand } from '../src/lib/writing-review.ts';

for (const [maximum, boundaries] of [[10, [[0,1],[2.5,1],[3,2],[5,3],[7,4],[7.5,4],[9,5],[10,5]]], [15, [[0,1],[3.5,1],[4,2],[7,3],[7.5,3],[10,4],[12.5,4],[13,5],[15,5]]]]) {
  for (const [score, band] of boundaries) assert.equal(writingBand(score, maximum), band);
}
assert.match(TRANSLATION_RUBRIC, /准确、完整、通顺/);
assert.match(TRANSLATION_RUBRIC, /不得因一个错误或一处漏译自动降档/);
assert.match(WRITING_RUBRIC, /非书信不得强求称呼落款/);
assert.match(WRITING_RUBRIC, /不要求必须三段/);
for (const [module, constant] of [['writing', 'WRITING_RUBRIC'], ['translation', 'TRANSLATION_RUBRIC']]) {
  const route = readFileSync(new URL(`../src/app/api/${module}-attempts/[taskId]/review/route.ts`, import.meta.url), 'utf8');
  assert.ok(route.includes(`import { ${constant} }`));
  assert.ok(route.split(constant).length >= 3, 'Route must use the imported rubric in its prompt');
}
console.log('Review rubric wiring, safeguards and writing band boundaries passed.');
