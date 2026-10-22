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
    typeof item.quote === 'string' && (item.category === 'omission' ? item.quote === '' : item.quote.trim().length > 0 && sentence.translation.includes(item.quote) && answer.includes(item.quote)) &&
    ['meaning', 'omission', 'logic', 'expression'].includes(item.category) &&
    ['minor', 'major'].includes(item.severity) && typeof item.reason === 'string' && item.reason.trim().length > 0
  ));
}
