import assert from 'node:assert/strict';
import { translationBand, validTranslationDeductions } from '../src/lib/translation-review.ts';

for (const [score, band] of [[0,1],[4,1],[5,2],[8,2],[9,3],[12,3],[13,4],[15,4]]) {
  assert.equal(translationBand(score), band);
}
const sentence = {
  original: 'Clothes can improve confidence.', translation: '衣服会降低信心。',
  reason: '正反含义相反', suggestion: '衣服可以增强信心。',
  deductions: [{ source: 'improve', quote: '降低', category: 'meaning', severity: 'major', reason: '增强错译为降低，改变了原句含义。' }],
};
assert.equal(validTranslationDeductions([sentence], sentence.translation), true);
for (const change of [
  { source: 'invented phrase' }, { quote: '编造译文' }, { reason: '' },
  { category: 'style preference' }, { severity: 'arbitrary' }, { quote: '' },
]) {
  assert.equal(validTranslationDeductions([{ ...sentence, deductions: [{ ...sentence.deductions[0], ...change }] }], sentence.translation), false);
}
assert.equal(validTranslationDeductions([{ ...sentence, translation: '', deductions: [{ ...sentence.deductions[0], quote: '', category: 'omission' }] }], ''), true);
assert.equal(validTranslationDeductions([{ ...sentence, deductions: [] }], sentence.translation), true);
assert.equal(validTranslationDeductions([{ ...sentence, deductions: undefined }], sentence.translation), false);
console.log('Translation review: band boundaries, exact source/answer quotes, omissions and legacy data passed.');
