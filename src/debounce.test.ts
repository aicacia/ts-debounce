import * as tape from "tape";
import { debounce } from ".";

tape("debounce defaults", (assert) => {
  debounce(assert.end)();
});

tape("debounce", (assert) => {
  let count = 0;

  const func = debounce(
    () => {
      count += 1;
      assert.equals(count, 2);
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
    }
  );

  func();
  func();
  func();
  func();
  func();
});

tape("debounce isImmediate", (assert) => {
  let count = 0;

  const func = debounce(
    () => {
      assert.equals(count, 1);
    },
    100,
    {
      isImmediate: true,
      after() {
        count -= 1;
        assert.end();
      },
      before() {
        count += 1;
      },
    }
  );

  func();
});

tape("debounce flush", (assert) => {
  let count = 0;

  const func = debounce(() => {
    count += 1;
  }, 100);

  func();
  func();

  func.flush();

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
