import tape from "tape";
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

  const func = debounce((a0, a1, a2) => {
    a = a0;
    b = a1;
    c = a2;
  }, 0);

  func(1, 2, 3);
  func.flush();

  setTimeout(() => {
    assert.equals(a, 1);
    assert.equals(b, 2);
    assert.equals(c, 3);
    assert.end();
  }, 100);
});
