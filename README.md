# ts-debounce

debounce

```ts
import { debounce } from "@stembord/debounce";

let count = 0;

const func = debounce(
  () => {
    console.log(count); // 1
  },
  100,
  {
    after() {
      count -= 1;
      console.log(count); // 0
    },
    before() {
      count += 1;
    }
  }
);

func();
console.log(count); // 1
```
