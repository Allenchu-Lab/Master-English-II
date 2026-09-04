import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

const files = readdirSync("content/reading-a").filter((name) => name.endsWith(".json")).sort();
assert.deepEqual(files, Array.from({ length: 15 }, (_, index) => `${2010 + index}.json`));
let totalQuestions = 0;
for (const file of files) {
  const paper = JSON.parse(readFileSync(`content/reading-a/${file}`, "utf8"));
  assert.equal(paper.year, Number(file.slice(0, 4)));
  assert.equal(paper.status, "published");
  assert.equal(paper.answerStatus, "complete");
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

const pendingAnswerFiles = readdirSync("content/answer-keys-pending").filter((name) => name.endsWith(".json")).sort();
assert.deepEqual(pendingAnswerFiles, Array.from({ length: 15 }, (_, index) => `${2010 + index}.json`));
const answerImageSources = {
  2010: ["IMG_1139.heic", "91b1798f01766a2cecac58783faeeb9fbcd825651163c15413eff46a806d0d95"],
  2011: ["IMG_1140.heic", "e05411cd696049ef27b92b094671cd96561931c54f345f89785f5b8c1a203253"],
  2012: ["IMG_1141.heic", "c998d3e111ef086932ddde622ffc8428a81d30ba2800b067eb278ce2e1e99462"],
  2013: ["IMG_1142.heic", "ea4ce1c7359c7bc00d809dfc50f2e1416e43075dbb10e655886af25befa2ab5b"],
  2014: ["IMG_1144.heic", "287cb6c7eff92d1f7f7df8c2727dd9575bcba20f07b29fff4d3fc5b7bf013dab"],
  2015: ["IMG_1143.heic", "e20cff85d58991a4832eb810c09215dc0a5dfe0bf4122edca734166863bf8e4f"],
  2016: ["IMG_1127.heic", "471dba5be93221736674c865fa0664854b20b258ea08f76fec18c9ab3b40e358"],
  2017: ["IMG_1128.heic", "fa91e2c6b128eb5d4dfef45f8275165bf4fbad0b9be7f0c8bb1114b41fe02b9b"],
  2018: ["IMG_1129.heic", "8adc395eef1d4ba60a3e146eb8da4883a50f963e338f24fd21a7b68a8b43102e"],
  2019: ["IMG_1130.heic", "7ffcbd0818d36d09529086712fc2ddb851913e326042547c54009b74f57cffea"],
  2020: ["IMG_1131.heic", "2e2321b9fd67899fe602066e4c7119d678d325e1d0a0e756066f4f774d4fbb16"],
  2021: ["IMG_1132.heic", "f9c3a4f5efd9e23c1507bed9febb6292eed3c02dd32fcf248dcee90b870e777f"],
  2022: ["IMG_1133.heic", "cec23d016bd0ac97afbde56c1e6faebd02a82acef7e0d59beecb4b792aa2251d"],
  2023: ["IMG_1134.heic", "808cbc1dc39e9d4d73929b143cebaabd561191d4a564bd29b1f4910ddb4554e6"],
  2024: ["IMG_1135.heic", "5d90af687a2741608b012d2ba478e291493759cea0e5666a562629e8d822438e"],
  2025: ["IMG_1136.heic", "628521c4094987ff20140938845fc91911446bc6a603bb5e36009b2ecf0c8c05"],
  2026: ["IMG_1137.heic", "f8acd644c7b1f39875398edb5680c7bf9d202b2709bd6f6377f6a264eabbae00"],
};
assert.deepEqual(
  readdirSync("content/source-answer-images").filter((name) => name.endsWith(".heic")).sort(),
  Object.values(answerImageSources).map(([name]) => name).sort(),
);
for (const [year, [sourceImage, sourceSha256]] of Object.entries(answerImageSources)) {
  const image = readFileSync(`content/source-answer-images/${sourceImage}`);
  assert.equal(createHash("sha256").update(image).digest("hex"), sourceSha256, `${year}: source answer image changed`);
}
for (const file of pendingAnswerFiles) {
  const key = JSON.parse(readFileSync(`content/answer-keys-pending/${file}`, "utf8"));
  const [sourceImage, sourceSha256] = answerImageSources[key.year];
  assert.equal(key.year, Number(file.slice(0, 4)));
  assert.equal(key.section, "reading_a");
  assert.equal(key.sourceImage, sourceImage);
  assert.deepEqual(Object.keys(key.answers), Array.from({ length: 20 }, (_, index) => String(21 + index)));
  assert.ok(Object.values(key.answers).every((answer) => /^[A-D]$/.test(answer)));
  assert.ok(sourceSha256);

  const published = JSON.parse(readFileSync(`content/answer-keys/${file}`, "utf8"));
  assert.equal(published.year, key.year);
  assert.equal(published.section, "reading_a");
  assert.match(published.source, /AI-generated explanations/);
  const publishedQuestions = published.texts.flatMap((text) => text.questions);
  assert.equal(publishedQuestions.length, 20);
  for (const question of publishedQuestions) {
    assert.equal(question.answer, key.answers[String(question.number)]);
    assert.ok(question.promptZh.trim());
    assert.equal(question.optionsZh.length, 4);
    assert.ok(question.optionsZh.every((option) => option.trim()));
    assert.ok(question.explanation.trim());
  }
}
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
const existingAnswers = Object.fromEntries(
  [2025, 2026].map((year) => {
    const key = JSON.parse(readFileSync(`content/answer-keys/${year}.json`, "utf8"));
    return [year, key.texts.flatMap((text) => text.questions).map((question) => question.answer).join("")];
  }),
);
assert.deepEqual(existingAnswers, { 2025: "BCADABCCBCABABDCDADD", 2026: "DCAACBACDDBACDBDCCBB" });
console.log("Content tests passed: 2010–2026 covered, 17 PDFs, 68 passages, 340 questions and complete answer keys. 2010–2024 answer letters match source images; explanations are AI-generated.");
