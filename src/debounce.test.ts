import tape = require("tape");
import { debounce } from ".";

tape("debounce defaults", (assert: tape.Test) => {
  debounce(assert.end)();
});

tape("debounce", (assert: tape.Test) => {
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

tape("debounce isImmediate", (assert: tape.Test) => {
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
