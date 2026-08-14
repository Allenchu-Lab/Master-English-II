export interface ExamQuestion {
  number: number;
  prompt: string;
  options: string[];
}

export interface ExamPassage {
  id?: string;
  number: number;
  passage: string;
  wordCount: number;
  questions: ExamQuestion[];
  sourcePages: readonly [number, number];
}

export interface ExamPaper {
  year: number;
  title: string;
  sourceFile: string;
  sections: { cloze: number; readingA: number; readingB: number; translation: number; writing: number };
  readingA: readonly ExamPassage[];
}

export type ExamPaperMap = Record<string, ExamPaper>;
