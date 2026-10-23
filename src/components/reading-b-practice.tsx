"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronDown, Clock3, LoaderCircle, Pause, Play, X } from 'lucide-react';
import type { ReadingBAnswers, ReadingBAttempt, ReadingBContent } from '@/lib/reading-b';

export function ReadingBPractice({ task, isEnglish }: { task: { id: string; content: ReadingBContent }; isEnglish: boolean }) {
  const router = useRouter();
  const content = task.content;
  const endpoint = `/api/reading-b-attempts/${task.id}`;
  const back = `/?type=reading_b&year=${content.year}${isEnglish ? '&lang=en' : ''}`;
  const [answers, setAnswers] = useState<ReadingBAnswers>({});
  const [attempt, setAttempt] = useState<ReadingBAttempt | null>(null);
  const [active, setActive] = useState(41);
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
  const feedback = attempt?.feedback?.find(item => item.number === active);
  const activeQuestion = content.questions.find(question => question.number === active)!;

  useEffect(() => {
    let cancelled = false;
    fetch(endpoint).then(async response => {
      if (!response.ok) throw Error();
      const data = await response.json() as { attempt: ReadingBAttempt | null };
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

  const persist = useCallback((action: 'save' | 'submit' | 'redo', snapshot: ReadingBAnswers) => {
    const version = revision.current;
    const operation = queue.current.catch(() => {}).then(async () => {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, answers: snapshot, elapsedSeconds: seconds.current, attemptId: attemptId.current }) });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || (isEnglish ? 'Unable to save. Try again.' : '保存失败，请重试。'));
      const saved = data.attempt as ReadingBAttempt;
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
    if (submitted) document.querySelector('.reading-b-source mark')?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, [active, submitted]);

  function choose(letter: string, number = active) {
    if (!ready || submitted || busy || mutationLock.current) return;
    if (content.kind !== 'true_false' && Object.entries(answers).some(([key, choice]) => key !== String(number) && choice === letter)) return;
    revision.current++;
    setActive(number);
    setAnswers(previous => {
      const next = { ...previous };
      if (content.kind !== 'true_false' && Object.entries(next).some(([key, choice]) => key !== String(number) && choice === letter)) return previous;
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
        setAnswers({}); setElapsed(0); seconds.current = 0; setActive(41); setNotice('');
      } else {
        const firstWrong = saved.feedback?.find(item => saved.answers[String(item.number)] !== item.answer);
        setActive(firstWrong?.number ?? 41); setNotice('');
      }
    } catch (error) { setNotice(error instanceof Error ? error.message : '操作失败，请重试。'); }
    finally { mutationLock.current = false; setBusy(false); }
  }

  function focusQuestion(number: number) {
    setActive(number);
    if (content.kind === 'headings') document.getElementById(`reading-b-${number}`)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  const questionNavigation = <nav className={`reading-b-questions ${content.kind === 'matching' ? 'reading-b-people' : ''}`} aria-label={isEnglish ? 'Select question' : '选择题号'}>{content.questions.map(question => {
    const key = attempt?.feedback?.find(item => item.number === question.number);
    const correct = key && answers[String(question.number)] === key.answer;
    return <button key={question.number} disabled={!ready || busy} className={`${active === question.number ? 'is-active' : ''} ${submitted ? correct ? 'is-correct' : 'is-wrong' : ''}`} aria-pressed={active === question.number} onClick={() => focusQuestion(question.number)}>
      <span>{question.number}</span>{content.kind === 'matching' && <span className="reading-b-person-name">{question.label}</span>}<b>{answers[String(question.number)] ?? '—'}</b>{submitted && (correct ? <Check size={14} aria-label={isEnglish ? 'Correct' : '正确'} /> : <X size={14} aria-label={isEnglish ? 'Incorrect' : '错误'} />)}
    </button>;
  })}</nav>;

  const matchingOptions = <div className="reading-b-options" role="group" aria-label={isEnglish ? 'Shared options' : '共享选项'}>{content.options.map(option => {
    const selected = answers[String(active)] === option.letter;
    const uses = content.questions.filter(question => answers[String(question.number)] === option.letter).map(question => question.number);
    const occupied = uses.some(number => number !== active);
    return <button key={option.letter} className={`${selected ? 'is-selected' : ''} ${!submitted && occupied ? 'is-occupied' : ''} ${submitted && feedback?.answer === option.letter ? 'is-correct' : submitted && selected ? 'is-incorrect' : ''}`} disabled={!ready || busy || submitted || occupied} aria-pressed={selected} onClick={() => choose(option.letter)}>
      <span className="reading-b-option-letter">{option.letter}</span><span>{option.text}{uses.length > 0 && <small>{isEnglish ? 'Selected for ' : '已选用于 '}{uses.join('、')}</small>}</span>
    </button>;
  })}</div>;

  const saveStatus = <footer className="reading-b-save" aria-live="polite">{notice || (submitted ? (isEnglish ? 'Graded against the answer key' : '按参考答案判分') : (isEnglish ? 'Draft saved automatically' : '草稿自动保存'))}{saveFailed && dirty && !submitted && <button disabled={busy} onClick={() => { void persist('save', answers).catch(error => setNotice(error.message)); }}>{isEnglish ? 'Retry saving' : '重试保存'}</button>}</footer>;

  return <main className={`reading-b-page ${content.kind === 'matching' ? 'is-matching' : ''} ${submitted ? 'is-review' : 'is-exam'}`}>
    <header className="practice-header">
      <Link href={back} aria-label={isEnglish ? 'Back to practice' : '返回题目列表'} onClick={event => { if (ready && !event.metaKey && !event.ctrlKey) { event.preventDefault(); void act('back'); } }}><ArrowLeft /></Link>
      <strong>{content.year} / {isEnglish ? 'Reading Part B' : '阅读理解 Part B'}</strong>
      {!submitted && <span className="reading-b-header-count">{ready ? 5 - missing.length : '—'} / 5</span>}
      <div className="practice-timer-group"><button className="practice-timer" disabled={!ready || busy || submitted} onClick={() => setRunning(value => !value)}>
        {running ? <Pause /> : elapsed ? <Play /> : <Clock3 />}<span>{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</span>{running ? (isEnglish ? 'Pause' : '暂停') : (isEnglish ? 'Start' : '开始')}
      </button></div>
      <button className="header-submit" disabled={!ready || busy || (!submitted && missing.length === content.questions.length)} onClick={() => submitted || missing.length ? confirm.current?.showModal() : void act('submit')}>
        {busy && <LoaderCircle className="is-spinning" />}{submitted ? (isEnglish ? 'Try again' : '重新练习') : (isEnglish ? 'Submit' : '提交')}
      </button>
    </header>
    <div className="reading-b-layout">
      <section className="reading-b-source" aria-label={isEnglish ? 'Reading passage' : '阅读原文'}>
        <div className="reading-b-meta">{content.kind === 'headings' ? (isEnglish ? 'Subheading matching' : '小标题选择') : content.kind === 'matching' ? (isEnglish ? 'Information matching' : '信息匹配') : (isEnglish ? 'True or false' : '判断正误')} · {isEnglish ? '5 questions · 10 points' : '5 题 · 10 分'}</div>
        <p className="reading-b-directions">{content.directions}</p>
        {!ready && <div className="reading-b-loading">{notice ? <><p>{notice}</p><button onClick={() => setLoadRevision(value => value + 1)}>{isEnglish ? 'Retry' : '重新读取'}</button></> : <LoaderCircle className="is-spinning" aria-label={isEnglish ? 'Loading' : '正在读取'} />}</div>}
        {content.title && <h1>{content.title}</h1>}
        {content.paragraphs.map((paragraph, index) => <div key={index} id={paragraph.number ? `reading-b-${paragraph.number}` : undefined} className="reading-b-paragraph">
          {paragraph.number && <div className={`reading-b-gap reading-b-heading-answer ${active === paragraph.number ? 'is-active' : ''}`}>
            <button disabled={!ready || busy} aria-label={`${isEnglish ? 'Question' : '第'} ${paragraph.number}${isEnglish ? '' : ' 题'}`} onClick={() => setActive(paragraph.number!)}>{paragraph.number}.</button>
            <select className={!answers[String(paragraph.number)] ? 'is-placeholder' : undefined} aria-label={`${paragraph.number} ${isEnglish ? 'Answer' : '答案'}`} disabled={!ready || busy || submitted} value={answers[String(paragraph.number)] ?? ''} onChange={event => choose(event.target.value, paragraph.number!)}>
              <option value="">{isEnglish ? 'Choose a subheading' : '选择小标题'}</option>
              {content.options.map(option => <option key={option.letter} value={option.letter} disabled={Object.entries(answers).some(([number, letter]) => number !== String(paragraph.number) && letter === option.letter)}>{option.letter}. {option.text}</option>)}
            </select>
            <ChevronDown className="reading-b-select-chevron" aria-hidden="true" />
          </div>}
          <p>{submitted && feedback?.evidence && paragraph.text.includes(feedback.evidence)
            ? <>{paragraph.text.slice(0, paragraph.text.indexOf(feedback.evidence))}<mark>{feedback.evidence}</mark>{paragraph.text.slice(paragraph.text.indexOf(feedback.evidence) + feedback.evidence.length)}</>
            : paragraph.text}</p>
        </div>)}
        <small className="reading-b-source-note">{isEnglish ? 'Source: original paper, pages ' : '来源：原试卷第 '}{content.sourcePages.join('–')}{isEnglish ? '' : ' 页'}</small>
      </section>
      <section className="reading-b-answer" aria-label={isEnglish ? 'Your answers' : '作答与复盘'}>
        <div className="reading-b-answer-head"><div><span className="reading-b-meta">{submitted ? (isEnglish ? 'YOUR RESULT' : '作答结果') : (isEnglish ? 'YOUR ANSWERS' : '你的作答')}</span><h2>{submitted ? (isEnglish ? 'Review & improve' : '答案复盘') : content.kind === 'true_false' ? (isEnglish ? 'True or false' : '判断各项正误') : (isEnglish ? 'Match the options' : '选择对应选项')}</h2></div>
          {submitted ? <strong className="reading-b-score">{attempt?.score}<small> / 10</small></strong> : <span className="reading-b-count">{ready ? 5 - missing.length : '—'} / 5</span>}
        </div>
        {content.kind === 'matching' && <>
          {!submitted && <p className="reading-b-hint">{isEnglish ? 'Select a name on the left, then choose its matching option on the right. Each option can be used once.' : '先选人物，再选对应选项。每个选项仅可使用一次。'}</p>}
          <div className="reading-b-match-sheet">{questionNavigation}{matchingOptions}</div>
        </>}
        {content.kind === 'headings' && questionNavigation}
        {content.kind === 'true_false' && <div className="reading-b-true-false">{content.questions.map(question => {
          const key = attempt?.feedback?.find(item => item.number === question.number);
          return <article key={question.number} className={active === question.number ? 'is-active' : ''}>
            <button className="reading-b-statement" onClick={() => setActive(question.number)} aria-pressed={active === question.number}>{question.number}. {question.label}</button>
            <div role="group" aria-label={`${question.number} ${isEnglish ? 'Answer' : '答案'}`}>{content.options.map(option => <button key={option.letter} disabled={!ready || busy || submitted} aria-pressed={answers[String(question.number)] === option.letter} className={`${answers[String(question.number)] === option.letter ? 'is-selected' : ''} ${submitted && key?.answer === option.letter ? 'is-correct' : submitted && answers[String(question.number)] === option.letter ? 'is-incorrect' : ''}`} onClick={() => choose(option.letter,question.number)}>{option.letter} · {option.text}</button>)}</div>
          </article>;
        })}</div>}
          {content.kind === 'headings' && <div className="reading-b-current"><span>{active}</span><h3>{isEnglish ? `Paragraph ${active}` : `第 ${active} 题小标题`}</h3></div>}
          {content.kind === 'headings' && !submitted && <p className="reading-b-hint">{isEnglish ? 'Choose an option below. Select it again to clear.' : '点击下方选项作答，再次点击可取消。'}</p>}
          {submitted && feedback && <div className="reading-b-feedback">
            {content.kind !== 'headings' && <h3>{active}. {activeQuestion.label}</h3>}
            <p><span>{isEnglish ? 'Your answer' : '你的答案'}：{answers[String(active)] ?? (isEnglish ? 'Unanswered' : '未作答')}</span><strong>{isEnglish ? 'Correct answer' : '正确答案'}：{feedback.answer}</strong></p>
            <h4>{isEnglish ? 'Evidence' : '原文依据'}</h4><blockquote>{feedback.evidence}</blockquote>
            <h4>{isEnglish ? 'Why it matches' : '匹配依据'}</h4><p>{feedback.explanation}</p>
          </div>}
          {feedback && <p className="reading-b-reference-option">{feedback.answer}. {content.options.find(option => option.letter === feedback.answer)?.text}</p>}
        {content.kind === 'headings' && !submitted && matchingOptions}
        {saveStatus}
      </section>
    </div>
    <dialog ref={confirm} className="translation-redo-dialog" aria-labelledby="reading-b-confirm-title">
      <button className="translation-dialog-close" aria-label={isEnglish ? 'Close' : '关闭'} onClick={() => confirm.current?.close()}><X size={20} /></button>
      <h2 id="reading-b-confirm-title">{submitted ? (isEnglish ? 'Start again?' : '重新练习这篇文章？') : (isEnglish ? 'Submit with unanswered questions?' : '还有题目未作答，确认提交？')}</h2>
      <p>{submitted ? (isEnglish ? 'Start with blank answers. Your submitted attempt will be kept.' : '将开始一份空白作答，已提交的练习记录会保留。') : `${isEnglish ? 'Unanswered questions: ' : '未作答题号：'}${missing.map(question => question.number).join('、')}`}</p>
      <div className="translation-dialog-actions"><button autoFocus onClick={() => confirm.current?.close()}>{submitted ? (isEnglish ? 'Keep reviewing' : '继续复盘') : (isEnglish ? 'Continue answering' : '继续作答')}</button><button className="translation-primary" onClick={() => { confirm.current?.close(); void act(submitted ? 'redo' : 'submit'); }}>{submitted ? (isEnglish ? 'Start again' : '确认重做') : (isEnglish ? 'Submit' : '确认提交')}</button></div>
    </dialog>
  </main>;
}
