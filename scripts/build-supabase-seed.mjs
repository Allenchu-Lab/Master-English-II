import { readFileSync, writeFileSync } from "node:fs";

// 题库导入源。刻意放在 content/ 而非 src/，它只在生成 seed 时使用，
// 不参与应用构建：运行时题库一律从数据库读取。
const source = readFileSync("content/exam-papers.ts", "utf8")
  .replace(/^export const examPapers = /, "")
  .replace(/ as const;[\s\S]*$/, "");
const papers = JSON.parse(source);
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const lines = ["begin;"];

for (const paper of Object.values(papers)) {
  lines.push(`insert into public.exam_papers (year, title, source_file, status) values (${paper.year}, ${quote(paper.title)}, ${quote(paper.sourceFile)}, 'published') on conflict (year) do update set title = excluded.title, source_file = excluded.source_file, status = excluded.status;`);
  const sections = [["cloze", paper.sections.cloze, 1, "draft"], ["reading_a", paper.sections.readingA, 2, "published"], ["reading_b", paper.sections.readingB, 3, "draft"], ["translation", paper.sections.translation, 4, "draft"], ["writing", paper.sections.writing, 5, "draft"]];
  for (const [type, count, position, status] of sections) {
    lines.push(`insert into public.exam_sections (paper_id, type, item_count, position, status) select id, '${type}', ${count}, ${position}, '${status}' from public.exam_papers where year = ${paper.year} on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;`);
  }
  for (const passage of paper.readingA) {
    lines.push(`insert into public.passages (section_id, passage_number, body, word_count, source_page_start, source_page_end, status) select s.id, ${passage.number}, ${quote(passage.passage)}, ${passage.wordCount}, ${passage.sourcePages[0]}, ${passage.sourcePages[1]}, 'published' from public.exam_sections s join public.exam_papers p on p.id = s.paper_id where p.year = ${paper.year} and s.type = 'reading_a' on conflict (section_id, passage_number) do update set body = excluded.body, word_count = excluded.word_count, source_page_start = excluded.source_page_start, source_page_end = excluded.source_page_end, status = excluded.status;`);
    for (const question of passage.questions) {
      lines.push(`insert into public.questions (passage_id, question_number, prompt, status) select g.id, ${question.number}, ${quote(question.prompt)}, 'published' from public.passages g join public.exam_sections s on s.id = g.section_id join public.exam_papers p on p.id = s.paper_id where p.year = ${paper.year} and s.type = 'reading_a' and g.passage_number = ${passage.number} on conflict (passage_id, question_number) do update set prompt = excluded.prompt, status = excluded.status;`);
      question.options.forEach((option, index) => lines.push(`insert into public.question_options (question_id, option_index, body) select q.id, ${index}, ${quote(option)} from public.questions q join public.passages g on g.id = q.passage_id join public.exam_sections s on s.id = g.section_id join public.exam_papers p on p.id = s.paper_id where p.year = ${paper.year} and g.passage_number = ${passage.number} and q.question_number = ${question.number} on conflict (question_id, option_index) do update set body = excluded.body;`));
    }
  }
}
lines.push("commit;");
writeFileSync("supabase/seed.sql", `${lines.join("\n")}\n`);
