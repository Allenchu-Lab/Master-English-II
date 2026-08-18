"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Check, Clock3, LoaderCircle, Pause, Play, RotateCcw } from "lucide-react";
import type { PracticePassage } from "@/data/get-practice-passage";
import { HighlightGuide, SelectableHighlight } from "@/components/selectable-highlight";

type SaveState = "connecting" | "saved" | "saving" | "error";
type GradedQuestion = { questionNumber: number; selectedOption: number; correctOption: number; isCorrect: boolean; promptZh: string; optionTranslations: string[]; explanation: string };
type GradeResult = { score: number; total: number; questions: GradedQuestion[] };

export function PracticeReader({ passage }: { passage: PracticePassage }) {
  /**
   * 练习记录编号必须是 state 而不是 ref。
   *
   * 它是异步取回的，而保存的副作用以它为前置条件。放在 ref 里时，编号到位
   * 不会触发副作用重新运行，一旦两者时序错开，保存就永久不再触发——一次
   * PATCH 都发不出去，界面显示保存失败，提交也因为编号为空而静默无反应。
   * 用 state 让 React 的依赖链保证顺序，从根上消除这类竞态。
   */
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saveState, setSaveState] = useState<SaveState>("connecting");
  const [submitted, setSubmitted] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  /**
   * 连接异常的原始信息。只存状态码和服务端返回的文案，展示用的中英文在渲染时
   * 再拼——这样取记录的函数不必依赖语言状态，避免它因语言变化而重新生成、
   * 连带触发多余的请求。
   */
  const [connectIssue, setConnectIssue] = useState<{ status?: number; message?: string } | null>(null);
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

  /**
   * 取得（或新建）本篇的练习记录。返回记录编号，失败时返回 null 并记下原因。
   *
   * 编号是保存和提交的前提，缺了它两者都无法进行。原先失败后只把状态标成
   * error 就不再重试，用户会在毫不知情的情况下继续答题，答案全部丢失。
   */
  const openAttempt = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(`/api/attempts/${passage.id}`);
      if (!response.ok) {
        const detail = await response.json().catch(() => null) as { error?: string } | null;
        setConnectIssue({ status: response.status, message: detail?.error });
        setSaveState("error");
        return null;
      }
      const { attempt: current } = await response.json() as { attempt: { id: string; answers: Record<string, number> } };
      setAttemptId(current.id);
      setAnswers(current.answers ?? {});
      setSubmitted(false);
      setConnectIssue(null);
      setSaveState("saved");
      return current.id;
    } catch {
      // fetch 抛异常代表请求没能送达，与服务端明确返回错误是两种不同情况。
      setConnectIssue({});
      setSaveState("error");
      return null;
    }
  }, [passage.id]);

  // 不做取消处理：请求返回后即便组件已卸载，写入 state 也是无害的；
  // 而丢弃结果会让编号永久为空，那正是之前保存彻底失效的原因。
  // openAttempt 内部的 state 写入都发生在 await 之后，并非同步执行，
  // 这条规则无法穿过 await 边界判断，故在此关闭。
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void openAttempt(); }, [openAttempt]);

  // 依赖 attemptId：编号到位后本副作用会自动重新运行，不会像之前那样错过时机。
  useEffect(() => {
    if (!attemptId || submitted) return;
    const timer = window.setTimeout(async () => {
      // 放在定时器内而非副作用体内：避免每次选择答案都同步触发一次额外渲染。
      setSaveState("saving");
      try {
        const response = await fetch(`/api/attempts/${passage.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attemptId, answers }) });
        setSaveState(response.ok ? "saved" : "error");
        setConnectIssue(response.ok ? null : { status: response.status });
      } catch {
        setSaveState("error");
        setConnectIssue({});
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [answers, attemptId, passage.id, submitted]);

  const submit = async () => {
    if (Object.keys(answers).length !== passage.questions.length) {
      setSubmitError(isEnglish ? "Answer every question before submitting." : "请完成全部题目后再提交。");
      return;
    }
    setSubmitError(null);
    setSaveState("saving");
    // 编号缺失时当场补建再继续提交。原先直接 return，点按钮毫无反应，
    // 用户答完一整篇得不到任何提示，也无法自行恢复。
    const activeId = attemptId ?? await openAttempt();
    if (!activeId) {
      setSubmitError(isEnglish
        ? "Could not reach the server, so this attempt was not submitted. Please try again."
        : "无法连接服务器，本次作答未提交，请重试。");
      return;
    }
    let response: Response;
    try {
      response = await fetch(`/api/attempts/${passage.id}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attemptId: activeId, answers }) });
    } catch {
      setSubmitError(isEnglish ? "Could not reach the server. Please try again." : "无法连接服务器，请稍后再试。");
      setSaveState("error");
      return;
    }
    const data = await response.json().catch(() => ({})) as GradeResult & { error?: string };
    if (!response.ok) {
      // 带上状态码，便于用户反馈时一眼定位，不再是一句笼统的失败。
      setSubmitError(`${data.error ?? (isEnglish ? "Unable to grade this passage." : "当前文章暂时无法判分。")}（${response.status}）`);
      setSaveState("error");
      return;
    }
    setGradeResult(data);
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

      {connectIssue && <div className="practice-alert" role="alert">
        <span>{connectIssue.message
          ? `${connectIssue.message}${connectIssue.status ? `（${connectIssue.status}）` : ""}`
          : connectIssue.status
            ? (isEnglish ? `Your answers are not being saved (${connectIssue.status}).` : `作答未能保存到服务器（${connectIssue.status}）。`)
            : (isEnglish ? "Could not reach the server. Your answers are not being saved." : "无法连接服务器，你的作答目前没有被保存。")}</span>
        <button onClick={() => { void openAttempt(); }}>{isEnglish ? "Retry" : "重试"}</button>
      </div>}

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
