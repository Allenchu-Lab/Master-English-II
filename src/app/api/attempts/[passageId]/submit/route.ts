import { NextResponse } from "next/server";
import { getOrCreateSessionUser } from "@/lib/auth/session";
import { transaction } from "@/lib/db";

type KeyRow = { question_number: number; correct_option: number; prompt_zh: string; option_translations: string[]; explanation: string };

export async function POST(request: Request, { params }: { params: Promise<{ passageId: string }> }) {
  const { passageId } = await params;
  const user = await getOrCreateSessionUser();
  const { attemptId, answers } = await request.json() as { attemptId?: string; answers?: Record<string, number> };
  if (!attemptId || !answers || Array.isArray(answers)) return NextResponse.json({ error: "请完成全部题目后再提交。" }, { status: 400 });

  try {
    const result = await transaction(async (client) => {
      const attempt = await client.query("select 1 from practice_attempts where id = $1 and user_id = $2 and passage_id = $3 for update", [attemptId, user.id, passageId]);
      if (!attempt.rowCount) throw new Error("ATTEMPT_NOT_FOUND");
      const keys = await client.query<KeyRow>(
        `select q.question_number, k.correct_option, k.prompt_zh, k.option_translations, k.explanation
         from questions q join private.question_keys k on k.question_id = q.id
         where q.passage_id = $1 and q.status = 'published' order by q.question_number`,
        [passageId],
      );
      const questionCount = await client.query<{ count: string }>("select count(*) from questions where passage_id = $1 and status = 'published'", [passageId]);
      if (!keys.rowCount || keys.rowCount !== Number(questionCount.rows[0].count)) throw new Error("KEYS_UNAVAILABLE");
      if (keys.rows.some((item) => !Number.isInteger(answers[String(item.question_number)]) || answers[String(item.question_number)] < 0 || answers[String(item.question_number)] > 3)) throw new Error("INCOMPLETE");
      const questions = keys.rows.map((item) => ({
        questionNumber: item.question_number, selectedOption: answers[String(item.question_number)], correctOption: item.correct_option,
        isCorrect: answers[String(item.question_number)] === item.correct_option, promptZh: item.prompt_zh,
        optionTranslations: item.option_translations, explanation: item.explanation,
      }));
      const score = questions.filter((item) => item.isCorrect).length;
      await client.query("update practice_attempts set answers = $1, submitted_at = now(), score = $2 where id = $3", [answers, score, attemptId]);
      return { score, total: questions.length, questions };
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error && error.message === "INCOMPLETE" ? "请完成全部题目后再提交。" : "当前文章暂时无法判分。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
