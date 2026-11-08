export type TranslationDeduction = {
  source: string;
  quote: string;
  category: 'meaning' | 'omission' | 'logic' | 'expression';
  severity: 'minor' | 'major';
  reason: string;
};

export type TranslationSentence = {
  original: string;
  translation: string;
  reason: string;
  suggestion: string;
  deductions?: TranslationDeduction[];
};

// English II uses holistic bands, not a fixed penalty per word.
export function translationBand(score: number) {
  return score >= 13 ? 4 : score >= 9 ? 3 : score >= 5 ? 2 : 1;
}

export function normalizeTranslationDeductions(sentences: TranslationSentence[]) {
  for (const sentence of sentences) {
    if (!Array.isArray(sentence.deductions)) continue;
    for (const item of sentence.deductions) {
      if (!item || typeof item !== 'object') continue;
      // Normalize enum formatting only; never rewrite or invent quoted text.
      if (typeof item.category === 'string') item.category = item.category.trim().toLowerCase() as TranslationDeduction['category'];
      if (typeof item.severity === 'string') item.severity = item.severity.trim().toLowerCase() as TranslationDeduction['severity'];
    }
  }
}

export function translationDeductionFailure(sentences: TranslationSentence[], answer: string): string | null {
  for (const sentence of sentences) {
    if (!Array.isArray(sentence.deductions)) return 'missing-deductions';
    if (sentence.deductions.length > 12) return 'deduction-shape';
    for (const item of sentence.deductions) {
      if (!item || typeof item !== 'object') return 'invalid-deduction';
      if (typeof item.source !== 'string' || !item.source.trim() || !sentence.original.includes(item.source)) return 'source-quote';
      if (typeof item.quote !== 'string' || (item.category === 'omission' ? item.quote !== '' : !item.quote.trim() || !answer.includes(item.quote))) return 'answer-quote';
      if (!['meaning','omission','logic','expression'].includes(item.category)) return 'category';
      if (!['minor','major'].includes(item.severity)) return 'severity';
      if (typeof item.reason !== 'string' || !item.reason.trim()) return 'deduction-shape';
    }
  }
  return null;
}

export function parseTranslationReview(value: unknown, passage: string, answer: string) {
  if (!value || typeof value !== 'object') throw Error('response-format');
  const review = value as Record<string, unknown>;
  if (typeof review.score !== 'number' || !Number.isInteger(review.score) || review.score < 0 || review.score > 15) throw Error('score-format');
  if (typeof review.summary !== 'string' || !review.summary.trim() || typeof review.reference !== 'string' || !review.reference.trim()) throw Error('response-format');
  if (!Array.isArray(review.sentences) || review.sentences.some(s => !s || typeof s !== 'object'
    || ['original','translation','suggestion'].some(k => typeof s[k] !== 'string')
    || !s.original.trim() || !passage.includes(s.original))) throw Error('sentences');
  const sentences = review.sentences as TranslationSentence[];
  normalizeTranslationDeductions(sentences);
  const failure = translationDeductionFailure(sentences, answer);
  if (failure) throw Error(failure);
  const issues = sentences.filter(s => s.deductions!.length > 0);
  if (!issues.length && review.score !== 15) throw Error('score-consistency');
  if (issues.length && review.score === 15) throw Error('score-consistency');
  // Keep the existing stored/UI shape without asking the model to repeat its reasons.
  for (const sentence of issues) sentence.reason = sentence.deductions!.map(item => item.reason).join('；');
  const notes: Record<string, Record<string, string>[]> = {};
  for (const [key, fields, source] of [['patterns',['original','explanation','usage'],'original'],['vocabulary',['word','meaning','usage'],'word']] as const) {
    if (!Array.isArray(review[key]) || review[key].length > 8) throw Error('study-notes');
    notes[key] = review[key].filter((item: Record<string, unknown>) => item && fields.every(field => typeof item[field] === 'string' && String(item[field]).trim()) && passage.includes(String(item[source])));
  }
  return { score: review.score, summary: review.summary, reference: review.reference, sentences: issues, patterns: notes.patterns, vocabulary: notes.vocabulary, rubricVersion: 2 };
}
