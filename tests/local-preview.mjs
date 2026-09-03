import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import pg from "pg";
import ts from "typescript";

const databaseUrl = "postgresql://chitouen_local@127.0.0.1:55432/chitouen_local";
const db = new pg.Client({ connectionString: databaseUrl });
const previous = { NODE_ENV: process.env.NODE_ENV, DATABASE_URL: process.env.DATABASE_URL };
const moduleUrl = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
function compile(path, imports = {}) {
  let source = readFileSync(path, "utf8").replace('import "server-only";', "");
  for (const [name, url] of Object.entries(imports)) source = source.replaceAll(`"${name}"`, `"${url}"`);
  return moduleUrl(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
}

await db.connect();
try {
  assert.equal((await db.query("show data_directory")).rows[0].data_directory, `${process.cwd()}/.local-db/data`);
  globalThis.__localPreviewTestDb = db;
  const config = compile("src/lib/content-preview.ts");
  const imports = {
    "@/lib/content-preview": config,
    "@/lib/db": moduleUrl("export const query = (...args) => globalThis.__localPreviewTestDb.query(...args);"),
  };
  const { localContentPreviewEnabled } = await import(config);
  const { getExamPapers } = await import(compile("src/data/get-exam-papers.ts", imports));
  const { getPracticePassage } = await import(compile("src/data/get-practice-passage.ts", imports));
  const { isPassageGradable } = await import(compile("src/data/passage-gradable.ts", imports));
  process.env.DATABASE_URL = databaseUrl;
  process.env.NODE_ENV = "development";
  assert.equal(localContentPreviewEnabled(), true);
  const local = await getExamPapers();
  assert.equal(Object.keys(local).length, 17);
  for (let year = 2010; year <= 2024; year++) {
    assert.equal(local[year].readingA.length, 4);
    for (const item of local[year].readingA) {
      assert.equal(item.questionCount, 5);
      assert.equal(item.gradable, false);
    }
    const passage = await getPracticePassage(year, 1);
    assert.equal(passage.questions.length, 5);
    assert.equal(passage.questions[0].options.length, 4);
    assert.equal(await isPassageGradable(passage.id), false);
  }
  process.env.NODE_ENV = "production";
  assert.equal(localContentPreviewEnabled(), false);
  assert.deepEqual(Object.keys(await getExamPapers()), ["2025", "2026"]);
  for (let year = 2010; year <= 2024; year++) assert.equal(await getPracticePassage(year, 1), null);
  assert.ok(await getPracticePassage(2026, 1));
  process.env.NODE_ENV = "development";
  process.env.DATABASE_URL = "postgresql://example.invalid/production";
  assert.equal(localContentPreviewEnabled(), false);
  console.log("Local preview tests passed: 17 local years, 2 production years; draft direct URLs blocked in production; grading unchanged.");
} finally {
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  delete globalThis.__localPreviewTestDb;
  await db.end();
}
