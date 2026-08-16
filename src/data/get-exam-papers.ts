import { examPapers } from "@/data/exam-papers";
import type { ExamPaperMap, ExamPassage } from "@/data/exam-types";
import { query } from "@/lib/db";

type PaperRow = {
  year: number; title: string; source_file: string; item_count: number;
  passage_id: string | null; passage_number: number | null; body: string | null;
  word_count: number | null; source_page_start: number | null; source_page_end: number | null;
  question_number: number | null; prompt: string | null; option_index: number | null; option_body: string | null;
};

export async function getExamPapers(): Promise<ExamPaperMap> {
  if (!process.env.DATABASE_URL) return examPapers as unknown as ExamPaperMap;
  const result = await query<PaperRow>(`
    select p.year, p.title, p.source_file, s.item_count,
      g.id passage_id, g.passage_number, g.body, g.word_count, g.source_page_start, g.source_page_end,
      q.question_number, q.prompt, o.option_index, o.body option_body
    from exam_papers p
    join exam_sections s on s.paper_id = p.id and s.type = 'reading_a' and s.status = 'published'
    left join passages g on g.section_id = s.id and g.status = 'published'
    left join questions q on q.passage_id = g.id and q.status = 'published'
    left join question_options o on o.question_id = q.id
    where p.status = 'published'
    order by p.year, g.passage_number, q.question_number, o.option_index
  `);

  const papers: ExamPaperMap = {};
  for (const row of result.rows) {
    const key = String(row.year);
    papers[key] ??= { year: row.year, title: row.title, sourceFile: row.source_file, sections: { cloze: 1, readingA: row.item_count, readingB: 1, translation: 1, writing: 2 }, readingA: [] };
    if (!row.passage_id || row.passage_number === null || !row.body || row.word_count === null) continue;
    let passage = papers[key].readingA.find((item) => item.id === row.passage_id);
    if (!passage) {
      passage = { id: row.passage_id, number: row.passage_number, passage: row.body, wordCount: row.word_count, sourcePages: [row.source_page_start ?? 0, row.source_page_end ?? 0], questions: [] };
      (papers[key].readingA as ExamPassage[]).push(passage);
    }
    if (row.question_number === null || !row.prompt) continue;
    let question = passage.questions.find((item) => item.number === row.question_number);
    if (!question) {
      question = { number: row.question_number, prompt: row.prompt, options: [] };
      passage.questions.push(question);
    }
    if (row.option_index !== null && row.option_body) question.options[row.option_index] = row.option_body;
  }
  return papers;
}
