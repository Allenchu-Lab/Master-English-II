"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { DraftSaveError } from "@/lib/draft-save";
import { useDraftAutosave, useMutationQueue, useUnsavedGuard } from "./use-draft-autosave";
import type { PracticeDialogHandle } from "@/components/ui/practice-dialog";

type AttemptBase<TAnswers> = {
  id: string;
  answers: TAnswers;
  elapsed_seconds: number;
  submitted_at: string | null;
  feedback: { number: number; answer: string }[] | null;
};

// Shared attempt lifecycle for cloze and reading B: load, timer, serialized save,
// debounced autosave, leave guard and submit/redo/back. Selection rules and DOM
// scrolling stay in each page because they differ between the two layouts.
export function useTaskAttempt<TAnswers extends Record<string, string>, TAttempt extends AttemptBase<TAnswers>>({
  endpoint, back, isEnglish, initialActive,
}: { endpoint: string; back: string; isEnglish: boolean; initialActive: number }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<TAnswers>({} as TAnswers);
  const [attempt, setAttempt] = useState<TAttempt | null>(null);
  const [active, setActive] = useState(initialActive);
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
  const queue = useMutationQueue();
  const mutationLock = useRef(false);
  const confirm = useRef<PracticeDialogHandle>(null);
  const submitted = Boolean(attempt?.submitted_at);

  useEffect(() => {
    let cancelled = false;
    fetch(endpoint).then(async response => {
      if (!response.ok) throw Error();
      const data = await response.json() as { attempt: TAttempt | null };
      if (cancelled) return;
      attemptId.current = data.attempt?.id ?? null;
      seconds.current = data.attempt?.elapsed_seconds ?? 0;
      setAttempt(data.attempt); setAnswers(data.attempt?.answers ?? {} as TAnswers); setElapsed(seconds.current);
      setNotice(''); setReady(true);
    }).catch(() => { if (!cancelled) setNotice(isEnglish ? 'Unable to load your response.' : '无法读取作答，请重试。'); });
    return () => { cancelled = true; };
  }, [endpoint, isEnglish, loadRevision]);

  useEffect(() => {
    if (!running || submitted) return;
    const timer = setInterval(() => { seconds.current = Math.min(seconds.current + 1, 604800); setElapsed(seconds.current); }, 1000);
    return () => clearInterval(timer);
  }, [running, submitted]);

  const persist = useCallback((action: 'save' | 'submit' | 'redo', snapshot: TAnswers) => {
    const version = revision.current;
    const operation = queue.enqueue(async () => {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, answers: snapshot, elapsedSeconds: seconds.current, attemptId: attemptId.current }) });
      const data = await response.json();
      if (!response.ok) throw new DraftSaveError(response.status, data.error || (isEnglish ? 'Unable to save. Try again.' : '保存失败，请重试。'));
      const saved = data.attempt as TAttempt;
      attemptId.current = saved.id;
      setAttempt(saved);
      setSaveFailed(false);
      if (revision.current === version) { setDirty(false); setNotice(isEnglish ? 'Saved' : '已保存'); }
      return saved;
    });
    return operation;
  }, [endpoint, isEnglish, queue]);

  useDraftAutosave({
    enabled: ready && !submitted && !busy && dirty,
    snapshot: JSON.stringify(answers),
    save: () => persist('save', answers),
    blocked: () => mutationLock.current,
    onError: error => {
      setSaveFailed(true);
      setNotice(error instanceof Error ? error.message : (isEnglish ? 'Save failed. Try again.' : '保存失败，请重试。'));
    },
  });
  useUnsavedGuard(dirty);

  async function act(action: 'submit' | 'redo' | 'back') {
    if (mutationLock.current) return;
    mutationLock.current = true; setBusy(true); setRunning(false);
    try {
      await queue.drain();
      if (action === 'back') {
        if (dirty) await persist('save', answers);
        router.push(back); return;
      }
      const saved = await persist(action, answers);
      if (action === 'redo') {
        setAnswers({} as TAnswers); setElapsed(0); seconds.current = 0; setActive(initialActive); setNotice('');
      } else {
        const firstWrong = saved.feedback?.find(item => saved.answers[String(item.number)] !== item.answer);
        setActive(firstWrong?.number ?? initialActive); setNotice('');
      }
    } catch (error) { setNotice(error instanceof Error ? error.message : '操作失败，请重试。'); }
    finally { mutationLock.current = false; setBusy(false); }
  }

  return {
    answers, setAnswers, attempt, active, setActive,
    ready, busy, notice, setNotice, elapsed, running, setRunning,
    dirty, setDirty, saveFailed, submitted, setLoadRevision,
    revisionRef: revision, mutationLock, confirm, persist, act,
  };
}