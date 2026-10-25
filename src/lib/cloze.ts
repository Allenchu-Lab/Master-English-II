export type ClozeContent = {
  year: number;
  directions: string;
  paragraphs: string[];
  questions: { number: number; options: string[] }[];
  sourcePages: number[];
};
export type ClozeKey = { number: number; answer: string; explanation: string };
export type ClozeAnswers = Record<string, string>;
export type ClozeAttempt = {
  id: string; answers: ClozeAnswers; elapsed_seconds: number;
  score: number | null; submitted_at: string | null; feedback: ClozeKey[] | null;
};

export function validClozeAnswers(value: unknown, content: ClozeContent): value is ClozeAnswers {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value)
    && Object.entries(value).every(([number, letter]) => content.questions.some(q => String(q.number) === number)
      && typeof letter === 'string' && /^[A-D]$/.test(letter)));
}

export function gradeCloze(answers: ClozeAnswers, keys: ClozeKey[]): number {
  return keys.reduce((score, key) => score + (answers[String(key.number)] === key.answer ? 0.5 : 0), 0);
}
