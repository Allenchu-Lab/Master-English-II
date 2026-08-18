import { readFileSync, writeFileSync } from "node:fs";

/**
 * 按原卷段落切分阅读正文，写入 content/exam-papers.ts 的 paragraphs 字段。
 *
 * 正文最初从 PDF 提取时丢掉了换行，整篇连成一串，导致数据库 paragraphs
 * 始终为空、页面只能整篇当一段渲染，精读也无法逐段分析。
 *
 * 这里用每段的起始短语定位切点，短语取自原卷。切分后会校验：起始短语必须
 * 依次出现、首段必须从第 0 位开始、且各段拼回去与原文逐字符一致，
 * 任何一项不满足就中止，不会写出半对的数据。
 *
 * 用法：node scripts/split-passage-paragraphs.mjs
 */

const SOURCE = "content/exam-papers.ts";

// 每篇的段落起始短语，顺序即段落顺序。撇号使用原文中的 U+2019。
const STARTS = {
  2025: {
    1: [
      "U.S. customers historically tipped",
      "Today’s tip requests are often not connected",
      "It’s becoming more common for tips",
      "The prevalence of digital payment devices",
      "Tipping has always been a vital source",
      "Notably, tipping primarily benefits",
      "So to increase employee wages",
    ],
    2: [
      "When it was established",
      "From life expectancy to cancer",
      "Many of the answers to the crisis",
      "Yet despite two decades of strategies",
      "This must begin with the question",
      "Reform wants to ask how power",
    ],
    3: [
      "Heat action plans, or HAPs",
      "But implementation of existing HAPs",
      "Mumbai’s April heat stroke deaths",
      "To help improve HAPs",
      "Such mapping doesn’t need to be complex",
      "HAPs shouldn’t just include short-term",
    ],
    4: [
      "Navigating beyond the organised pavements",
      "Urban planners interpret desire paths",
      "Yet, reluctance persists",
      "The Wickquasgeck Trail is an example",
      "In online spaces, desire paths",
      "Animal desire paths, such as ducks",
    ],
  },
  2026: {
    1: [
      "Ask people about public libraries",
      "The reality is startlingly different",
      "Enter any one of them",
      "There are libraries with business",
      "In return for all of this",
      "The number of libraries that have closed",
      "The review recommends a national branding",
    ],
    2: [
      "According to our research, around one in five",
      "For businesses, the implications are worrying",
      "The situation presents a delicate balance",
      "With AI’s potential to simplify",
    ],
    3: [
      "Since the 2008 launch",
      "This is why the recent severe delays",
      "Disruptions have become increasingly frequent",
      "The huge improvements in Italy",
      "But lack of capacity is another problem",
      "One of the most important changes",
      "Improvements will also come from",
    ],
    4: [
      "In 2023, Chicago lost one",
      "Williams pointed to rising production costs",
      "Chicago’s summer festivals are about more",
      "We often hear people ask why",
      "Wicker Park Fest has long been",
      "This summer, as you enjoy",
    ],
  },
};

const problems = [];
const bare = (value) => value.replace(/\s+/g, "");

function splitBody(label, body, starts) {
  const offsets = [];
  let cursor = 0;
  for (const marker of starts) {
    const at = body.indexOf(marker, cursor);
    if (at === -1) {
      problems.push(`${label}：找不到段落起始短语「${marker}」`);
      return null;
    }
    offsets.push(at);
    cursor = at + marker.length;
  }
  if (offsets[0] !== 0) {
    problems.push(`${label}：首段起始短语不在开头，实际位于第 ${offsets[0]} 个字符`);
    return null;
  }

  const paragraphs = offsets.map((start, index) => body.slice(start, offsets[index + 1] ?? body.length).trim());
  if (paragraphs.some((item) => !item)) {
    problems.push(`${label}：切分后存在空段落`);
    return null;
  }
  // 逐字符校验，确认没有丢字或错位。段间空白差异不计入比较。
  if (bare(paragraphs.join("")) !== bare(body)) {
    problems.push(`${label}：切分后内容与原文不一致，已放弃`);
    return null;
  }
  return paragraphs;
}

const raw = readFileSync(SOURCE, "utf8");
const prefix = "export const examPapers = ";
const literal = raw.replace(new RegExp(`^${prefix}`), "").replace(/ as const;[\s\S]*$/, "");
const papers = JSON.parse(literal);
const before = JSON.parse(literal);

const summary = [];
for (const [year, texts] of Object.entries(STARTS)) {
  const paper = papers[year];
  if (!paper) {
    problems.push(`题库中没有 ${year} 年`);
    continue;
  }
  for (const [number, starts] of Object.entries(texts)) {
    const passage = paper.readingA.find((item) => item.number === Number(number));
    if (!passage) {
      problems.push(`${year} Text ${number}：题库中不存在`);
      continue;
    }
    const paragraphs = splitBody(`${year} Text ${number}`, passage.passage, starts);
    if (!paragraphs) continue;
    passage.paragraphs = paragraphs;
    summary.push(`${year} Text ${number}：${paragraphs.length} 段，最短 ${Math.min(...paragraphs.map((p) => p.length))} 字符`);
  }
}

// 除新增的 paragraphs 外，其余字段必须逐一保持原样。
for (const year of Object.keys(before)) {
  for (const passage of before[year].readingA) {
    const now = papers[year].readingA.find((item) => item.number === passage.number);
    // 两边都剔除 paragraphs 再比较：脚本重复运行时基准里已含该字段，
    // 只剔除一边会把正常的重跑误判成字段被改动。
    const after = { ...now };
    const original = { ...passage };
    delete after.paragraphs;
    delete original.paragraphs;
    if (JSON.stringify(after) !== JSON.stringify(original)) {
      problems.push(`${year} Text ${passage.number}：除 paragraphs 外的字段被改动`);
    }
  }
}

if (problems.length) {
  console.error("切分未通过校验：\n");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("\n未写入任何内容。");
  process.exit(1);
}

writeFileSync(SOURCE, `${prefix}${JSON.stringify(papers, null, 2)} as const;\n`);
console.log(`已写入 ${SOURCE}\n`);
for (const line of summary) console.log(`  ${line}`);
console.log(`\n共 ${summary.length} 篇，全部通过逐字符校验。`);
