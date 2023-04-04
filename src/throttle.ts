import { noop } from "./noop";

export interface IThrottleOptions {
  before?: () => void;
  after?: () => void;
}

export type ThrottleFn<F extends (...args: any[]) => any> = F & {
  cancel(): void;
  flush(): void;
};

export function throttle<F extends (...args: any[]) => any>(
  func: F,
  delay = 0,
  options: IThrottleOptions = {}
): ThrottleFn<F> {
  let running = false;
  let lastMS = 0;
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
    if (running) {
      after();
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

    if (!running) {
      running = true;
      before();
    }

    lastCall = call;
    clearTimeoutIfSet();

    lastMS = Date.now();
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
