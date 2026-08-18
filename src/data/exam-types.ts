export type ExamSectionType = "cloze" | "reading_a" | "reading_b" | "translation" | "writing";

/**
 * 首页文章列表用的轻量结构。
 *
 * 刻意不包含正文、题干和选项：列表只显示词数与题数，把这些内容一并查出来
 * 会让每次打开首页都白传八篇英文原文和一百多个选项，在低带宽下明显拖慢加载。
 * 正文与选项由练习页按需单独获取。
 */
export interface ExamPassage {
  id: string;
  number: number;
  wordCount: number;
  questionCount: number;
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
