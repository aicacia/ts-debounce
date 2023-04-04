import tape from "tape";
import { throttle } from ".";

const FPS = 1000 / 60;

async function run(fn: () => void, frames = 60) {
  return new Promise<void>(async (resolve) => {
    let frame = 0;
    while (frame < frames) {
      frame += 1;
      fn();
      await wait(FPS);
    }
    resolve();
  });
}

async function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

tape("throttle", (assert) => {
  const counter = {
    count: 0,
    inc: (amount: number) => {
      counter.count += amount;
    },
  };

  const fn = throttle(counter.inc, 0, {
    before() {
      assert.equals(counter.count, 0);
    },
    after() {
      assert.equals(counter.count, 1);
      assert.end();
    },
  });

  fn(1);

  fn.cancel();
});

tape("throttle every 100ms", async (assert) => {
  let called = 0;
  let count = 0;

  const fn = throttle(() => {
    count += 1;
  }, 100);
  await run(() => {
    called += 1;
    fn();
  });

  assert.equals(called, 60);
  assert.equals(count, 1);
  assert.end();
});

tape("throttle cancel", async (assert) => {
  let count = 0;

  const fn = throttle(() => {
    count += 1;
  }, 100);
  const promise = run(fn, 2);
  fn.cancel();
  await promise;

  assert.equals(count, 1);
  assert.end();
});

tape("throttle flush", async (assert) => {
  let count = 0;

  const fn = throttle(() => {
    count += 1;
  }, 100);
  fn();
  await wait(10);
  fn();
  fn.flush();

  assert.equals(count, 2);
  assert.end();
});
