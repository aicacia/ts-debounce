export interface IOptions {
  isImmediate?: boolean;
  before?: () => void;
  after?: () => void;
}

const noop = () => undefined;

export type DebounceFn<F extends (...args: any[]) => void> = F & {
  cancel(): void;
  flush(): void;
};

export function debounce<F extends (...args: any[]) => void>(
  func: F,
  waitMilliseconds = 0,
  options: IOptions = {}
): DebounceFn<F> {
  let timeoutId: any = null,
    running = false;

  const before = options.before || noop,
    after = options.after || noop;

  function clear() {
    if (timeoutId != null) {
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

    if (!!options.isImmediate && timeoutId == null) {
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
