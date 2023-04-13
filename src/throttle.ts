import { noop } from "./noop";

export type ThrottleFn<F extends (...args: any[]) => any> = F & {
  cancel(): void;
  flush(): void;
};

export function throttle<F extends (...args: any[]) => any>(
  func: F,
  delay = 0
): ThrottleFn<F> {
  let lastMS = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCall: (() => void) | null = null;

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
    lastMS = Date.now();
  }

  function flush() {
    if (lastCall !== null) {
      lastCall();
      lastCall = null;
    }
    cancel();
  }

  const throttleFn: ThrottleFn<F> = function throttleFn<T>(
    this: T,
    ...args: any[]
  ) {
    const deltaMS = Date.now() - lastMS;
    const self = this; // eslint-disable-line @typescript-eslint/no-this-alias

    function call() {
      lastMS = Date.now();
      func.apply(self, args);
    }

    lastCall = call;
    clearTimeoutIfSet();

    if (deltaMS > delay) {
      call();
    } else {
      timeoutId = setTimeout(call, delay - deltaMS);
    }
  } as any;

  throttleFn.cancel = cancel;
  throttleFn.flush = flush;

  return throttleFn;
}
