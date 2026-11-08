/** A failed write must not poison later saves or the final submission. */
export function createMutationQueue() {
  let tail: Promise<unknown> = Promise.resolve();
  return {
    enqueue<T>(run: () => Promise<T>): Promise<T> {
      const operation = tail.catch(() => {}).then(run);
      tail = operation;
      return operation;
    },
    async drain() { await tail.catch(() => {}); },
  };
}

export class DraftSaveError extends Error {
  status: number;
  constructor(status: number, message = "Draft save failed") {
    super(message);
    this.status = status;
    this.name = "DraftSaveError";
  }
}

type Clock = {
  setTimeout: (run: () => void, delay: number) => unknown;
  clearTimeout: (timer: unknown) => void;
};

/** Cancellation stops timers/retries, never an already-sent write. Final actions
 * must drain the mutation queue before submitting, navigating or starting over. */
export function scheduleDraftSave({
  save, onError, blocked = () => false, delayMs = 600, clock = {
    setTimeout: (run, delay) => setTimeout(run, delay),
    clearTimeout: timer => clearTimeout(timer as ReturnType<typeof setTimeout>),
  },
}: {
  save: () => Promise<unknown>;
  onError: (error: unknown) => void;
  blocked?: () => boolean;
  delayMs?: number;
  clock?: Clock;
}) {
  let cancelled = false;
  let timer: unknown;
  async function run(attempt: number) {
    if (cancelled || blocked()) return;
    try { await save(); }
    catch (error) {
      if (cancelled || blocked()) return;
      // Stale attempts and validation/auth failures require user intervention.
      const retryable = !(error instanceof DraftSaveError) || error.status >= 500;
      if (attempt < 3 && retryable) timer = clock.setTimeout(() => { void run(attempt + 1); }, 1000 * 2 ** attempt);
      else onError(error);
    }
  }
  timer = clock.setTimeout(() => { void run(0); }, delayMs);
  return () => { cancelled = true; clock.clearTimeout(timer); };
}
