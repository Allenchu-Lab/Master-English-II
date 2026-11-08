import test from 'node:test';
import assert from 'node:assert/strict';
import { createMutationQueue, DraftSaveError, scheduleDraftSave } from '../../src/lib/draft-save.ts';

function deferred() {
  let resolve, reject;
  const promise = new Promise((a, b) => { resolve = a; reject = b; });
  return { promise, resolve, reject };
}
const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
function fakeClock() {
  const timers = new Map();
  let id = 0;
  return {
    setTimeout(run, delay) { const key = ++id; timers.set(key, { run, delay }); return key; },
    clearTimeout(key) { timers.delete(key); },
    get size() { return timers.size; },
    async next() {
      const [key, timer] = timers.entries().next().value;
      timers.delete(key); timer.run(); await settle(); return timer.delay;
    },
  };
}

test('slow saves remain ordered; submit and redo follow the last draft', async () => {
  const queue = createMutationQueue(), slow = deferred(), writes = [];
  const first = queue.enqueue(async () => { await slow.promise; writes.push('old answer'); });
  const second = queue.enqueue(async () => { writes.push('new answer'); });
  const submit = queue.enqueue(async () => { writes.push('submitted'); });
  const redo = queue.enqueue(async () => { writes.push('fresh draft'); });
  await settle(); assert.deepEqual(writes, []);
  slow.resolve(); await Promise.all([first, second, submit, redo]);
  assert.deepEqual(writes, ['old answer', 'new answer', 'submitted', 'fresh draft']);
});

test('failed save does not poison retry, final submission or drain', async () => {
  const queue = createMutationQueue();
  await assert.rejects(queue.enqueue(async () => { throw new DraftSaveError(503); }));
  assert.equal(await queue.enqueue(async () => 'submitted with full answer'), 'submitted with full answer');
  await queue.drain();
});

test('navigation waits for the in-flight write', async () => {
  const queue = createMutationQueue(), slow = deferred();
  void queue.enqueue(() => slow.promise);
  let navigated = false;
  const leave = queue.drain().then(() => { navigated = true; });
  await settle(); assert.equal(navigated, false);
  slow.resolve(); await leave; assert.equal(navigated, true);
});

test('continuous input cancels old debounce and saves only newest answer', async () => {
  const clock = fakeClock(), writes = [];
  let cancel = () => {};
  for (const answer of ['a', 'ab', 'abc']) {
    cancel(); cancel = scheduleDraftSave({ clock, save: async () => writes.push(answer), onError: assert.fail });
  }
  assert.equal(clock.size, 1); await clock.next(); assert.deepEqual(writes, ['abc']);
});

test('transient failures retry at 1, 2 and 4 seconds then report once', async () => {
  const clock = fakeClock(); let attempts = 0, errors = 0;
  scheduleDraftSave({ clock, save: async () => { attempts++; throw new DraftSaveError(503); }, onError: () => errors++ });
  const delays = []; while (clock.size) delays.push(await clock.next());
  assert.deepEqual(delays, [600, 1000, 2000, 4000]); assert.equal(attempts, 4); assert.equal(errors, 1);
});

for (const status of [400, 401, 403, 404, 409, 429]) test(`HTTP ${status} does not blindly retry`, async () => {
  const clock = fakeClock(); let errors = 0;
  scheduleDraftSave({ clock, save: async () => { throw new DraftSaveError(status); }, onError: () => errors++ });
  await clock.next(); assert.equal(clock.size, 0); assert.equal(errors, 1);
});

test('cancel while a request is pending prevents retry after rejection', async () => {
  const clock = fakeClock(), request = deferred();
  const cancel = scheduleDraftSave({ clock, save: () => request.promise, onError: assert.fail });
  await clock.next(); cancel(); request.reject(new Error('offline')); await settle();
  assert.equal(clock.size, 0);
});

test('submit/redo lock prevents any delayed draft from starting', async () => {
  const clock = fakeClock(); let locked = false, writes = 0;
  scheduleDraftSave({ clock, blocked: () => locked, save: async () => writes++, onError: assert.fail });
  locked = true; await clock.next(); assert.equal(writes, 0);
});
