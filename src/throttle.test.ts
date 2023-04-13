import tape from "tape";
import { throttle } from ".";

const FPS = 1000 / 60;
const FRAMES = 60;

async function run(fn: (...args: any[]) => any, frames = FRAMES) {
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

tape(`throttle every ${(FPS * FRAMES) | 0}ms`, async (assert) => {
  let called = 0;
  let count = 0;

  const fn = throttle(() => {
    count += 1;
  }, FPS * FRAMES);
  await run(() => {
    called += 1;
    fn();
  });

  assert.equals(called, FRAMES);
  assert.equals(count, 1);
  assert.end();
});

tape("throttle cancel", async (assert) => {
  let count = 0;

  const fn = throttle(() => {
    count += 1;
  }, FPS * FRAMES);
  fn();
  fn();
  fn.cancel();
  await wait(FPS * FRAMES);

  assert.equals(count, 1);
  assert.end();
});

tape("throttle flush", async (assert) => {
  let count = 0;

  const fn = throttle(() => {
    count += 1;
  }, FPS * FRAMES);
  fn();
  fn();
  fn.flush();

  assert.equals(count, 2);
  assert.end();
});
