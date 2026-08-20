"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MousePointer2, X } from "lucide-react";

type Highlight = { start: number; end: number };
type InteractionMode = "highlight" | "lookup";
const guideStorageKey = "reading-highlight-onboarding-complete-v2";

type DictionaryEntry = { term: string; phonetic?: string; partOfSpeech?: string; meaning: string; contextMeaning?: string };

/** 查词请求会真实调用 AI，超过这个长度的选段不再送去查询。 */
const MAX_TERM_LENGTH = 60;
/** 只把标记附近的文字作为语境送出，整段过长且对释义无益。 */
const CONTEXT_RADIUS = 220;

/**
 * 释义缓存，模块级共享并持久化。
 *
 * 原先缓存放在组件内，每个段落各存一份：同一个词在另一段要重新查，刷新后
 * 全部作废。考研词汇高度复现，这让"正在查询"出现得远比必要频繁。
 * 改为全页共享并写入本地存储后，一个词在整个应用里只查一次。
 */
const cacheStorageKey = "dictionary-cache";
const CACHE_LIMIT = 300;
const dictionaryCache = new Map<string, DictionaryEntry>();
let cacheLoaded = false;

function loadCache() {
  if (cacheLoaded) return;
  cacheLoaded = true;
  try {
    const saved = window.localStorage.getItem(cacheStorageKey);
    if (!saved) return;
    for (const [term, value] of Object.entries(JSON.parse(saved) as Record<string, DictionaryEntry>)) {
      dictionaryCache.set(term, value);
    }
  } catch { /* 缓存损坏时忽略，重新查询即可。 */ }
}

function rememberEntry(term: string, value: DictionaryEntry) {
  dictionaryCache.set(term, value);
  // 超出上限时丢弃最早写入的条目，避免本地存储无限增长。
  while (dictionaryCache.size > CACHE_LIMIT) {
    const oldest = dictionaryCache.keys().next().value;
    if (oldest === undefined) break;
    dictionaryCache.delete(oldest);
  }
  try {
    window.localStorage.setItem(cacheStorageKey, JSON.stringify(Object.fromEntries(dictionaryCache)));
  } catch { /* 存储写满时仅失去持久化，内存缓存仍然有效。 */ }
}

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

export function SelectableHighlight({ text, scope, storageKey, isEnglish = false, mode = "highlight" }: { text: string; scope: string; storageKey: string; isEnglish?: boolean; mode?: InteractionMode }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const lookupRequestRef = useRef(0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const scopedStorageKey = `${storageKey}:${scope}`;

  const [lookup, setLookup] = useState<{ index?: number; term: string; start: number; x?: number; y?: number } | null>(null);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [pendingLookupStart, setPendingLookupStart] = useState<number | null>(null);

  useEffect(() => {
    if (mode !== "highlight") return;
    const restore = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(scopedStorageKey);
        if (saved) setHighlights(JSON.parse(saved) as Highlight[]);
      } catch { /* Ignore invalid local highlight data. */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, [mode, scopedStorageKey]);

  useEffect(() => {
    if (mode === "highlight" && hydrated) window.localStorage.setItem(scopedStorageKey, JSON.stringify(highlights));
  }, [highlights, hydrated, mode, scopedStorageKey]);

  // 按 Esc 或点击弹层外部关闭，符合浮层的一般预期。
  useEffect(() => {
    if (!lookup) return;
    const close = () => {
      lookupRequestRef.current += 1;
      setLookup(null);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    const onOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
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

  const wordSegments = useMemo(() => {
    if (mode !== "lookup") return [];
    const result: { text: string; start: number; word: boolean }[] = [];
    const pattern = /[A-Za-z]+(?:['’][A-Za-z]+|-[A-Za-z]+)*/g;
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      const start = match.index;
      if (start > cursor) result.push({ text: text.slice(cursor, start), start: cursor, word: false });
      result.push({ text: match[0], start, word: true });
      cursor = start + match[0].length;
    }
    if (cursor < text.length) result.push({ text: text.slice(cursor), start: cursor, word: false });
    return result;
  }, [mode, text]);

  const addSelection = () => {
    if (mode !== "highlight") return;
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

  const openLookup = async (term: string, start: number, anchor: HTMLElement, index?: number) => {
    const trimmed = term.trim();
    if (pendingLookupStart === start) {
      lookupRequestRef.current += 1;
      setPendingLookupStart(null);
      return;
    }
    if (lookup?.term === trimmed && lookup.start === start) {
      lookupRequestRef.current += 1;
      setLookup(null);
      return;
    }

    const containerRect = containerRef.current?.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const popoverWidth = Math.min(320, window.innerWidth * 0.9);
    const x = containerRect ? Math.min(anchorRect.left - containerRect.left, Math.max(0, containerRect.width - popoverWidth)) : undefined;
    const y = containerRect ? anchorRect.bottom - containerRect.top : undefined;
    const requestId = ++lookupRequestRef.current;
    const nextLookup = { index, term: trimmed, start, x, y };
    setPendingLookupStart(start);
    setLookup(null);
    setLookupError(null);
    setEntry(null);

    loadCache();
    const key = trimmed.toLowerCase();
    const cached = dictionaryCache.get(key);
    if (cached) {
      setPendingLookupStart(null);
      setLookup(nextLookup);
      setEntry(cached);
      return;
    }
    if (trimmed.length > MAX_TERM_LENGTH) {
      setPendingLookupStart(null);
      setLookup(nextLookup);
      setLookupError(isEnglish ? "Select a shorter phrase to look up." : "选中的内容过长，请选更短的词或短语。");
      return;
    }

    // 只截取标记周围的文字作为语境，帮助 AI 判断该词在本句中的含义。
    const context = text.slice(Math.max(0, start - CONTEXT_RADIUS), start + trimmed.length + CONTEXT_RADIUS);

    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: trimmed, context }),
      });
      const data = await response.json().catch(() => null) as (DictionaryEntry & { error?: string }) | null;
      if (requestId !== lookupRequestRef.current) return;
      setPendingLookupStart(null);
      setLookup(nextLookup);
      if (!response.ok || !data?.meaning) {
        setLookupError(data?.error ?? (isEnglish ? "Could not look up this word." : "查词失败，请稍后再试。"));
        return;
      }
      rememberEntry(key, data);
      setEntry(data);
    } catch {
      if (requestId === lookupRequestRef.current) {
        setPendingLookupStart(null);
        setLookup(nextLookup);
        setLookupError(isEnglish ? "Could not reach the server." : "无法连接服务器，请稍后再试。");
      }
    }
  };

  return <span ref={containerRef} className={`selectable-highlight ${mode === "lookup" ? "lookup-by-word" : ""}`} onMouseUp={addSelection} onTouchEnd={addSelection}>
    {mode === "lookup" ? wordSegments.map((segment) => segment.word
      ? <button
          type="button"
          key={segment.start}
          className={`lookup-word ${lookup?.start === segment.start ? "is-open" : ""} ${pendingLookupStart === segment.start ? "is-looking" : ""}`}
          onClick={(event) => { void openLookup(segment.text, segment.start, event.currentTarget); }}
          aria-busy={pendingLookupStart === segment.start}
          aria-label={isEnglish ? `Look up ${segment.text}` : `查询 ${segment.text}`}
        >{segment.text}</button>
      : <span key={segment.start}>{segment.text}</span>) : segments.map((segment, index) => segment.highlightIndex === undefined
      ? <span key={index}>{segment.text}</span>
      : <mark
          key={index}
          onClick={(event) => { event.stopPropagation(); removeHighlight(segment.highlightIndex!); }}
          title={isEnglish ? "Remove highlight" : "点击取消标记"}
        >{segment.text}</mark>)}

    {lookup && <span className="word-lookup" style={lookup.x === undefined ? undefined : { left: lookup.x, top: lookup.y }} role="dialog" aria-label={isEnglish ? "Word meaning" : "词汇释义"} onClick={(event) => event.stopPropagation()}>
      <span className="word-lookup-head">
        <strong>{lookup.term}</strong>
        {entry?.phonetic && <em>{entry.phonetic}</em>}
        {entry?.partOfSpeech && <i>{entry.partOfSpeech}</i>}
      </span>
      {lookupError && <span className="word-lookup-state is-error">{lookupError}</span>}
      {entry && <>
        <span className="word-lookup-meaning">{entry.meaning}</span>
        {entry.contextMeaning && <span className="word-lookup-context">
          <b>{isEnglish ? "In this sentence" : "本句中"}</b>{entry.contextMeaning}
        </span>}
      </>}
      <span className="word-lookup-actions">
        {lookup.index !== undefined && <button type="button" onClick={() => removeHighlight(lookup.index!)}>{isEnglish ? "Remove highlight" : "取消标记"}</button>}
        <button type="button" onClick={() => { lookupRequestRef.current += 1; setLookup(null); }}>{isEnglish ? "Close" : "关闭"}</button>
      </span>
    </span>}
  </span>;
}

export function HighlightGuide({ isEnglish }: { isEnglish: boolean }) {
  const [visible, setVisible] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const show = window.setTimeout(() => setVisible(window.localStorage.getItem(guideStorageKey) !== "true"), 0);
    const complete = () => setVisible(false);
    window.addEventListener("reading-highlight-created", complete);
    return () => {
      window.clearTimeout(show);
      window.removeEventListener("reading-highlight-created", complete);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    startButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      window.localStorage.setItem(guideStorageKey, "true");
      setVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  if (!visible) return null;

  const dismiss = () => {
    window.localStorage.setItem(guideStorageKey, "true");
    setVisible(false);
  };

  return <div className="highlight-onboarding-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) dismiss(); }}>
    <section className="highlight-onboarding" role="dialog" aria-modal="true" aria-labelledby="highlight-onboarding-title">
      <button className="highlight-onboarding-close" type="button" onClick={dismiss} aria-label={isEnglish ? "Close guide" : "关闭引导"}><X /></button>
      <span className="highlight-onboarding-eyebrow">{isEnglish ? "Reading tool" : "阅读小工具"}</span>
      <h2 id="highlight-onboarding-title">{isEnglish ? "Highlight what matters" : "划出重点，读得更清楚"}</h2>
      <p>{isEnglish ? "Drag across any important phrase to save a highlight. Click it once to remove it." : "拖动选中重要内容即可留下高亮，再点击一次就能取消。"}</p>

      <div className="highlight-demo" aria-hidden="true">
        <span className="highlight-demo-label">Text 1</span>
        <p>Reading becomes easier when you <span className="highlight-demo-target"><mark>notice the key idea</mark><MousePointer2 className="highlight-demo-cursor" /></span> in each sentence.</p>
        <span className="highlight-demo-tip">{isEnglish ? "Drag to highlight · Click to remove" : "拖动划重点 · 点击取消"}</span>
      </div>

      <button ref={startButtonRef} className="highlight-onboarding-start" type="button" onClick={dismiss}>{isEnglish ? "Start practice" : "知道了，开始做题"}</button>
    </section>
  </div>;
}
