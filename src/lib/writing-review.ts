export type WritingDeduction = {
  original: string;
  category: "task" | "grammar" | "wording" | "cohesion" | "format" | "length";
  reason: string;
  suggestion: string;
  impact: number;
};

export type WritingExpression = {
  original: string;
  rewrite: string;
  pattern: string;
  useCases: string[];
};

export type WritingReview = {
  score: number;
  maxScore: number;
  band: number;
  summary: string;
  nextBandGap: string;
  deductions: WritingDeduction[];
  revisedAnswer: string;
  expressions: WritingExpression[];
};

const categories = new Set(["task", "grammar", "wording", "cohesion", "format", "length"]);

export function isWritingReview(value: unknown, maxScore: number): value is WritingReview {
  if (!value || typeof value !== "object") return false;
  const review = value as Partial<WritingReview>;
  return typeof review.score === "number" && review.score >= 0 && review.score <= maxScore
    && review.maxScore === maxScore
    && typeof review.band === "number" && Number.isInteger(review.band) && review.band >= 1 && review.band <= 5
    && typeof review.summary === "string" && typeof review.nextBandGap === "string"
    && typeof review.revisedAnswer === "string"
    && Array.isArray(review.deductions) && review.deductions.length <= 8
    && review.deductions.every((item) => item && typeof item.original === "string"
      && typeof item.category === "string" && categories.has(item.category)
      && typeof item.reason === "string" && typeof item.suggestion === "string"
      && typeof item.impact === "number" && item.impact >= 0)
    && Array.isArray(review.expressions) && review.expressions.length >= 3 && review.expressions.length <= 5
    && review.expressions.every((item) => item && typeof item.original === "string"
      && typeof item.rewrite === "string" && typeof item.pattern === "string"
      && Array.isArray(item.useCases) && item.useCases.every((useCase) => typeof useCase === "string"));
}
