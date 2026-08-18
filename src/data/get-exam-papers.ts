import type { ExamPaperMap, ExamPassage, ExamSectionType } from "@/data/exam-types";
import { query } from "@/lib/db";

/**
 * 题库唯一来源是数据库，代码中不保留任何题目内容或数量的兜底值。
 * 缺少数据库连接时直接失败，避免线上静默展示过期的内置数据。
 */

type SectionRow = { year: number; title: string; source_file: string; type: ExamSectionType; item_count: number; status: string };

type PassageRow = {
  year: number; passage_id: string; passage_number: number; word_count: number;
  source_page_start: number | null; source_page_end: number | null; question_count: string;
};

type CoverageRow = { passage_id: string; question_count: string; key_count: string };

export async function getExamPapers(): Promise<ExamPaperMap> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");

  const sectionResult = await query<SectionRow>(`
    select p.year, p.title, p.source_file, s.type, s.item_count, s.status
    from exam_papers p join exam_sections s on s.paper_id = p.id
    where p.status = 'published'
    order by p.year, s.position
  `);

  const papers: ExamPaperMap = {};
  for (const row of sectionResult.rows) {
    const key = String(row.year);
    papers[key] ??= { year: row.year, title: row.title, sourceFile: row.source_file, sections: [], readingA: [] };
    papers[key].sections.push({ type: row.type, itemCount: row.item_count, available: row.status === "published" });
  }
  if (!Object.keys(papers).length) return papers;

  // 只取列表需要的计数，不取正文、题干和选项内容。
  const passageResult = await query<PassageRow>(`
    select p.year, g.id passage_id, g.passage_number, g.word_count,
      g.source_page_start, g.source_page_end,
      count(q.id) question_count
    from exam_papers p
    join exam_sections s on s.paper_id = p.id and s.type = 'reading_a' and s.status = 'published'
    join passages g on g.section_id = s.id and g.status = 'published'
    left join questions q on q.passage_id = g.id and q.status = 'published'
    where p.status = 'published'
    group by p.year, g.id, g.passage_number, g.word_count, g.source_page_start, g.source_page_end
    order by p.year, g.passage_number
  `);

  // 判分能力取决于答案表覆盖是否完整，缺答案的篇目在界面上标记为未开放。
  const coverageResult = await query<CoverageRow>(`
    select g.id passage_id,
      count(distinct q.id) question_count,
      count(distinct k.question_id) key_count
    from passages g
    left join questions q on q.passage_id = g.id and q.status = 'published'
    left join private.question_keys k on k.question_id = q.id
    group by g.id
  `);
  const gradable = new Map(coverageResult.rows.map((row) => [
    row.passage_id,
    Number(row.question_count) > 0 && row.question_count === row.key_count,
  ]));

  // 每行已经是一篇文章的汇总，不再需要按题目和选项做分组归并。
  for (const row of passageResult.rows) {
    const paper = papers[String(row.year)];
    if (!paper) continue;
    paper.readingA.push({
      id: row.passage_id,
      number: row.passage_number,
      wordCount: row.word_count,
      questionCount: Number(row.question_count),
      sourcePages: [row.source_page_start ?? 0, row.source_page_end ?? 0],
      gradable: gradable.get(row.passage_id) ?? false,
    } satisfies ExamPassage);
  }

  return papers;
}
