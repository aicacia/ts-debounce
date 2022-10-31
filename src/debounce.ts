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
  let timeoutId: ReturnType<typeof setTimeout> | null = null,
    running = false;

  const before = options.before || noop,
    after = options.after || noop;

  function clear() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function cancel() {
    running = false;
    clear();
  }

  function flush() {
    clear();
    call();
  }

  function call<T>(this: T, ...args: any[]) {
    running = false;
    func.apply(this, args);
    after();
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

    if (!!options.isImmediate && timeoutId === null) {
      call(this, args);
    } else {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        call(this, args);
      }, waitMilliseconds);
    }
  } as any;

  debounceFn.cancel = cancel;
  debounceFn.flush = flush;

  return debounceFn;
}
