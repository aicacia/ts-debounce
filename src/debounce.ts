import { noop } from "./noop";

export interface IDebounceOptions {
  before?: () => void;
  after?: () => void;
}

export type DebounceFn<F extends (...args: any[]) => any> = F & {
  cancel(): void;
  flush(): void;
};

export function debounce<F extends (...args: any[]) => any>(
  func: F,
  delay = 0,
  options: IDebounceOptions = {}
): DebounceFn<F> {
  let running = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCall: (() => void) | null = null;

  const before = options.before || noop;
  const after = options.after || noop;

  function clearTimeoutIfSet() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      return true;
    } else {
      return false;
    }
  }

  function cancel() {
    if (clearTimeoutIfSet()) {
      lastCall = null;
    }
    running = false;
  }

  function flush() {
    if (lastCall !== null) {
      lastCall();
      lastCall = null;
    }
    cancel();
  }

  const debounceFn: DebounceFn<F> = function debounceFn<T>(
    this: T,
    ...args: any[]
  ) {
    const self = this; // eslint-disable-line @typescript-eslint/no-this-alias

    function call() {
      func.apply(self, args);
      after();
    }

    if (!running) {
      running = true;
      before();
    }

    lastCall = call;
    clearTimeoutIfSet();

    timeoutId = setTimeout(call, delay);
  } as any;

  debounceFn.cancel = cancel;
  debounceFn.flush = flush;

  return debounceFn;
}
