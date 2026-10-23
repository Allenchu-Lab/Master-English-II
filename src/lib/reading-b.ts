export type ReadingBContent = {
  year: number;
  kind: 'headings' | 'matching';
  title: string;
  directions: string;
  paragraphs: { text: string; number?: number }[];
  options: { letter: string; text: string }[];
  questions: { number: number; label: string }[];
  sourcePages: number[];
};
export type ReadingBKey = { number: number; answer: string; evidence: string; explanation: string };
export type ReadingBAnswers = Record<string, string>;
export type ReadingBAttempt = {
  id: string; answers: ReadingBAnswers; elapsed_seconds: number;
  score: number | null; submitted_at: string | null; feedback: ReadingBKey[] | null;
};

export function validReadingBAnswers(value: unknown, content: ReadingBContent): value is ReadingBAnswers {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (new Set(Object.values(value)).size !== Object.values(value).length) return false;
  return Object.entries(value).every(([number, letter]) =>
    content.questions.some(question => String(question.number) === number)
    && content.options.some(option => option.letter === letter));
}

export function gradeReadingB(answers: ReadingBAnswers, keys: ReadingBKey[]): number {
  return keys.reduce((score, key) => score + (answers[String(key.number)] === key.answer ? 2 : 0), 0);
}
