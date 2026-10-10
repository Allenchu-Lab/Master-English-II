import { readdirSync, readFileSync, writeFileSync } from "node:fs";

// 题库导入源。刻意放在 content/ 而非 src/，它只在生成 seed 时使用，
// 不参与应用构建：运行时题库一律从数据库读取。
const source = readFileSync("content/exam-papers.ts", "utf8")
  .replace(/^export const examPapers = /, "")
  .replace(/ as const;[\s\S]*$/, "");
const papers = JSON.parse(source);
const writingTasks = JSON.parse(readFileSync("content/writing-tasks.json", "utf8"));
for (const file of readdirSync("content/reading-a").filter((file) => file.endsWith(".json")).sort()) {
  const paper = JSON.parse(readFileSync(`content/reading-a/${file}`, "utf8"));
  if (papers[paper.year]) throw new Error(`Duplicate paper year: ${paper.year}`);
  const validDraft = paper.status === "draft" && paper.answerStatus === "pending";
  const validPublished = paper.status === "published" && paper.answerStatus === "complete";
  if (!validDraft && !validPublished) throw new Error(`Invalid publication state in ${file}`);
  if (validPublished) JSON.parse(readFileSync(`content/answer-keys/${paper.year}.json`, "utf8"));
  papers[paper.year] = paper;
}
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const lines = ["begin;"];
const writingLines = ["begin;"];

for (const paper of Object.values(papers)) {
  const status = paper.answerStatus === "pending" ? "draft" : "published";
  lines.push(`insert into public.exam_papers (year, title, source_file, status) values (${paper.year}, ${quote(paper.title)}, ${quote(paper.sourceFile)}, '${status}') on conflict (year) do update set title = excluded.title, source_file = excluded.source_file, status = excluded.status;`);
  const writingCount = writingTasks.filter((task) => task.year === paper.year).length;
  const writingStatus = writingCount ? "published" : "draft";
  const sections = [["cloze", paper.sections.cloze, 1, "draft"], ["reading_a", paper.sections.readingA, 2, status], ["reading_b", paper.sections.readingB, 3, "draft"], ["translation", paper.sections.translation, 4, "draft"], ["writing", writingCount || paper.sections.writing, 5, writingStatus]];
  for (const [type, count, position, status] of sections) {
    if (count === 0) continue;
    lines.push(`insert into public.exam_sections (paper_id, type, item_count, position, status) select id, '${type}', ${count}, ${position}, '${status}' from public.exam_papers where year = ${paper.year} on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;`);
  }
  for (const passage of paper.readingA) {
    // paragraphs 必须一并写入：为空时页面只能整篇当一段渲染，精读也无法逐段分析。
    const paragraphs = quote(JSON.stringify(passage.paragraphs ?? []));
    lines.push(`insert into public.passages (section_id, passage_number, body, paragraphs, word_count, source_page_start, source_page_end, status) select s.id, ${passage.number}, ${quote(passage.passage)}, ${paragraphs}::jsonb, ${passage.wordCount}, ${passage.sourcePages[0]}, ${passage.sourcePages[1]}, '${status}' from public.exam_sections s join public.exam_papers p on p.id = s.paper_id where p.year = ${paper.year} and s.type = 'reading_a' on conflict (section_id, passage_number) do update set body = excluded.body, paragraphs = excluded.paragraphs, word_count = excluded.word_count, source_page_start = excluded.source_page_start, source_page_end = excluded.source_page_end, status = excluded.status;`);
    for (const question of passage.questions) {
      lines.push(`insert into public.questions (passage_id, question_number, prompt, status) select g.id, ${question.number}, ${quote(question.prompt)}, '${status}' from public.passages g join public.exam_sections s on s.id = g.section_id join public.exam_papers p on p.id = s.paper_id where p.year = ${paper.year} and s.type = 'reading_a' and g.passage_number = ${passage.number} on conflict (passage_id, question_number) do update set prompt = excluded.prompt, status = excluded.status;`);
      question.options.forEach((option, index) => lines.push(`insert into public.question_options (question_id, option_index, body) select q.id, ${index}, ${quote(option)} from public.questions q join public.passages g on g.id = q.passage_id join public.exam_sections s on s.id = g.section_id join public.exam_papers p on p.id = s.paper_id where p.year = ${paper.year} and g.passage_number = ${passage.number} and q.question_number = ${question.number} on conflict (question_id, option_index) do update set body = excluded.body;`));
    }
  }
}
for (const year of [...new Set(writingTasks.map((task) => task.year))]) {
  const count = writingTasks.filter((task) => task.year === year).length;
  writingLines.push(`insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', ${count}, 5, 'published' from exam_papers where year = ${year} on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;`);
}
for (const task of writingTasks) {
  const chart = task.chart ? `${quote(JSON.stringify(task.chart))}::jsonb` : "null";
  const statement = `insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, ${quote(task.part)}, ${task.questionNumber}, ${quote(task.prompt)}, ${task.targetWords}, ${task.points}, ${chart}, ${task.sourcePage}, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = ${task.year} and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;`;
  lines.push(statement.replaceAll("insert into writing_tasks", "insert into public.writing_tasks").replaceAll("from exam_sections", "from public.exam_sections").replaceAll("join exam_papers", "join public.exam_papers"));
  writingLines.push(statement);
}
lines.push("commit;");
writingLines.push("commit;");
writeFileSync("supabase/seed.sql", `${lines.join("\n")}\n`);
writeFileSync("deploy/postgres/013-writing-content.sql", `${writingLines.join("\n")}\n`);
