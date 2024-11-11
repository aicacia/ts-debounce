export type ForcePromise<T> = T extends Promise<infer U> ? T : Promise<T>;

// biome-ignore lint/suspicious/noExplicitAny: allow any function
export type PromisifyFn<F extends (...args: any) => any> = (
  this: ThisParameterType<F>,
  ...args: Parameters<F>
) => ForcePromise<ReturnType<F>>;
