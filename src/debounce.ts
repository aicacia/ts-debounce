export interface IOptions {
  isImmediate?: boolean;
  before?: () => void;
  after?: () => void;
}

const noop = () => undefined;

export function debounce<F extends (...args: any[]) => void>(
  func: F,
  waitMilliseconds = 0,
  options: IOptions = {}
): F {
  let timeoutId: any = null;
  let running = false;

  const before = options.before || noop,
    after = options.after || noop;

  return function debounceFn<T>(this: T, ...args: any[]) {
    if (!running) {
      running = true;
      before();
    }

    if (timeoutId != null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (!!options.isImmediate && timeoutId == null) {
      running = false;
      func.apply(this, args);
      after();
    } else {
      timeoutId = setTimeout(() => {
        running = false;
        timeoutId = null;
        func.apply(this, args);
        after();
      }, waitMilliseconds);
    }
  } as any;
}
