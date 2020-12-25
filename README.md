# ts-debounce

[![license](https://img.shields.io/badge/license-MIT%2FApache--2.0-blue")](LICENSE-MIT)
[![docs](https://img.shields.io/badge/docs-typescript-blue.svg)](https://aicacia.gitlab.io/libs/ts-debounce/)
[![npm (scoped)](https://img.shields.io/npm/v/@aicacia/debounce)](https://www.npmjs.com/package/@aicacia/debounce)
[![pipelines](https://gitlab.com/aicacia/libs/ts-debounce/badges/master/pipeline.svg)](https://gitlab.com/aicacia/libs/ts-debounce/-/pipelines)

debounce

```ts
import { debounce } from "@aicacia/debounce";

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
    },
  }
);

func();
console.log(count); // 1
```
