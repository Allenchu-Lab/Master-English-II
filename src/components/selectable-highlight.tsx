"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Highlight = { start: number; end: number };
const guideStorageKey = "reading-highlight-guide-complete";

type DictionaryEntry = { term: string; phonetic?: string; partOfSpeech?: string; meaning: string; contextMeaning?: string };

/** 查词请求会真实调用 AI，超过这个长度的选段不再送去查询。 */
const MAX_TERM_LENGTH = 60;
/** 只把标记附近的文字作为语境送出，整段过长且对释义无益。 */
const CONTEXT_RADIUS = 220;

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

export function SelectableHighlight({ text, scope, storageKey, isEnglish = false }: { text: string; scope: string; storageKey: string; isEnglish?: boolean }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const scopedStorageKey = `${storageKey}:${scope}`;

  // 查词弹层：只在点击已有标记时打开，避免每次划词都触发一次 AI 调用。
  const [lookup, setLookup] = useState<{ index: number; term: string } | null>(null);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  // 同一个词重复点击不再请求，既省调用也避开限流。
  const cache = useRef(new Map<string, DictionaryEntry>());

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

  // 按 Esc 或点击弹层外部关闭，符合浮层的一般预期。
  useEffect(() => {
    if (!lookup) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setLookup(null); };
    const onOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setLookup(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [lookup]);

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
    setLookup(null);
  };

  const openLookup = async (index: number, term: string) => {
    const trimmed = term.trim();
    setLookup({ index, term: trimmed });
    setLookupError(null);
    setEntry(null);

    const cached = cache.current.get(trimmed.toLowerCase());
    if (cached) {
      setEntry(cached);
      return;
    }
    if (trimmed.length > MAX_TERM_LENGTH) {
      setLookupError(isEnglish ? "Select a shorter phrase to look up." : "选中的内容过长，请选更短的词或短语。");
      return;
    }

    // 只截取标记周围的文字作为语境，帮助 AI 判断该词在本句中的含义。
    const at = text.indexOf(trimmed);
    const context = at === -1 ? text.slice(0, CONTEXT_RADIUS * 2)
      : text.slice(Math.max(0, at - CONTEXT_RADIUS), at + trimmed.length + CONTEXT_RADIUS);

    setLooking(true);
    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: trimmed, context }),
      });
      const data = await response.json().catch(() => null) as (DictionaryEntry & { error?: string }) | null;
      if (!response.ok || !data?.meaning) {
        setLookupError(data?.error ?? (isEnglish ? "Could not look up this word." : "查词失败，请稍后再试。"));
        return;
      }
      cache.current.set(trimmed.toLowerCase(), data);
      setEntry(data);
    } catch {
      setLookupError(isEnglish ? "Could not reach the server." : "无法连接服务器，请稍后再试。");
    } finally {
      setLooking(false);
    }
  };

  return <span ref={containerRef} className="selectable-highlight" onMouseUp={addSelection} onTouchEnd={addSelection}>
    {segments.map((segment, index) => segment.highlightIndex === undefined
      ? <span key={index}>{segment.text}</span>
      : <mark
          key={index}
          className={lookup?.index === segment.highlightIndex ? "is-open" : ""}
          onClick={(event) => { event.stopPropagation(); void openLookup(segment.highlightIndex!, segment.text); }}
          title={isEnglish ? "Look up this word" : "点击查看释义"}
        >{segment.text}</mark>)}

    {lookup && <span className="word-lookup" role="dialog" aria-label={isEnglish ? "Word meaning" : "词汇释义"} onClick={(event) => event.stopPropagation()}>
      <span className="word-lookup-head">
        <strong>{lookup.term}</strong>
        {entry?.phonetic && <em>{entry.phonetic}</em>}
        {entry?.partOfSpeech && <i>{entry.partOfSpeech}</i>}
      </span>
      {looking && <span className="word-lookup-state">{isEnglish ? "Looking up…" : "正在查询…"}</span>}
      {lookupError && <span className="word-lookup-state is-error">{lookupError}</span>}
      {entry && <>
        <span className="word-lookup-meaning">{entry.meaning}</span>
        {entry.contextMeaning && <span className="word-lookup-context">
          <b>{isEnglish ? "In this sentence" : "本句中"}</b>{entry.contextMeaning}
        </span>}
      </>}
      <span className="word-lookup-actions">
        <button type="button" onClick={() => removeHighlight(lookup.index)}>{isEnglish ? "Remove highlight" : "取消标记"}</button>
        <button type="button" onClick={() => setLookup(null)}>{isEnglish ? "Close" : "关闭"}</button>
      </span>
    </span>}
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
    <p>{isEnglish ? "Drag over text to highlight it, then click the highlight to see what it means." : "拖选文字即可标记，点击标记可查看释义。"}</p>
    <button type="button" onClick={dismiss} aria-label={isEnglish ? "Dismiss guide" : "关闭引导"}>×</button>
  </aside>;
}
