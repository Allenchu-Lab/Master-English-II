import test from "node:test";
import assert from "node:assert/strict";
import { mergeHighlights } from "../../src/lib/highlight.ts";

test("returns empty for empty input", () => {
  assert.deepEqual(mergeHighlights([]), []);
});

test("keeps a single range as-is", () => {
  assert.deepEqual(mergeHighlights([{ start: 2, end: 6 }]), [{ start: 2, end: 6 }]);
});

test("sorts disjoint ranges by start offset", () => {
  const input = [{ start: 10, end: 12 }, { start: 0, end: 3 }];
  assert.deepEqual(mergeHighlights(input), [{ start: 0, end: 3 }, { start: 10, end: 12 }]);
});

test("merges overlapping ranges", () => {
  assert.deepEqual(mergeHighlights([{ start: 0, end: 6 }, { start: 4, end: 9 }]), [{ start: 0, end: 9 }]);
});

test("merges touching ranges where start equals previous end", () => {
  assert.deepEqual(mergeHighlights([{ start: 0, end: 5 }, { start: 5, end: 8 }]), [{ start: 0, end: 8 }]);
});

test("does not merge when there is a one-character gap", () => {
  assert.deepEqual(mergeHighlights([{ start: 0, end: 5 }, { start: 6, end: 8 }]), [{ start: 0, end: 5 }, { start: 6, end: 8 }]);
});

test("absorbs a range fully contained in the previous one", () => {
  assert.deepEqual(mergeHighlights([{ start: 0, end: 10 }, { start: 3, end: 5 }]), [{ start: 0, end: 10 }]);
});

test("collapses a chain of overlapping ranges into one", () => {
  const input = [{ start: 0, end: 3 }, { start: 2, end: 5 }, { start: 4, end: 8 }, { start: 20, end: 22 }];
  assert.deepEqual(mergeHighlights(input), [{ start: 0, end: 8 }, { start: 20, end: 22 }]);
});

test("does not mutate the input array or its objects", () => {
  const first = { start: 0, end: 6 };
  const second = { start: 4, end: 9 };
  const input = [first, second];
  mergeHighlights(input);
  assert.deepEqual(input, [{ start: 0, end: 6 }, { start: 4, end: 9 }]);
  assert.deepEqual(first, { start: 0, end: 6 });
  assert.deepEqual(second, { start: 4, end: 9 });
});
