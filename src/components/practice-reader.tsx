"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Check, Clock3, LoaderCircle, Pause, Play, RotateCcw } from "lucide-react";
import type { PracticePassage } from "@/data/get-practice-passage";
import { HighlightGuide, SelectableHighlight } from "@/components/selectable-highlight";

type GradedQuestion = { questionNumber: number; selectedOption: number; correctOption: number; isCorrect: boolean; promptZh: string; optionTranslations: string[]; explanation: string };
type GradeResult = { score: number; total: number; questions: GradedQuestion[] };

export function PracticeReader({ passage, startFresh = false }: { passage: PracticePassage; startFresh?: boolean }) {
  const openedRef = useRef(false);
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
  /**
   * 界面不展示自动保存的过程。它属于后台行为，摆到用户面前只会分散注意力，
   * 何况提交时会重发完整答案，中途某次没存上也不影响结果。
   * 只有提交是用户主动发起的，需要在按钮上给出反馈。
   */
  const [submitting, setSubmitting] = useState(false);
  // 提交很快时不闪 loading，只有超过 400 毫秒才显示，避免一次无意义的闪动。
  const [showSubmitSpinner, setShowSubmitSpinner] = useState(false);
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

  const [uiLanguage, setUiLanguage] = useState<"zh" | "en">("zh");
  const isEnglish = uiLanguage === "en";

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("ui-language");
    if (savedLanguage !== "en" && savedLanguage !== "zh") return;
    const timer = window.setTimeout(() => setUiLanguage(savedLanguage), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = isEnglish ? "en" : "zh-CN";
  }, [isEnglish, passage.number, passage.year]);

  useEffect(() => {
    if (!timerRunning || submitted) return;
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning, submitted]);

  /**
   * 取得（或新建）本篇的练习记录。返回记录编号，失败时返回 null。
   *
   * 编号是保存和提交的前提。失败不在界面上打扰用户：提交时会再取一次，
   * 并把完整答案一起发出，所以此处只把状态标成待保存即可。
   */
  const openAttempt = useCallback(async (fresh = false): Promise<string | null> => {
    try {
      const response = await fetch(`/api/attempts/${passage.id}`, fresh ? { method: "POST" } : undefined);
      if (!response.ok) return null;
      const { attempt: current, grade } = await response.json() as { attempt: { id: string; answers: Record<string, number>; submitted_at: string | null }; grade?: GradeResult };
      setAttemptId(current.id);
      setAnswers(current.answers ?? {});
      // 带回判分结果说明这条记录已提交，直接恢复复盘视图，
      // 而不是让用户面对一份空白的答题页。
      setGradeResult(grade ?? null);
      setSubmitted(Boolean(grade));
      // Redo 只在入口消费一次。清掉查询参数，刷新页面时继续当前这轮，
      // 不会因为地址仍带 redo 而重复新建练习记录。
      if (fresh) window.history.replaceState(window.history.state, "", `/practice/${passage.year}/${passage.number}`);
      return current.id;
    } catch {
      // fetch 抛异常代表请求没能送达，与服务端明确返回错误是两种不同情况。
      return null;
    }
  }, [passage.id, passage.number, passage.year]);

  // 不做取消处理：请求返回后即便组件已卸载，写入 state 也是无害的；
  // 而丢弃结果会让编号永久为空，那正是之前保存彻底失效的原因。
  // openAttempt 内部的 state 写入都发生在 await 之后，并非同步执行。
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    void openAttempt(startFresh);
  }, [openAttempt, startFresh]);

  /**
   * 保存作答。依赖 attemptId，编号到位后会自动重新运行。
   *
   * 失败由程序自己退避重试，不打断做题：保存是后台行为，网络抖动不该变成
   * 用户要处理的事情。即使全部重试都失败也不会丢答案——提交时会把完整
   * 答案再发一遍，所以这里只需安静地把状态显示出来。
   */
  useEffect(() => {
    if (!attemptId || submitted) return;
    let cancelled = false;
    let timer = 0;

    const save = async (attempt: number) => {
      try {
        const response = await fetch(`/api/attempts/${passage.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId, answers }),
        });
        if (cancelled || response.ok) return;
        retry(attempt, response.status);
      } catch {
        if (!cancelled) retry(attempt);
      }
    };

    // 退避重试：1 秒、2 秒、4 秒。全程不提示，失败也不打断做题。
    const retry = (attempt: number, status?: number) => {
      // 400 和 404 是请求本身的问题，重试不会有不同结果，直接放弃。
      const worthRetrying = status === undefined || status >= 500 || status === 409;
      if (attempt >= 3 || !worthRetrying) return;
      timer = window.setTimeout(() => { void save(attempt + 1); }, 1000 * 2 ** attempt);
    };

    timer = window.setTimeout(() => { void save(0); }, 200);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [answers, attemptId, passage.id, submitted]);

  /** 重做：请服务端新建一条记录，历史提交保留不动。 */
  const restart = async () => {
    setSubmitError(null);
    try {
      const response = await fetch(`/api/attempts/${passage.id}`, { method: "POST" });
      // 重做是用户主动发起的操作，失败必须告知；后台保存才适合静默重试。
      if (!response.ok) {
        setSubmitError(isEnglish ? "Could not start a new attempt. Please try again." : "无法开始新一轮练习，请稍后再试。");
        return;
      }
      const { attempt: fresh } = await response.json() as { attempt: { id: string } };
      setAttemptId(fresh.id);
      setAnswers({});
      setGradeResult(null);
      setSubmitted(false);
      setElapsedSeconds(0);
      setTimerRunning(false);
    } catch {
      setSubmitError(isEnglish ? "Could not reach the server. Please try again." : "无法连接服务器，请稍后再试。");
    }
  };

  const submit = async () => {
    if (Object.keys(answers).length !== passage.questions.length) {
      setSubmitError(isEnglish ? "Answer every question before submitting." : "请完成全部题目后再提交。");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    const spinnerTimer = window.setTimeout(() => setShowSubmitSpinner(true), 400);
    const finish = () => {
      window.clearTimeout(spinnerTimer);
      setShowSubmitSpinner(false);
      setSubmitting(false);
    };

    try {
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
        return;
      }
      const data = await response.json().catch(() => ({})) as GradeResult & { error?: string };
      if (!response.ok) {
        // 带上状态码，便于用户反馈时一眼定位，不再是一句笼统的失败。
        setSubmitError(`${data.error ?? (isEnglish ? "Unable to grade this passage." : "当前文章暂时无法判分。")}（${response.status}）`);
        return;
      }
      setGradeResult(data);
      setSubmitted(true);
      setTimerRunning(false);
    } finally {
      finish();
    }
  };

  const answeredCount = Object.keys(answers).length;
  const elapsed = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
  const highlightStorageKey = `reading-highlights:${passage.id}`;
  return (
    <main className="practice-page">
      <title>{isEnglish ? `ChiTouEN II · ${passage.year} Text ${passage.number}` : `吃透英语二 · ${passage.year} Text ${passage.number}`}</title>
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
          {submitted
            ? <span className="header-submitted"><Check />{isEnglish ? "Submitted" : "已提交"}</span>
            : <button className="header-submit" onClick={submit} disabled={submitting}>{showSubmitSpinner && <LoaderCircle className="spin" />}{isEnglish ? "Submit" : "提交作答"}</button>}
        </div>
      </header>

      <div className="practice-layout">
        <section className="passage-pane">
          <div className="passage-meta"><span>{passage.year} · Text {passage.number}</span><span>{passage.wordCount} {isEnglish ? "words" : "词"}</span></div>
          <HighlightGuide isEnglish={isEnglish} />
          <article>{passage.paragraphs.length ? passage.paragraphs.map((paragraph, index) => <p key={index}><SelectableHighlight text={paragraph} scope={`passage:${index}`} storageKey={highlightStorageKey} isEnglish={isEnglish} /></p>) : <p><SelectableHighlight text={passage.body} scope="passage:0" storageKey={highlightStorageKey} isEnglish={isEnglish} /></p>}</article>
        </section>

        <aside className="question-pane">
          <div className="question-progress"><strong>Text {passage.number}</strong><i><b style={{ width: `${answeredCount / passage.questions.length * 100}%` }} /></i><span>{isEnglish ? `${answeredCount} / ${passage.questions.length} answered` : `${answeredCount} / ${passage.questions.length} 已作答`}</span></div>
          <div className="question-scroll">
            {passage.questions.map((question) => <section className={`question-item ${submitted ? "is-disabled" : ""}`} key={question.id} role="group" aria-labelledby={`question-${question.number}`}>
              <h2 id={`question-${question.number}`}><span>{question.number}</span><SelectableHighlight text={question.prompt} scope={`question:${question.id}`} storageKey={highlightStorageKey} isEnglish={isEnglish} /></h2>
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
          {(submitError || submitted) && <footer className={`practice-submit ${submitError ? "has-error" : ""}`}><span>{submitError ?? (isEnglish ? <><strong>{gradeResult?.score} / {gradeResult?.total}</strong> correct</> : <>答对 <strong>{gradeResult?.score} / {gradeResult?.total}</strong> 题</>)}</span>{submitted && <div className="practice-submit-actions"><Link className="secondary" href="/">{isEnglish ? "Back to library" : "返回首页"}</Link><button className="practice-restart" onClick={() => { void restart(); }}>{isEnglish ? "Redo" : "重新练习"}</button><Link href={`/intensive/${passage.year}/${passage.number}`}>{isEnglish ? "Intensive reading" : "进入精读"}</Link></div>}</footer>}
        </aside>
      </div>

    </main>
  );
}
