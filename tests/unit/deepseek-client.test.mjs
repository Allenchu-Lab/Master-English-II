import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from '../load-ts.mjs';
const { callDeepseek } = loadTs('src/lib/deepseek-client.ts', {
  './deepseek-config': { deepseekModel: 'test-model', deepseekThinking: { type: 'disabled' } },
});

test('shared AI transport preserves model, timeout signal, rubric and provider status without retry', async () => {
  const originalFetch = globalThis.fetch, originalKey = process.env.DEEPSEEK_API_KEY;
  let calls = 0;
  const signal = new AbortController().signal;
  const payload = { temperature: 0.1, messages: [{ role: 'system', content: 'unchanged rubric' }] };
  process.env.DEEPSEEK_API_KEY = 'test-key';
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.deepseek.com/chat/completions');
    assert.equal(options.signal, signal);
    assert.equal(options.headers.Authorization, 'Bearer test-key');
    assert.deepEqual(JSON.parse(options.body), { ...payload, model: 'test-model', thinking: { type: 'disabled' }, response_format: { type: 'json_object' } });
    return Response.json({}, { status: 503 });
  };
  try {
    assert.equal((await callDeepseek(payload, signal)).status, 503);
    assert.equal(calls, 1);
    delete process.env.DEEPSEEK_API_KEY;
    assert.throws(() => callDeepseek(payload, signal), /not configured/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = originalKey;
  }
});
