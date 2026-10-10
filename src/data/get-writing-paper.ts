import "server-only";

import { query } from "@/lib/db";

export type WritingChart = {
  title: string;
  type?: "bar" | "pie" | "grouped" | "stacked" | "line" | "table";
  unit?: string;
  items?: { label: string; value: number }[];
  categories?: string[];
  series?: { name: string; values: number[] }[];
  columns?: string[];
  rows?: string[][];
  note?: string;
  showValues?: boolean;
};

export type WritingTask = {
  id: string;
  year: number;
  part: "A" | "B";
  questionNumber: number;
  prompt: string;
  targetWords: number;
  points: number;
  chart: WritingChart | null;
  sourcePage: number | null;
};

type WritingTaskRow = {
  id: string;
  year: number;
  part: "A" | "B";
  question_number: number;
  prompt: string;
  target_words: number;
  points: number;
  chart: WritingChart | null;
  source_page: number | null;
};

export async function getWritingPaper(year: number): Promise<WritingTask[]> {
  const result = await query<WritingTaskRow>(`
    select w.id, p.year, w.part, w.question_number, w.prompt, w.target_words,
      w.points, w.chart, w.source_page
    from writing_tasks w
    join exam_sections s on s.id = w.section_id
    join exam_papers p on p.id = s.paper_id
    where p.year = $1 and p.status = 'published' and s.status = 'published'
      and w.status = 'published'
    order by w.part
  `, [year]);

  return result.rows.map((row) => ({
    id: row.id,
    year: row.year,
    part: row.part,
    questionNumber: row.question_number,
    prompt: row.prompt,
    targetWords: row.target_words,
    points: row.points,
    chart: row.chart,
    sourcePage: row.source_page,
  }));
}
