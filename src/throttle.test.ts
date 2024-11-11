import * as tape from "tape";
import { throttle } from ".";

const MILISECONDS_PER_FRAME = 1000 / 60;
const FPS = 60;

async function run(fn: () => void, frames = FPS) {
	return new Promise<void>((resolve) => {
		let frame = 0;
		let promise = Promise.resolve();
		while (frame++ < frames) {
			promise = promise.then(() => {
				fn();
				return wait(MILISECONDS_PER_FRAME);
			});
		}
		promise.finally(resolve);
	});
}

async function wait(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}

tape("throttle", async (assert) => {
	const counter = {
		count: 0,
		inc: () => {
			counter.count += 1;
		},
	};

	const fn = throttle(counter.inc, 0);

	assert.equals(counter.count, 0);
	await run(fn);
	assert.equals(counter.count, 60);
	assert.end();
});

tape(
	`throttle every ${(MILISECONDS_PER_FRAME * FPS) | 0}ms`,
	async (assert) => {
		let called = 0;
		let count = 0;

		const fn = throttle(() => {
			count += 1;
		}, MILISECONDS_PER_FRAME * FPS);
		await run(() => {
			called += 1;
			fn();
		});

		assert.equals(called, FPS);
		assert.equals(count, 1);
		assert.end();
	},
);

tape("throttle cancel", async (assert) => {
	let count = 0;

	const fn = throttle(() => {
		count += 1;
	}, MILISECONDS_PER_FRAME * FPS);
	fn();
	fn();
	fn.cancel();
	await wait(MILISECONDS_PER_FRAME * FPS);

	assert.equals(count, 1);
	assert.end();
});

tape("throttle flush", (assert) => {
	let count = 0;

	const fn = throttle(() => {
		count += 1;
	}, MILISECONDS_PER_FRAME * FPS);
	fn();
	fn();
	fn.flush();

	assert.equals(count, 2);
	assert.end();
});

tape("throttle result", async (assert) => {
	let count = 0;

	const fn = throttle(() => {
		count += 1;
		return count;
	}, MILISECONDS_PER_FRAME);
	const countPromises: Promise<number>[] = [];
	await run(() => {
		countPromises.push(fn());
	});

	const counts = await Promise.all(countPromises);
	for (let i = 0; i < counts.length; i++) {
		assert.equals(counts[i], i + 1);
	}
	assert.end();
});

tape("throttle promise result", async (assert) => {
	let count = 0;

	const fn = throttle(async () => {
		count += 1;
		await wait(0);
		return count;
	}, MILISECONDS_PER_FRAME);
	const countPromises: Promise<number>[] = [];
	await run(() => {
		countPromises.push(fn());
	});

	const counts = await Promise.all(countPromises);
	for (let i = 0; i < counts.length; i++) {
		assert.equals(counts[i], i + 1);
	}
	assert.end();
});
