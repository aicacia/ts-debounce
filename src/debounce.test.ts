import * as tape from "tape";
import { debounce } from ".";

async function wait(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}

tape("debounce defaults", (assert) => {
	debounce(assert.end)();
});

tape("debounce", (assert) => {
	let count = 0;

	const func = debounce(
		() => {
			count += 1;
			assert.equals(count, 2);
			return count;
		},
		100,
		{
			after() {
				count -= 2;
				assert.equals(count, 0);
				assert.end();
			},
			before() {
				count += 1;
			},
		},
	);

	func();
	func();
	func();
	func();
	func();
});

tape("debounce flush", (assert) => {
	let count = 0;

	const func = debounce(() => {
		count += 1;
		return count;
	}, 100);

	func();
	func();

	const flushResult = func.flush();

	assert.equals(flushResult, 1);
	assert.equals(count, 1);

	setTimeout(() => {
		assert.equals(count, 1);
		assert.end();
	}, 101);
});

tape("debounce cancel", (assert) => {
	let count = 0;

	const func = debounce(() => {
		count += 1;
	}, 100);

	func();
	func();

	func.cancel();

	setTimeout(() => {
		assert.equals(count, 0);
		assert.end();
	}, 101);
});

tape("debounce cancel next tick", (assert) => {
	let count = 0;

	const func = debounce(() => {
		count += 1;
	}, 0);

	func();
	func();

	func.cancel();

	setTimeout(() => {
		assert.equals(count, 0);
		assert.end();
	}, 100);
});

tape("debounce multiple args", (assert) => {
	let a = 0;
	let b = 0;
	let c = 0;

	function updateABC(a0: number, a1: number, a2: number) {
		a = a0;
		b = a1;
		c = a2;
	}

	const func = debounce(updateABC, 0);

	func(1, 2, 3);
	func.flush();

	setTimeout(() => {
		assert.equals(a, 1);
		assert.equals(b, 2);
		assert.equals(c, 3);
		assert.end();
	}, 100);
});

tape("debounce result", async (assert) => {
	let count = 0;

	const func = debounce(() => {
		count += 1;
		return count;
	}, 100);

	const aPromise = func();
	const bPromise = func();

	const [a, b] = await Promise.all([aPromise, bPromise]);
	assert.equals(a, 1);
	assert.equals(b, 1);
	assert.end();
});

tape("debounce promise result", async (assert) => {
	let count = 0;

	const func = debounce(async () => {
		await wait(10);
		count += 1;
		return count;
	}, 100);

	const aPromise = func();
	const bPromise = func();

	const [a, b] = await Promise.all([aPromise, bPromise]);
	assert.equals(a, 1);
	assert.equals(b, 1);
	assert.end();
});
