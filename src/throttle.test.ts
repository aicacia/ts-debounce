import tape from "tape";
import { throttle } from ".";

const FPS = 1000 / 60;

async function run(fn: () => void, frames = 60) {
  return new Promise<void>((resolve) => {
    let frame = 0;
    (function onRun() {
      fn();
      if (frame > frames) {
        resolve();
      } else {
        frame += 1;
        setTimeout(onRun, FPS);
      }
    })();
  });
}

async function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

tape("throttle defaults", (assert) => {
  throttle(assert.end)();
});

tape("throttle defaults", async (assert) => {
  let count = 0;

  await run(
    throttle(() => {
      count += 1;
    }, 100)
  );

  assert.equals(count, 9);
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
