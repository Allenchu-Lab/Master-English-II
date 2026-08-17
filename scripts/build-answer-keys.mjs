import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 判分数据导入工具。
 *
 * 输入：content/answer-keys/ 下每年一个 JSON 文件（答案、题干中译、选项中译、解析）。
 * 输出：deploy/postgres/003-grading.sql，写入 private.question_keys。
 *
 * 新增年份的流程是「加一个 JSON 文件，重新生成，应用 SQL」，不需要改任何代码。
 * 生成的 SQL 是幂等的：同一题重复导入会更新而不是报错，改错别字后可以直接重跑。
 *
 * 用法：node scripts/build-answer-keys.mjs
 */

const SOURCE_DIR = "content/answer-keys";
const OUTPUT_FILE = "deploy/postgres/003-grading.sql";
const LETTERS = ["A", "B", "C", "D"];

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;

const problems = [];

function check(condition, message) {
  if (!condition) problems.push(message);
  return condition;
}

function loadPapers() {
  const files = readdirSync(SOURCE_DIR).filter((name) => name.endsWith(".json")).sort();
  check(files.length > 0, `${SOURCE_DIR} 下没有找到任何 JSON 答案文件`);

  return files.map((name) => {
    const path = join(SOURCE_DIR, name);
    let paper;
    try {
      paper = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      problems.push(`${name}：JSON 格式错误 —— ${error.message}`);
      return null;
    }

    check(Number.isInteger(paper.year), `${name}：缺少 year，或 year 不是整数`);
    check(paper.section === "reading_a", `${name}：section 目前只支持 "reading_a"，收到 ${JSON.stringify(paper.section)}`);
    check(Array.isArray(paper.texts) && paper.texts.length > 0, `${name}：texts 必须是非空数组`);

    for (const text of paper.texts ?? []) {
      const label = `${name} Text ${text.number}`;
      check(Number.isInteger(text.number) && text.number > 0, `${label}：number 必须是正整数`);
      check(Array.isArray(text.questions) && text.questions.length > 0, `${label}：questions 必须是非空数组`);

      const seen = new Set();
      for (const question of text.questions ?? []) {
        const tag = `${label} 第 ${question.number} 题`;
        check(Number.isInteger(question.number), `${tag}：题号必须是整数`);
        check(!seen.has(question.number), `${tag}：题号重复`);
        seen.add(question.number);
        check(LETTERS.includes(question.answer), `${tag}：答案必须是 A/B/C/D 之一，收到 ${JSON.stringify(question.answer)}`);
        check(typeof question.promptZh === "string" && question.promptZh.trim().length > 0, `${tag}：promptZh 不能为空`);
        check(
          Array.isArray(question.optionsZh) && question.optionsZh.length === 4
            && question.optionsZh.every((item) => typeof item === "string" && item.trim().length > 0),
          `${tag}：optionsZh 必须是 4 条非空中文选项`,
        );
        check(typeof question.explanation === "string" && question.explanation.trim().length > 0, `${tag}：explanation 不能为空`);
      }
    }
    return paper;
  }).filter(Boolean);
}

const papers = loadPapers();

if (problems.length) {
  console.error("答案数据校验未通过：\n");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("\n修正后重新运行。未生成任何 SQL。");
  process.exit(1);
}

const lines = [
  "-- 本文件由 scripts/build-answer-keys.mjs 生成，请勿手工编辑。",
  "-- 修改答案请编辑 content/answer-keys/<年份>.json 后重新生成。",
  "begin;",
];

let questionTotal = 0;

for (const paper of papers) {
  for (const text of paper.texts) {
    const values = text.questions
      .slice()
      .sort((left, right) => left.number - right.number)
      .map((question) => {
        questionTotal += 1;
        const optionTranslations = `${quote(JSON.stringify(question.optionsZh))}::jsonb`;
        return `  (${question.number}, ${LETTERS.indexOf(question.answer)}, ${quote(question.promptZh)}, ${optionTranslations}, ${quote(question.explanation)})`;
      })
      .join(",\n");

    lines.push(
      "",
      `-- ${paper.year} 年 阅读 Part A Text ${text.number}`,
      "insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)",
      "select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation",
      "from questions q",
      "join passages g on g.id = q.passage_id",
      "join exam_sections s on s.id = g.section_id",
      "join exam_papers p on p.id = s.paper_id",
      "join (values",
      values,
      ") as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number",
      `where p.year = ${paper.year} and s.type = '${paper.section}' and g.passage_number = ${text.number}`,
      "on conflict (question_id) do update set",
      "  correct_option = excluded.correct_option,",
      "  prompt_zh = excluded.prompt_zh,",
      "  option_translations = excluded.option_translations,",
      "  explanation = excluded.explanation,",
      "  updated_at = now();",
    );
  }
}

lines.push("", "commit;");
writeFileSync(OUTPUT_FILE, `${lines.join("\n")}\n`);

const summary = papers.map((paper) => `${paper.year} 年 ${paper.texts.length} 篇`).join("、");
console.log(`已生成 ${OUTPUT_FILE}`);
console.log(`覆盖：${summary}，共 ${questionTotal} 道题`);
