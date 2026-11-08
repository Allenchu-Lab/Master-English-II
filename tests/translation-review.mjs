import assert from 'node:assert/strict';
import { translationBand, normalizeTranslationDeductions, translationDeductionFailure, parseTranslationReview } from '../src/lib/translation-review.ts';

for (const [score, band] of [[0,1],[4,1],[5,2],[8,2],[9,3],[12,3],[13,4],[15,4]]) {
  assert.equal(translationBand(score), band);
}
const sentence = {
  original: 'Clothes can improve confidence.', translation: '衣服会降低信心。',
  reason: '正反含义相反', suggestion: '衣服可以增强信心。',
  deductions: [{ source: 'improve', quote: '降低', category: 'meaning', severity: 'major', reason: '增强错译为降低，改变了原句含义。' }],
};
assert.equal(translationDeductionFailure([sentence], sentence.translation), null);
for (const change of [
  { source: 'invented phrase' }, { quote: '编造译文' }, { reason: '' },
  { category: 'style preference' }, { severity: 'arbitrary' }, { quote: '' },
]) {
  assert.notEqual(translationDeductionFailure([{ ...sentence, deductions: [{ ...sentence.deductions[0], ...change }] }], sentence.translation), null);
}
assert.equal(translationDeductionFailure([{ ...sentence, translation: '', deductions: [{ ...sentence.deductions[0], quote: '', category: 'omission' }] }], ''), null);
assert.equal(translationDeductionFailure([{ ...sentence, deductions: [] }], sentence.translation), null);
assert.equal(translationDeductionFailure([{ ...sentence, deductions: undefined }], sentence.translation), 'missing-deductions');
const combined = structuredClone(sentence);
combined.translation = '衣服';
assert.equal(translationDeductionFailure([combined], sentence.translation), null, 'Quotes may belong to a merged sentence in the full answer');
combined.deductions[0].category = ' MEANING ';
combined.deductions[0].severity = 'Major';
normalizeTranslationDeductions([combined]);
assert.equal(translationDeductionFailure([combined], sentence.translation), null);
combined.deductions[0].quote = '编造的文字';
assert.equal(translationDeductionFailure([combined], sentence.translation), 'answer-quote');
console.log('Translation review: band boundaries, exact source/answer quotes, omissions and legacy data passed.');

const compact = {score:10,summary:'含义理解有误。',reference:'衣服可以增强信心。',sentences:[{...sentence,reason:undefined}],patterns:[],vocabulary:[]};
const parsed = parseTranslationReview(structuredClone(compact),sentence.original,sentence.translation);
assert.equal(parsed.sentences[0].reason,sentence.deductions[0].reason);
assert.equal(parsed.rubricVersion,2);
assert.deepEqual(parseTranslationReview({...compact,score:15,sentences:[]},sentence.original,sentence.translation).sentences,[]);
assert.throws(()=>parseTranslationReview({...compact,score:10,sentences:[]},sentence.original,sentence.translation),/score-consistency/);
assert.throws(()=>parseTranslationReview({...compact,score:15},sentence.original,sentence.translation),/score-consistency/);
assert.throws(()=>parseTranslationReview({...compact,sentences:[{...sentence,original:'Invented source'}]},sentence.original,sentence.translation),/sentences/);
assert.throws(()=>parseTranslationReview({...compact,sentences:[{...sentence,deductions:[{...sentence.deductions[0],quote:'不存在的译文'}]}]},sentence.original,sentence.translation),/answer-quote/);
assert.equal(parseTranslationReview({...compact,patterns:[{original:'Invented',explanation:'x',usage:'y'}]},sentence.original,sentence.translation).patterns.length,0);
console.log('Compact translation review passed: error-only output, perfect score, score consistency, grounding and stored-shape compatibility.');
