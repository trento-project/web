---
name: trento-frontend-testing
description: "Use when writing or changing jest tests under assets/js/ in trento web: picking a render helper from @lib/test-utils, faking a Phoenix socket, injecting a socket through SocketContext, mocking a third-party hook, choosing between waitFor, findBy and act, choosing queries (role or label against data-testid), removing a data-testid that cypress can consume, or hitting a jest.config.cjs surprise. Not for Elixir tests."
---

# Trento frontend testing (jest, `assets/`)

Conventions for the React suite. The commands in `AGENTS.md` win. The generic method is in the
`proving-test-changes` and `test-double-boundaries` skills.

## Runner

The suite runs on jest, not Vitest. Run all commands from `assets/`:

```bash
npm test                         # TZ=UTC jest, full suite
npm test -- js/common/Foo        # one directory or file, still with TZ=UTC
npm run lint                     # eslint
npm run format:check             # prettier -c .
```

Date-formatting specs assume `TZ=UTC`. A bare `npx jest` does not set it.

Read a run with `grep`, not `tail`. `| tail -5` drops the name of the failing test. The
pipeline also exits with the status of `tail`, so a red run reads as green to any `&&` after it:

```bash
npm test -- js/common/Foo 2>&1 | grep -E "^(FAIL|Tests:)|^  ● " | grep -v Console | sort -u
```

`setupTests.js` calls `jest.retryTimes(1)`, so a test that fails once and then passes reports
green. The full suite is sometimes flaky with one unrelated test. Re-run with the grep, record the name,
and compare with `main` before you blame your diff.

`jest.config.cjs` has traps: `clearMocks` does not reset implementations, getter-only ESM exports
cannot be spied on, and unhandled rejections kill the worker. See `references/jest-config.md`.

## `@lib/test-utils`

| Export | Use |
|---|---|
| `renderWithRouter(ui, { route })` | Wraps in `BrowserRouter` and pushes `route` first. |
| `renderWithRouterMatch(ui, { path, route, children })` | When the component reads route params. |
| `withState(component, initialState, useRealStore)` | Redux `Provider`. Returns `[wrapped, store]`. The store is a `redux-mock-store` (reducers do not run) unless `useRealStore` is `true`. |
| `withDefaultState(component)` | `withState` with `defaultInitialState`. |
| `hookWrapperWithState(initialState)` | Returns `[wrapper, store]` over a mock store. Pass `wrapper` to `renderHook`, not the array. |
| `recordSaga(saga, action, state)` | Runs a saga and returns the dispatched actions. |
| `defaultInitialState` | The shared store shape. |

Factories are in `@lib/test-utils/factories` (faker builders).

Two AI assistant entry points are separate on purpose, and not re-exported from `index.jsx`:

| Entry point | Exports |
|---|---|
| `@lib/test-utils/aguiEvents` | `aguiEvents.*` event factories and `buildAssistantTurn`. Plain functions, no jest, so stories import them too. |
| `@lib/test-utils/aiAssistant` | `renderAIAssistant(...)`: mounts the pane over `makeMockSocket()`, completes the join, returns helpers such as `emitAgUi`, `sendUserMessage` and `streamAssistantTurn`. |

`sendUserMessage(text)` returns the `send_message` payload that the client pushed.
`streamAssistantTurn(payload, { messageId, deltas })` takes it as its first argument. A caller
then cannot pair a reply with the wrong `thread_id` or `run_id` by hand.

The factories must build what the channel actually pushes, including the fields that it omits.
Before you add a key to an event factory, read the Elixir struct that emits the event, not
another spec. A `runId` that the server never sends on `RUN_ERROR` once hid a client bug that
dropped every real error, with a green suite.

Do not add provider wrappers to `index.jsx`. Most specs import it, so a wrapper drags its whole
import graph into all of them. That is why there is no `renderWithSocket`.

## Phoenix sockets

`@lib/test-utils/phoenixDoubles` is plain JS with no `jest.fn`, so stories can import it too. For
jest semantics on a method, call `jest.spyOn(target, 'method')` after construction.

```js
import { makeMockSocket } from '@lib/test-utils/phoenixDoubles';

const socket = makeMockSocket();
const channel = socket.channels.get('topic:1'); // set once the code under test joins

channel.joinPush.fire('ok');         // complete the join
channel.joinPush.fire('error', {});  // or fail it
channel.emit('some_event', payload); // a server push to channel.on listeners
channel.pushed;                      // [{ event, payload, push }]: what the client sent
channel.triggerError();              // trip onError handlers
channel.triggerClose();              // trip onClose handlers
```

`makeMockSocket` keeps one `MockChannel` per topic. `socket.channel(topic)` returns the cached
instance forever. If the owner was rebuilt, `expect(getChannel()).toBe(channelFromBefore)`
still cannot fail for a fixed topic. Assert on the owner, not on channel identity.

Import the doubles through the `@lib` alias. The real `phoenix` package maps to an empty stub in
`mocks/phoenix.js`.

### Inject the socket through `SocketContext`

`@common/SocketProvider` exports `SocketContext` so that tests can inject a fake socket. Do not
`jest.mock('@common/SocketProvider')`.

```jsx
import { SocketContext } from '@common/SocketProvider';

render(
  <SocketContext.Provider value={socket}>
    <ComponentUnderTest />
  </SocketContext.Provider>
);
```

Use `value={null}` for the case with no socket. An explicit value is better than a mock that
`clearMocks` does not reset.

### Exception: a third-party hook

"Inject, do not mock" is about our own modules. A third-party hook often has no seam, and the
branches that you need depend on its return value. Then a module mock is correct:

```js
import { useActionBarCopy } from '@assistant-ui/core/react';

jest.mock('@assistant-ui/core/react', () => ({ useActionBarCopy: jest.fn() }));

useActionBarCopy.mockReturnValue({ copy: jest.fn(), disabled: false, isCopied: false });
```

- If the job of the component is to react to the return value of the hook, use it.
- If the hook is incidental and a real provider works, do not use it.
- Always pair it with an integration spec that runs the real library over the real transport.
  `assets/js/common/AIAssistant/AgUiEventFlow.test.jsx` is the model.

When the component hands the hook a callback, that callback is the unit. Take it from the
recorded call and invoke it:

```js
const [options] = useActionBarCopy.mock.lastCall;
await expect(options.copyToClipboard('some **markdown**')).rejects.toThrow();
```

A mock of `@assistant-ui/core/react` also changes primitives from `@assistant-ui/react` that use
the same hook module. Say so in the spec, so that a library bump that moves the primitive does
not surprise the next person.

## `waitFor`, `findBy` and `act`

`await act(async () => channel.emit(evt))` does not flush the AG-UI runtime. The runtime reads
events through its own rxjs pipeline, outside React's work loop. Only `waitFor` or `findBy`
waits for it. Use `act` for "the event was delivered", and a query wait for "the UI shows it".

Wrap only what has not arrived yet:

- The first check that a delta rendered: `await waitFor(() => expect(bubble()).toHaveTextContent(...))`.
- A later check that the same text survived a stop or a cleared configuration: plain `expect`,
  with no wrapper. This is a persistence claim, and `waitFor` polls past a short wipe.
- After an explicit settle barrier, a synchronous `getByText` catches a late arrival that
  `findByText` polls past.

Do not put `expect` in a shared setup helper, because the failure then points at the caller. Use
`await screen.findByText(delta)` as the barrier: when it fails, the DOM dump names the missing
text.

## Stories and play functions

Story code has no `waitFor`. Do not use a fixed sleep: it is too short on a loaded machine and
too long on a fast one. Poll on animation frames, as `AIAssistant.stories.jsx` does:

```js
const waitUntil = async (probe, timeoutMs = 2000) => {
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const found = probe();
    if (found) return found;
    if (Date.now() >= deadline) return null;
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
  }
};
```

It returns `null` on timeout instead of a throw, so a story that gives up shows a static render,
not a red screen.

## Queries: role and label first, test id last

Priority: `getByRole(role, { name })`, then `getByLabelText`, then `getByText`, then
`getByTestId`.

New code does not add `data-testid` to markup or to specs. When you touch a spec, a change from
test id queries to role or label queries is welcome. Prove it with a mutation
(`proving-test-changes`).

Before you delete a `data-testid` from production markup, search the Cypress suite. Page objects
and specs in `test/e2e/cypress/` use some of them as CSS selectors:

```bash
grep -rn "data-testid\|data-test-id" test/e2e    # from the repository root
grep -rn "the-exact-id" test/ assets/            # the one that you remove
```

Report the result either way.

When a component mock stands in for a subtree, render copy, not a test id:

```jsx
Parts: () => <span>message parts</span>, // then getByText('message parts')
```

## Lint and format

- `npx eslint <files>`. The flat configuration is `assets/eslint.config.js`. Components must be
  function declarations, not arrow constants. A local rule enforces this
  (`assets/tools/eslint-rules/functionComponentDefinition.js`).
- `npx prettier -c <path>` on the directory that you touched. CI checks the whole tree.
