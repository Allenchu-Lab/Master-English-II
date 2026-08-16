"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Highlight = { start: number; end: number };
const guideStorageKey = "reading-highlight-guide-complete";

function mergeHighlights(highlights: Highlight[]) {
  return [...highlights]
    .sort((a, b) => a.start - b.start)
    .reduce<Highlight[]>((merged, highlight) => {
      const previous = merged.at(-1);
      if (!previous || highlight.start > previous.end) return [...merged, highlight];
      previous.end = Math.max(previous.end, highlight.end);
      return merged;
    }, []);
}

export function SelectableHighlight({ text, scope, storageKey }: { text: string; scope: string; storageKey: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const scopedStorageKey = `${storageKey}:${scope}`;

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(scopedStorageKey);
        if (saved) setHighlights(JSON.parse(saved) as Highlight[]);
      } catch { /* Ignore invalid local highlight data. */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, [scopedStorageKey]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(scopedStorageKey, JSON.stringify(highlights));
  }, [highlights, hydrated, scopedStorageKey]);

  const segments = useMemo(() => {
    const result: { text: string; highlightIndex?: number }[] = [];
    let cursor = 0;
    highlights.forEach((highlight, index) => {
      if (highlight.start > cursor) result.push({ text: text.slice(cursor, highlight.start) });
      result.push({ text: text.slice(highlight.start, highlight.end), highlightIndex: index });
      cursor = highlight.end;
    });
    if (cursor < text.length) result.push({ text: text.slice(cursor) });
    return result;
  }, [highlights, text]);

  const addSelection = () => {
    const selection = window.getSelection();
    const container = containerRef.current;
    if (!selection || selection.isCollapsed || !selection.rangeCount || !container) return;
    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) return;

    const before = range.cloneRange();
    before.selectNodeContents(container);
    before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length;
    const end = start + range.toString().length;
    if (end <= start) return;

    setHighlights((current) => mergeHighlights([...current, { start, end }]));
    window.localStorage.setItem(guideStorageKey, "true");
    window.dispatchEvent(new Event("reading-highlight-created"));
    selection.removeAllRanges();
  };

  const removeHighlight = (index: number) => {
    setHighlights((current) => current.filter((_, highlightIndex) => highlightIndex !== index));
  };

  return <span ref={containerRef} className="selectable-highlight" onMouseUp={addSelection} onTouchEnd={addSelection}>
    {segments.map((segment, index) => segment.highlightIndex === undefined
      ? <span key={index}>{segment.text}</span>
      : <mark key={index} onClick={(event) => { event.stopPropagation(); removeHighlight(segment.highlightIndex!); }} title="点击取消标记">{segment.text}</mark>)}
  </span>;
}

export function HighlightGuide({ isEnglish }: { isEnglish: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = window.setTimeout(() => setVisible(window.localStorage.getItem(guideStorageKey) !== "true"), 0);
    const complete = () => setVisible(false);
    window.addEventListener("reading-highlight-created", complete);
    return () => {
      window.clearTimeout(show);
      window.removeEventListener("reading-highlight-created", complete);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    window.localStorage.setItem(guideStorageKey, "true");
    setVisible(false);
  };

  return <aside className="highlight-guide" aria-label={isEnglish ? "Highlight guide" : "划词标记引导"}>
    <span aria-hidden="true">Highlight</span>
    <p>{isEnglish ? "Drag over text to highlight it. Click a highlight to remove it." : "拖选文字即可标记，点击标记可取消。"}</p>
    <button type="button" onClick={dismiss} aria-label={isEnglish ? "Dismiss guide" : "关闭引导"}>×</button>
  </aside>;
}
