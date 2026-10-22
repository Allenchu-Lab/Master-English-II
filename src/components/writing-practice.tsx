"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bookmark, BookMarked, Check, ChevronDown, Clock3, LoaderCircle, Pause, PenLine, Play, RotateCcw, Sparkles, X } from "lucide-react";
import type { WritingChart, WritingTask } from "@/data/get-writing-paper";
import { requestAi } from "@/lib/ai-request";
import { writingBand, type WritingReview } from "@/lib/writing-review";

type Attempt = { id: string; answer: string; elapsed_seconds: number; submitted_at: string | null; review: WritingReview | null };
type LetterDraft = { salutation: string; body: string; closing: string; signature: string };

const emptyLetterDraft: LetterDraft = { salutation: "", body: "", closing: "", signature: "" };

const deductionLabels = {
  task: "任务完成",
  grammar: "语法",
  wording: "表达",
  cohesion: "衔接",
  format: "格式语域",
  length: "字数",
};

function countWords(value: string) {
  return value.trim().match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)?.length ?? 0;
}

function keepEnglishInput(value: string) {
  return value
    .replace(/……/g, "...")
    .replace(/[，、]/g, ",")
    .replace(/。/g, ".")
    .replace(/！/g, "!")
    .replace(/？/g, "?")
    .replace(/；/g, ";")
    .replace(/：/g, ":")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/【/g, "[")
    .replace(/】/g, "]")
    .replace(/　/g, " ")
    .replace(/\p{Script=Han}/gu, "");
}

function isLetterWritingTask(task: WritingTask) {
  return task.part === "A" && /\b(letter|email|reply)\b/i.test(task.prompt);
}

function composeLetterAnswer(draft: LetterDraft) {
  const signoff = [draft.closing.trim(), draft.signature.trim()].filter(Boolean).join("\n");
  return [draft.salutation.trim(), draft.body.trim(), signoff].filter(Boolean).join("\n\n");
}

function parseLetterAnswer(answer: string): LetterDraft {
  const lines = answer.replace(/\r\n/g, "\n").split("\n");
  while (lines[0]?.trim() === "") lines.shift();
  while (lines.at(-1)?.trim() === "") lines.pop();

  const firstLine = lines[0]?.trim() ?? "";
  const hasSalutation = /^(dear\b|hello\b|hi\b|to whom\b)/i.test(firstLine);
  const closingIndex = lines.findLastIndex((line) => /^(yours\b|sincerely\b|best regards\b|kind regards\b|respectfully\b)/i.test(line.trim()));
  const bodyStart = hasSalutation ? 1 : 0;
  const bodyEnd = closingIndex >= bodyStart ? closingIndex : lines.length;

  return {
    salutation: hasSalutation ? firstLine : "",
    body: lines.slice(bodyStart, bodyEnd).join("\n").trim(),
    closing: closingIndex >= bodyStart ? lines[closingIndex].trim() : "",
    signature: closingIndex >= bodyStart ? lines.slice(closingIndex + 1).join("\n").trim() : "",
  };
}

function formatRevisedAnswer(value: string, part: "A" | "B") {
  if (part !== "A") return value;
  return value
    .replace(/^(Dear\s+[^,\n]+,)\s*/i, "$1\n\n")
    .replace(/[ \t]+((?:Yours|Sincerely|Best regards|Kind regards),?)[ \t]+([^\n]+)$/i, "\n\n$1\n$2");
}

function PromptChart({ chart, year }: { chart: WritingChart; year: number }) {
  if (year >= 2010 && year <= 2026) {
    return <figure className={`writing-chart writing-chart-original ${year === 2026 ? "writing-chart-enlarged" : ""}`}><Image src={`/writing/charts/${year}-part-b.png`} alt={chart.title} width={1600} height={1000} loading="eager" /></figure>;
  }

  if (chart.type === "table" && chart.columns && chart.rows) {
    return <figure className="writing-chart writing-chart-table"><figcaption>{chart.title}</figcaption><div><table><thead><tr>{chart.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{chart.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div></figure>;
  }

  if (chart.type === "pie" && chart.items) {
    const total = chart.items.reduce((sum, item) => sum + item.value, 0);
    const colors = ["#16875b", "#69a88d", "#9bc6b3", "#c7ded3", "#dfe9e4"];
    const stops = chart.items.map((item, index) => {
      const start = chart.items?.slice(0, index).reduce((sum, current) => sum + current.value, 0) ?? 0;
      const end = start + item.value;
      return `${colors[index % colors.length]} ${start / total * 100}% ${end / total * 100}%`;
    }).join(", ");
    return <figure className="writing-chart writing-chart-pie"><figcaption>{chart.title}</figcaption><div className="writing-pie"><i style={{ background: `conic-gradient(${stops})` }} /><ul>{chart.items.map((item, index) => <li key={item.label}><b style={{ background: colors[index % colors.length] }} /><span>{item.label}</span><strong>{item.value}{chart.unit}</strong></li>)}</ul></div></figure>;
  }

  if ((chart.type === "grouped" || chart.type === "stacked" || chart.type === "line") && chart.categories && chart.series) {
    const maximum = Math.max(...chart.series.flatMap((series) => series.values), 1);
    if (chart.type === "line") {
      const pointX = (index: number) => 8 + index * 84 / Math.max(chart.categories!.length - 1, 1);
      const pointY = (value: number) => 88 - value / maximum * 70;
      return <figure className="writing-chart writing-chart-line"><figcaption>{chart.title}</figcaption>{chart.series.length > 1 && <div className="writing-chart-legend">{chart.series.map((series, index) => <span key={series.name}><i className={`series-${index}`} />{series.name}</span>)}</div>}<svg viewBox="0 0 100 100" role="img" aria-label={chart.title}><path d="M8 88H94" /><path d="M8 18V88" />{chart.series.map((series, seriesIndex) => <g className={`series-${seriesIndex}`} key={series.name}><polyline points={series.values.map((value, index) => `${pointX(index)},${pointY(value)}`).join(" ")} />{series.values.map((value, index) => <g key={`${series.name}-${chart.categories?.[index]}`}><circle cx={pointX(index)} cy={pointY(value)} r="1.6" /><text className="value" x={pointX(index)} y={pointY(value) - 4}>{value}</text></g>)}</g>)}{chart.categories.map((category, index) => <text key={category} x={pointX(index)} y={95}>{category}</text>)}</svg>{chart.note && <p>{chart.note}</p>}</figure>;
    }
    if (chart.type === "stacked") {
      const maximumTotal = Math.max(...chart.categories.map((_, categoryIndex) => chart.series?.reduce((sum, series) => sum + series.values[categoryIndex], 0) ?? 0), 1);
      return <figure className="writing-chart writing-chart-grouped writing-chart-stacked"><figcaption>{chart.title}</figcaption><div className="writing-chart-legend">{chart.series.map((series, index) => <span key={series.name}><i className={`series-${index}`} />{series.name}</span>)}</div><div className="writing-grouped-bars">{chart.categories.map((category, categoryIndex) => <div key={category}><div>{chart.series?.map((series, seriesIndex) => <i key={series.name} className={`series-${seriesIndex}`} style={{ height: `${series.values[categoryIndex] / maximumTotal * 100}%` }} />)}</div><strong>{category}</strong></div>)}</div><small>{chart.unit}</small></figure>;
    }
    return <figure className="writing-chart writing-chart-grouped"><figcaption>{chart.title}</figcaption><div className="writing-chart-legend">{chart.series.map((series, index) => <span key={series.name}><i className={`series-${index}`} />{series.name}</span>)}</div><div className="writing-grouped-bars">{chart.categories.map((category, categoryIndex) => <div key={category}><div>{chart.series?.map((series, seriesIndex) => <i key={series.name} className={`series-${seriesIndex}`} style={{ height: `${series.values[categoryIndex] / maximum * 100}%` }}>{chart.showValues === false ? null : <span>{series.values[categoryIndex]}</span>}</i>)}</div><strong>{category}</strong></div>)}</div><small>{chart.unit}</small></figure>;
  }

  const items = chart.items ?? [];
  const maximum = Math.max(...items.map((item) => item.value), 1);
  return (
    <figure className="writing-chart">
      <figcaption>{chart.title}</figcaption>
      <div className="writing-chart-bars">
        {items.map((item) => <div key={item.label}>
          <span>{item.label}</span>
          <i><b style={{ width: `${item.value / maximum * 100}%` }} /></i>
          <strong>{item.value.toFixed(1)}{chart.unit}</strong>
        </div>)}
      </div>
    </figure>
  );
}

export function WritingPractice({ tasks, initialLanguage = "zh", initialPart = "A" }: { tasks: WritingTask[]; initialLanguage?: "zh" | "en"; initialPart?: "A" | "B" }) {
  const [activePart, setActivePart] = useState<"A" | "B">(initialPart);
  const [answer, setAnswer] = useState("");
  const [letterDraft, setLetterDraft] = useState<LetterDraft>(emptyLetterDraft);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const rewriteDialog = useRef<HTMLDialogElement>(null);
  const [rewriting, setRewriting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<WritingReview | null>(null);
  const [savedExpressions, setSavedExpressions] = useState<Set<number>>(new Set());
  const [savingExpression, setSavingExpression] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uiLanguage, setUiLanguage] = useState<"zh" | "en">(initialLanguage);
  const hydratedTaskId = useRef<string | null>(null);
  const activeTask = tasks.find((task) => task.part === activePart) ?? tasks[0];
  const isEnglish = uiLanguage === "en";
  const usesLetterFrame = isLetterWritingTask(activeTask);
  const originalLetter = useMemo(() => parseLetterAnswer(answer), [answer]);
  const wordCount = useMemo(() => countWords(answer), [answer]);
  const wordsRemaining = Math.max(activeTask.targetWords - wordCount, 0);
  const showLengthWarning = !attempt?.submitted_at && wordCount > 0 && wordsRemaining > 0;
  const elapsed = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
  const languageHref = (path: string) => isEnglish ? `${path}${path.includes("?") ? "&" : "?"}lang=en` : path;

  const selectPart = (part: "A" | "B") => {
    setActivePart(part);
    const url = new URL(window.location.href);
    if (part === "B") url.searchParams.set("part", "B");
    else url.searchParams.delete("part");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  };

  useEffect(() => {
    const urlLanguage = new URLSearchParams(window.location.search).get("lang");
    if (urlLanguage === "en" || urlLanguage === "zh") {
      window.localStorage.setItem("ui-language", urlLanguage);
      return;
    }
    const savedLanguage = window.localStorage.getItem("ui-language");
    if (savedLanguage !== "en" && savedLanguage !== "zh") return;
    const timer = window.setTimeout(() => setUiLanguage(savedLanguage), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = isEnglish ? "en" : "zh-CN";
  }, [isEnglish]);

  useEffect(() => {
    if (!timerRunning || attempt?.submitted_at) return;
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning, attempt?.submitted_at]);

  const loadAttempt = useCallback(async () => {
    if (!activeTask) return;
    setLoading(true);
    setError(null);
    hydratedTaskId.current = null;
    try {
      const response = await fetch(`/api/writing-attempts/${activeTask.id}`);
      if (!response.ok) throw new Error();
      const data = await response.json() as { attempt: Attempt };
      setAttempt(data.attempt);
      setReview(data.attempt.review);
      if (data.attempt.review) {
        const savedResponse = await fetch(`/api/writing-expressions?attemptId=${data.attempt.id}`);
        const savedData = await savedResponse.json().catch(() => ({})) as { expressions?: { pattern: string }[] };
        const patterns = new Set(savedData.expressions?.map((item) => item.pattern) ?? []);
        setSavedExpressions(new Set(data.attempt.review.expressions.flatMap((item, index) => patterns.has(item.pattern) ? [index] : [])));
      } else {
        setSavedExpressions(new Set());
      }
      setAnswer(data.attempt.answer);
      setLetterDraft(parseLetterAnswer(data.attempt.answer));
      setElapsedSeconds(data.attempt.elapsed_seconds);
      setTimerRunning(false);
      hydratedTaskId.current = activeTask.id;
    } catch {
      setError(isEnglish ? "Could not open this writing task." : "暂时无法打开这道写作题，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, [activeTask, isEnglish]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadAttempt(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAttempt]);

  useEffect(() => {
    if (!activeTask || hydratedTaskId.current !== activeTask.id || attempt?.submitted_at) return;
    const timer = window.setTimeout(async () => {
      setSaving(true);
      try {
        const response = await fetch(`/api/writing-attempts/${activeTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer, elapsedSeconds }),
        });
        if (!response.ok) throw new Error();
      } catch {
        setError(isEnglish ? "Draft not saved. Keep this page open and try again." : "草稿暂未保存，请保持页面打开后重试。");
      } finally {
        setSaving(false);
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [activeTask, answer, attempt?.submitted_at, elapsedSeconds, isEnglish]);

  const runReview = async (taskId: string, attemptId: string) => {
    setReviewing(true);
    const result = await requestAi(`/api/writing-attempts/${taskId}/review`, { attemptId });
    setReviewing(false);
    if (!result.ok || !result.data || typeof result.data !== "object" || !("review" in result.data)) {
      setError(isEnglish ? "Could not review this response. Try again." : "暂时无法完成批改，请重试。");
      return;
    }
    setReview((result.data as { review: WritingReview }).review);
  };

  const submit = async () => {
    if (!activeTask || !answer.trim() || submitting) {
      if (!answer.trim()) setError(isEnglish ? "Write your response before submitting." : "请先写下答案再提交。");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/writing-attempts/${activeTask.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, elapsedSeconds }),
      });
      const data = await response.json().catch(() => ({})) as { attempt?: Attempt; error?: string };
      if (!response.ok || !data.attempt) throw new Error(data.error);
      setAttempt(data.attempt);
      setTimerRunning(false);
      void runReview(activeTask.id, data.attempt.id);
    } catch {
      setError(isEnglish ? "Could not submit this draft. Please try again." : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  const rewrite = async () => {
    if (!activeTask || rewriting) return;
    setRewriting(true);
    setError(null);
    try {
      const response = await fetch(`/api/writing-attempts/${activeTask.id}`, { method: "PUT" });
      const data = await response.json().catch(() => ({})) as { attempt?: Attempt };
      if (!response.ok || !data.attempt) throw new Error();
      setAttempt(data.attempt);
      setReview(null);
      setSavedExpressions(new Set());
      setAnswer("");
      setLetterDraft(emptyLetterDraft);
      setElapsedSeconds(0);
      setTimerRunning(false);
      hydratedTaskId.current = activeTask.id;
    } catch {
      setError(isEnglish ? "Could not start a new draft. Please try again." : "暂时无法开始重写，请稍后重试。");
    } finally {
      setRewriting(false);
    }
  };

  const toggleExpression = async (index: number) => {
    if (!attempt || savingExpression !== null) return;
    const isSaved = savedExpressions.has(index);
    setSavingExpression(index);
    const response = await fetch("/api/writing-expressions", {
      method: isSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId: attempt.id, expressionIndex: index }),
    });
    if (!response.ok) {
      setError(isEnglish ? "Could not update this expression." : "暂时无法更新这条表达，请重试。");
      setSavingExpression(null);
      return;
    }
    setSavedExpressions((current) => {
      const next = new Set(current);
      if (isSaved) next.delete(index);
      else next.add(index);
      return next;
    });
    setSavingExpression(null);
  };

  if (!activeTask) return null;

  return (
    <main className="writing-page">
      <title>{isEnglish ? `ChiTouEN II · ${activeTask.year} Writing` : `吃透英语二 · ${activeTask.year} 写作`}</title>
      <header className="practice-header">
        <Link href={languageHref(`/?type=writing&year=${activeTask.year}`)} className="practice-back" aria-label={isEnglish ? "Back to practice" : "返回刷题"}><ArrowLeft /></Link>
        <nav><PenLine /><Link href={languageHref(`/?type=writing&year=${activeTask.year}`)}>{isEnglish ? "Practice" : "刷题"}</Link><span>/</span><span>{activeTask.year}</span><span>/</span><strong>{isEnglish ? "Writing" : "写作"}</strong></nav>
        <div className="practice-timer-group">
          <button className={`practice-timer ${timerRunning ? "is-running" : ""}`} onClick={() => setTimerRunning((running) => !running)} disabled={Boolean(attempt?.submitted_at)}>
            {timerRunning ? <Pause /> : elapsedSeconds ? <Play /> : <Clock3 />}<span>{elapsed}</span><small>{timerRunning ? (isEnglish ? "Pause" : "暂停") : elapsedSeconds ? (isEnglish ? "Resume" : "继续") : (isEnglish ? "Start" : "开始")}</small>
          </button>
          <button className="timer-reset" onClick={() => { setTimerRunning(false); setElapsedSeconds(0); }} disabled={Boolean(attempt?.submitted_at) || elapsedSeconds === 0} aria-label={isEnglish ? "Reset timer" : "重新计时"}><RotateCcw /></button>
        </div>
        <div className="practice-header-actions">
          {attempt?.submitted_at
            ? <span className="header-submitted"><Check />{isEnglish ? "Completed" : "已完成"}</span>
            : <button className="header-submit" onClick={submit} disabled={loading || submitting || !answer.trim()} aria-busy={submitting}>{submitting && <LoaderCircle className="spin" />}{submitting ? (isEnglish ? "Submitting…" : "正在提交…") : (isEnglish ? "Submit" : "完成写作")}</button>}
        </div>
      </header>

      <div className="writing-layout">
        <section className="writing-prompt-pane">
          <div className="writing-part-tabs" role="tablist" aria-label={isEnglish ? "Writing task" : "写作任务"}>
            {tasks.map((task) => <button key={task.id} role="tab" aria-selected={activePart === task.part} className={activePart === task.part ? "active" : ""} onClick={() => selectPart(task.part)}><strong>Part {task.part}</strong><span>{task.targetWords} {isEnglish ? "words" : "词"} · {task.points} {isEnglish ? "pts" : "分"}</span></button>)}
          </div>
          <article className="writing-prompt">
            <span className="writing-question-number">{activeTask.questionNumber}. Directions</span>
            <p>{activeTask.prompt}</p>
            {activeTask.chart && <PromptChart chart={activeTask.chart} year={activeTask.year} />}
            <small>{isEnglish ? `Source: ${activeTask.year} paper · page ${activeTask.sourcePage}` : `来源：${activeTask.year} 年真题 · 第 ${activeTask.sourcePage} 页`}</small>
          </article>
        </section>

        <section className={`writing-editor-pane ${attempt?.submitted_at ? "has-review" : ""}`}>
          <header>
            <div><span>{isEnglish ? "YOUR RESPONSE" : "你的答案"}</span><strong>{isEnglish ? `Part ${activeTask.part}` : `写作 Part ${activeTask.part}`}</strong></div>
            <div className={wordCount >= activeTask.targetWords ? "is-ready" : ""}><strong>{wordCount}</strong><span>/ {activeTask.targetWords} {isEnglish ? "words" : "词"}</span></div>
          </header>
          <div className="writing-editor">
            {loading ? <div className="writing-editor-loading"><LoaderCircle className="spin" />{isEnglish ? "Opening your draft…" : "正在打开草稿…"}</div> : attempt?.submitted_at ? (
              reviewing ? <div className="writing-review-loading"><LoaderCircle className="is-spinning" /><strong>{isEnglish ? "Reviewing your response" : "正在批改你的作文"}</strong><span>{isEnglish ? "Scoring, locating deductions and extracting reusable expressions…" : "正在评分、定位扣分依据并提炼可迁移表达…"}</span></div>
                : review ? <div className="writing-review">
                  <section className="writing-review-score">
                    <div><span>{isEnglish ? "ESTIMATED SCORE" : "AI 预估分"}</span><strong>{review.score}<small>/ {review.maxScore}</small></strong><em>{isEnglish ? `Band ${writingBand(review.score, review.maxScore)}` : `第 ${writingBand(review.score, review.maxScore)} 档`}</em></div>
                    <div><p>{review.summary}</p><dl><dt>{isEnglish ? "To reach the next band" : "升档最优先修改"}</dt><dd>{review.nextBandGap}</dd></dl></div>
                  </section>
                  <button className="writing-rewrite" onClick={() => rewriteDialog.current?.showModal()} disabled={rewriting}>{rewriting && <LoaderCircle className="spin" />}{isEnglish ? "Write again" : "重新写一遍"}</button>
                  <details className="writing-original-answer">
                    <summary><span>{isEnglish ? "View original response" : "查看本次原文"}</span><ChevronDown aria-hidden="true" /></summary>
                    {usesLetterFrame ? <div className="writing-original-letter">
                      <p className={originalLetter.salutation ? "" : "is-missing"}>{originalLetter.salutation || (isEnglish ? "Salutation not provided" : "未填写称呼")}</p>
                      {originalLetter.body && <p>{originalLetter.body}</p>}
                      {(originalLetter.closing || originalLetter.signature) && <p className="writing-original-signoff">{[originalLetter.closing, originalLetter.signature].filter(Boolean).join("\n")}</p>}
                    </div> : <p>{answer}</p>}
                  </details>
                  <section className="writing-review-section">
                    <header><div><span>01</span><strong>{isEnglish ? "Where points were lost" : "扣分依据"}</strong></div><small>{isEnglish ? "Every deduction is linked to your original response" : "每一处扣分都对应你的原文"}</small></header>
                    <div className="writing-deductions">{review.deductions.map((item, index) => <article key={`${item.original}-${index}`}><div><span>{isEnglish ? item.category : deductionLabels[item.category]}</span><strong>-{item.impact}</strong></div><blockquote>{item.original}</blockquote><p>{item.reason}</p><div className="writing-suggestion"><Check /><span>{item.suggestion}</span></div></article>)}</div>
                  </section>
                  <section className="writing-review-section">
                    <header><div><span>02</span><strong>{isEnglish ? "Higher-scoring revision" : "基于原文的提分版本"}</strong><em className="writing-target-band">{writingBand(review.score, review.maxScore) < 5 ? (isEnglish ? `Target Band ${writingBand(review.score, review.maxScore) + 1}` : `目标第 ${writingBand(review.score, review.maxScore) + 1} 档`) : (isEnglish ? "Band 5 revision" : "第 5 档优化版")}</em></div><small>{isEnglish ? "Your ideas, with only necessary changes" : "保留你的观点，只做必要修改"}</small></header>
                    <div className="writing-revised-answer">{formatRevisedAnswer(review.revisedAnswer, activeTask.part)}</div>
                  </section>
                  <section className="writing-review-section">
                    <header><div><span>03</span><strong>{isEnglish ? "Expressions worth remembering" : "这次值得记住的表达"}</strong></div><div className="writing-review-section-actions"><small>{isEnglish ? "Save patterns you can reuse in other topics" : "保存可迁移到其他主题的写法"}</small><Link href={languageHref("/writing/expressions")}><BookMarked />{isEnglish ? "My expressions" : "我的表达"}</Link></div></header>
                    <div className="writing-expressions">{review.expressions.map((item, index) => <article key={item.pattern}><div><p><del>{item.original}</del><strong>{item.rewrite}</strong></p><button className={savedExpressions.has(index) ? "is-saved" : ""} onClick={() => void toggleExpression(index)} disabled={savingExpression === index}>{savedExpressions.has(index) ? <Check /> : <Bookmark />}{savedExpressions.has(index) ? (isEnglish ? "Saved" : "已保存") : (isEnglish ? "Save" : "保存表达")}</button></div><blockquote>{item.pattern}</blockquote><ul>{item.useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul></article>)}</div>
                  </section>
                </div> : <div className="writing-review-loading"><Sparkles /><strong>{isEnglish ? "Review is not ready" : "批改尚未完成"}</strong><button onClick={() => void runReview(activeTask.id, attempt.id)}>{isEnglish ? "Review again" : "重新批改"}</button></div>
            ) : usesLetterFrame ? <div className="writing-letter-editor">
              <label className="writing-letter-line">
                <span>{isEnglish ? "Salutation" : "称呼"}</span>
                <input value={letterDraft.salutation} onChange={(event) => {
                  const next = { ...letterDraft, salutation: keepEnglishInput(event.target.value) };
                  setLetterDraft(next);
                  setAnswer(composeLetterAnswer(next));
                  setError(null);
                }} placeholder="Dear …," spellCheck="true" inputMode="text" lang="en" autoCapitalize="sentences" />
              </label>
              <label className="writing-letter-body">
                <span>{isEnglish ? "Body" : "正文"}</span>
                <textarea value={letterDraft.body} onChange={(event) => {
                  const next = { ...letterDraft, body: keepEnglishInput(event.target.value) };
                  setLetterDraft(next);
                  setAnswer(composeLetterAnswer(next));
                  setError(null);
                }} placeholder={isEnglish ? "Start writing here…" : "在这里开始写作…"} spellCheck="true" inputMode="text" lang="en" autoCapitalize="sentences" />
              </label>
              <div className="writing-letter-signoff">
                <label className="writing-letter-line">
                  <span>{isEnglish ? "Closing" : "结束语"}</span>
                  <input value={letterDraft.closing} onChange={(event) => {
                    const next = { ...letterDraft, closing: keepEnglishInput(event.target.value) };
                    setLetterDraft(next);
                    setAnswer(composeLetterAnswer(next));
                    setError(null);
                  }} placeholder="Yours sincerely," spellCheck="true" inputMode="text" lang="en" autoCapitalize="sentences" />
                </label>
                <label className="writing-letter-line">
                  <span>{isEnglish ? "Signature" : "署名"}</span>
                  <input value={letterDraft.signature} onChange={(event) => {
                    const next = { ...letterDraft, signature: keepEnglishInput(event.target.value) };
                    setLetterDraft(next);
                    setAnswer(composeLetterAnswer(next));
                    setError(null);
                  }} placeholder="Your name" spellCheck="true" inputMode="text" lang="en" autoCapitalize="words" />
                </label>
              </div>
            </div> : <textarea value={answer} onChange={(event) => {
              const next = keepEnglishInput(event.target.value);
              setAnswer(next);
              setError(null);
            }} placeholder={isEnglish ? "Start writing here…" : "在这里开始写作…"} spellCheck="true" inputMode="text" lang="en" autoCapitalize="sentences" aria-label={isEnglish ? "Writing response" : "写作答案"} />}
          </div>
          <footer>
            <span aria-live="polite" className={error ? "has-error" : showLengthWarning ? "has-warning" : ""}>{error ?? (attempt?.submitted_at ? (isEnglish ? "AI estimate for practice only" : "AI 评分仅供练习参考") : saving ? (isEnglish ? "Saving…" : "正在保存…") : showLengthWarning ? (isEnglish ? `${wordsRemaining} words below the suggested length. A shorter response may lower your score.` : `距离建议字数还差 ${wordsRemaining} 词，字数不足可能影响得分。`) : (isEnglish ? "Draft saved automatically" : "草稿已自动保存"))}</span>
          </footer>
        </section>
      </div>
    <dialog ref={rewriteDialog} className="translation-redo-dialog" aria-labelledby="writing-redo-title" aria-describedby="writing-redo-description">
      <button className="translation-dialog-close" aria-label={isEnglish ? "Close" : "关闭"} onClick={() => rewriteDialog.current?.close()}><X size={20} /></button>
      <h2 id="writing-redo-title">{isEnglish ? "Write again?" : "重新写这篇作文？"}</h2>
      <p id="writing-redo-description">{isEnglish ? "You will start with a blank response. Your submitted writing and review will be kept." : "将开始一份空白作答，已提交的作文与批阅结果会保留。"}</p>
      <div className="translation-dialog-actions">
        <button autoFocus onClick={() => rewriteDialog.current?.close()}>{isEnglish ? "Keep reviewing" : "继续复盘"}</button>
        <button className="translation-primary" onClick={() => { rewriteDialog.current?.close(); void rewrite(); }}>{isEnglish ? "Write again" : "重新写一遍"}</button>
      </div>
    </dialog>
    </main>
  );
}
