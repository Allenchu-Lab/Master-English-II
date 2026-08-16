import { query } from "@/lib/db";

export type PracticeQuestion = {
  id: string;
  number: number;
  prompt: string;
  options: { index: number; body: string }[];
};

export type PracticePassage = {
  id: string;
  year: number;
  number: number;
  body: string;
  paragraphs: string[];
  wordCount: number;
  questions: PracticeQuestion[];
};

export async function getPracticePassage(year: number, number: number): Promise<PracticePassage | null> {
  const passageResult = await query<{ id: string; passage_number: number; body: string; paragraphs: string[]; word_count: number }>(`
    select g.id, g.passage_number, g.body, g.paragraphs, g.word_count
    from passages g join exam_sections s on s.id = g.section_id join exam_papers p on p.id = s.paper_id
    where p.year = $1 and p.status = 'published' and s.type = 'reading_a' and s.status = 'published'
      and g.passage_number = $2 and g.status = 'published'
    limit 1
  `, [year, number]);
  const data = passageResult.rows[0];
  if (!data) return null;
  const questionResult = await query<{ id: string; question_number: number; prompt: string; option_index: number; body: string }>(`
    select q.id, q.question_number, q.prompt, o.option_index, o.body
    from questions q join question_options o on o.question_id = q.id
    where q.passage_id = $1 and q.status = 'published'
    order by q.question_number, o.option_index
  `, [data.id]);
  const questions: PracticeQuestion[] = [];
  for (const row of questionResult.rows) {
    let question = questions.find((item) => item.id === row.id);
    if (!question) {
      question = { id: row.id, number: row.question_number, prompt: row.prompt, options: [] };
      questions.push(question);
    }
    question.options.push({ index: row.option_index, body: row.body });
  }

  return {
    id: data.id,
    year,
    number: data.passage_number,
    body: data.body,
    paragraphs: Array.isArray(data.paragraphs) ? data.paragraphs : [],
    wordCount: data.word_count,
    questions,
  };
}
