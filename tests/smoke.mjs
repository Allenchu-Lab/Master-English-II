import assert from "node:assert/strict";

const baseUrl = (process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(15_000) });
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  return response;
}

const health = await get("/api/health");
assert.deepEqual(await health.json(), { ok: true });

for (const path of ["/?lang=en", "/practice/2026/1?lang=en", "/intensive/2026/1?lang=en"]) {
  const response = await get(path);
  const html = await response.text();
  assert.match(html, /ChiTouEN II/, `${path} did not render the English product title`);
}

console.log(`Smoke tests passed against ${baseUrl}`);
