import once = require("once");

export type Procedure = (...args: any[]) => void;

export interface IOptions {
  isImmediate?: boolean;
  before?: () => void;
  after?: () => void;
}

const noop = () => {};

export const debounce = <F extends Procedure>(
  func: F,
  waitMilliseconds = 0,
  options: IOptions = {}
): F => {
  let timeoutId: NodeJS.Timeout | undefined;

  const before = once(options.before || noop),
    after = once(options.after || noop);

  return function debounceFn<T>(this: T, ...args: any[]) {
    const context = this;

    before();

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    if (!!options.isImmediate && timeoutId === undefined) {
      func.apply(context, args);
      after();
    } else {
      timeoutId = setTimeout(() => {
        timeoutId = undefined;
        func.apply(context, args);
        after();
      }, waitMilliseconds);
    }
  } as any;
};
