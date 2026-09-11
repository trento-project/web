---
name: trento-ai-assistant-ui
description: Use when modifying any React component under assets/js/common/AIAssistant/, the WebSocketAIAgent transport at assets/js/lib/ai/, the AG-UI runtime wiring through @assistant-ui/react + @assistant-ui/react-ag-ui, the per-user AI provider/model selection UI, or debugging React-side symptoms like missing TEXT_MESSAGE_END events, runtime errors from `useAgUiRuntime`, "channel join timeout", or the AI Assistant pane failing to render. Pair this with trento-ai-assistant for the Elixir/Phoenix channel counterpart.
---

# Trento AI Assistant — React + JS client

This skill documents the browser side. The Elixir/Phoenix-channel side is in the sibling skill `trento-ai-assistant`.

## When to invoke

- Editing anything under `assets/js/common/AIAssistant/` (the React components)
- Editing anything under `assets/js/lib/ai/` (the WebSocket transport, providers, connection status)
- Adding or modifying the per-user AI configuration UI (model / provider selection)
- Debugging React-side symptoms:
  - Assistant pane fails to render or stays in "Connecting..."
  - `RUN_FINISHED` arrives but the assistant message UI never settles
  - Channel join errors or "channel join timeout" surfaced in the console
  - Stale messages from a prior thread leaking into a new one
  - `AbstractAgent.onError` callbacks firing unexpectedly
- Changing how `assistant-ui` (the rendering library) integrates with the AG-UI event stream
- Touching the Vitest tests under the same paths

Do NOT invoke for unrelated React work (cluster pages, host pages, etc.) — only the AI Assistant pane.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                 React: <AIAssistant />                       │
│  AIAssistant.jsx (modal + thread state owner)                │
│       │                                                       │
│       │ provides: userID, threadID (regenerable on "new")    │
│       ▼                                                       │
│  AssistantChatProvider.jsx                                   │
│       │ builds: new WebSocketAIAgent({socket, userID, ...})  │
│       │ wraps with: <AssistantRuntimeProvider>               │
│       │             runtime = useAgUiRuntime({ agent })      │
│       ▼                                                       │
│  AssistantThread.jsx + subcomponents                         │
│  (assistant-ui renders messages, tool calls, prompt input)   │
└──────────────────────────────────────────────────────────────┘
                            ↕ (rxjs Observable of AG-UI events)
┌──────────────────────────────────────────────────────────────┐
│           WebSocketAIAgent (extends AbstractAgent)           │
│  assets/js/lib/ai/WebSocketAIAgent.js                        │
│   - initialize() — join Phoenix channel "ai_assistant:<id>"  │
│   - run({messages, threadId}) — push "send_message" + create │
│     an Observable that emits each "ag_ui_event" the channel  │
│     pushes back, completes on RUN_FINISHED, errors on        │
│     RUN_ERROR                                                 │
└──────────────────────────────────────────────────────────────┘
                            ↕ (Phoenix.Socket WebSocket)
                       Phoenix backend channel
                  (see trento-ai-assistant skill)
```

The browser is a transport + render layer. All chat logic — message accumulation, tool-call rendering, prompt composition — is provided by `@assistant-ui/react` + `@assistant-ui/react-ag-ui`. Our code wires the runtime to a Phoenix channel and translates the channel's `ag_ui_event` push into the rxjs Observable that `useAgUiRuntime` consumes.

## Module roles

### `assets/js/lib/ai/` (transport + utilities)

| File | Role |
|---|---|
| `WebSocketAIAgent.js` | `class WebSocketAIAgent extends AbstractAgent`. Owns the Phoenix `Channel` for `"ai_assistant:<userID>"`. `run({messages, threadId})` returns an `Observable` per user message; pushes `send_message` with `{message, thread_id, run_id}` and forwards each incoming `ag_ui_event` to the subscriber. Completes the Observable on `RUN_FINISHED`, errors it on `RUN_ERROR`. Drops connection state on `channel.onError`/`onClose`. |
| `connectionStatus.js` | `CONNECTION_STATUS = { DISCONNECTED, CONNECTING, CONNECTED }` enum. Used by `WebSocketAIAgent` and surfaced to the UI via `onConnectionChange` callback. |
| `providers.js` | Per-provider metadata for the AI configuration UI (provider display names, supported models, defaults). |
| `index.js` | Re-exports for `@lib/ai` import path. |

### `assets/js/common/AIAssistant/` (React components)

| File | Role |
|---|---|
| `AIAssistant.jsx` | Top-level pane. Owns `threadID` state (`useState(() => crypto.randomUUID())`). "New thread" callback regenerates the UUID. Renders the `ModalFrame` + `AssistantChatProvider`. |
| `AssistantChatProvider.jsx` | Builds the `WebSocketAIAgent` instance from `useSocket()` + `userID`. Calls `useAgUiRuntime({ agent })`. Wraps children in `AssistantRuntimeProvider`. On `threadID` change, calls `runtime.thread.reset()` to wipe the prior thread's messages (`useAgUiRuntime` keeps state in a `useRef` across agent swaps — explicit reset is required). |
| `AssistantThread.jsx` | Renders the chat thread using assistant-ui's primitives. Composes `ThreadWelcome/` (empty state), `MessageBubble/` (assistant + user messages), `PromptComposer/` (input + send button), `AgentProgressIndicator/` (in-flight spinner driven by `isRunning`). |
| `ChatHeader/` | Title + "new thread" button + close button. |
| `MessageBubble/` | Individual message rendering (text, tool calls, tool results). |
| `PromptComposer/` | Text input + send button. Send hidden while `isRunning` (driven by assistant-ui's store). |
| `AgentProgressIndicator/` | Spinner + "thinking..." message during a run. |
| `ThreadWelcome/` | Empty-state placeholder before the first message. |
| `ModalFrame/` | Modal shell around the chat. |
| `index.js` | Re-exports for `@common/AIAssistant`. |

### Tests (Vitest)

| File | Coverage |
|---|---|
| `assets/js/lib/ai/WebSocketAIAgent.test.js` | `extractMessageText/1` helper; channel join + error paths; `run()` Observable lifecycle (complete on RUN_FINISHED, error on RUN_ERROR, abort on disconnect). |
| `assets/js/lib/ai/providers.test.js` | Provider metadata lookups. |
| `assets/js/common/AIAssistant/AssistantChatProvider.test.jsx` | Mounts the provider with a fake socket; verifies agent lifecycle + thread reset on threadID change. |
| `assets/js/common/AIAssistant/AgUiEventFlow.test.jsx` | End-to-end React-side flow: stub `WebSocketAIAgent`, feed canned AG-UI events through the Observable, assert assistant-ui renders the expected message/tool sequence. |

## AG-UI event flow

`useAgUiRuntime({ agent })` (from `@assistant-ui/react-ag-ui`) subscribes to `agent.run(...)`'s Observable and translates incoming AG-UI events into assistant-ui's internal store (messages, tool calls, run state). Our `WebSocketAIAgent.run()` just forwards events from the Phoenix channel verbatim — no event translation on the JS side.

Events we forward:

- `RUN_STARTED` — assistant-ui flips `isRunning: true`.
- `TEXT_MESSAGE_START` / `_CONTENT` / `_END` — assistant-ui builds a streaming assistant message.
- `TOOL_CALL_START` / `_ARGS` / `_END` — assistant-ui renders a tool-call card.
- `TOOL_CALL_RESULT` — assistant-ui renders the result inside the tool-call card.
- `RUN_ERROR` — Observable errors out → assistant-ui shows the error message; `isRunning: false`.
- `RUN_FINISHED` — Observable completes → assistant-ui flips `isRunning: false`.

Other event types (`THINKING_*`, `STEP_*`, `STATE_*`, `CUSTOM`) are supported by assistant-ui out of the box but not emitted by the trento channel today. See `trento-ai-assistant` for what the channel emits and why.

## ID ownership (JS side)

| ID | Generated by | Sent in `send_message` payload? |
|---|---|---|
| `userID` | `<AIAssistant>` consumer (the page mounting the assistant) | no — used to scope the channel topic `"ai_assistant:<userID>"` |
| `threadID` | `AIAssistant.jsx` `useState(() => crypto.randomUUID())` — regenerated by the "new thread" button | yes (as `thread_id`) |
| `runId` | `WebSocketAIAgent.js` line ~122, fresh per `run()` call (`crypto.randomUUID()`) | yes (as `run_id`) |

The backend never generates these. The channel echoes them in `RUN_STARTED` / `RUN_FINISHED` events for assistant-ui's correlation. See `trento-ai-assistant` "ID ownership" for the full picture.

## `send_message` payload contract

```js
this.channel
  .push('send_message', {
    message: extractMessageText(lastMessage),
    thread_id: threadId,
    run_id: runId,
  })
  .receive('error', (error) => { ... });
```

All three fields are required. The channel strict-matches and replies `{:error, :invalid_payload}` if any are missing or non-string. The `.receive('error', ...)` callback catches both transport errors (channel push failure) AND application errors (the channel's `:invalid_payload` reply).

`extractMessageText/1` (exported from `WebSocketAIAgent.js`) collapses assistant-ui's message-content shape (string OR array of `{type, text}` parts) to a plain string.

## Connection lifecycle

`WebSocketAIAgent` tracks one of three statuses:

- `DISCONNECTED` — initial state, on disconnect, on join failure.
- `CONNECTING` — during `initialize()`.
- `CONNECTED` — after successful `channel.join()`.

State transitions surface via the `onConnectionChange` callback the consumer passes in (e.g. `AssistantChatProvider`'s `onConnectionChange` prop). The UI uses this to render the right "connecting / connected / disconnected" affordances.

**Auto-recovery is deliberate**: on `channel.onError` / `onClose`, the agent flips to `DISCONNECTED` but does NOT null out `this.channel`. Phoenix's `Socket` auto-rejoins the channel when the WebSocket comes back, and the joinPush's `receive('ok')` flips status back to `CONNECTED`. `channel.push` also buffers while down + flushes on rejoin → "drop → recover → prompt" sequences Just Work without consumer code.

## Disabled / unauthorized channel join

The channel's `join/3` returns one of:

- `:ok` — normal join.
- `:ai_assistant_disabled` — feature flag off in `:trento, :ai, enabled:`.
- `:unauthorized` — `current_user_id` doesn't match the topic suffix.
- `:user_not_logged` — no `current_user_id` assigned on the socket.

`WebSocketAIAgent.initialize()` rejects the join promise with the failure reason. `AssistantChatProvider`'s `agent.initialize().catch(noop)` swallows the rejection (consumer reads the status via `onConnectionChange` → DISCONNECTED). Add explicit UI handling if you want to distinguish the four error reasons in the pane (e.g. show "AI Assistant is disabled" vs "Connection lost").

## Common pitfalls

- **Don't `null` the channel on disconnect.** Phoenix auto-rejoins; nulling the reference loses buffered pushes and breaks the recover path. See the `_setupChannelHandlers` comment.
- **`threadID` changes need explicit `runtime.thread.reset()`.** `useAgUiRuntime` retains state across agent swaps via `useRef`. Without the reset, prior-thread messages stick around. `AssistantChatProvider` does this via the `previousThreadIDRef` effect.
- **The `disconnect()` tear-down error is tagged `AbortError`.** AbstractAgent's `onError` has an allowlist for `AbortError` — without the tag, the in-flight subscriber would surface an unhandled error during unmount.
- **`extractMessageText` only extracts `type === 'text'` parts.** assistant-ui's content array can include `{type: 'image', ...}` and friends; image attachments would be dropped silently. Add handling if image messages enter scope.
- **`run({messages})` reads `last(messages)`.** Re-running with the same message array would push it again. assistant-ui's runtime is supposed to only invoke `run` once per user message — verify if you see duplicate `send_message` events in the channel logs.
- **The `_activeRunId` guard in the Observable teardown.** `if (this._activeRunId === runId) this._clearActiveRun()` prevents a stale Observable's teardown from clobbering a newer run's state. Don't simplify away.
- **Console-log debugging.** `WebSocketAIAgent._handleAgUiEvent` is the chokepoint for ALL incoming events — `console.log(event)` there gives you the full wire stream during local development. Useful when correlating React-side rendering with channel-side emissions documented in `trento-ai-assistant`.

## Conventions

- **No business logic in the React layer.** Channel decides what events to emit. UI just renders.
- **assistant-ui is the source of truth for message store + run state.** Don't keep parallel state in our components.
- **Use `useSocket()` from `@common/SocketProvider`** to get the Phoenix socket — never construct one directly in the AI Assistant code.
- **Test the Observable lifecycle, not the channel internals.** The Vitest tests stub the Phoenix channel; integration with the real channel is verified manually.

## Verification recipe

1. **Type-check + lint.** `npm run lint` from `assets/`.
2. **Tests.** `npm test -- WebSocketAIAgent AssistantChatProvider AgUiEventFlow` from `assets/`. All green.
3. **Storybook.** `npm run storybook` and inspect the `AIAssistant.stories.jsx` story — confirms components render in isolation with fake data.
4. **Live smoke** (full stack):
   - `mix phx.server` (Elixir backend running with sagents + langchain configured)
   - Open a browser, log in, open AI Assistant pane.
   - Verify "Connecting..." flips to connected. Send a prompt that triggers a tool call.
   - In the browser devtools console, drop a `console.log(event)` in `_handleAgUiEvent` to watch the full event stream.
   - Click "new thread" → confirm the messages clear and a new `threadID` is generated.
5. **Reconnect path.** While a conversation is active, stop & restart `mix phx.server`. The agent should flip to DISCONNECTED then back to CONNECTED on its own. Next prompt should work without a page reload.

## Related skills

- `trento-ai-assistant` — Elixir-side counterpart (channel, AgUi module, tools, sagents adapters).
- `sagents` — sagents v0.7 library reference (generic, not trento-specific).
