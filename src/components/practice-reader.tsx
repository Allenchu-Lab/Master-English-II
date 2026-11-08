"use client";
import { DraftStatus } from "@/components/ui/draft-status";
import { PracticeActionBar } from "@/components/ui/practice-action-bar";
import { CompletionBadge } from "@/components/ui/completion-badge";

import { PracticeChoice } from "@/components/ui/practice-choice";
import { PracticeProgress } from "@/components/ui/practice-progress";

import { PracticeDialog, PracticeDialogTitle, type PracticeDialogHandle } from "@/components/ui/practice-dialog";

import { Button } from "@/components/ui/button";
import { DraftSaveError } from "@/lib/draft-save";
import { useDraftAutosave, useMutationQueue, useUnsavedGuard } from "@/components/ui/use-draft-autosave";
import { useUiLanguage } from "@/components/ui/use-ui-language";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Clock3, LoaderCircle, Pause, Play, RotateCcw, X } from "lucide-react";
import type { PracticePassage } from "@/data/get-practice-passage";
import { HighlightGuide, SelectableHighlight } from "@/components/selectable-highlight";

type GradedQuestion = { questionNumber: number; selectedOption: number; correctOption: number; isCorrect: boolean; promptZh: string; optionTranslations: string[]; explanation: string };
type GradeResult = { score: number; total: number; questions: GradedQuestion[] };

export function PracticeReader({ passage, startFresh = false, initialLanguage = "zh", previewOnly = false }: { passage: PracticePassage; startFresh?: boolean; initialLanguage?: "zh" | "en"; previewOnly?: boolean }) {
  const router = useRouter();
  const confirm = useRef<PracticeDialogHandle>(null);
  const saveQueue = useMutationQueue();
  const [leaving, setLeaving] = useState(false);
  const [draftSaveFailed, setDraftSaveFailed] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState("{}");
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
  const [restarting, setRestarting] = useState(false);
  const actionPending = useRef(false);
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

  const { isEnglish } = useUiLanguage(initialLanguage);

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
    if (previewOnly) return null;
    try {
      const response = await fetch(`/api/attempts/${passage.id}`, fresh ? { method: "POST" } : undefined);
      if (!response.ok) return null;
      const { attempt: current, grade } = await response.json() as { attempt: { id: string; answers: Record<string, number>; submitted_at: string | null }; grade?: GradeResult };
      setAttemptId(current.id);
      setAnswers(current.answers ?? {});
      setSavedAnswers(JSON.stringify(current.answers ?? {}));
      // 带回判分结果说明这条记录已提交，直接恢复复盘视图，
      // 而不是让用户面对一份空白的答题页。
      setGradeResult(grade ?? null);
      setSubmitted(Boolean(grade));
      // Redo 只在入口消费一次。清掉查询参数，刷新页面时继续当前这轮，
      // 不会因为地址仍带 redo 而重复新建练习记录。
      if (fresh) window.history.replaceState(window.history.state, "", `/practice/${passage.year}/${passage.number}${new URLSearchParams(window.location.search).get("lang") === "en" ? "?lang=en" : ""}`);
      return current.id;
    } catch {
      // fetch 抛异常代表请求没能送达，与服务端明确返回错误是两种不同情况。
      return null;
    }
  }, [passage.id, passage.number, passage.year, previewOnly]);

  // 不做取消处理：请求返回后即便组件已卸载，写入 state 也是无害的；
  // 而丢弃结果会让编号永久为空，那正是之前保存彻底失效的原因。
  // openAttempt 内部的 state 写入都发生在 await 之后，并非同步执行。
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    void openAttempt(startFresh);
  }, [openAttempt, startFresh]);

  const persistAnswers = useCallback(() => {
    const operation = saveQueue.enqueue(async () => {
      const response = await fetch(`/api/attempts/${passage.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers }),
      });
      if (!response.ok) throw new DraftSaveError(response.status);
      setSavedAnswers(JSON.stringify(answers));
      setDraftSaveFailed(false);
    });
    return operation;
  }, [answers, attemptId, passage.id, saveQueue]);

  const dirty = !submitted && Boolean(attemptId) && savedAnswers !== JSON.stringify(answers);
  useUnsavedGuard(dirty);

  const leave = async (href: string) => {
    if (actionPending.current) return;
    actionPending.current = true;
    setLeaving(true);
    try {
      await saveQueue.drain();
      if (!previewOnly && !submitted && dirty) await persistAnswers();
      router.push(href);
    } catch {
      setSubmitError(isEnglish ? "Could not save. Your answers are still here. Try again." : "保存失败，答案仍保留在当前页面，请重试。");
    } finally { actionPending.current = false; setLeaving(false); }
  };

  useDraftAutosave({
    enabled: !previewOnly && Boolean(attemptId) && !submitted && !submitting && !leaving && dirty,
    snapshot: JSON.stringify(answers),
    save: persistAnswers,
    blocked: () => actionPending.current,
    delayMs: 200,
    onError: () => setDraftSaveFailed(true),
  });

  /** 重做：请服务端新建一条记录，历史提交保留不动。 */
  const restart = async () => {
    if (previewOnly || actionPending.current) return;
    actionPending.current = true;
    setRestarting(true);
    setSubmitError(null);
    try {
      await saveQueue.drain();
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
    } finally {
      actionPending.current = false;
      setRestarting(false);
    }
  };

  const submit = async () => {
    if (previewOnly || actionPending.current) return;
    setSubmitError(null);
    actionPending.current = true;
    setSubmitting(true);
    const spinnerTimer = window.setTimeout(() => setShowSubmitSpinner(true), 400);
    const finish = () => {
      window.clearTimeout(spinnerTimer);
      setShowSubmitSpinner(false);
      setSubmitting(false);
      actionPending.current = false;
    };

    try {
      await saveQueue.drain();
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

  const missing = passage.questions.filter(question => answers[String(question.number)] === undefined);
  const answeredCount = Object.keys(answers).length;
  const checkMissing = () => {
    confirm.current?.close();
    if (missing[0]) {
      const heading = document.getElementById(`question-${missing[0].number}`);
      heading?.scrollIntoView({ block: "center", behavior: "instant" });
      heading?.focus({ preventScroll: true });
    }
  };
  const elapsed = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
  const highlightStorageKey = `reading-highlights:${passage.id}`;
  const languageHref = (path: string) => isEnglish ? `${path}${path.includes("?") ? "&" : "?"}lang=en` : path;
  return (
    <main className={`practice-page ${submitted ? "is-review" : "is-exam"}`}>
      <title>{isEnglish ? `ChiTouEN II · ${passage.year} Text ${passage.number}` : `吃透英语二 · ${passage.year} Text ${passage.number}`}</title>
      <header className="practice-header">
        <Link href={languageHref(`/?type=reading_a&year=${passage.year}`)} className="practice-back" aria-label={isEnglish ? "Back to practice" : "返回刷题"} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); void leave(event.currentTarget.href); } }}><ArrowLeft /></Link>
        <nav><BookOpen /><Link href={languageHref(`/?type=reading_a&year=${passage.year}`)} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); void leave(event.currentTarget.href); } }}>{isEnglish ? "Practice" : "刷题"}</Link><span>/</span><span>{isEnglish ? `${passage.year} Paper` : `${passage.year} 年`}</span><span>/</span><strong>Text {passage.number}</strong></nav>
        <div className="practice-timer-group">
          <Button className={`practice-timer ${timerRunning ? "is-running" : ""}`} onClick={() => setTimerRunning((running) => !running)} disabled={submitted} aria-label={timerRunning ? (isEnglish ? "Pause timer" : "暂停计时") : (isEnglish ? "Start timer" : "开始计时")}>
            {timerRunning ? <Pause /> : elapsedSeconds ? <Play /> : <Clock3 />}<span>{elapsed}</span><small>{timerRunning ? (isEnglish ? "Pause" : "暂停") : elapsedSeconds ? (isEnglish ? "Resume" : "继续") : (isEnglish ? "Start" : "开始")}</small>
          </Button>
          <Button className="timer-reset" onClick={() => { setTimerRunning(false); setElapsedSeconds(0); }} disabled={submitted || elapsedSeconds === 0} aria-label={isEnglish ? "Reset timer" : "重新计时"} title={isEnglish ? "Reset timer" : "重新计时"}><RotateCcw /></Button>
        </div>
        <div className="practice-header-actions">
          {submitted
            ? <CompletionBadge>{isEnglish ? "Submitted" : "已提交"}</CompletionBadge>
            : <Button className="header-submit" onClick={() => missing.length ? confirm.current?.showModal() : void submit()} disabled={previewOnly || submitting || leaving || answeredCount === 0} aria-busy={submitting}>{showSubmitSpinner && <LoaderCircle className="spin" />}{previewOnly ? (isEnglish ? "Answer key pending" : "答案待补") : submitting ? (isEnglish ? "Submitting…" : "正在提交…") : (isEnglish ? "Submit" : "提交作答")}</Button>}
        </div>
      </header>

      <div className="practice-layout">
        <section className="passage-pane">
          {previewOnly && <p role="status">{isEnglish ? "Local preview · Answer key pending. Selections are not saved and grading is disabled." : "本地预览 · 答案待补。选项可试点，不保存作答，也不判分。"}</p>}
          <div className="passage-meta"><span>{passage.year} · Text {passage.number}</span><span>{passage.wordCount} {isEnglish ? "words" : "词"}</span></div>
          <HighlightGuide isEnglish={isEnglish} />
          <article>{passage.paragraphs.length ? passage.paragraphs.map((paragraph, index) => <p key={index}><SelectableHighlight text={paragraph} scope={`passage:${index}`} storageKey={highlightStorageKey} isEnglish={isEnglish} /></p>) : <p><SelectableHighlight text={passage.body} scope="passage:0" storageKey={highlightStorageKey} isEnglish={isEnglish} /></p>}</article>
        </section>

        <aside className="question-pane">
          <div className="question-progress"><strong>Text {passage.number}</strong><PracticeProgress value={answeredCount} total={passage.questions.length} label={isEnglish ? "Answered questions" : "已作答题目"} /><span>{isEnglish ? `${answeredCount} / ${passage.questions.length} answered` : `${answeredCount} / ${passage.questions.length} 已作答`}</span></div>
          <div className="question-scroll">
            {passage.questions.map((question) => <section className={`question-item ${submitted ? "is-disabled" : ""}`} key={question.id} role="group" aria-labelledby={`question-${question.number}`}>
              <h2 id={`question-${question.number}`} tabIndex={-1}><span>{question.number}</span><SelectableHighlight text={question.prompt} scope={`question:${question.id}`} storageKey={highlightStorageKey} isEnglish={isEnglish} /></h2>
              <div className="option-list">{question.options.map((option) => {
                const selected = answers[String(question.number)] === option.index;
                const graded = gradeResult?.questions.find((item) => item.questionNumber === question.number);
                const optionState = submitted && option.index === graded?.correctOption ? "correct" : submitted && selected && !graded?.isCorrect ? "incorrect" : selected ? "selected" : "";
                return <PracticeChoice key={option.index} className={optionState} selected={selected} disabled={submitted || submitting || leaving} onChange={() => setAnswers((current) => {
                  const key = String(question.number);
                  if (current[key] !== option.index) return { ...current, [key]: option.index };
                  const next = { ...current };
                  delete next[key];
                  return next;
                })}><span className="option-letter">{String.fromCharCode(65 + option.index)}</span><span>{option.body}{submitted && graded?.optionTranslations[option.index] && <small className="option-translation">{graded.optionTranslations[option.index]}</small>}</span></PracticeChoice>;
              })}</div>
              {submitted && gradeResult?.questions.find((item) => item.questionNumber === question.number) && <div className="answer-analysis">
                <strong>{isEnglish ? "Answer" : "答案"}：{String.fromCharCode(65 + (gradeResult.questions.find((item) => item.questionNumber === question.number)?.correctOption ?? 0))}</strong>
                <p>{gradeResult.questions.find((item) => item.questionNumber === question.number)?.promptZh}</p>
                <p>{gradeResult.questions.find((item) => item.questionNumber === question.number)?.explanation}</p>
              </div>}
            </section>)}
          {!submitted && !previewOnly && <DraftStatus tone={draftSaveFailed ? "error" : "default"}>{draftSaveFailed ? (isEnglish ? "Save failed. Your answers are still on this page." : "保存失败，答案仍保留在当前页面。") : !attemptId ? (isEnglish ? "Loading your response…" : "正在读取作答…") : dirty ? (isEnglish ? "Saving…" : "正在保存…") : (isEnglish ? "Draft saved automatically" : "草稿自动保存")}</DraftStatus>}
          </div>
          {(submitError || submitted) && <PracticeActionBar tone={submitError ? "error" : "default"} summary={submitError ?? (isEnglish ? <><strong>{gradeResult?.score} / {gradeResult?.total}</strong> correct</> : <>答对 <strong>{gradeResult?.score} / {gradeResult?.total}</strong> 题</>)} actions={submitted ? [
            { id: "home", label: isEnglish ? "Back to library" : "返回首页", variant: "secondary", href: languageHref(`/?type=reading_a&year=${passage.year}`) },
            { id: "redo", label: restarting ? (isEnglish ? "Starting…" : "正在开始…") : (isEnglish ? "Redo" : "重新练习"), variant: "secondary", busy: restarting, onPress: () => confirm.current?.showModal() },
            { id: "study", label: isEnglish ? "Intensive reading" : "进入精读", variant: "primary", href: languageHref(`/intensive/${passage.year}/${passage.number}`) },
          ] : []} />}
        </aside>
      </div>

      <PracticeDialog ref={confirm} className="translation-redo-dialog" aria-labelledby="reading-confirm-title">
        <Button className="translation-dialog-close" aria-label={isEnglish ? "Close" : "关闭"} onClick={() => confirm.current?.close()}><X data-icon-size="20" /></Button>
        <PracticeDialogTitle id="reading-confirm-title">{submitted ? (isEnglish ? "Start again?" : "重新练习这篇文章？") : (isEnglish ? "Submit with unanswered questions?" : "还有题目未作答，确认提交？")}</PracticeDialogTitle>
        <p>{submitted ? (isEnglish ? "Start with blank answers. Your submitted attempt will be kept." : "将开始一份空白作答，已提交的练习记录会保留。") : `${isEnglish ? "Unanswered questions: " : "未作答题号："}${missing.map(question => question.number).join("、")}`}</p>
        <div className="translation-dialog-actions"><Button variant="secondary" autoFocus onClick={submitted ? () => confirm.current?.close() : checkMissing}>{submitted ? (isEnglish ? "Keep reviewing" : "继续复盘") : (isEnglish ? "Check unanswered" : "返回检查")}</Button><Button variant="primary" className="translation-primary" onClick={() => { confirm.current?.close(); void (submitted ? restart() : submit()); }}>{submitted ? (isEnglish ? "Start again" : "确认重做") : (isEnglish ? "Submit anyway" : "仍然提交")}</Button></div>
      </PracticeDialog>
    </main>
  );
}
