export type ExamSectionType = "cloze" | "reading_a" | "reading_b" | "translation" | "writing";

export interface ExamQuestion {
  number: number;
  prompt: string;
  options: string[];
}

export interface ExamPassage {
  id: string;
  number: number;
  passage: string;
  wordCount: number;
  questions: ExamQuestion[];
  sourcePages: readonly [number, number];
  /**
   * 该篇是否具备完整答案与解析，可以判分。
   * 判定依据是 private.question_keys 的覆盖数与本篇已发布题目数相等。
   * 为 false 时不应引导用户作答，因为提交会因缺少答案而失败。
   */
  gradable: boolean;
}

export interface ExamSection {
  type: ExamSectionType;
  /** 该年该题型的题目或篇目数量，来自 exam_sections.item_count。 */
  itemCount: number;
  /** 内容是否已发布可用，来自 exam_sections.status。 */
  available: boolean;
}

export interface ExamPaper {
  year: number;
  title: string;
  sourceFile: string;
  sections: ExamSection[];
  readingA: ExamPassage[];
}

export type ExamPaperMap = Record<string, ExamPaper>;
