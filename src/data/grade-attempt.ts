import "server-only";
import { query } from "@/lib/db";

/**
 * 判分结果的构建逻辑。提交时和刷新后重建复盘都用它，
 * 保证两条路径给出的分数与解析完全一致。
 */

export type GradedQuestion = {
  questionNumber: number;
  selectedOption: number;
  correctOption: number;
  isCorrect: boolean;
  promptZh: string;
  optionTranslations: string[];
  explanation: string;
};

export type GradeResult = { score: number; total: number; questions: GradedQuestion[] };

export type KeyRow = {
  question_number: number;
  correct_option: number;
  prompt_zh: string;
  option_translations: string[];
  explanation: string;
};

/** 答案存放在 private schema，只在服务端读取，不随题目下发到浏览器。 */
export const KEYS_SQL = `
  select q.question_number, k.correct_option, k.prompt_zh, k.option_translations, k.explanation
  from questions q join private.question_keys k on k.question_id = q.id
  where q.passage_id = $1 and q.status = 'published'
  order by q.question_number
`;

export const PUBLISHED_QUESTION_COUNT_SQL = "select count(*) from questions where passage_id = $1 and status = 'published'";

/** 选项下标必须是 0 到 3 的整数，缺任何一题都视为未完成。 */
export function hasCompleteAnswers(keys: KeyRow[], answers: Record<string, number>): boolean {
  return keys.every((item) => {
    const selected = answers[String(item.question_number)];
    return Number.isInteger(selected) && selected >= 0 && selected <= 3;
  });
}

export function toGradeResult(keys: KeyRow[], answers: Record<string, number>): GradeResult {
  const questions = keys.map((item) => {
    const selectedOption = answers[String(item.question_number)];
    return {
      questionNumber: item.question_number,
      selectedOption,
      correctOption: item.correct_option,
      isCorrect: selectedOption === item.correct_option,
      promptZh: item.prompt_zh,
      optionTranslations: item.option_translations,
      explanation: item.explanation,
    };
  });
  return { score: questions.filter((item) => item.isCorrect).length, total: questions.length, questions };
}

/**
 * 为已提交的练习记录重建判分结果，用于刷新后恢复复盘视图。
 * 答案覆盖不完整时返回 null，调用方据此退回普通作答视图。
 */
export async function loadGradeResult(passageId: string, answers: Record<string, number>): Promise<GradeResult | null> {
  const keys = await query<KeyRow>(KEYS_SQL, [passageId]);
  const total = await query<{ count: string }>(PUBLISHED_QUESTION_COUNT_SQL, [passageId]);
  if (!keys.rowCount || keys.rowCount !== Number(total.rows[0].count)) return null;
  if (!hasCompleteAnswers(keys.rows, answers)) return null;
  return toGradeResult(keys.rows, answers);
}
