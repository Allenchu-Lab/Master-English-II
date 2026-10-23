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

export function validTranslationDeductions(sentences: TranslationSentence[], answer: string) {
  return sentences.every(sentence => Array.isArray(sentence.deductions) && sentence.deductions.length <= 12 && sentence.deductions.every(item =>
    item && typeof item.source === 'string' && item.source.trim().length > 0 && sentence.original.includes(item.source) &&
    typeof item.quote === 'string' && (item.category === 'omission' ? item.quote === '' : item.quote.trim().length > 0 && answer.includes(item.quote)) &&
    ['meaning', 'omission', 'logic', 'expression'].includes(item.category) &&
    ['minor', 'major'].includes(item.severity) && typeof item.reason === 'string' && item.reason.trim().length > 0
  ));
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

export function translationDeductionFailure(sentences: TranslationSentence[], answer: string) {
  for (const sentence of sentences) {
    if (!Array.isArray(sentence.deductions)) return 'missing-deductions';
    for (const item of sentence.deductions) {
      if (!item || typeof item !== 'object') return 'invalid-deduction';
      if (typeof item.source !== 'string' || !sentence.original.includes(item.source)) return 'source-quote';
      if (typeof item.quote !== 'string' || (item.category !== 'omission' && !answer.includes(item.quote))) return 'answer-quote';
      if (!['meaning','omission','logic','expression'].includes(item.category)) return 'category';
      if (!['minor','major'].includes(item.severity)) return 'severity';
    }
  }
  return 'deduction-shape';
}
