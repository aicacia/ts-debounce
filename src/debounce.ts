export interface IDebounceOptions {
  isImmediate?: boolean;
  before?: () => void;
  after?: () => void;
}

const noop = () => undefined;

export type DebounceFn<F extends (...args: any[]) => any> = F & {
  cancel(): void;
  flush(): void;
};

export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitMilliseconds = 0,
  options: IDebounceOptions = {}
): DebounceFn<F> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let running = false;

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
      running = false;
      func.apply(currentThis, currentArguments as any[]);
      currentThis = null;
      currentArguments = null;
      after();
    }
  }

  const debounceFn: DebounceFn<F> = function debounceFn<T>(
    this: T,
    ...args: any[]
  ) {
    if (!running) {
      running = true;
      before();
    }

    clear();
    currentThis = this; // eslint-disable-line @typescript-eslint/no-this-alias
    currentArguments = args;

    if (!!options.isImmediate && timeoutId === null) {
      call();
    } else {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        call();
      }, waitMilliseconds);
    }
  } as any;

  debounceFn.cancel = cancel;
  debounceFn.flush = flush;

  return debounceFn;
}
