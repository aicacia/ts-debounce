export interface IThrottleOptions {
  isImmediate?: boolean;
  before?: () => void;
  after?: () => void;
}

const noop = () => undefined;

export type ThrottleFn<F extends (...args: any[]) => any> = F & {
  cancel(): void;
  flush(): void;
};

export function throttle<F extends (...args: any[]) => any>(
  func: F,
  delay = 0,
  options: IThrottleOptions = {}
): ThrottleFn<F> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  let lastMS = 0;

  const before = options.before || noop;
  const after = options.after || noop;

  let currentThis: any = null;
  let currentArguments: any[] | null = null;

  function clear() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function cancel() {
    running = false;
    currentThis = null;
    currentArguments = null;
    clear();
  }

  function flush() {
    clear();
    call();
  }

  function call() {
    if (running) {
      lastMS = Date.now();
      running = false;
      func.apply(currentThis, currentArguments as any[]);
      currentThis = null;
      currentArguments = null;
      after();
    }
  }

  const throttleFn: ThrottleFn<F> = function throttleFn<T>(
    this: T,
    ...args: any[]
  ) {
    const deltaMS = Date.now() - lastMS;

    if (!running) {
      running = true;
      before();
    }

    clear();
    currentThis = this; // eslint-disable-line @typescript-eslint/no-this-alias
    currentArguments = args;

    if (deltaMS > delay || (!!options.isImmediate && timeoutId === null)) {
      call();
    } else {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        call();
      }, delay);
    }
  } as any;

  throttleFn.cancel = cancel;
  throttleFn.flush = flush;

  return throttleFn;
}
