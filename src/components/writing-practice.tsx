"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Clock3, LoaderCircle, Pause, PenLine, Play, RotateCcw } from "lucide-react";
import type { WritingChart, WritingTask } from "@/data/get-writing-paper";

type Attempt = { id: string; answer: string; elapsed_seconds: number; submitted_at: string | null };

function countWords(value: string) {
  return value.trim().match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)?.length ?? 0;
}

function keepEnglishInput(value: string) {
  return value.replace(/[^A-Za-z0-9\s.,!?;:'"()[\]{}<>/@#$%&*+=_\-–—…]/g, "");
}

function PromptChart({ chart, year }: { chart: WritingChart; year: number }) {
  if (year >= 2010 && year <= 2026) {
    return <figure className="writing-chart writing-chart-original"><Image src={`/writing/charts/${year}-part-b.png`} alt={chart.title} width={1600} height={1000} /></figure>;
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
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uiLanguage, setUiLanguage] = useState<"zh" | "en">(initialLanguage);
  const hydratedTaskId = useRef<string | null>(null);
  const activeTask = tasks.find((task) => task.part === activePart) ?? tasks[0];
  const isEnglish = uiLanguage === "en";
  const wordCount = useMemo(() => countWords(answer), [answer]);
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
      setAnswer(data.attempt.answer);
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
    } catch {
      setError(isEnglish ? "Could not submit this draft. Please try again." : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeTask) return null;

  return (
    <main className="writing-page">
      <title>{isEnglish ? `ChiTouEN II · ${activeTask.year} Writing` : `吃透英语二 · ${activeTask.year} 写作`}</title>
      <header className="practice-header">
        <Link href={languageHref("/?type=writing")} className="practice-back" aria-label={isEnglish ? "Back to practice" : "返回刷题"}><ArrowLeft /></Link>
        <nav><PenLine /><Link href={languageHref("/?type=writing")}>{isEnglish ? "Practice" : "刷题"}</Link><span>/</span><span>{activeTask.year}</span><span>/</span><strong>{isEnglish ? "Writing" : "写作"}</strong></nav>
        <div className="practice-timer-group">
          <button className={`practice-timer ${timerRunning ? "is-running" : ""}`} onClick={() => setTimerRunning((running) => !running)} disabled={Boolean(attempt?.submitted_at)}>
            {timerRunning ? <Pause /> : elapsedSeconds ? <Play /> : <Clock3 />}<span>{elapsed}</span><small>{timerRunning ? (isEnglish ? "Pause" : "暂停") : elapsedSeconds ? (isEnglish ? "Resume" : "继续") : (isEnglish ? "Start" : "开始")}</small>
          </button>
          <button className="timer-reset" onClick={() => { setTimerRunning(false); setElapsedSeconds(0); }} disabled={Boolean(attempt?.submitted_at) || elapsedSeconds === 0} aria-label={isEnglish ? "Reset timer" : "重新计时"}><RotateCcw /></button>
        </div>
        <div className="practice-header-actions">
          {attempt?.submitted_at
            ? <span className="header-submitted"><Check />{isEnglish ? "Completed" : "已完成"}</span>
            : <button className="header-submit" onClick={submit} disabled={loading || submitting} aria-busy={submitting}>{submitting && <LoaderCircle className="spin" />}{submitting ? (isEnglish ? "Submitting…" : "正在提交…") : (isEnglish ? "Submit" : "完成写作")}</button>}
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

        <section className="writing-editor-pane">
          <header>
            <div><span>{isEnglish ? "YOUR RESPONSE" : "你的答案"}</span><strong>{isEnglish ? `Part ${activeTask.part}` : `写作 Part ${activeTask.part}`}</strong></div>
            <div className={wordCount >= activeTask.targetWords ? "is-ready" : ""}><strong>{wordCount}</strong><span>/ {activeTask.targetWords} {isEnglish ? "words" : "词"}</span></div>
          </header>
          <div className="writing-editor">
            {loading ? <div className="writing-editor-loading"><LoaderCircle className="spin" />{isEnglish ? "Opening your draft…" : "正在打开草稿…"}</div> : <textarea value={answer} disabled={Boolean(attempt?.submitted_at)} onChange={(event) => {
              const next = keepEnglishInput(event.target.value);
              setAnswer(next);
              setError(null);
            }} placeholder={isEnglish ? "Start writing here…" : "在这里开始写作…"} spellCheck="true" inputMode="text" lang="en" autoCapitalize="sentences" aria-label={isEnglish ? "Writing response" : "写作答案"} />}
          </div>
          <footer>
            <span className={error ? "has-error" : ""}>{error ?? (attempt?.submitted_at ? (isEnglish ? "Submitted. Your response is saved." : "已完成，答案已保存。") : saving ? (isEnglish ? "Saving…" : "正在保存…") : (isEnglish ? "Draft saved automatically" : "草稿已自动保存"))}</span>
          </footer>
        </section>
      </div>
    </main>
  );
}
