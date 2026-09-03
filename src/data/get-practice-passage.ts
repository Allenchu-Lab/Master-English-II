import { query } from "@/lib/db";
import { localContentPreviewEnabled } from "@/lib/content-preview";

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
  const preview = localContentPreviewEnabled();
  const passageResult = await query<{ id: string; passage_number: number; body: string; paragraphs: string[]; word_count: number }>(`
    select g.id, g.passage_number, g.body, g.paragraphs, g.word_count
    from passages g join exam_sections s on s.id = g.section_id join exam_papers p on p.id = s.paper_id
    where p.year = $1 and (p.status = 'published' or ($3 and p.status = 'draft'))
      and s.type = 'reading_a' and (s.status = 'published' or ($3 and s.status = 'draft'))
      and g.passage_number = $2 and (g.status = 'published' or ($3 and g.status = 'draft'))
    limit 1
  `, [year, number, preview]);
  const data = passageResult.rows[0];
  if (!data) return null;
  const questionResult = await query<{ id: string; question_number: number; prompt: string; option_index: number; body: string }>(`
    select q.id, q.question_number, q.prompt, o.option_index, o.body
    from questions q join question_options o on o.question_id = q.id
    where q.passage_id = $1 and (q.status = 'published' or ($2 and q.status = 'draft'))
    order by q.question_number, o.option_index
  `, [data.id, preview]);
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
