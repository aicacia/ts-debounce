import { noop } from "./noop";
import type { PromisifyFn } from "./types";

export interface IDebounceOptions {
	before?: () => void;
	after?: () => void;
}

// biome-ignore lint/suspicious/noExplicitAny: allow any function
export type DebounceFn<F extends (...args: any) => any> = PromisifyFn<F> & {
	cancel(): void;
	flush(): void;
};

// biome-ignore lint/suspicious/noExplicitAny: allow any function
export function debounce<F extends (...args: any) => any>(
	func: F,
	delay = 0,
	options: IDebounceOptions = {},
): DebounceFn<F> {
	let running = false;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let lastCall: (() => void) | null = null;
	const resolvers: ((value: ReturnType<F>) => void)[] = [];
	const rejectors: ((reason: unknown) => void)[] = [];

	const before = options.before || noop;
	const after = options.after || noop;

	function clearTimeoutIfSet() {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
			timeoutId = null;
			return true;
		}
		return false;
	}

	function cancel() {
		if (clearTimeoutIfSet()) {
			lastCall = null;
		}
		running = false;
		resolvers.length = 0;
		rejectors.length = 0;
	}

	function flush() {
		if (lastCall !== null) {
			lastCall();
		}
	}

	function resolve(value: ReturnType<F>) {
		for (const resolver of resolvers) {
			resolver(value);
		}
		cancel();
	}

	function reject(reason: unknown) {
		for (const rejector of rejectors) {
			rejector(reason);
		}
		cancel();
	}

	const debounceFn: DebounceFn<F> = function debounceFn<T>(
		this: T,
		...args: unknown[]
	) {
		const self = this; // eslint-disable-line @typescript-eslint/no-this-alias

		function call() {
			const result = func.apply(self, args);
			after();
			if (typeof result?.then === "function") {
				try {
					result.then(resolve);
					if (typeof result?.catch === "function") {
						result.catch(reject);
					}
				} catch (error) {
					reject(error);
				}
			} else {
				resolve(result);
			}
		}

		if (!running) {
			running = true;
			before();
		}

		lastCall = call;
		clearTimeoutIfSet();

		timeoutId = setTimeout(call, delay);

		return new Promise((resolve, reject) => {
			resolvers.push(resolve);
			rejectors.push(reject);
		});
	} as never;

	debounceFn.cancel = cancel;
	debounceFn.flush = flush;

	return debounceFn;
}
