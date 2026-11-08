"use client";
import { ReviewScore } from "@/components/ui/review-score";
import { ReviewOriginal } from "@/components/ui/review-original";
import { DraftStatus } from "@/components/ui/draft-status";
import { PracticeActionBar } from "@/components/ui/practice-action-bar";
import { ReviewProgress } from "@/components/ui/review-progress";
import { CompletionBadge } from "@/components/ui/completion-badge";
import chartDimensions from "@/data/writing-chart-dimensions.json";
import { Tabs } from "@heroui/react/tabs";
import { useRedoRequest } from "@/components/ui/use-redo-request";
import { PracticeBadge } from "@/components/ui/practice-badge";

import { Input } from "@heroui/react/input";
import { TextArea } from "@heroui/react/textarea";

import { PracticeDialog, PracticeDialogTitle, type PracticeDialogHandle } from "@/components/ui/practice-dialog";

import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bookmark, BookMarked, Check, Clock3, LoaderCircle, Pause, PenLine, Play, RotateCcw, Sparkles, X } from "lucide-react";
import type { WritingChart, WritingTask } from "@/data/get-writing-paper";
import { requestReview } from "@/lib/request-review";
import type { ReviewStage } from "@/lib/review-stream";
import { writingBand, type WritingReview } from "@/lib/writing-review";
import { DraftSaveError } from "@/lib/draft-save";
import { useDraftAutosave, useMutationQueue, useUnsavedGuard } from "@/components/ui/use-draft-autosave";
import { useUiLanguage } from "@/components/ui/use-ui-language";
import { composeLetterAnswer, emptyLetterDraft, parseLetterAnswer, type LetterDraft } from "@/lib/letter-answer";

type Attempt = { id: string; answer: string; elapsed_seconds: number; submitted_at: string | null; review: WritingReview | null };

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

function formatRevisedAnswer(value: string, part: "A" | "B") {
  if (part !== "A") return value;
  return value
    .replace(/^(Dear\s+[^,\n]+,)\s*/i, "$1\n\n")
    .replace(/[ \t]+((?:Yours|Sincerely|Best regards|Kind regards),?)[ \t]+([^\n]+)$/i, "\n\n$1\n$2");
}

function PromptChart({ chart, year }: { chart: WritingChart; year: number }) {
  if (year >= 2010 && year <= 2026) {
    // Reserve each scan's intrinsic aspect ratio before loading; CSS still controls display width.
    const dimensions = chartDimensions[String(year) as keyof typeof chartDimensions];
    // eslint-disable-next-line @next/next/no-img-element
    return <figure className="writing-chart writing-chart-original"><img src={`/writing/charts/${year}-part-b.png`} alt={chart.title} width={dimensions.width} height={dimensions.height} loading="eager" /></figure>;
  }

  if (chart.type === "table" && chart.columns && chart.rows) {
    return <figure className="writing-chart writing-chart-table"><figcaption>{chart.title}</figcaption><div><table><thead><tr>{chart.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{chart.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div></figure>;
  }

  if (chart.type === "pie" && chart.items) {
    const total = chart.items.reduce((sum, item) => sum + item.value, 0);
    const colors = ["var(--chart-series-1)", "var(--chart-series-2)", "var(--chart-series-3)", "var(--chart-series-4)", "var(--chart-series-5)"];
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
  const router = useRouter();
  const saveQueue = useMutationQueue();
  const navigationLock = useRef(false);
  const [navigating, setNavigating] = useState(false);
  const [savedDraft, setSavedDraft] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activePart, setActivePart] = useState<"A" | "B">(initialPart);
  const [answer, setAnswer] = useState("");
  const [letterDraft, setLetterDraft] = useState<LetterDraft>(emptyLetterDraft);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const rewriteDialog = useRef<PracticeDialogHandle>(null);
  const [rewriting, setRewriting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const reviewSequence = useRef(0);
  useEffect(() => () => { reviewSequence.current++; }, []);
  const [reviewStage, setReviewStage] = useState<ReviewStage>(0);
  const [review, setReview] = useState<WritingReview | null>(null);
  const [savedExpressions, setSavedExpressions] = useState<Set<number>>(new Set());
  const [savingExpression, setSavingExpression] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isEnglish } = useUiLanguage(initialLanguage);
  const [hydratedTaskId, setHydratedTaskId] = useState<string | null>(null);
  const activeTask = tasks.find((task) => task.part === activePart) ?? tasks[0];
  const usesLetterFrame = isLetterWritingTask(activeTask);
  const originalLetter = useMemo(() => parseLetterAnswer(answer), [answer]);
  const wordCount = useMemo(() => countWords(answer), [answer]);
  const wordsRemaining = Math.max(activeTask.targetWords - wordCount, 0);
  const showLengthWarning = !attempt?.submitted_at && wordCount > 0 && wordsRemaining > 0;
  const elapsed = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
  const languageHref = (path: string) => isEnglish ? `${path}${path.includes("?") ? "&" : "?"}lang=en` : path;

  useRedoRequest(!loading && Boolean(attempt?.submitted_at), () => rewriteDialog.current?.showModal());
  const snapshot = answer;
  const dirty = !loading && hydratedTaskId === activeTask?.id && !attempt?.submitted_at && savedDraft !== snapshot;
  const saveDraft = useCallback(() => {
    const operation = saveQueue.enqueue(async () => {
      setSaving(true);
      try {
        const response = await fetch(`/api/writing-attempts/${activeTask.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer, elapsedSeconds }),
        });
        if (!response.ok) throw new DraftSaveError(response.status);
        setSavedDraft(answer);
        setSaveError(null);
      } catch (error) {
        setSaveError(isEnglish ? "Draft not saved. Try again before leaving." : "草稿保存失败，请重试后再离开。");
        throw error;
      } finally { setSaving(false); }
    });
    return operation;
  }, [activeTask, answer, elapsedSeconds, isEnglish, saveQueue]);

  const navigate = async (target: "A" | "B" | string) => {
    if (navigationLock.current || loading || submitting || rewriting) return;
    if (target === activePart) return;
    navigationLock.current = true;
    setNavigating(true);
    try {
      await saveQueue.drain();
      if (dirty) await saveDraft();
      if (target === "A" || target === "B") {
        setHydratedTaskId(null);
        setLoading(true);
        setActivePart(target);
        const url = new URL(window.location.href);
        if (target === "B") url.searchParams.set("part", "B");
        else url.searchParams.delete("part");
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      } else router.push(target);
    } catch { /* Keep the unsaved response on screen. */ }
    finally { navigationLock.current = false; setNavigating(false); }
  };

  useUnsavedGuard(dirty);

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
    reviewSequence.current++;
    setReviewing(false);
    setLoading(true);
    setError(null);
    setHydratedTaskId(null);
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
      setSavedDraft(data.attempt.answer);
      setSaveError(null);
      setLetterDraft(parseLetterAnswer(data.attempt.answer));
      setElapsedSeconds(data.attempt.elapsed_seconds);
      setTimerRunning(false);
      setHydratedTaskId(activeTask.id);
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

  useDraftAutosave({
    enabled: dirty && !navigating && !submitting && !rewriting,
    snapshot,
    save: saveDraft,
    blocked: () => navigationLock.current,
    delayMs: 500,
    onError: () => {}, // saveDraft supplies the translated failure message.
  });

  const runReview = async (taskId: string, attemptId: string) => {
    const sequence = ++reviewSequence.current;
    setReviewStage(0);
    setReviewing(true);
    setError(null);
    const result = await requestReview(`/api/writing-attempts/${taskId}/review`, attemptId, stage => {
      if (reviewSequence.current === sequence) setReviewStage(stage);
    });
    if (reviewSequence.current !== sequence) return;
    setReviewing(false);
    if (!result.ok || !result.data || typeof result.data !== "object" || !("review" in result.data)) {
      const message = result.data && typeof result.data === "object" && "error" in result.data && typeof result.data.error === "string" ? result.data.error : null;
      setError(message ?? (isEnglish ? "Could not review this response. Try again." : "暂时无法完成批改，请重试。"));
      return;
    }
    setReview((result.data as { review: WritingReview }).review);
  };

  const submit = async () => {
    if (!activeTask || !answer.trim() || submitting || navigationLock.current) {
      if (!answer.trim()) setError(isEnglish ? "Write your response before submitting." : "请先写下答案再提交。");
      return;
    }
    navigationLock.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await saveQueue.drain();
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
      navigationLock.current = false;
      setSubmitting(false);
    }
  };

  const rewrite = async () => {
    if (!activeTask || rewriting || reviewing || navigationLock.current) return;
    navigationLock.current = true;
    setRewriting(true);
    setError(null);
    try {
      await saveQueue.drain();
      const response = await fetch(`/api/writing-attempts/${activeTask.id}`, { method: "PUT" });
      const data = await response.json().catch(() => ({})) as { attempt?: Attempt };
      if (!response.ok || !data.attempt) throw new Error();
      setAttempt(data.attempt);
      setReview(null);
      setSavedExpressions(new Set());
      setAnswer("");
      setSavedDraft("");
      setLetterDraft(emptyLetterDraft);
      setElapsedSeconds(0);
      setTimerRunning(false);
      setHydratedTaskId(activeTask.id);
    } catch {
      setError(isEnglish ? "Could not start a new draft. Please try again." : "暂时无法开始重写，请稍后重试。");
    } finally {
      navigationLock.current = false;
      setRewriting(false);
    }
  };

  const toggleExpression = async (index: number) => {
    if (!attempt || savingExpression !== null) return;
    const isSaved = savedExpressions.has(index);
    setSavingExpression(index);
    try {
      const response = await fetch("/api/writing-expressions", {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.id, expressionIndex: index }),
      });
      if (!response.ok) throw new Error();
      setSavedExpressions((current) => {
        const next = new Set(current);
        if (isSaved) next.delete(index);
        else next.add(index);
        return next;
      });
    } catch {
      setError(isEnglish ? "Could not update this expression." : "暂时无法更新这条表达，请重试。");
    } finally { setSavingExpression(null); }
  };

  if (!activeTask) return null;

  return (
    <main className="writing-page">
      <title>{isEnglish ? `ChiTouEN II · ${activeTask.year} Writing` : `吃透英语二 · ${activeTask.year} 写作`}</title>
      <header className="practice-header">
        <Link href={languageHref(`/?type=writing&year=${activeTask.year}`)} className="practice-back" aria-label={isEnglish ? "Back to practice" : "返回刷题"} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); void navigate(event.currentTarget.href); } }}><ArrowLeft /></Link>
        <nav><PenLine /><Link href={languageHref(`/?type=writing&year=${activeTask.year}`)} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); void navigate(event.currentTarget.href); } }}>{isEnglish ? "Practice" : "刷题"}</Link><span>/</span><span>{activeTask.year}</span><span>/</span><strong>{isEnglish ? "Writing" : "写作"}</strong></nav>
        <div className="practice-timer-group">
          <Button className={`practice-timer ${timerRunning ? "is-running" : ""}`} onClick={() => setTimerRunning((running) => !running)} disabled={Boolean(attempt?.submitted_at)}>
            {timerRunning ? <Pause /> : elapsedSeconds ? <Play /> : <Clock3 />}<span>{elapsed}</span><small>{timerRunning ? (isEnglish ? "Pause" : "暂停") : elapsedSeconds ? (isEnglish ? "Resume" : "继续") : (isEnglish ? "Start" : "开始")}</small>
          </Button>
          <Button className="timer-reset" onClick={() => { setTimerRunning(false); setElapsedSeconds(0); }} disabled={Boolean(attempt?.submitted_at) || elapsedSeconds === 0} aria-label={isEnglish ? "Reset timer" : "重新计时"}><RotateCcw /></Button>
        </div>
        <div className="practice-header-actions">
          {attempt?.submitted_at
            ? <CompletionBadge>{isEnglish ? "Completed" : "已完成"}</CompletionBadge>
            : <Button variant="primary" className="header-submit" disabled={loading || submitting || navigating || !answer.trim()} aria-busy={submitting} onClick={() => void submit()}>{submitting ? (isEnglish ? "Submitting…" : "正在提交…") : (isEnglish ? "Submit" : "提交作答")}</Button>}
        </div>
      </header>

      <Tabs variant="primary" className="writing-layout" selectedKey={activePart} onSelectionChange={key => { if (key === "A" || key === "B") void navigate(key); }}>
        <section className="writing-prompt-pane">
          <Tabs.ListContainer className="writing-task-tabs"><Tabs.List aria-label={isEnglish ? "Writing task" : "写作任务"}>{tasks.map(task => <Tabs.Tab key={task.id} id={task.part} isDisabled={loading || navigating || submitting || rewriting}>Part {task.part}<Tabs.Indicator /></Tabs.Tab>)}</Tabs.List></Tabs.ListContainer>
          <Tabs.Panel id={activePart} className="writing-task-panel"><article className="writing-prompt">
            <span className="writing-question-number">{activeTask.questionNumber}. Directions</span>
            <p>{activeTask.prompt}</p>
            {activeTask.chart && <PromptChart chart={activeTask.chart} year={activeTask.year} />}
            <small>{isEnglish ? `Source: ${activeTask.year} paper · page ${activeTask.sourcePage}` : `来源：${activeTask.year} 年真题 · 第 ${activeTask.sourcePage} 页`}</small>
          </article></Tabs.Panel>
        </section>

        <section className={`writing-editor-pane ${attempt?.submitted_at ? "has-review" : ""}`}>
          {!attempt?.submitted_at && <>
          <header>
            <div><strong>{isEnglish ? "Review & reflection" : "批阅和复盘"}</strong></div>
            <div className={wordCount >= activeTask.targetWords ? "is-ready" : ""}><strong>{wordCount}</strong><span>/ {activeTask.targetWords} {isEnglish ? "words" : "词"}</span></div>
          </header>
          </>}
          <div className="writing-editor">
            {attempt?.submitted_at && <h2 className="review-page-title">{isEnglish ? "Review & reflection" : "批阅和复盘"}</h2>}
            {loading ? <div className="writing-editor-loading"><LoaderCircle className="spin" />{isEnglish ? "Opening your draft…" : "正在打开草稿…"}</div> : attempt?.submitted_at ? (
              reviewing ? <ReviewProgress english={isEnglish} kind="writing" stage={reviewStage} />
                : review ? <div className="writing-review">
                  <ReviewScore score={review.score} total={review.maxScore} band={writingBand(review.score, review.maxScore)} english={isEnglish} summary={review.summary} nextBandGap={review.nextBandGap} />
                  <ReviewOriginal label={isEnglish ? "My response" : "我的作答"}>
                    {usesLetterFrame ? <div className="writing-original-letter">
                      <p className={originalLetter.salutation ? "" : "is-missing"}>{originalLetter.salutation || (isEnglish ? "Salutation not provided" : "未填写称呼")}</p>
                      {originalLetter.body && <p>{originalLetter.body}</p>}
                      {(originalLetter.closing || originalLetter.signature) && <p className="writing-original-signoff">{[originalLetter.closing, originalLetter.signature].filter(Boolean).join("\n")}</p>}
                    </div> : <p>{answer}</p>}
                  </ReviewOriginal>
                  <section className="writing-review-section">
                    <header><div><span>01</span><strong>{isEnglish ? "Where points were lost" : "扣分依据"}</strong></div><small>{isEnglish ? "Every deduction is linked to your original response" : "每一处扣分都对应你的原文"}</small></header>
                    <div className="writing-deductions">{review.deductions.length === 0 && <p className="analysis-empty-note">{isEnglish ? "No clear deductions were identified in this response." : "本次作答未发现明确扣分项。"}</p>}{review.deductions.map((item, index) => <article key={`${item.original}-${index}`}><div><PracticeBadge>{isEnglish ? item.category : deductionLabels[item.category]}</PracticeBadge><strong>-{item.impact}</strong></div><blockquote>{item.original}</blockquote><p>{item.reason}</p><div className="writing-suggestion"><Check /><span>{item.suggestion}</span></div></article>)}</div>
                  </section>
                  <section className="writing-review-section">
                    <header><div><span>02</span><strong>{isEnglish ? "Higher-scoring revision" : "基于原文的提分版本"}</strong><PracticeBadge className="writing-target-band">{writingBand(review.score, review.maxScore) < 5 ? (isEnglish ? `Band ${writingBand(review.score, review.maxScore) + 1}` : `第 ${writingBand(review.score, review.maxScore) + 1} 档`) : (isEnglish ? "Band 5" : "第 5 档")}</PracticeBadge></div><small>{isEnglish ? "Your ideas, with only necessary changes" : "保留你的观点，只做必要修改"}</small></header>
                    <div className="writing-revised-answer">{formatRevisedAnswer(review.revisedAnswer, activeTask.part)}</div>
                  </section>
                  <section className="writing-review-section">
                    <header><div><span>03</span><strong>{isEnglish ? "Expressions worth remembering" : "这次值得记住的表达"}</strong></div><div className="writing-review-section-actions"><small>{isEnglish ? "Save patterns you can reuse in other topics" : "保存可迁移到其他主题的写法"}</small><Link href={languageHref("/writing/expressions")}><BookMarked />{isEnglish ? "My expressions" : "我的表达"}</Link></div></header>
                    <div className="writing-expressions">{review.expressions.length === 0 && <p className="analysis-empty-note">{isEnglish ? "No additional expressions were extracted from this response." : "本次未提取到额外的可迁移表达。"}</p>}{review.expressions.map((item, index) => <article key={item.pattern}><div><p><del>{item.original}</del><strong>{item.rewrite}</strong></p><Button className={savedExpressions.has(index) ? "is-saved" : ""} onClick={() => void toggleExpression(index)} disabled={savingExpression === index}>{savedExpressions.has(index) ? <Check /> : <Bookmark />}{savedExpressions.has(index) ? (isEnglish ? "Saved" : "已保存") : (isEnglish ? "Save" : "保存表达")}</Button></div><blockquote>{item.pattern}</blockquote><ul>{item.useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul></article>)}</div>
                  </section>
                </div> : <div className="writing-review-loading"><Sparkles /><strong>{isEnglish ? "Review is not ready" : "批改尚未完成"}</strong><Button onClick={() => void runReview(activeTask.id, attempt.id)}>{isEnglish ? "Review again" : "重新批改"}</Button></div>
            ) : usesLetterFrame ? <div className="writing-letter-editor">
              <label className="writing-letter-line">
                <span>{isEnglish ? "Salutation" : "称呼"}</span>
                <Input disabled={navigating || submitting} value={letterDraft.salutation} onChange={(event) => {
                  const next = { ...letterDraft, salutation: keepEnglishInput(event.target.value) };
                  setLetterDraft(next);
                  setAnswer(composeLetterAnswer(next));
                  setError(null);
                }} placeholder="Dear …," spellCheck="true" inputMode="text" lang="en" autoCapitalize="sentences" />
              </label>
              <label className="writing-letter-body">
                <span>{isEnglish ? "Body" : "正文"}</span>
                <TextArea disabled={navigating || submitting} value={letterDraft.body} onChange={(event) => {
                  const next = { ...letterDraft, body: keepEnglishInput(event.target.value) };
                  setLetterDraft(next);
                  setAnswer(composeLetterAnswer(next));
                  setError(null);
                }} placeholder={isEnglish ? "Start writing here…" : "在这里开始写作…"} spellCheck="true" inputMode="text" lang="en" autoCapitalize="sentences" />
              </label>
              <div className="writing-letter-signoff">
                <label className="writing-letter-line">
                  <span>{isEnglish ? "Closing" : "结束语"}</span>
                  <Input disabled={navigating || submitting} value={letterDraft.closing} onChange={(event) => {
                    const next = { ...letterDraft, closing: keepEnglishInput(event.target.value) };
                    setLetterDraft(next);
                    setAnswer(composeLetterAnswer(next));
                    setError(null);
                  }} placeholder="Yours sincerely," spellCheck="true" inputMode="text" lang="en" autoCapitalize="sentences" />
                </label>
                <label className="writing-letter-line">
                  <span>{isEnglish ? "Signature" : "署名"}</span>
                  <Input disabled={navigating || submitting} value={letterDraft.signature} onChange={(event) => {
                    const next = { ...letterDraft, signature: keepEnglishInput(event.target.value) };
                    setLetterDraft(next);
                    setAnswer(composeLetterAnswer(next));
                    setError(null);
                  }} placeholder="Your name" spellCheck="true" inputMode="text" lang="en" autoCapitalize="words" />
                </label>
              </div>
            </div> : <TextArea disabled={navigating || submitting} value={answer} onChange={(event) => {
              const next = keepEnglishInput(event.target.value);
              setAnswer(next);
              setError(null);
            }} placeholder={isEnglish ? "Start writing here…" : "在这里开始写作…"} spellCheck="true" inputMode="text" lang="en" autoCapitalize="sentences" aria-label={isEnglish ? "Writing response" : "写作答案"} />}
            {!attempt?.submitted_at && <DraftStatus tone={error || saveError ? "error" : showLengthWarning ? "warning" : "default"}>{error ?? saveError ?? (saving || dirty ? (isEnglish ? "Saving…" : "正在保存…") : showLengthWarning ? (isEnglish ? `${wordsRemaining} words below the suggested length. A shorter response may lower your score.` : `距离建议字数还差 ${wordsRemaining} 词，字数不足可能影响得分。`) : (isEnglish ? "Draft saved automatically" : "草稿自动保存"))}</DraftStatus>}
          </div>
          {attempt?.submitted_at ? <PracticeActionBar tone={error ? "error" : "default"} summary={error ?? (review ? <strong>{review.score} / {review.maxScore}</strong> : (isEnglish ? "Submitted" : "已提交"))} actions={[
            { id: "home", label: isEnglish ? "Back to library" : "返回首页", variant: "secondary", href: languageHref(`/?type=writing&year=${activeTask.year}`) },
            { id: "redo", label: isEnglish ? "Redo" : "重新练习", variant: "primary", disabled: rewriting || navigating, onPress: () => rewriteDialog.current?.showModal() },
          ]} /> : null}
        </section>
      </Tabs>
    <PracticeDialog ref={rewriteDialog} className="translation-redo-dialog" aria-labelledby="writing-redo-title" aria-describedby="writing-redo-description">
      <Button className="translation-dialog-close" aria-label={isEnglish ? "Close" : "关闭"} onClick={() => rewriteDialog.current?.close()}><X data-icon-size="20" /></Button>
      <PracticeDialogTitle id="writing-redo-title">{isEnglish ? "Write again?" : "重新写这篇作文？"}</PracticeDialogTitle>
      <p id="writing-redo-description">{isEnglish ? "You will start with a blank response. Your submitted writing and review will be kept." : "将开始一份空白作答，已提交的作文与批阅结果会保留。"}</p>
      <div className="translation-dialog-actions">
        <Button variant="secondary" autoFocus onClick={() => rewriteDialog.current?.close()}>{isEnglish ? "Keep reviewing" : "继续复盘"}</Button>
        <Button variant="primary" className="translation-primary" onClick={() => { rewriteDialog.current?.close(); void rewrite(); }}>{isEnglish ? "Write again" : "重新写一遍"}</Button>
      </div>
    </PracticeDialog>
    </main>
  );
}
