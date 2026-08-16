"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Check, Clock3, LoaderCircle, Pause, Play, RotateCcw } from "lucide-react";
import type { PracticePassage } from "@/data/get-practice-passage";
import { ensureAnonymousUser, getSupabaseBrowserClient } from "@/lib/supabase/client";
import { HighlightGuide, SelectableHighlight } from "@/components/selectable-highlight";

type SaveState = "connecting" | "saved" | "saving" | "error";
type GradedQuestion = { questionNumber: number; selectedOption: number; correctOption: number; isCorrect: boolean; promptZh: string; optionTranslations: string[]; explanation: string };
type GradeResult = { score: number; total: number; questions: GradedQuestion[] };

export function PracticeReader({ passage }: { passage: PracticePassage }) {
  const attemptId = useRef<string | null>(null);
  const hydrated = useRef(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saveState, setSaveState] = useState<SaveState>("connecting");
  const [submitted, setSubmitted] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [uiLanguage, setUiLanguage] = useState<"zh" | "en">("zh");
  const isEnglish = uiLanguage === "en";

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("ui-language");
    if (savedLanguage !== "en" && savedLanguage !== "zh") return;
    const timer = window.setTimeout(() => setUiLanguage(savedLanguage), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!timerRunning || submitted) return;
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning, submitted]);

  useEffect(() => {
    let cancelled = false;
    async function restoreAttempt() {
      const client = getSupabaseBrowserClient();
      if (!client) { setSaveState("error"); return; }
      try {
        const user = await ensureAnonymousUser(client);
        const { data, error } = await client
          .from("practice_attempts")
          .select("id, answers, submitted_at")
          .eq("user_id", user.id)
          .eq("passage_id", passage.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        let current = data;
        if (!current || current.submitted_at) {
          const created = await client.from("practice_attempts")
            .insert({ user_id: user.id, passage_id: passage.id, answers: {} })
            .select("id, answers, submitted_at").single();
          if (created.error) throw created.error;
          current = created.data;
        }
        if (cancelled) return;
        attemptId.current = current.id;
        setAnswers((current.answers as Record<string, number>) ?? {});
        setSubmitted(false);
        hydrated.current = true;
        setSaveState("saved");
      } catch { if (!cancelled) setSaveState("error"); }
    }
    restoreAttempt();
    return () => { cancelled = true; };
  }, [passage.id]);

  useEffect(() => {
    if (!hydrated.current || !attemptId.current || submitted) return;
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      const client = getSupabaseBrowserClient();
      if (!client || !attemptId.current) return;
      const { error } = await client.from("practice_attempts").update({ answers }).eq("id", attemptId.current);
      setSaveState(error ? "error" : "saved");
    }, 500);
    return () => window.clearTimeout(timer);
  }, [answers, submitted]);

  const submit = async () => {
    const client = getSupabaseBrowserClient();
    if (!client || !attemptId.current) return;
    if (Object.keys(answers).length !== passage.questions.length) {
      setSubmitError(isEnglish ? "Answer every question before submitting." : "请完成全部题目后再提交。");
      return;
    }
    setSubmitError(null);
    setSaveState("saving");
    const { data, error } = await client.rpc("submit_practice_attempt", { attempt_uuid: attemptId.current, submitted_answers: answers });
    if (error) { setSubmitError(isEnglish ? "Unable to grade this passage yet." : "当前文章暂时无法判分。"); setSaveState("error"); return; }
    setGradeResult(data as GradeResult);
    setSubmitted(true);
    setTimerRunning(false);
    setSaveState("saved");
  };

  const answeredCount = Object.keys(answers).length;
  const elapsed = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
  const highlightStorageKey = `reading-highlights:${passage.id}`;
  return (
    <main className="practice-page">
      <header className="practice-header">
        <Link href="/" className="practice-back" aria-label={isEnglish ? "Back to practice" : "返回刷题"}><ArrowLeft /></Link>
        <nav><BookOpen /><Link href="/">{isEnglish ? "Practice" : "刷题"}</Link><span>/</span><span>{isEnglish ? `${passage.year} Paper` : `${passage.year} 年`}</span><span>/</span><strong>Text {passage.number}</strong></nav>
        <div className="practice-timer-group">
          <button className={`practice-timer ${timerRunning ? "is-running" : ""}`} onClick={() => setTimerRunning((running) => !running)} disabled={submitted} aria-label={timerRunning ? (isEnglish ? "Pause timer" : "暂停计时") : (isEnglish ? "Start timer" : "开始计时")}>
            {timerRunning ? <Pause /> : elapsedSeconds ? <Play /> : <Clock3 />}<span>{elapsed}</span><small>{timerRunning ? (isEnglish ? "Pause" : "暂停") : elapsedSeconds ? (isEnglish ? "Resume" : "继续") : (isEnglish ? "Start" : "开始")}</small>
          </button>
          <button className="timer-reset" onClick={() => { setTimerRunning(false); setElapsedSeconds(0); }} disabled={submitted || elapsedSeconds === 0} aria-label={isEnglish ? "Reset timer" : "重新计时"} title={isEnglish ? "Reset timer" : "重新计时"}><RotateCcw /></button>
        </div>
        <div className="practice-header-actions">
          <span className={`save-indicator is-${saveState}`}>{saveState === "saving" && <LoaderCircle />}{saveState === "saved" && <Check />}{saveState === "connecting" ? (isEnglish ? "Connecting" : "正在连接") : saveState === "saving" ? (isEnglish ? "Saving" : "正在保存") : saveState === "saved" ? (isEnglish ? "Saved" : "已自动保存") : (isEnglish ? "Save failed" : "保存失败")}</span>
          {submitted ? <span className="header-submitted"><Check />{isEnglish ? "Submitted" : "已提交"}</span> : <button className="header-submit" onClick={submit} disabled={saveState === "connecting" || saveState === "saving"}>{isEnglish ? "Submit" : "提交作答"}</button>}
        </div>
      </header>

      <div className="practice-layout">
        <section className="passage-pane">
          <div className="passage-meta"><span>{passage.year} · Text {passage.number}</span><span>{passage.wordCount} {isEnglish ? "words" : "词"}</span></div>
          <HighlightGuide isEnglish={isEnglish} />
          <article>{passage.paragraphs.length ? passage.paragraphs.map((paragraph, index) => <p key={index}><SelectableHighlight text={paragraph} scope={`passage:${index}`} storageKey={highlightStorageKey} /></p>) : <p><SelectableHighlight text={passage.body} scope="passage:0" storageKey={highlightStorageKey} /></p>}</article>
        </section>

        <aside className="question-pane">
          <div className="question-progress"><strong>Text {passage.number}</strong><i><b style={{ width: `${answeredCount / passage.questions.length * 100}%` }} /></i><span>{isEnglish ? `${answeredCount} / ${passage.questions.length} answered` : `${answeredCount} / ${passage.questions.length} 已作答`}</span></div>
          <div className="question-scroll">
            {passage.questions.map((question) => <section className={`question-item ${submitted ? "is-disabled" : ""}`} key={question.id} role="group" aria-labelledby={`question-${question.number}`}>
              <h2 id={`question-${question.number}`}><span>{question.number}</span><SelectableHighlight text={question.prompt} scope={`question:${question.id}`} storageKey={highlightStorageKey} /></h2>
              <div className="option-list">{question.options.map((option) => {
                const selected = answers[String(question.number)] === option.index;
                const graded = gradeResult?.questions.find((item) => item.questionNumber === question.number);
                const optionState = submitted && option.index === graded?.correctOption ? "correct" : submitted && selected && !graded?.isCorrect ? "incorrect" : selected ? "selected" : "";
                return <label key={option.index} className={optionState}><input type="checkbox" checked={selected} disabled={submitted} onChange={() => setAnswers((current) => {
                  const key = String(question.number);
                  if (current[key] !== option.index) return { ...current, [key]: option.index };
                  const next = { ...current };
                  delete next[key];
                  return next;
                })} /><span className="option-letter">{String.fromCharCode(65 + option.index)}</span><span>{option.body}{submitted && graded?.optionTranslations[option.index] && <small className="option-translation">{graded.optionTranslations[option.index]}</small>}</span></label>;
              })}</div>
              {submitted && gradeResult?.questions.find((item) => item.questionNumber === question.number) && <div className="answer-analysis">
                <strong>{isEnglish ? "Answer" : "答案"}：{String.fromCharCode(65 + (gradeResult.questions.find((item) => item.questionNumber === question.number)?.correctOption ?? 0))}</strong>
                <p>{gradeResult.questions.find((item) => item.questionNumber === question.number)?.promptZh}</p>
                <p>{gradeResult.questions.find((item) => item.questionNumber === question.number)?.explanation}</p>
              </div>}
            </section>)}
          </div>
          {(submitError || submitted) && <footer className={`practice-submit ${submitError ? "has-error" : ""}`}><span>{submitError ?? (isEnglish ? <><strong>{gradeResult?.score} / {gradeResult?.total}</strong> correct</> : <>答对 <strong>{gradeResult?.score} / {gradeResult?.total}</strong> 题</>)}</span>{submitted && <div className="practice-submit-actions"><Link className="secondary" href="/">{isEnglish ? "Back to library" : "返回首页"}</Link><Link href={`/intensive/${passage.year}/${passage.number}`}>{isEnglish ? "Intensive reading" : "进入精读"}</Link></div>}</footer>}
        </aside>
      </div>

    </main>
  );
}
