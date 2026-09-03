import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Use the project's existing compiler so this also runs on Node 20 without a TS loader.
const source = readFileSync(new URL("../src/lib/ai-request.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { requestAi } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const originalFetch = globalThis.fetch;
const originalTimeout = globalThis.setTimeout;
const originalClear = globalThis.clearTimeout;

try {
  let calls = 0;
  let resolve;
  globalThis.fetch = () => {
    calls++;
    return new Promise((done) => { resolve = done; });
  };
  const body = { term: "bank", context: "river bank" };
  const pending = Array.from({ length: 10 }, () => requestAi("/api/dictionary", body));
  await Promise.resolve();
  assert.equal(calls, 1, "Ten identical clicks must share one request");
  resolve(Response.json({ meaning: "河岸" }));
  const results = await Promise.all(pending);
  assert.ok(results.every((result) => result.data.meaning === "河岸"));

  globalThis.fetch = async () => { calls++; return Response.json({ meaning: "test" }); };
  await Promise.all([
    requestAi("/api/dictionary", { term: "bank", context: "river" }),
    requestAi("/api/dictionary", { term: "bank", context: "money" }),
  ]);
  assert.equal(calls, 3, "Different contexts must not share a meaning");
  await requestAi("/api/dictionary", body);
  assert.equal(calls, 4, "Completed in-flight entries must be released");

  globalThis.fetch = () => { throw new Error("offline"); };
  await assert.rejects(requestAi("/api/dictionary", body), /offline/);
  globalThis.fetch = async () => Response.json({ meaning: "retry works" });
  assert.equal((await requestAi("/api/dictionary", body)).data.meaning, "retry works");
  globalThis.fetch = async () => new Response("invalid json");
  await assert.rejects(requestAi("/api/dictionary", body));
  globalThis.fetch = async () => Response.json({ error: "temporary" }, { status: 503 });
  assert.equal((await requestAi("/api/dictionary", body)).ok, false);

  let expire;
  globalThis.setTimeout = (fn, milliseconds) => { assert.equal(milliseconds, 75_000); expire = fn; return 1; };
  globalThis.clearTimeout = () => {};
  globalThis.fetch = (_path, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("Timed out", "AbortError")));
  });
  const stalled = requestAi("/api/dictionary", body);
  await Promise.resolve();
  expire();
  await assert.rejects(stalled, { name: "AbortError" });
  globalThis.fetch = async () => Response.json({ meaning: "recovered" });
  assert.equal((await requestAi("/api/dictionary", body)).data.meaning, "recovered");
  console.log("AI request tests passed: 10 clicks / 1 request, context isolation, failure retry, timeout cleanup. No paid API calls.");
} finally {
  globalThis.fetch = originalFetch;
  globalThis.setTimeout = originalTimeout;
  globalThis.clearTimeout = originalClear;
}
