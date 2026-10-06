# `assets/jest.config.cjs`: what each setting does to a spec

| Setting | Consequence |
|---|---|
| `clearMocks: true` | Clears calls, not implementations. A `mockReturnValue` or `mockImplementation` from one test survives into the next, so specs become order-dependent. Set implementations in `beforeEach`. `resetMocks` and `restoreMocks` are off. |
| `moduleNameMapper` aliases | `@common`, `@hooks`, `@lib`, `@pages`, `@state` map to `js/*`. Use them in specs too. |
| `^phoenix$` maps to `mocks/phoenix.js` | The real `phoenix` package is an empty stub in every spec. Use `@lib/test-utils/phoenixDoubles`. |
| `^react-markdown$`, `^remark-gfm$`, images, `.css` | Stubs in `mocks/`. |
| `globals.config` | Seeds the `config` global that `getFromConfig` reads (`aiEnabled`, `aiProviders`, SSO keys, `adminUsername`). Change it there, not per spec. |
| `transformIgnorePatterns` | Babel transforms the listed ESM packages (`@assistant-ui`, `@ag-ui`, `assistant-stream`, `nanoid`, `zustand`, and others). Their exports become getters, so `jest.spyOn(module, 'export')` throws. A module mock is the only seam for them. |
| `testEnvironment: 'jsdom'` | No layout, no real `fetch`. See `setupTests.js`. |
| `reporters` with `jest-junit` | Writes XML to `/tmp` on every run. |

## Keys in `moduleNameMapper` are regular expressions

A key without anchors matches any import that contains it. A bare `'react-markdown'` key once
also captured `@assistant-ui/react-markdown` and made a primitive `undefined` in every AI
assistant spec. Several specs then carried mocks that only repaired that fallout. Anchor every key
that you add: `'^name$'`.

## `setupTests.js`

It adds jsdom polyfills: `ResizeObserver`, `Element.prototype.scrollTo`, `TextEncoder` and
`TextDecoder`, the web streams that `assistant-stream` needs, a stub `Response`, and
`mockAnimationsApi()` for Headless UI. It also mocks `chart.js/auto` and `react-chartjs-2`.

It calls `jest.retryTimes(1, { logErrorsBeforeRetry: true })`. A test that fails once and then
passes reports green. Look for the logged first error before you call a test stable.

## Unhandled rejections kill the worker

A promise that rejects during a test with no listener does not fail the test. It kills the
worker:

```
  Promise.reject(new Error('boom'));
                 ^
[Error: boom]
Node.js v24.x
```

There is no test name and no suite summary. In a run with many workers it shows as an opaque
`ChildProcessWorker._onExit`. A re-run can pass, because the timing is marginal.

The cause: jest-circus charges an `unhandledRejection` to the running test, but node emits the
event one tick after the rejection. If the file has no async work left, circus already removed its
listener during teardown. A `process.on('unhandledRejection')` in a setup file does not help: the
sandbox gets a copy of `process`, and circus listens on the real one.

The fix goes in the spec that needs it, with no shared helper:

```js
// Keeps circus's rejection handler installed one macrotask longer, so work left
// in flight fails THIS test by name instead of killing the worker.
afterEach(async () => {
  cleanup(); // idempotent; RTL's own hook still runs
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
});
```

Call `cleanup()` explicitly. Hook order decides whether the unmount lands before or after the
hop, and only "before" catches a rejection that the unmount causes.

This turns a crash into a named failure. It does not let a test accept an expected rejection.
If the correct behaviour of a scenario leaks a rejection, test it at the layer that owns the
error.
