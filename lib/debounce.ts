export interface IOptions {
  isImmediate?: boolean;
  before?: () => void;
  after?: () => void;
}

const noop = () => {};

export const debounce = <F extends (...args: any[]) => void>(
  func: F,
  waitMilliseconds = 0,
  options: IOptions = {}
): F => {
  let timeoutId: NodeJS.Timeout | undefined;
  let running = false;

  const before = options.before || noop,
    after = options.after || noop;

  return function debounceFn<T>(this: T, ...args: any[]) {
    if (!running) {
      running = true;
      before();
    }

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    if (!!options.isImmediate && timeoutId === undefined) {
      running = false;
      func.apply(this, args);
      after();
    } else {
      timeoutId = setTimeout(() => {
        running = false;
        timeoutId = undefined;
        func.apply(this, args);
        after();
      }, waitMilliseconds);
    }
  } as any;
};
