"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { createMutationQueue, scheduleDraftSave } from "@/lib/draft-save";

export function useMutationQueue() {
  const [queue] = useState(createMutationQueue);
  return queue;
}

/** Only answer/task changes restart debounce; timer ticks and translated labels
 * use the latest callback without postponing a pending save indefinitely. */
export function useDraftAutosave({ enabled, snapshot, save, onError, blocked, delayMs = 600 }: {
  enabled: boolean;
  snapshot: string;
  save: () => Promise<unknown>;
  onError: (error: unknown) => void;
  blocked: () => boolean;
  delayMs?: number;
}) {
  const saveLatest = useEffectEvent(save);
  const reportError = useEffectEvent(onError);
  const isBlocked = useEffectEvent(blocked);
  useEffect(() => {
    if (!enabled) return;
    return scheduleDraftSave({ save: saveLatest, onError: reportError, blocked: isBlocked, delayMs });
  }, [enabled, snapshot, delayMs]);
}

export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}
