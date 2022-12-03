import { throttle, ThrottleFn } from "./throttle";

export interface IDebounceOptions {
  isImmediate?: boolean;
  before?: () => void;
  after?: () => void;
}

export type DebounceFn<F extends (...args: any[]) => any> = ThrottleFn<F>;

export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitMilliseconds = 0,
  options: IDebounceOptions = {}
): DebounceFn<F> {
  return throttle(func, waitMilliseconds, { ...options, debounceMode: true });
}
