export type Highlight = { start: number; end: number };

// Sorts by start offset and folds overlapping or touching ranges together.
// Input objects are never mutated: merged entries are copies, so callers keep
// their own highlight references intact.
export function mergeHighlights(highlights: Highlight[]): Highlight[] {
  return [...highlights]
    .sort((a, b) => a.start - b.start)
    .reduce<Highlight[]>((merged, highlight) => {
      const previous = merged.at(-1);
      if (!previous || highlight.start > previous.end) return [...merged, { ...highlight }];
      previous.end = Math.max(previous.end, highlight.end);
      return merged;
    }, []);
}
