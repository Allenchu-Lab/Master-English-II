"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Check, ChevronLeft, ChevronRight, LoaderCircle, LockKeyhole, RotateCcw, Sparkles } from "lucide-react";
import type { PracticePassage } from "@/data/get-practice-passage";
import { SelectableHighlight } from "@/components/selectable-highlight";

type AccessState = "checking" | "allowed" | "denied" | "error";
type ParagraphAnalysis = {
  summary: string;
  translation: string;
  structure: { original: string; explanation: string }[];
  vocabulary: { term: string; meaning: string }[];
  examTip: string;
};

export function IntensiveReader({ passage }: { passage: PracticePassage }) {
  const paragraphs = useMemo(() => passage.paragraphs.length ? passage.paragraphs : [passage.body], [passage.body, passage.paragraphs]);
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [activeParagraph, setActiveParagraph] = useState(0);
  const [analyses, setAnalyses] = useState<Record<number, ParagraphAnalysis>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loadingParagraph, setLoadingParagraph] = useState<number | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [uiLanguage, setUiLanguage] = useState<"zh" | "en">("zh");
  const isEnglish = uiLanguage === "en";

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("ui-language");
    if (savedLanguage !== "en" && savedLanguage !== "zh") return;
    const timer = window.setTimeout(() => setUiLanguage(savedLanguage), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = isEnglish ? `ChiTouEN II · ${passage.year} Text ${passage.number} · Intensive Reading` : `吃透英语二 · ${passage.year} Text ${passage.number} · 精读`;
    document.documentElement.lang = isEnglish ? "en" : "zh-CN";
  }, [isEnglish, passage.number, passage.year]);

  useEffect(() => {
    let cancelled = false;
    async function checkAccess() {
      try {
        const response = await fetch(`/api/attempts/${passage.id}/access`);
        if (!response.ok) throw new Error("Unable to check access");
        const { allowed } = await response.json() as { allowed: boolean };
        if (!cancelled) setAccessState(allowed ? "allowed" : "denied");
      } catch {
        if (!cancelled) setAccessState("error");
      }
    }
    checkAccess();
    return () => { cancelled = true; };
  }, [passage.id]);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const savedAnalyses = window.localStorage.getItem(`intensive-analyses:${passage.id}`);
        const savedNotes = window.localStorage.getItem(`intensive-notes:${passage.id}`);
        if (savedAnalyses) setAnalyses(JSON.parse(savedAnalyses));
        if (savedNotes) setNotes(JSON.parse(savedNotes));
      } catch { /* Ignore invalid local study data. */ }
    }, 0);
    return () => window.clearTimeout(restore);
  }, [passage.id]);

  useEffect(() => {
    window.localStorage.setItem(`intensive-notes:${passage.id}`, JSON.stringify(notes));
  }, [notes, passage.id]);

  const generateAnalysis = async () => {
    setLoadingParagraph(activeParagraph);
    setAnalysisError(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 75_000);
    try {
      const response = await fetch("/api/intensive-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ paragraph: paragraphs[activeParagraph], year: passage.year, text: passage.number, paragraphNumber: activeParagraph + 1 }),
      });
      const result = await response.json() as ParagraphAnalysis & { error?: string };
      if (!response.ok) throw new Error(isEnglish ? "Unable to generate the analysis. Please try again." : (result.error ?? "生成失败，请稍后重试。"));
      const next = { ...analyses, [activeParagraph]: result };
      setAnalyses(next);
      window.localStorage.setItem(`intensive-analyses:${passage.id}`, JSON.stringify(next));
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === "AbortError";
      setAnalysisError(timedOut
        ? (isEnglish ? "The analysis is taking too long. Please try again." : "AI 服务响应超时，请稍后重试。")
        : error instanceof Error ? error.message : (isEnglish ? "Unable to generate the analysis. Please try again." : "生成失败，请稍后重试。"));
    } finally {
      window.clearTimeout(timeout);
      setLoadingParagraph(null);
    }
  };

  if (accessState !== "allowed") {
    return <main className="intensive-gate">
      <div>{accessState === "checking" ? <LoaderCircle className="is-spinning" /> : <LockKeyhole />}</div>
      <h1>{accessState === "checking" ? (isEnglish ? "Checking your progress" : "正在确认学习进度") : accessState === "denied" ? (isEnglish ? "Submit your answers to unlock intensive reading" : "完成作答后解锁精读") : (isEnglish ? "Unable to check your progress" : "暂时无法确认学习进度")}</h1>
      <p>{accessState === "checking" ? (isEnglish ? "Please wait…" : "请稍候……") : accessState === "denied" ? (isEnglish ? "Intensive reading begins after submission. Complete this passage first, then return to study it paragraph by paragraph." : "精读属于提交后的学习阶段。先独立完成并提交这篇文章，再回来逐段吃透。") : (isEnglish ? "Check your connection and try again, or return to the library." : "请检查网络连接后重试，或先返回首页。")}</p>
      {accessState !== "checking" && <div className="intensive-gate-actions"><Link href={`/practice/${passage.year}/${passage.number}`}>{accessState === "denied" ? (isEnglish ? "Complete practice" : "去完成作答") : (isEnglish ? "Try again" : "重试进入")}</Link><Link href="/" className="secondary">{isEnglish ? "Back to library" : "返回首页"}</Link></div>}
    </main>;
  }

  const analysis = analyses[activeParagraph];
  const completedCount = Object.keys(analyses).length;
  const highlightStorageKey = `reading-highlights:${passage.id}`;

  return <main className="intensive-page">
    <header className="intensive-header">
      <Link href="/" className="practice-back" aria-label={isEnglish ? "Back to library" : "返回首页"}><ArrowLeft /></Link>
      <nav><BookOpen /><Link href="/">{isEnglish ? "Practice" : "刷题"}</Link><span>/</span><span>{isEnglish ? `${passage.year} Paper` : `${passage.year} 年`}</span><span>/</span><strong>Text {passage.number} {isEnglish ? "Intensive Reading" : "精读"}</strong></nav>
      <Link className="intensive-review-link" href={`/practice/${passage.year}/${passage.number}`}><RotateCcw />{isEnglish ? "Review answers" : "回看作答"}</Link>
    </header>

    <div className="intensive-layout">
      <article className="intensive-paper">
        <header><span>{passage.year} · TEXT {passage.number}</span><h1>{isEnglish ? "Paragraph Study" : "逐段精读"}</h1><p>{isEnglish ? "Click an unfamiliar word for its meaning. Select a paragraph to study it." : "点击不认识的单词查看释义，选择段落进行精读。"}</p></header>
        <nav className="intensive-mobile-index" aria-label={isEnglish ? "Select a paragraph" : "选择精读段落"}>{paragraphs.map((_, index) => <button key={index} className={activeParagraph === index ? "active" : ""} onClick={() => { setActiveParagraph(index); setAnalysisError(null); }}>{index + 1}{analyses[index] && <Check />}</button>)}</nav>
        {paragraphs.map((paragraph, index) => <div key={index} className={`intensive-paragraph ${activeParagraph === index ? "active" : ""}`} onClick={() => { setActiveParagraph(index); setAnalysisError(null); }}>
          <button type="button" className="intensive-paragraph-number" onClick={(event) => { event.stopPropagation(); setActiveParagraph(index); setAnalysisError(null); }} aria-label={isEnglish ? `Select paragraph ${index + 1}` : `选择第 ${index + 1} 段`}>{String(index + 1).padStart(2, "0")}</button>
          <SelectableHighlight text={paragraph} scope={`passage:${index}`} storageKey={highlightStorageKey} isEnglish={isEnglish} mode="lookup" />
          {analyses[index] && <Check className="intensive-paragraph-check" />}
        </div>)}
      </article>

      <aside className="intensive-insight">
        <div className="intensive-insight-head"><strong>{isEnglish ? "Paragraph analysis" : "段落解析"}</strong><i><b style={{ width: `${completedCount / paragraphs.length * 100}%` }} /></i><span>{isEnglish ? `${completedCount} / ${paragraphs.length} analyzed` : `${completedCount} / ${paragraphs.length} 已解析`}</span></div>

        {!analysis ? <section className="analysis-empty">
          <span className="analysis-step">STEP 1</span>
          <h3>{isEnglish ? "Write down your understanding" : "先写下你的理解"}</h3>
          <p>{isEnglish ? "Do not view the analysis yet. Summarize the paragraph in your own words, then let AI help you find gaps." : "暂时不要看解析。用自己的话概括这段，再让 AI 帮你找偏差。"}</p>
          <label><span>{isEnglish ? "My summary" : "我的段意"}</span><textarea value={notes[activeParagraph] ?? ""} onChange={(event) => setNotes({ ...notes, [activeParagraph]: event.target.value })} placeholder={isEnglish ? "Think first, then summarize the paragraph in your own words…" : "先独立思考，再用自己的话概括这一段……"} /></label>
          <button onClick={generateAnalysis} disabled={loadingParagraph === activeParagraph}>{loadingParagraph === activeParagraph ? <><LoaderCircle className="is-spinning" />{isEnglish ? "Analyzing paragraph" : "正在解析本段"}</> : <><Sparkles />{isEnglish ? "Analyze paragraph" : "段落解析"}</>}</button>
          {analysisError && <p className="analysis-error">{analysisError}</p>}
        </section> : <div className="analysis-content">
          <section className="understanding-compare">
            <div className="understanding-mine"><span>{isEnglish ? "My summary" : "我的段意"}</span><textarea value={notes[activeParagraph] ?? ""} onChange={(event) => setNotes({ ...notes, [activeParagraph]: event.target.value })} placeholder={isEnglish ? "Think first, then summarize the paragraph in your own words…" : "先独立思考，再用自己的话概括这一段……"} /></div>
            <div className="understanding-ai"><span><Sparkles />{isEnglish ? "AI summary" : "AI 段意"}</span><p>{analysis.summary}</p></div>
          </section>
          <section className="analysis-card"><div className="analysis-card-title"><span>01</span><h3>{isEnglish ? "Reference translation" : "参考译文"}</h3></div><p>{analysis.translation}</p></section>
          {!!analysis.structure.length && <section className="analysis-card"><div className="analysis-card-title"><span>02</span><h3>{isEnglish ? "Sentence structure" : "长难句结构"}</h3></div>{analysis.structure.map((item, index) => <div className="structure-item" key={`${item.original}-${index}`}><blockquote>{item.original}</blockquote><p>{item.explanation}</p></div>)}</section>}
          {!!analysis.vocabulary.length && <section className="analysis-card"><div className="analysis-card-title"><span>03</span><h3>{isEnglish ? "Key words and phrases" : "重点词与短语"}</h3></div><dl>{analysis.vocabulary.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.meaning}</dd></div>)}</dl></section>}
          <section className="analysis-card exam-tip"><div className="analysis-card-title"><span>04</span><h3>{isEnglish ? "Exam insight" : "命题提示"}</h3></div><p>{analysis.examTip}</p></section>
          <button className="regenerate-analysis" onClick={generateAnalysis} disabled={loadingParagraph === activeParagraph}>{loadingParagraph === activeParagraph ? <LoaderCircle className="is-spinning" /> : <RotateCcw />}{isEnglish ? "Regenerate" : "重新生成"}</button>
          {analysisError && <p className="analysis-error">{analysisError}</p>}
        </div>}

        <footer className="intensive-panel-nav">
          <button disabled={activeParagraph === 0} onClick={() => setActiveParagraph((current) => current - 1)}><ChevronLeft />{isEnglish ? "Previous" : "上一段"}</button>
          {activeParagraph < paragraphs.length - 1 ? <button className="primary" onClick={() => setActiveParagraph((current) => current + 1)}>{isEnglish ? "Next" : "下一段"}<ChevronRight /></button> : <Link href="/">{isEnglish ? "Finish and return" : "完成精读，返回首页"}<Check /></Link>}
        </footer>
      </aside>
    </div>
  </main>;
}
