import type { PromisifyFn } from "./types";

// biome-ignore lint/suspicious/noExplicitAny: allow any function
export type ThrottleFn<F extends (...args: any) => any> = PromisifyFn<F> & {
	cancel(): void;
	flush(): ReturnType<F> | undefined;
};

// biome-ignore lint/suspicious/noExplicitAny: allow any function
export function throttle<F extends (...args: any) => any>(
	func: F,
	delay = 0,
): ThrottleFn<F> {
	let lastMS = 0;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let lastCall: (() => ReturnType<F>) | null = null;
	const resolvers: ((value: ReturnType<F>) => void)[] = [];
	const rejectors: ((reason: unknown) => void)[] = [];

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
		resolvers.length = 0;
		rejectors.length = 0;
	}

	function flush() {
		if (lastCall !== null) {
			return lastCall();
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

	const throttleFn: ThrottleFn<F> = function throttleFn<T>(
		this: T,
		...args: unknown[]
	) {
		const deltaMS = Date.now() - lastMS;
		const self = this; // eslint-disable-line @typescript-eslint/no-this-alias

		function call() {
			lastMS = Date.now();
			const result = func.apply(self, args);
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
			return result;
		}

		lastCall = call;
		clearTimeoutIfSet();

		const promise = new Promise((resolve, reject) => {
			resolvers.push(resolve);
			rejectors.push(reject);
		});

		if (deltaMS > delay) {
			call();
		} else {
			timeoutId = setTimeout(call, delay - deltaMS);
		}

		return promise;
	} as never;

	throttleFn.cancel = cancel;
	throttleFn.flush = flush;

	return throttleFn;
}
