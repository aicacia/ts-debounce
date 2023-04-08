import tape from "tape";
import { throttle } from ".";

const FPS = 1000 / 60;

async function run(
  fn: (...args: any[]) => any,
  end: (...args: any[]) => any = () => undefined,
  frames = 60
) {
  return new Promise<void>(async (resolve) => {
    let frame = 0;
    while (frame < frames) {
      frame += 1;
      fn();
      await wait(FPS);
    }
    end();
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

  const fn = throttle(counter.inc, 0, {
    before() {
      assert.equals(counter.count, 0);
    },
    after() {
      assert.equals(counter.count, 60);
      assert.end();
    },
  });

  await run(fn, fn.cancel);
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
  const promise = run(fn);
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
