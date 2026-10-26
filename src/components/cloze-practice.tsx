"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Clock3, LoaderCircle, Pause, Play, X } from 'lucide-react';
import type { ClozeAnswers, ClozeAttempt, ClozeContent } from '@/lib/cloze';
import { HighlightGuide, SelectableHighlight } from '@/components/selectable-highlight';

export function ClozePractice({ task, isEnglish }: { task: { id: string; content: ClozeContent }; isEnglish: boolean }) {
  const router = useRouter();
  const content = task.content;
  const endpoint = `/api/cloze-attempts/${task.id}`;
  const back = `/?type=cloze&year=${content.year}${isEnglish ? '&lang=en' : ''}`;
  const [answers, setAnswers] = useState<ClozeAnswers>({});
  const [attempt, setAttempt] = useState<ClozeAttempt | null>(null);
  const [active, setActive] = useState(1);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [loadRevision, setLoadRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const attemptId = useRef<string | null>(null);
  const seconds = useRef(0);
  const revision = useRef(0);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutationLock = useRef(false);
  const confirm = useRef<HTMLDialogElement>(null);
  const submitted = Boolean(attempt?.submitted_at);
  const missing = content.questions.filter(question => !answers[String(question.number)]);

  useEffect(() => {
    let cancelled = false;
    fetch(endpoint).then(async response => {
      if (!response.ok) throw Error();
      const data = await response.json() as { attempt: ClozeAttempt | null };
      if (cancelled) return;
      attemptId.current = data.attempt?.id ?? null;
      seconds.current = data.attempt?.elapsed_seconds ?? 0;
      setAttempt(data.attempt); setAnswers(data.attempt?.answers ?? {}); setElapsed(seconds.current);
      setNotice(''); setReady(true);
    }).catch(() => { if (!cancelled) setNotice(isEnglish ? 'Unable to load your response.' : '无法读取作答，请重试。'); });
    return () => { cancelled = true; };
  }, [endpoint, isEnglish, loadRevision]);

  useEffect(() => {
    if (!running || submitted) return;
    const timer = setInterval(() => { seconds.current = Math.min(seconds.current + 1, 604800); setElapsed(seconds.current); }, 1000);
    return () => clearInterval(timer);
  }, [running, submitted]);

  const persist = useCallback((action: 'save' | 'submit' | 'redo', snapshot: ClozeAnswers) => {
    const version = revision.current;
    const operation = queue.current.catch(() => {}).then(async () => {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, answers: snapshot, elapsedSeconds: seconds.current, attemptId: attemptId.current }) });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || (isEnglish ? 'Unable to save. Try again.' : '保存失败，请重试。'));
      const saved = data.attempt as ClozeAttempt;
      attemptId.current = saved.id;
      setAttempt(saved);
      setSaveFailed(false);
      if (revision.current === version) { setDirty(false); setNotice(isEnglish ? 'Saved' : '已保存'); }
      return saved;
    });
    queue.current = operation;
    return operation;
  }, [endpoint, isEnglish]);

  useEffect(() => {
    if (!ready || submitted || busy || !dirty) return;
    const timer = setTimeout(() => {
      if (mutationLock.current) return;
      void persist('save', answers).catch(error => { setSaveFailed(true); setNotice(error.message); });
    }, 600);
    saveTimer.current = timer;
    return () => clearTimeout(timer);
  }, [answers, ready, submitted, busy, dirty, persist]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (!submitted) return;
    document.getElementById(`cloze-blank-${active}`)?.scrollIntoView({ block: 'center', behavior: 'instant' });
    document.getElementById(`cloze-question-${active}`)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [active, submitted]);

  function choose(letter: string, number = active) {
    if (!ready || submitted || busy || mutationLock.current) return;
    revision.current++;
    setActive(number);
    setAnswers(previous => {
      const next = { ...previous };
      if (!letter || next[String(number)] === letter) delete next[String(number)]; else next[String(number)] = letter;
      return next;
    });
    setDirty(true); setNotice(isEnglish ? 'Saving…' : '正在保存……');
  }

  async function act(action: 'submit' | 'redo' | 'back') {
    if (mutationLock.current) return;
    mutationLock.current = true; setBusy(true); setRunning(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      await queue.current.catch(() => {});
      if (action === 'back') {
        if (dirty) await persist('save', answers);
        router.push(back); return;
      }
      const saved = await persist(action, answers);
      if (action === 'redo') {
        setAnswers({}); setElapsed(0); seconds.current = 0; setActive(1); setNotice('');
      } else {
        const firstWrong = saved.feedback?.find(item => saved.answers[String(item.number)] !== item.answer);
        setActive(firstWrong?.number ?? 1); setNotice('');
      }
    } catch (error) { setNotice(error instanceof Error ? error.message : '操作失败，请重试。'); }
    finally { mutationLock.current = false; setBusy(false); }
  }

  function focusQuestion(number: number, fromSource = false) {
    setActive(number);
    document.getElementById(fromSource ? `cloze-question-${number}` : `cloze-blank-${number}`)?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }

  return <main className={`reading-b-page cloze-page ${submitted ? 'is-review' : 'is-exam'}`}>
    <header className="practice-header">
      <Link href={back} aria-label={isEnglish ? 'Back to practice' : '返回题目列表'} onClick={event => { if (ready && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); void act('back'); } }}><ArrowLeft /></Link>
      <strong>{content.year} / {isEnglish ? 'Cloze' : '完形填空'}</strong>
      <div className="practice-timer-group"><button className="practice-timer" disabled={!ready || busy || submitted} onClick={() => setRunning(value => !value)}>
        {running ? <Pause /> : elapsed ? <Play /> : <Clock3 />}<span>{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</span>{running ? (isEnglish ? 'Pause' : '暂停') : (isEnglish ? 'Start' : '开始')}
      </button></div>
      <button className="header-submit" disabled={!ready || busy || (!submitted && missing.length === 20)} onClick={() => submitted || missing.length ? confirm.current?.showModal() : void act('submit')}>
        {busy && <LoaderCircle className="is-spinning" />}{submitted ? (isEnglish ? 'Try again' : '重新练习') : (isEnglish ? 'Submit' : '提交')}
      </button>
    </header>
    <div className="reading-b-layout">
      <section className="reading-b-source cloze-source" aria-label={isEnglish ? 'Reading passage' : '阅读原文'}>
        <div className="reading-b-meta">{isEnglish ? 'USE OF ENGLISH · 20 QUESTIONS · 10 POINTS' : '完形填空 · 20 题 · 10 分'}</div>
        <p className="reading-b-directions">{content.directions}</p>
        <HighlightGuide isEnglish={isEnglish} />
        {content.paragraphs.map((paragraph, index) => <p className="cloze-paragraph" key={index}>{paragraph.split(/(\{\{\d+\}\})/).map((piece, i) => {
          const match = /^\{\{(\d+)\}\}$/.exec(piece);
          if (!match) return piece ? <SelectableHighlight key={`${task.id}:${index}:${i}`} text={piece} scope={`passage:${index}:segment:${i}`} storageKey={`cloze-highlights:${task.id}`} isEnglish={isEnglish} /> : null;
          const number = Number(match[1]);
          const key = attempt?.feedback?.find(item => item.number === number);
          const correct = key && answers[String(number)] === key.answer;
          const choice = answers[String(number)];
          const word = content.questions[number - 1].options[choice ? choice.charCodeAt(0)-65 : -1];
          return <button key={i} id={`cloze-blank-${number}`} className={`cloze-blank ${active === number ? 'is-active' : ''} ${submitted ? correct ? 'is-correct' : 'is-wrong' : ''}`} aria-label={`${isEnglish ? 'Question' : '第'} ${number}${isEnglish ? '' : ' 题'}${word ? `: ${word}` : ''}`} aria-pressed={active === number} disabled={!ready || busy} onClick={() => focusQuestion(number,true)}><sup>{number}</sup>{word || '\u00a0\u00a0\u00a0'}</button>;
        })}</p>)}
        <small className="reading-b-source-note">{isEnglish ? 'Source: original paper, pages ' : '来源：原试卷第 '}{content.sourcePages.join('–')}{isEnglish ? '' : ' 页'}</small>
      </section>
      <section className="reading-b-answer cloze-answer" aria-label={isEnglish ? 'Your answers' : '作答与复盘'}>
        <div className="cloze-answer-top">
          <div className="reading-b-answer-head"><div><span className="reading-b-meta">{submitted ? (isEnglish ? 'YOUR RESULT' : '作答结果') : (isEnglish ? 'YOUR ANSWERS' : '你的作答')}</span><h2>{submitted ? (isEnglish ? 'Review answers' : '答案复盘') : (isEnglish ? 'Choose the best answer' : '选择最佳选项')}</h2></div>
            {submitted ? <strong className="reading-b-score">{attempt?.score}<small> / 10</small></strong> : <span className="reading-b-count">{ready ? 20-missing.length : '—'} / 20</span>}
          </div>
          <nav className="cloze-question-nav" aria-label={isEnglish ? 'Select question' : '选择题号'}>{content.questions.map(question => {
            const key = attempt?.feedback?.find(item => item.number === question.number);
            const correct = key && answers[String(question.number)] === key.answer;
            return <button key={question.number} disabled={!ready || busy} aria-pressed={active === question.number} aria-label={`${question.number}${submitted ? correct ? (isEnglish ? ' Correct' : ' 正确') : (isEnglish ? ' Incorrect' : ' 错误') : ''}`} className={`${active === question.number ? 'is-active' : ''} ${answers[String(question.number)] ? 'is-answered' : ''} ${submitted ? correct ? 'is-correct' : 'is-wrong' : ''}`} onClick={() => { focusQuestion(question.number); document.getElementById(`cloze-question-${question.number}`)?.scrollIntoView({block:'start',behavior:'instant'}); }}>{question.number}</button>;
          })}</nav>
        </div>
        {!ready ? <div className="reading-b-loading">{notice ? <><p role="alert">{notice}</p><button onClick={() => setLoadRevision(value => value+1)}>{isEnglish ? 'Retry' : '重新读取'}</button></> : <LoaderCircle className="is-spinning" aria-label={isEnglish ? 'Loading' : '正在读取'} />}</div> : <div className="cloze-question-list">{content.questions.map(question => {
          const key = attempt?.feedback?.find(item => item.number === question.number);
          const correct = key && answers[String(question.number)] === key.answer;
          return <article id={`cloze-question-${question.number}`} key={question.number} className={`cloze-question ${active === question.number ? 'is-active' : ''}`}>
            <div className="cloze-question-title"><button onClick={() => focusQuestion(question.number)} aria-label={`${isEnglish ? 'Locate blank' : '定位原文空格'} ${question.number}`}>{question.number.toString().padStart(2,'0')}</button>{submitted && <span className={correct ? 'is-correct' : 'is-wrong'}>{correct ? <Check size={14} /> : <X size={14} />}{correct ? (isEnglish ? 'Correct' : '正确') : (isEnglish ? `Correct answer: ${key?.answer}` : `正确答案：${key?.answer}`)} · {correct ? '0.5' : '0'} / 0.5</span>}</div>
            <div className="cloze-choices" role="group" aria-label={`${question.number} ${isEnglish ? 'Answer' : '答案'}`}>{question.options.map((option,index) => {
              const letter = String.fromCharCode(65+index);
              const selected = answers[String(question.number)] === letter;
              return <button key={letter} disabled={busy || submitted} aria-pressed={selected} className={`${selected ? 'is-selected' : ''} ${submitted && key?.answer === letter ? 'is-correct' : submitted && selected ? 'is-wrong' : ''}`} onClick={() => choose(letter,question.number)}><span>{letter}</span>{option}</button>;
            })}</div>
            {submitted && key && <p className="cloze-explanation">{key.explanation}</p>}
          </article>;
        })}</div>}
        <footer className="reading-b-save" role="status">{notice || (submitted ? (isEnglish ? 'Graded against the answer key' : '按参考答案判分') : (isEnglish ? 'Draft saved automatically' : '草稿自动保存'))}{saveFailed && dirty && !submitted && <button disabled={busy} onClick={() => { void persist('save',answers).catch(error => setNotice(error.message)); }}>{isEnglish ? 'Retry saving' : '重试保存'}</button>}</footer>
      </section>
    </div>
    <dialog ref={confirm} className="translation-redo-dialog" aria-labelledby="cloze-confirm-title">
      <button className="translation-dialog-close" aria-label={isEnglish ? 'Close' : '关闭'} onClick={() => confirm.current?.close()}><X size={20} /></button>
      <h2 id="cloze-confirm-title">{submitted ? (isEnglish ? 'Start again?' : '重新练习这篇文章？') : (isEnglish ? 'Submit with unanswered questions?' : '还有题目未作答，确认提交？')}</h2>
      <p>{submitted ? (isEnglish ? 'Start with blank answers. Your submitted attempt will be kept.' : '将开始一份空白作答，已提交的练习记录会保留。') : `${isEnglish ? 'Unanswered questions: ' : '未作答题号：'}${missing.map(q=>q.number).join('、')}`}</p>
      <div className="translation-dialog-actions"><button autoFocus onClick={() => confirm.current?.close()}>{submitted ? (isEnglish ? 'Keep reviewing' : '继续复盘') : (isEnglish ? 'Continue answering' : '继续作答')}</button><button className="translation-primary" onClick={() => { confirm.current?.close(); void act(submitted ? 'redo' : 'submit'); }}>{submitted ? (isEnglish ? 'Start again' : '确认重做') : (isEnglish ? 'Submit' : '确认提交')}</button></div>
    </dialog>
  </main>;
}
