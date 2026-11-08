"use client";
import { DraftStatus } from "@/components/ui/draft-status";
import { PracticeActionBar } from "@/components/ui/practice-action-bar";
import { CompletionBadge } from "@/components/ui/completion-badge";
import { useRedoRequest } from "@/components/ui/use-redo-request";
import { useTaskAttempt } from "@/components/ui/use-task-attempt";
import { PracticeNotice } from "@/components/ui/practice-notice";
import { PracticeSelect } from "@/components/ui/practice-select";
import { PracticeChoice } from "@/components/ui/practice-choice";

import { PracticeDialog, PracticeDialogTitle } from "@/components/ui/practice-dialog";

import { Button } from "@/components/ui/button";

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft, Check, Clock3, LoaderCircle, Pause, Play, X } from 'lucide-react';
import type { ReadingBAnswers, ReadingBAttempt, ReadingBContent } from '@/lib/reading-b';
import { HighlightGuide, SelectableHighlight } from '@/components/selectable-highlight';

export function ReadingBPractice({ task, isEnglish }: { task: { id: string; content: ReadingBContent }; isEnglish: boolean }) {
  const content = task.content;
  const endpoint = `/api/reading-b-attempts/${task.id}`;
  const back = `/?type=reading_b&year=${content.year}${isEnglish ? '&lang=en' : ''}`;
  const {
    answers, setAnswers, attempt, active, setActive,
    ready, busy, notice, setNotice, elapsed, running, setRunning,
    dirty, setDirty, saveFailed, submitted, setLoadRevision,
    revisionRef, mutationLock, confirm, persist, act,
  } = useTaskAttempt<ReadingBAnswers, ReadingBAttempt>({ endpoint, back, isEnglish, initialActive: 41 });
  const missing = content.questions.filter(question => !answers[String(question.number)]);
  const feedback = attempt?.feedback?.find(item => item.number === active);
  const activeQuestion = content.questions.find(question => question.number === active)!;

  useEffect(() => {
    if (!submitted) return;
    document.querySelector('.reading-b-source .highlight-evidence')?.scrollIntoView({ block: 'center', behavior: 'instant' });
    if (content.kind === 'matching' && feedback) document.getElementById(`reading-b-option-${feedback.answer}`)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [active, submitted, content.kind, feedback]);

  function choose(letter: string, number = active) {
    if (!ready || submitted || busy || mutationLock.current) return;
    if (content.kind !== 'true_false' && Object.entries(answers).some(([key, choice]) => key !== String(number) && choice === letter)) return;
    revisionRef.current++;
    setActive(number);
    setAnswers(previous => {
      const next = { ...previous };
      if (content.kind !== 'true_false' && Object.entries(next).some(([key, choice]) => key !== String(number) && choice === letter)) return previous;
      if (!letter || next[String(number)] === letter) delete next[String(number)]; else next[String(number)] = letter;
      return next;
    });
    setDirty(true); setNotice(isEnglish ? 'Saving…' : '正在保存……');
  }

  function focusQuestion(number: number) {
    setActive(number);
    if (content.kind === 'headings') document.getElementById(`reading-b-${number}`)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  const questionNavigation = <nav className={`reading-b-questions ${content.kind === 'matching' ? 'reading-b-people' : ''}`} aria-label={isEnglish ? 'Select question' : '选择题号'}>{content.questions.map(question => {
    const key = attempt?.feedback?.find(item => item.number === question.number);
    const correct = key && answers[String(question.number)] === key.answer;
    return <Button id={`reading-b-question-${question.number}`} key={question.number} disabled={!ready || busy} className={`${active === question.number ? 'is-active' : ''} ${submitted ? correct ? 'is-correct' : 'is-wrong' : ''}`} aria-pressed={active === question.number} onClick={() => focusQuestion(question.number)}>
      <span>{question.number}</span>{content.kind === 'matching' && <span className="reading-b-person-name">{question.label}</span>}<b>{answers[String(question.number)] ?? '—'}</b>{submitted && (correct ? <Check data-icon-size="14" aria-label={isEnglish ? 'Correct' : '正确'} /> : <X data-icon-size="14" aria-label={isEnglish ? 'Incorrect' : '错误'} />)}
    </Button>;
  })}</nav>;

  const reviewFeedback = submitted && feedback ? <div className="reading-b-feedback">
            {content.kind !== 'headings' && <h3>{active}. {activeQuestion.label}</h3>}
            <p className="reading-b-answer-comparison"><span>{isEnglish ? 'Your answer' : '你的答案'}：{answers[String(active)] ?? (isEnglish ? 'Unanswered' : '未作答')}</span><strong>{isEnglish ? 'Correct answer' : '正确答案'}：{feedback.answer}</strong></p>
            <h4>{isEnglish ? 'Evidence' : '原文依据'}</h4><blockquote>{feedback.evidence}</blockquote>
            <h4>{isEnglish ? 'Why it matches' : '匹配依据'}</h4><p>{feedback.explanation}</p>
          </div> : null;

  const matchingOptions = <div className="reading-b-options" role="group" aria-label={isEnglish ? 'Shared options' : '共享选项'}>{content.options.map(option => {
    const selected = answers[String(active)] === option.letter;
    const uses = content.questions.filter(question => answers[String(question.number)] === option.letter).map(question => question.number);
    const occupied = uses.some(number => number !== active);
    return <div key={option.letter} id={`reading-b-option-${option.letter}`} className="reading-b-option"><PracticeChoice className={`${selected ? 'is-selected' : ''} ${!submitted && occupied ? 'is-occupied' : ''} ${submitted && feedback?.answer === option.letter ? 'is-correct' : submitted && selected ? 'is-incorrect' : ''}`} disabled={!ready || busy || submitted || occupied} selected={selected} onChange={() => choose(option.letter)}>
      <span className="reading-b-option-letter">{option.letter}</span><span>{option.text}{uses.length > 0 && <small>{isEnglish ? 'Selected for ' : '已选用于 '}{uses.join('、')}</small>}</span>
    </PracticeChoice>{content.kind === 'matching' && submitted && feedback?.answer === option.letter && reviewFeedback}</div>;
  })}</div>;

  const saveStatus = !submitted && <DraftStatus tone={saveFailed ? "error" : "default"}>{notice || (isEnglish ? 'Draft saved automatically' : '草稿自动保存')}{saveFailed && dirty && !submitted && <Button disabled={busy} onClick={() => { void persist('save', answers).catch(error => setNotice(error.message)); }}>{isEnglish ? 'Retry saving' : '重试保存'}</Button>}</DraftStatus>;

  useRedoRequest(ready && submitted, () => confirm.current?.showModal());
  return <main className={`reading-b-page ${content.kind === 'matching' ? 'is-matching' : ''} ${submitted ? 'is-review' : 'is-exam'}`}>
    <header className="practice-header">
      <Link href={back} aria-label={isEnglish ? 'Back to practice' : '返回题目列表'} onClick={event => { if (ready && !event.metaKey && !event.ctrlKey) { event.preventDefault(); void act('back'); } }}><ArrowLeft /></Link>
      <strong>{content.year} / {isEnglish ? 'Reading Part B' : '阅读理解 Part B'}</strong>
      {!submitted && <span className="reading-b-header-count">{ready ? 5 - missing.length : '—'} / 5</span>}
      <div className="practice-timer-group"><Button className="practice-timer" disabled={!ready || busy || submitted} onClick={() => setRunning(value => !value)}>
        {running ? <Pause /> : elapsed ? <Play /> : <Clock3 />}<span>{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</span>{running ? (isEnglish ? 'Pause' : '暂停') : (isEnglish ? 'Start' : '开始')}
      </Button></div>
      {submitted ? <CompletionBadge>{isEnglish ? "Submitted" : "已提交"}</CompletionBadge> :       <Button className="header-submit" disabled={!ready || busy || (!submitted && missing.length === content.questions.length)} onClick={() => submitted || missing.length ? confirm.current?.showModal() : void act('submit')}>
        {busy && <LoaderCircle className="is-spinning" />}{submitted ? (isEnglish ? 'Try again' : '重新练习') : (isEnglish ? 'Submit' : '提交')}
      </Button>}
    </header>
    <div className="reading-b-layout">
      <section className="reading-b-source" aria-label={isEnglish ? 'Reading passage' : '阅读原文'}>
        <div className="reading-b-meta">{content.kind === 'headings' ? (isEnglish ? 'Subheading matching' : '小标题选择') : content.kind === 'matching' ? (isEnglish ? 'Information matching' : '信息匹配') : (isEnglish ? 'True or false' : '判断正误')} · {isEnglish ? '5 questions · 10 points' : '5 题 · 10 分'}</div>
        <p className="reading-b-directions">{content.directions}</p>
        {!ready && <div className="reading-b-loading">{notice ? <><PracticeNotice>{notice}</PracticeNotice><Button onClick={() => setLoadRevision(value => value + 1)}>{isEnglish ? 'Retry' : '重新读取'}</Button></> : <LoaderCircle className="is-spinning" aria-label={isEnglish ? 'Loading' : '正在读取'} />}</div>}
        {content.title && <h1>{content.title}</h1>}
        <HighlightGuide isEnglish={isEnglish} />
        {content.paragraphs.map((paragraph, index) => <div key={index} id={paragraph.number ? `reading-b-${paragraph.number}` : undefined} className="reading-b-paragraph">
          {paragraph.number && <div className={`reading-b-gap reading-b-heading-answer ${active === paragraph.number ? 'is-active' : ''}`}>
            <Button disabled={!ready || busy} aria-label={`${isEnglish ? 'Question' : '第'} ${paragraph.number}${isEnglish ? '' : ' 题'}`} onClick={() => setActive(paragraph.number!)}>{paragraph.number}.</Button>
            <PracticeSelect label={`${paragraph.number} ${isEnglish ? 'Answer' : '答案'}`} disabled={!ready || busy || submitted} value={answers[String(paragraph.number)] ?? ''} placeholder={isEnglish ? 'Choose a subheading' : '选择小标题'} onChange={value => choose(value, paragraph.number!)} options={content.options.map(option => ({ ...option, disabled: Object.entries(answers).some(([number, letter]) => number !== String(paragraph.number) && letter === option.letter) }))} />
          </div>}
          <p><SelectableHighlight key={`${task.id}:${index}`} text={paragraph.text} scope={`passage:${index}`} storageKey={`reading-b-highlights:${task.id}`} isEnglish={isEnglish} evidence={submitted ? feedback?.evidence : undefined} /></p>
        </div>)}
        <small className="reading-b-source-note">{isEnglish ? 'Source: original paper, pages ' : '来源：原试卷第 '}{content.sourcePages.join('–')}{isEnglish ? '' : ' 页'}</small>
      </section>
      <section className="reading-b-answer reading-b-answer-shell" aria-label={isEnglish ? 'Your answers' : '作答与复盘'}>
        <div className="reading-b-answer-content">
        <div className="reading-b-answer-head"><div>{!submitted && <span className="reading-b-meta">{isEnglish ? 'YOUR ANSWERS' : '你的作答'}</span>}<h2>{submitted ? (isEnglish ? 'Review & improve' : '答案复盘') : content.kind === 'true_false' ? (isEnglish ? 'True or false' : '判断各项正误') : (isEnglish ? 'Match the options' : '选择对应选项')}</h2></div>
          {!submitted && <span className="reading-b-count">{ready ? 5 - missing.length : '—'} / 5</span>}
        </div>
        {content.kind === 'matching' && <>
          {!submitted && <p className="reading-b-hint">{isEnglish ? 'Select a name on the left, then choose its matching option on the right. Each option can be used once.' : '先选人物，再选对应选项。每个选项仅可使用一次。'}</p>}
          <div className="reading-b-match-sheet">{questionNavigation}{matchingOptions}</div>
        </>}
        {content.kind === 'headings' && questionNavigation}
        {content.kind === 'true_false' && <div className="reading-b-true-false">{content.questions.map(question => {
          const key = attempt?.feedback?.find(item => item.number === question.number);
          return <article key={question.number} className={active === question.number ? 'is-active' : ''}>
            <Button className="reading-b-statement" onClick={() => setActive(question.number)} aria-pressed={active === question.number}>{question.number}. {question.label}</Button>
            <div role="group" aria-label={`${question.number} ${isEnglish ? 'Answer' : '答案'}`}>{content.options.map(option => <PracticeChoice key={option.letter} disabled={!ready || busy || submitted} selected={answers[String(question.number)] === option.letter} className={`${answers[String(question.number)] === option.letter ? 'is-selected' : ''} ${submitted && key?.answer === option.letter ? 'is-correct' : submitted && answers[String(question.number)] === option.letter ? 'is-incorrect' : ''}`} onChange={() => choose(option.letter,question.number)}>{option.letter} · {option.text}</PracticeChoice>)}</div>
          </article>;
        })}</div>}
          {content.kind === 'headings' && <div className="reading-b-current"><span>{active}</span><h3>{isEnglish ? `Paragraph ${active}` : `第 ${active} 题小标题`}</h3></div>}
          {content.kind === 'headings' && !submitted && <p className="reading-b-hint">{isEnglish ? 'Choose an option below. Select it again to clear.' : '点击下方选项作答，再次点击可取消。'}</p>}
          {content.kind !== 'matching' && reviewFeedback}
          {content.kind !== 'matching' && feedback && <p className="reading-b-reference-option">{feedback.answer}. {content.options.find(option => option.letter === feedback.answer)?.text}</p>}
        {content.kind === 'headings' && !submitted && matchingOptions}
        {saveStatus}
        </div>
        {submitted && <PracticeActionBar summary={<>{isEnglish ? "Score" : "得分"} <strong>{attempt?.score} / 10</strong></>} actions={[
          { id: "home", label: isEnglish ? "Back to library" : "返回首页", variant: "secondary", href: back },
          { id: "redo", label: isEnglish ? "Redo" : "重新练习", variant: "primary", disabled: busy, onPress: () => confirm.current?.showModal() },
        ]} />}
      </section>
    </div>
    <PracticeDialog ref={confirm} className="translation-redo-dialog" aria-labelledby="reading-b-confirm-title">
      <Button className="translation-dialog-close" aria-label={isEnglish ? 'Close' : '关闭'} onClick={() => confirm.current?.close()}><X data-icon-size="20" /></Button>
      <PracticeDialogTitle id="reading-b-confirm-title">{submitted ? (isEnglish ? 'Start again?' : '重新练习这篇文章？') : (isEnglish ? 'Submit with unanswered questions?' : '还有题目未作答，确认提交？')}</PracticeDialogTitle>
      <p>{submitted ? (isEnglish ? 'Start with blank answers. Your submitted attempt will be kept.' : '将开始一份空白作答，已提交的练习记录会保留。') : `${isEnglish ? 'Unanswered questions: ' : '未作答题号：'}${missing.map(question => question.number).join('、')}`}</p>
      <div className="translation-dialog-actions"><Button variant="secondary" autoFocus onClick={() => { confirm.current?.close(); if (!submitted && missing[0]) { focusQuestion(missing[0].number); document.getElementById(`reading-b-question-${missing[0].number}`)?.focus(); } }}>{submitted ? (isEnglish ? 'Keep reviewing' : '继续复盘') : (isEnglish ? 'Check unanswered' : '返回检查')}</Button><Button variant="primary" className="translation-primary" onClick={() => { confirm.current?.close(); void act(submitted ? 'redo' : 'submit'); }}>{submitted ? (isEnglish ? 'Start again' : '确认重做') : (isEnglish ? 'Submit anyway' : '仍然提交')}</Button></div>
    </PracticeDialog>
  </main>;
}
