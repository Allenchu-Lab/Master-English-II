"use client";
import { ReviewScore } from "@/components/ui/review-score";
import { ReviewOriginal } from "@/components/ui/review-original";
import { DraftStatus } from "@/components/ui/draft-status";
import { PracticeActionBar } from "@/components/ui/practice-action-bar";
import { ReviewProgress } from "@/components/ui/review-progress";
import { CompletionBadge } from "@/components/ui/completion-badge";
import { Tabs } from "@heroui/react/tabs";
import { requestReview } from "@/lib/request-review";
import type { ReviewStage } from "@/lib/review-stream";
import { useRedoRequest } from "@/components/ui/use-redo-request";
import { PracticeBadge } from "@/components/ui/practice-badge";

import { TextArea } from "@heroui/react/textarea";

import { PracticeDialog, PracticeDialogTitle, type PracticeDialogHandle } from "@/components/ui/practice-dialog";

import { Button } from "@/components/ui/button";
import { DraftSaveError } from "@/lib/draft-save";
import { useDraftAutosave, useMutationQueue, useUnsavedGuard } from "@/components/ui/use-draft-autosave";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { translationBand, type TranslationSentence, type TranslationDeduction } from '@/lib/translation-review';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Clock3, LoaderCircle, Pause, Play, X } from 'lucide-react';
type Review={rubricVersion?:number;score:number;summary:string;reference:string;patterns?:{original:string;explanation:string;usage:string}[];vocabulary?:{word:string;meaning:string;usage:string}[];sentences:TranslationSentence[]};
type Attempt={id:string;review:Review|null;elapsed_seconds:number;answer:string;submitted_at:string|null};
export function TranslationPractice({task,year,isEnglish}:{task:{id:string;passage:string};year:number;isEnglish:boolean}) {
  const router=useRouter();
  const [savedAnswer,setSavedAnswer]=useState('');
  const redoDialog=useRef<PracticeDialogHandle>(null);
  const [panel,setPanel]=useState('feedback');
  const [attemptId,setAttemptId]=useState('');
  const [review,setReview]=useState<Review|null>(null);
  const [reviewing,setReviewing]=useState(false);
  const [reviewStage,setReviewStage]=useState<ReviewStage>(0);
  const reviewLock=useRef(false);
  async function getReview(id=attemptId){if(reviewLock.current)return;reviewLock.current=true;setReviewStage(0);setReviewing(true);setNotice('');try{const r=await requestReview(`${endpoint}/review`,id,setReviewStage);if(!r.ok||!r.data||typeof r.data!=='object'||!('review' in r.data))throw Error(r.data && typeof r.data==='object' && 'error' in r.data && typeof r.data.error==='string' ? r.data.error : '批改失败，译文已保留，请重试。');setReview(r.data.review as Review);}catch(error){setNotice(error instanceof Error ? error.message : (isEnglish?'Review failed. Your response is saved. Try again.':'批改失败，译文已保留，请重试。'));}finally{reviewLock.current=false;setReviewing(false);}}
  const [answer,setAnswer]=useState('');
  const [submitted,setSubmitted]=useState(false);
  const issues=submitted&&review?.rubricVersion===2?review.sentences.flatMap(sentence=>(sentence.deductions??[]).map(item=>({...item,original:sentence.original}))):[];
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [elapsed,setElapsed]=useState(0);
  const [running,setRunning]=useState(false);
  useEffect(()=>{if(!running||submitted)return;const timer=setInterval(()=>setElapsed(value=>value+1),1000);return()=>clearInterval(timer);},[running,submitted]);
  const saveQueue=useMutationQueue();
  const mutationLock=useRef(false);
  const endpoint=`/api/translation-attempts/${task.id}`;
  useEffect(()=>{let cancelled=false; fetch(endpoint).then(r=>{if(!r.ok)throw Error();return r.json();}).then(({attempt}:{attempt:Attempt|null})=>{if(cancelled)return;setAttemptId(attempt?.id??'');setReview(attempt?.review??null);setAnswer(attempt?.answer??'');setSavedAnswer(attempt?.answer??'');setElapsed(attempt?.elapsed_seconds??0);setSubmitted(Boolean(attempt?.submitted_at));setReady(true);}).catch(()=>setNotice(isEnglish?'Unable to load. Refresh to retry.':'读取失败，请刷新重试。'));return()=>{cancelled=true;};},[endpoint,isEnglish]);
  const dirty=ready&&!submitted&&answer!==savedAnswer;
  useUnsavedGuard(dirty);
  useDraftAutosave({
    enabled: ready && !submitted && !busy && dirty,
    snapshot: answer,
    blocked: () => mutationLock.current,
    save: () => saveQueue.enqueue(async () => {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, elapsedSeconds: elapsed, action: 'save' }) });
      if (!response.ok) throw new DraftSaveError(response.status);
      setSavedAnswer(answer);
      setNotice(isEnglish ? 'Draft saved' : '草稿已保存');
    }),
    onError: () => setNotice(isEnglish ? 'Save failed. Please retry.' : '保存失败，请稍后重试。'),
  });
  async function act(action:'submit'|'redo'|'back'){
    if(mutationLock.current)return;
    mutationLock.current=true;
    setRunning(false);setBusy(true);
    try{
      await saveQueue.drain();
      if(action==='back'&&!dirty){router.push(`/?type=translation&year=${year}${isEnglish?'&lang=en':''}`);return;}
      const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answer,elapsedSeconds:action==='redo'?0:elapsed,action:action==='back'?'save':action})});
      if(!r.ok)throw Error();
      const {attempt}=await r.json();
      setAttemptId(attempt.id);setReview(attempt.review??null);setAnswer(attempt.answer);setSavedAnswer(attempt.answer);setSubmitted(Boolean(attempt.submitted_at));setNotice('');
      if(action==='redo')setElapsed(0);
      if(action==='submit')void getReview(attempt.id);
      if(action==='back')router.push(`/?type=translation&year=${year}${isEnglish?'&lang=en':''}`);
    }catch{setNotice(isEnglish?'Unable to save. Your response is still here. Try again.':'保存失败，译文仍保留在当前页面，请重试。');}
    finally{mutationLock.current=false;setBusy(false);}
  }

  useRedoRequest(ready && submitted, () => redoDialog.current?.showModal());
  return <main className="writing-page translation-page"><header className="practice-header"><Link href={`/?type=translation&year=${year}${isEnglish?'&lang=en':''}`} aria-label={isEnglish?'Back':'返回'} onClick={event=>{if(ready&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();void act('back');}}}><ArrowLeft /></Link><strong>{year} / {isEnglish?'Translation':'翻译'}</strong><div className="practice-timer-group"><Button className="practice-timer" disabled={!ready||submitted} onClick={()=>setRunning(value=>!value)}>{running?<Pause/>:elapsed?<Play/>:<Clock3/>}<span>{String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}</span>{running?(isEnglish?'Pause':'暂停'):(isEnglish?'Start':'开始')}</Button></div><div className="practice-header-actions">{submitted ? <CompletionBadge>{isEnglish ? "Submitted" : "已提交"}</CompletionBadge> : <Button variant="primary" className="header-submit" disabled={!ready || busy || reviewing || !answer.trim()} aria-busy={busy} onClick={() => void act('submit')}>{busy ? (isEnglish ? "Submitting…" : "正在提交…") : (isEnglish ? "Submit" : "提交作答")}</Button>}</div></header><div className="writing-layout"><section className="writing-prompt-pane"><div className="writing-prompt"><span className="writing-question-number">46. TRANSLATION · 15 {isEnglish?'points':'分'}</span><p className="translation-instructions">{isEnglish?'Translate the following text into Chinese.':'将下列英文内容翻译成中文。'}</p>{issues.length>0?<small className="translation-highlight-key">{isEnglish?'Highlighted text indicates scoring issues. See the review for details.':'浅橙色标记为失分对应片段，具体原因见右侧批阅。'}</small>:null}{task.passage.split(/\n\s*\n/).map((paragraph,index)=><p key={index}><TranslationHighlights text={paragraph} issues={issues} source/></p>)}</div></section><section className={`writing-editor-pane ${submitted?'translation-result-pane':''}`}>
      {!submitted && <>       <header><div><strong>{isEnglish?'Review & reflection':'批阅和复盘'}</strong></div><>{!submitted && <PracticeBadge className="translation-status">{isEnglish?'15 points':'满分 15 分'}</PracticeBadge>}</></header> </>}
      <div className="writing-editor">
        {submitted && <h2 className="review-page-title">{isEnglish ? "Review & reflection" : "批阅和复盘"}</h2>}
        {!ready?<div className="translation-review-state"><LoaderCircle className="is-spinning"/><p>{isEnglish?'Loading your response…':'正在读取译文……'}</p></div>:submitted?<div className="translation-review">
          {review?<>
            <ReviewScore score={review.score} total={15} band={translationBand(review.score)} english={isEnglish} summary={review.summary} />
<ReviewOriginal label={isEnglish ? "My response" : "我的作答"}><p>{answer}</p></ReviewOriginal>

            <Tabs variant="primary" className="analysis-tabs" selectedKey={panel} onSelectionChange={key => setPanel(String(key))}><Tabs.ListContainer><Tabs.List aria-label={isEnglish ? 'Review sections' : '批阅内容'}>{[['feedback',isEnglish ? 'Scoring issues' : '失分批阅'],['reference',isEnglish ? 'Reference' : '参考译文'],['notes',isEnglish ? 'Key takeaways' : '句式与词汇']].map(([key,label]) => <Tabs.Tab key={key} id={key}>{label}<Tabs.Indicator /></Tabs.Tab>)}</Tabs.List></Tabs.ListContainer>
            <Tabs.Panel id={panel}>{panel==='feedback'?<section className="translation-feedback" aria-label={isEnglish ? 'Scoring issues' : '失分批阅'}>
              {review.rubricVersion !== 2 ? <div className="translation-legacy-review"><p>{isEnglish?'This older review has no detailed error annotations.':'这份旧批阅尚无具体失分标记，需按英语二分档标准重新批阅。'}</p><Button variant="primary" className="translation-primary" disabled={reviewing} onClick={()=>getReview()}>{reviewing?(isEnglish?'Reviewing…':'正在补充……'):(isEnglish?'Add error details':'补充扣分明细')}</Button>{reviewing && <ReviewProgress english={isEnglish} kind="translation" stage={reviewStage} />}</div> : <header className="translation-feedback-intro">
                <PracticeBadge>{issues.length ? (isEnglish ? `${issues.length} scoring issues` : `${issues.length} 处失分问题`) : (isEnglish ? 'No clear scoring issues' : '未发现明显失分问题')}</PracticeBadge>
                <p className="translation-caption">{isEnglish ? 'Holistic scoring, not fixed penalties per word. Only passages with scoring issues are shown below.' : '按全文分档估分，不逐词扣分。下方仅展示存在失分问题的内容。'}</p>
              </header>}
              {review.sentences.filter(item=>(item.deductions?.length??0)>0).map((item,index)=><article className="translation-sentence" key={index}><header><span>{String(index+1).padStart(2,'0')}</span><blockquote><TranslationHighlights text={item.original} issues={(item.deductions??[]).map(issue=>({...issue,original:item.original}))} source/></blockquote></header><div className={`translation-error-status ${item.deductions?.length?'has-deductions':''}`}>{item.deductions?.length?(isEnglish?`${item.deductions.length} scoring issue(s)`:`${item.deductions.length} 处失分问题`):item.deductions?(isEnglish?'No scoring issue':'无失分问题'):(isEnglish?'Details not available':'尚无失分明细')}</div><dl><div><dt>{isEnglish?'Your translation':'我的译文'}</dt><dd>{item.translation?<TranslationHighlights text={item.translation} issues={(item.deductions??[]).map(issue=>({...issue,original:item.original}))}/>:isEnglish?'Not translated':'未翻译'}</dd></div>{item.deductions?.length?item.deductions.map((issue,issueIndex)=><div className="translation-deduction" key={issueIndex}><dt>{isEnglish?({meaning:'Mistranslation',omission:'Omission',logic:'Logic error',expression:'Unclear expression'}[issue.category]):({meaning:'词义错译',omission:'漏译',logic:'逻辑关系错误',expression:'表达不清'}[issue.category])}<span>{issue.severity==='major'?(isEnglish?'Major':'重大问题'):(isEnglish?'Minor':'局部问题')}</span></dt><dd>{issue.reason}</dd></div>):<div><dt>{isEnglish?'Assessment':'批阅依据'}</dt><dd>{item.reason}</dd></div>}<div className="translation-suggestion"><dt>{isEnglish?'Improve':'提升建议'}</dt><dd>{item.suggestion}</dd></div></dl></article>)}</section>:panel==='reference'?<section className="translation-reference" aria-label={isEnglish ? "Reference translation" : "参考译文"}><p className="translation-caption">{isEnglish?'One valid approach, not the only correct answer.':'参考一种准确、通顺的译法，不是唯一标准答案。'}</p><div>{review.reference}</div></section>:<section className="translation-notes"><section className="translation-note-group"><h2>{isEnglish?'Key sentence patterns':'重要句式'}</h2>{review.patterns?.length?review.patterns.map((item,index)=><article key={index}><blockquote>{item.original}</blockquote><p>{item.explanation}</p><p className="translation-caption">{item.usage}</p></article>):<p className="translation-caption">{isEnglish?'Not available in this review.':'本次批阅暂无句式提炼。'}</p>}</section><section className="translation-note-group"><h2>{isEnglish?'Core vocabulary':'核心词汇'}</h2>{review.vocabulary?.length?review.vocabulary.map((item,index)=><article key={index}><strong>{item.word}</strong><p>{item.meaning}</p><p className="translation-caption">{item.usage}</p></article>):<p className="translation-caption">{isEnglish?'Not available in this review.':'本次批阅暂无词汇提炼。'}</p>}</section></section>}</Tabs.Panel></Tabs>
          </>:<><ReviewOriginal label={isEnglish ? "My response" : "我的作答"}><p>{answer}</p></ReviewOriginal>{reviewing?<ReviewProgress english={isEnglish} kind="translation" stage={reviewStage} />:<div className="translation-review-state" role="status"><h2>{isEnglish?'Review is not ready':'批阅尚未完成'}</h2><p>{isEnglish?'Your translation is saved. You can retry now.':'译文已保存，可以重新发起批阅。'}</p><Button variant="primary" className="translation-primary" onClick={()=>getReview()}>{isEnglish?'Retry review':'重新批阅'}</Button></div>}</>}
        </div>:<TextArea fullWidth className="translation-answer-input" disabled={!ready || busy} aria-label={isEnglish?'Chinese translation':'中文译文'} placeholder={isEnglish?'Write your Chinese translation here…':'在此输入中文译文……'} value={answer} maxLength={12000} onChange={e=>{setAnswer(e.target.value);setNotice(isEnglish?'Saving…':'正在保存……');}} />}
      {!submitted && <DraftStatus>{notice || (isEnglish ? 'Draft saved automatically' : '草稿自动保存')}</DraftStatus>}</div>{submitted ? <PracticeActionBar summary={notice || (review ? <strong>{review.score} / 15</strong> : (isEnglish ? 'Submitted' : '已提交'))} actions={[
        { id: "home", label: isEnglish ? "Back to library" : "返回首页", variant: "secondary", href: `/?type=translation&year=${year}${isEnglish?'&lang=en':''}` },
        { id: "redo", label: isEnglish ? "Redo" : "重新练习", variant: "primary", disabled: busy || reviewing, onPress: () => redoDialog.current?.showModal() },
      ]} /> : null}
    </section></div>

    <PracticeDialog ref={redoDialog} className="translation-redo-dialog" aria-labelledby="translation-redo-title" aria-describedby="translation-redo-description"><Button className="translation-dialog-close" aria-label={isEnglish?'Close':'关闭'} onClick={()=>redoDialog.current?.close()}><X data-icon-size="20"/></Button><PracticeDialogTitle id="translation-redo-title">{isEnglish?'Translate again?':'重新翻译这篇文章？'}</PracticeDialogTitle><p id="translation-redo-description">{isEnglish?'You will start with a blank response. Your submitted translation and review will be kept.':'将开始一份空白作答，已提交的译文与批阅结果会保留。'}</p><div className="translation-dialog-actions"><Button variant="secondary" autoFocus onClick={()=>redoDialog.current?.close()}>{isEnglish?'Keep reviewing':'继续复盘'}</Button><Button variant="primary" className="translation-primary" onClick={()=>{redoDialog.current?.close();setPanel('feedback');void act('redo');}}>{isEnglish?'Translate again':'重新翻译'}</Button></div></PracticeDialog>
    </main>;
}

type HighlightIssue=TranslationDeduction & {original:string};
function TranslationHighlights({text,issues,source=false}:{text:string;issues:HighlightIssue[];source?:boolean}) {
  const ranges=issues.flatMap(issue=>{
    const quote=source?issue.source:issue.quote;
    const base=source?text.indexOf(issue.original):0;
    if(!quote||base<0)return [];
    const local=source?issue.original.indexOf(quote):text.indexOf(quote);
    return local<0?[]:[{start:base+local,end:base+local+quote.length,reasons:[issue.reason]}];
  }).sort((a,b)=>a.start-b.start);
  const merged:typeof ranges=[];
  for(const range of ranges){const last=merged[merged.length-1];if(last&&range.start<last.end){last.end=Math.max(last.end,range.end);last.reasons.push(...range.reasons);}else merged.push({...range});}
  let cursor=0;
  const parts=[];
  for(const range of merged){parts.push(text.slice(cursor,range.start));parts.push(<mark className="translation-error-mark" key={range.start} aria-label={text.slice(range.start,range.end)+'：'+range.reasons.join('；')}>{text.slice(range.start,range.end)}</mark>);cursor=range.end;}
  parts.push(text.slice(cursor));return <>{parts}</>;
}
