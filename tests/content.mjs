import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

const files = readdirSync("content/reading-a").filter((name) => name.endsWith(".json")).sort();
assert.deepEqual(files, Array.from({ length: 15 }, (_, index) => `${2010 + index}.json`));
let totalQuestions = 0;
for (const file of files) {
  const paper = JSON.parse(readFileSync(`content/reading-a/${file}`, "utf8"));
  assert.equal(paper.year, Number(file.slice(0, 4)));
  assert.equal(paper.status, "draft");
  assert.equal(paper.answerStatus, "pending");
  const pdf = readFileSync(`content/source-pdfs/${paper.sourceFile}`);
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  assert.equal(createHash("sha256").update(pdf).digest("hex"), paper.sourceSha256, `${file}: original PDF changed`);
  assert.deepEqual(paper.sections, { cloze: 0, readingA: 4, readingB: 0, translation: 0, writing: 0 });
  assert.deepEqual(paper.readingA.map((text) => text.number), [1, 2, 3, 4]);
  for (const text of paper.readingA) {
    assert.equal(text.passage, text.paragraphs.join(" "));
    assert.equal(text.wordCount, text.passage.split(/\s+/).length);
    assert.ok(text.wordCount > 250 && text.wordCount < 650);
    assert.ok(text.paragraphs.length >= 4);
    assert.deepEqual(text.sourcePages, [text.number * 2 + 1, text.number * 2 + 2]);
    assert.deepEqual(text.questions.map((question) => question.number), Array.from({ length: 5 }, (_, index) => text.number * 5 + 16 + index));
    for (const question of text.questions) {
      assert.deepEqual(Object.keys(question).sort(), ["number", "options", "prompt"]);
      assert.equal(question.options.length, 4);
      for (const value of [question.prompt, ...question.options]) assert.ok(typeof value === "string" && value.trim().length > 0);
      totalQuestions++;
    }
  }
  assert.doesNotMatch(JSON.stringify(paper.readingA), /burningvocabulary|Part\s+B|Directions:|\ufffd|\u0000/);
}
assert.equal(totalQuestions, 300);
const paper2010 = JSON.parse(readFileSync("content/reading-a/2010.json", "utf8"));
assert.deepEqual(paper2010.readingA[2].questions[2].options, ["Tide.", "Crest.", "Colgate.", "Unilever."]);
const existing = JSON.parse(readFileSync("content/exam-papers.ts", "utf8").replace(/^export const examPapers = /, "").replace(/ as const;[\s\S]*$/, ""));
assert.deepEqual(Object.keys(existing).sort(), ["2025", "2026"]);
for (const paper of Object.values(existing)) {
  assert.equal(paper.readingA.length, 4);
  assert.equal(paper.readingA.flatMap((text) => text.questions).length, 20);
  const pdf = readFileSync(`content/source-pdfs/${paper.sourceFile}`);
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
}
console.log("Content tests passed: 2010–2026 covered, 17 PDFs, 68 passages, 340 questions. 2010–2024: 60 draft passages, 300 questions, 1200 options, no answers.");
