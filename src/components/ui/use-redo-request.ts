"use client";
import { useEffect, useRef } from "react";

// A list shortcut opens confirmation only; it never clears an attempt on navigation.
export function useRedoRequest(ready: boolean, onConfirm: () => void) {
  const handled = useRef(false);
  const callback = useRef(onConfirm);
  useEffect(() => { callback.current = onConfirm; });
  useEffect(() => {
    if (!ready || handled.current) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('redo') !== '1') return;
    handled.current = true;
    url.searchParams.delete('redo');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    callback.current();
  }, [ready]);
}
