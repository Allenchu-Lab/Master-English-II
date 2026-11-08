"use client";
import { DraftStatus } from "@/components/ui/draft-status";
import { PracticeActionBar } from "@/components/ui/practice-action-bar";
import { CompletionBadge } from "@/components/ui/completion-badge";
import { useRedoRequest } from "@/components/ui/use-redo-request";
import { useTaskAttempt } from "@/components/ui/use-task-attempt";
import { PracticeNotice } from "@/components/ui/practice-notice";
import { PracticeChoice } from "@/components/ui/practice-choice";

import { PracticeDialog, PracticeDialogTitle } from "@/components/ui/practice-dialog";

import { Button } from "@/components/ui/button";

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft, Check, Clock3, LoaderCircle, Pause, Play, X } from 'lucide-react';
import type { ClozeAnswers, ClozeAttempt, ClozeContent } from '@/lib/cloze';
import { HighlightGuide, SelectableHighlight } from '@/components/selectable-highlight';

export function ClozePractice({ task, isEnglish }: { task: { id: string; content: ClozeContent }; isEnglish: boolean }) {
  const content = task.content;
  const endpoint = `/api/cloze-attempts/${task.id}`;
  const back = `/?type=cloze&year=${content.year}${isEnglish ? '&lang=en' : ''}`;
  const {
    answers, setAnswers, attempt, active, setActive,
    ready, busy, notice, setNotice, elapsed, running, setRunning,
    dirty, setDirty, saveFailed, submitted, setLoadRevision,
    revisionRef, mutationLock, confirm, persist, act,
  } = useTaskAttempt<ClozeAnswers, ClozeAttempt>({ endpoint, back, isEnglish, initialActive: 1 });
  const missing = content.questions.filter(question => !answers[String(question.number)]);

  useEffect(() => {
    if (!submitted) return;
    document.getElementById(`cloze-blank-${active}`)?.scrollIntoView({ block: 'center', behavior: 'instant' });
    document.getElementById(`cloze-question-${active}`)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [active, submitted]);

  function choose(letter: string, number = active) {
    if (!ready || submitted || busy || mutationLock.current) return;
    revisionRef.current++;
    setActive(number);
    setAnswers(previous => {
      const next = { ...previous };
      if (!letter || next[String(number)] === letter) delete next[String(number)]; else next[String(number)] = letter;
      return next;
    });
    setDirty(true); setNotice(isEnglish ? 'Saving…' : '正在保存……');
  }

  function focusQuestion(number: number, fromSource = false) {
    setActive(number);
    document.getElementById(fromSource ? `cloze-question-${number}` : `cloze-blank-${number}`)?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }

  useRedoRequest(ready && submitted, () => confirm.current?.showModal());
  return <main className={`reading-b-page cloze-page ${submitted ? 'is-review' : 'is-exam'}`}>
    <header className="practice-header">
      <Link href={back} aria-label={isEnglish ? 'Back to practice' : '返回题目列表'} onClick={event => { if (ready && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); void act('back'); } }}><ArrowLeft /></Link>
      <strong>{content.year} / {isEnglish ? 'Cloze' : '完形填空'}</strong>
      <div className="practice-timer-group"><Button className="practice-timer" disabled={!ready || busy || submitted} onClick={() => setRunning(value => !value)}>
        {running ? <Pause /> : elapsed ? <Play /> : <Clock3 />}<span>{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</span>{running ? (isEnglish ? 'Pause' : '暂停') : (isEnglish ? 'Start' : '开始')}
      </Button></div>
      {submitted ? <CompletionBadge>{isEnglish ? "Submitted" : "已提交"}</CompletionBadge> :       <Button className="header-submit" disabled={!ready || busy || (!submitted && missing.length === 20)} onClick={() => submitted || missing.length ? confirm.current?.showModal() : void act('submit')}>
        {busy && <LoaderCircle className="is-spinning" />}{submitted ? (isEnglish ? 'Try again' : '重新练习') : (isEnglish ? 'Submit' : '提交')}
      </Button>}
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
          return <Button key={i} id={`cloze-blank-${number}`} className={`cloze-blank ${active === number ? 'is-active' : ''} ${submitted ? correct ? 'is-correct' : 'is-wrong' : ''}`} aria-label={`${isEnglish ? 'Question' : '第'} ${number}${isEnglish ? '' : ' 题'}${word ? `: ${word}` : ''}`} aria-pressed={active === number} disabled={!ready || busy} onClick={() => focusQuestion(number,true)}><sup>{number}</sup>{word || '\u00a0\u00a0\u00a0'}</Button>;
        })}</p>)}
        <small className="reading-b-source-note">{isEnglish ? 'Source: original paper, pages ' : '来源：原试卷第 '}{content.sourcePages.join('–')}{isEnglish ? '' : ' 页'}</small>
      </section>
      <section className="reading-b-answer cloze-answer reading-b-answer-shell" aria-label={isEnglish ? 'Your answers' : '作答与复盘'}>
        <div className="reading-b-answer-content">
        <div className="cloze-answer-top">
          <div className="reading-b-answer-head"><div>{!submitted && <span className="reading-b-meta">{isEnglish ? 'YOUR ANSWERS' : '你的作答'}</span>}<h2>{submitted ? (isEnglish ? 'Review answers' : '答案复盘') : (isEnglish ? 'Choose the best answer' : '选择最佳选项')}</h2></div>
            {!submitted && <span className="reading-b-count">{ready ? 20-missing.length : '—'} / 20</span>}
          </div>
          <nav className="cloze-question-nav" aria-label={isEnglish ? 'Select question' : '选择题号'}>{content.questions.map(question => {
            const key = attempt?.feedback?.find(item => item.number === question.number);
            const correct = key && answers[String(question.number)] === key.answer;
            return <Button key={question.number} disabled={!ready || busy} aria-pressed={active === question.number} aria-label={`${question.number}${submitted ? correct ? (isEnglish ? ' Correct' : ' 正确') : (isEnglish ? ' Incorrect' : ' 错误') : ''}`} className={`${active === question.number ? 'is-active' : ''} ${answers[String(question.number)] ? 'is-answered' : ''} ${submitted ? correct ? 'is-correct' : 'is-wrong' : ''}`} onClick={() => { focusQuestion(question.number); document.getElementById(`cloze-question-${question.number}`)?.scrollIntoView({block:'start',behavior:'instant'}); }}>{question.number}</Button>;
          })}</nav>
        </div>
        {!ready ? <div className="reading-b-loading">{notice ? <><PracticeNotice>{notice}</PracticeNotice><Button onClick={() => setLoadRevision(value => value+1)}>{isEnglish ? 'Retry' : '重新读取'}</Button></> : <LoaderCircle className="is-spinning" aria-label={isEnglish ? 'Loading' : '正在读取'} />}</div> : <div className="cloze-question-list">{content.questions.map(question => {
          const key = attempt?.feedback?.find(item => item.number === question.number);
          const correct = key && answers[String(question.number)] === key.answer;
          return <article id={`cloze-question-${question.number}`} key={question.number} className={`cloze-question ${active === question.number ? 'is-active' : ''}`}>
            <div className="cloze-question-title"><Button onClick={() => focusQuestion(question.number)} aria-label={`${isEnglish ? 'Locate blank' : '定位原文空格'} ${question.number}`}>{question.number.toString().padStart(2,'0')}</Button>{submitted && <span className={correct ? 'is-correct' : 'is-wrong'}>{correct ? <Check data-icon-size="14" /> : <X data-icon-size="14" />}{correct ? (isEnglish ? 'Correct' : '正确') : (isEnglish ? `Correct answer: ${key?.answer}` : `正确答案：${key?.answer}`)} · {correct ? '0.5' : '0'} / 0.5</span>}</div>
            <div className="cloze-choices" role="group" aria-label={`${question.number} ${isEnglish ? 'Answer' : '答案'}`}>{question.options.map((option,index) => {
              const letter = String.fromCharCode(65+index);
              const selected = answers[String(question.number)] === letter;
              return <PracticeChoice key={letter} disabled={busy || submitted} selected={selected} className={`${selected ? 'is-selected' : ''} ${submitted && key?.answer === letter ? 'is-correct' : submitted && selected ? 'is-wrong' : ''}`} onChange={() => choose(letter,question.number)}><span>{letter}</span>{option}</PracticeChoice>;
            })}</div>
            {submitted && key && <p className="cloze-explanation">{key.explanation}</p>}
          </article>;
        })}</div>}
        {!submitted && <DraftStatus tone={saveFailed ? "error" : "default"}>{notice || (isEnglish ? 'Draft saved automatically' : '草稿自动保存')}{saveFailed && dirty && !submitted && <Button disabled={busy} onClick={() => { void persist('save',answers).catch(error => setNotice(error.message)); }}>{isEnglish ? 'Retry saving' : '重试保存'}</Button>}</DraftStatus>}
        </div>
        {submitted && <PracticeActionBar summary={<>{isEnglish ? "Score" : "得分"} <strong>{attempt?.score} / 10</strong></>} actions={[
          { id: "home", label: isEnglish ? "Back to library" : "返回首页", variant: "secondary", href: back },
          { id: "redo", label: isEnglish ? "Redo" : "重新练习", variant: "secondary", disabled: busy, onPress: () => confirm.current?.showModal() },
          { id: "review", label: isEnglish ? "Review answers" : "查看复盘", variant: "primary", onPress: () => document.querySelector('.reading-b-answer-content')?.scrollTo({ top: 0, behavior: 'instant' }) },
        ]} />}
      </section>
    </div>
    <PracticeDialog ref={confirm} className="translation-redo-dialog" aria-labelledby="cloze-confirm-title">
      <Button className="translation-dialog-close" aria-label={isEnglish ? 'Close' : '关闭'} onClick={() => confirm.current?.close()}><X data-icon-size="20" /></Button>
      <PracticeDialogTitle id="cloze-confirm-title">{submitted ? (isEnglish ? 'Start again?' : '重新练习这篇文章？') : (isEnglish ? 'Submit with unanswered questions?' : '还有题目未作答，确认提交？')}</PracticeDialogTitle>
      <p>{submitted ? (isEnglish ? 'Start with blank answers. Your submitted attempt will be kept.' : '将开始一份空白作答，已提交的练习记录会保留。') : `${isEnglish ? 'Unanswered questions: ' : '未作答题号：'}${missing.map(q=>q.number).join('、')}`}</p>
      <div className="translation-dialog-actions"><Button variant="secondary" autoFocus onClick={() => { confirm.current?.close(); if (!submitted && missing[0]) focusQuestion(missing[0].number, true); }}>{submitted ? (isEnglish ? 'Keep reviewing' : '继续复盘') : (isEnglish ? 'Check unanswered' : '返回检查')}</Button><Button variant="primary" className="translation-primary" onClick={() => { confirm.current?.close(); void act(submitted ? 'redo' : 'submit'); }}>{submitted ? (isEnglish ? 'Start again' : '确认重做') : (isEnglish ? 'Submit anyway' : '仍然提交')}</Button></div>
    </PracticeDialog>
  </main>;
}
