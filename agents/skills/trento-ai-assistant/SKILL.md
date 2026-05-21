---
name: trento-ai-assistant
description: Use when modifying TrentoWeb.AIAssistantChannel, TrentoWeb.AIAssistant.AgUi, TrentoWeb.AIAssistantTools, the AI Assistant system prompt, or anything under Trento.AI.* (Agent + Server/Supervisor adapters + LLMBuilder + LLMRegistry + Configurations + UserConfiguration) or Trento.Infrastructure.AI.*. Covers the layered architecture from React assistant-ui down to the Gemini API, the PubSub event vocabulary the channel reacts to, the AG-UI event types emitted over the WebSocket, the Mox adapter pattern wrapping sagents, the langchain fork patches, model selection trade-offs, and how to verify changes end-to-end. Also useful when debugging "Sorry, I encountered an error" messages or when adding new tools, new AG-UI event types, or new prompt sections.
---

# Trento AI Assistant — channel + Trento.AI.* + sagents + langchain integration

This skill documents the Elixir side. The React + JS side is in the
sibling skill `trento-ai-assistant-ui`.

## When to invoke

- Editing `lib/trento_web/channels/ai_assistant_channel.ex`
- Editing `lib/trento_web/channels/ai_assistant/ag_ui.ex`
- Editing `lib/trento_web/channels/ai_assistant/ai_assistant_tools.ex`
- Editing the `@system_prompt` inside `lib/trento/ai/agent.ex`
- Editing anything under `lib/trento/ai/` (Agent, Agent.Server, Agent.Supervisor, LLMBuilder, LLMRegistry, Configurations, UserConfiguration, ApplicationConfigLoader)
- Editing anything under `lib/trento/infrastructure/ai/` (the sagents adapter impls)
- Reading or modifying anything under `deps/sagents/` or `deps/langchain/`
- Debugging an `Sorry, I encountered an error: ...` or `Failed to start agent...` push reaching the React UI
- Designing a new AG-UI event type to push to the client
- Adding a new tool to `AIAssistantTools.tools/0`
- Diagnosing `MALFORMED_FUNCTION_CALL`, `Exceeded max failure count`, `:lists.flatten("")`, or any langchain `LangChainError`
- Debugging Mox routing in `test/trento/ai/agent_test.exs` or `test/trento_web/channels/ai_assistant_channel_test.exs`

Do NOT invoke for unrelated channel work (`UserSocket`, other channels) unless those changes affect the AI assistant flow.

## Architecture

```
React (assistant-ui + @assistant-ui/react-ag-ui)
  ↕ Phoenix Channel WebSocket  "ai_assistant:<user_id>"
TrentoWeb.AIAssistantChannel       lib/trento_web/channels/ai_assistant_channel.ex
  ↕  emits via                     lib/trento_web/channels/ai_assistant/ag_ui.ex
TrentoWeb.AIAssistant.AgUi
  ↕  lifecycle via                 lib/trento/ai/agent.ex
Trento.AI.Agent
  ↕  Mox-able adapters             lib/trento/ai/agent/{server,supervisor}.ex
                                   lib/trento/infrastructure/ai/{sagents_agent_server,sagents_dynamic_supervisor}.ex
Sagents.AgentServer (per thread_id) + Sagents.AgentsDynamicSupervisor
  ↕  PubSub broadcast              topic "agent_server:<agent_id>"
Sagents.Agent → middleware stack → LangChain.LLMChain → ChatGoogleAI (fork)
  ↕
Google Gemini API
```

`agentic_runtime` was removed in May 2026 — trento talks to sagents directly via trento-owned adapters. No DB persistence of conversations; state lives in `Sagents.AgentServer` (one per JS-supplied `thread_id`) until inactivity timeout.

**Trento does NOT run `mix sagents.setup`.** No generated `Coordinator`, `Factory`, `Conversations` Ecto schemas, `IntegrationHelpers`, or LiveView helper modules. The modules in the table below are the trento-side equivalent of what the scaffold would have produced — written by hand to match trento's actual needs (no DB persistence, no LiveView, channel-based UI, in-memory thread state). If you're following the generic `sagents` skill and looking for our `Coordinator.start_conversation_session/2` or `Conversations` module, they don't exist — start at `Trento.AI.Agent.run/2` instead.

## Module roles

| Module | Path | Role |
|---|---|---|
| `TrentoWeb.AIAssistantChannel` | `lib/trento_web/channels/ai_assistant_channel.ex` | Phoenix.Channel. Translates JS `send_message` → `Trento.AI.Agent.run/2`; translates `{:agent, ...}` PubSub events → AG-UI emissions via `AgUi.*`. Owns the socket-assigns lifecycle (3 mutation helpers). Gates `join/3` on `Trento.AI.enabled?/0`. |
| `Trento.AI.Agent` | `lib/trento/ai/agent.ex` | Public `new!/1` (pure factory for `%Sagents.Agent{}`), `run/2(%Sagents.Agent{}, prompt)` (side-effecting trio: start + subscribe + add_message via adapters). Sole module touching sagents / langchain in production code. Owns the `@system_prompt`. |
| `Trento.AI.Agent.Server` | `lib/trento/ai/agent/server.ex` | Behaviour wrapping `Sagents.AgentServer.{subscribe,add_message}/N`. Mox-able. Default impl `Trento.Infrastructure.AI.SagentsAgentServer`. |
| `Trento.AI.Agent.Supervisor` | `lib/trento/ai/agent/supervisor.ex` | Behaviour wrapping `Sagents.AgentsDynamicSupervisor.start_agent_sync/1`. Default impl `Trento.Infrastructure.AI.SagentsDynamicSupervisor`. Callback spec narrowed to `{:ok, pid()} \| {:error, term()}` (3-tuple variant from sagents unreachable in practice). |
| `Trento.Infrastructure.AI.SagentsAgentServer` | `lib/trento/infrastructure/ai/sagents_agent_server.ex` | Concrete impl of `Trento.AI.Agent.Server`. `defdelegate ... to: Sagents.AgentServer`. |
| `Trento.Infrastructure.AI.SagentsDynamicSupervisor` | `lib/trento/infrastructure/ai/sagents_dynamic_supervisor.ex` | Concrete impl of `Trento.AI.Agent.Supervisor`. `defdelegate ... to: Sagents.AgentsDynamicSupervisor`. |
| `Trento.AI.LLMBuilder` | `lib/trento/ai/llm_builder.ex` | `build_for_user(user_id)` → `{:ok, %ChatGoogleAI{}\|%ChatOpenAI{}\|%ChatAnthropic{}}` or `{:error, :user_not_found \| :no_ai_configuration}`. Forces `stream: true`; Anthropic gets `thinking: %{type: "enabled"}`. |
| `Trento.AI.LLMRegistry` | `lib/trento/ai/llm_registry.ex` | Reads providers + models from app config via `ApplicationConfigLoader`. |
| `Trento.AI.ApplicationConfigLoader` | `lib/trento/ai/application_config_loader.ex` | Behaviour + default impl reading `:trento, :ai`. Mox-able (`Trento.AI.AICase` stubs it for tests). |
| `Trento.AI.Configurations` | `lib/trento/ai/configurations.ex` | `create_user_configuration/2` + `update_user_configuration/2` for the per-user AI config (encrypted via Cloak). |
| `Trento.AI.UserConfiguration` | `lib/trento/ai/user_configuration.ex` | Ecto schema; provider/model validated against `LLMRegistry` at changeset cast. `:api_key` is `EncryptedBinary`. |
| `TrentoWeb.AIAssistant.AgUi` | `lib/trento_web/channels/ai_assistant/ag_ui.ex` | Socket-in/socket-out functions for every AG-UI event the channel emits. Owns the 10 `AgUi.Core.Events.*` struct aliases + the `Phoenix.Channel.push/3` + camelCase encoding via `AgUi.Encoder.EventEncoder`. |
| `TrentoWeb.AIAssistantTools` | `lib/trento_web/channels/ai_assistant/ai_assistant_tools.ex` | `tools/0` returns 6 `%LangChain.Function{}` for Host/SapSystem/Database/Cluster listing + 2 Prometheus PromQL queries. Each reads `context.scope.id` (the `%Trento.Users.User{id: id}` partial struct passed via `Agent.new!`'s `:scope`). |

## Socket assigns

Channel `@moduledoc` is the **source of truth** for the assigns + 3 mutation helpers. Read it before adding a new assign or new handler. Summary:

| Assign | Type | Lifetime |
|---|---|---|
| `:current_user_id` | integer | from `UserSocket.connect` |
| `:current_scope` | `%Trento.Users.User{id: id}` partial struct | from `join/3` |
| `:loading` | boolean | toggled per run (double-send guard) |
| `:current_run_id` | UUID string | set per `send_message` (after validation) |
| `:current_thread_id` | UUID string | set per `send_message` (after validation) |
| `:message_id` | UUID string (= `current_run_id` today) | set per run |
| `:message_started` | boolean | per run — drives TEXT_MESSAGE_START dedup + orphan-END guard |
| `:run_has_started` | boolean | per run — stale-`:idle` guard |

Three private helpers consolidate mutations:

- `stash_run_ids/3` — called INSIDE `handle_incoming_prompt/4`'s happy branch, AFTER validation (loading-guard + non-empty prompt + LLMBuilder success). Prior IDs survive short-circuit cases.
- `activate_run/2` — once the sagents trio succeeds; flips `:loading: true` and zeros per-run booleans.
- `reset_run/1` — on `:idle` success, `:error`, and `run_agent` failure; clears per-run booleans + `:loading`. Leaves IDs alone (next `send_message` overwrites).

`:running` and `:llm_deltas` perform single-flag flips inline (`run_has_started`, `message_started`).

## Sagents PubSub event reference

Every event arrives at the channel as `{:agent, {:tag, payload}}`. Channel's `handle_info` clauses match the outer `{:agent, ...}` wrapper.

| Tag | Payload | Channel handles? | Notes |
|---|---|---|---|
| `:status_changed, :running, nil` | — | yes | Flips `:run_has_started: true`. |
| `:status_changed, :idle, _data` | varies | yes | Split on `:run_has_started` — stale-idle guard. `Sagents.AgentServer.init/1` broadcasts an initial `:idle` at boot that would otherwise emit a spurious `RUN_FINISHED`. |
| `:status_changed, :error, reason` | `%LangChainError{}` or term | yes | Pushes `RUN_ERROR` via `AgUi.run_error(reason)`. AgUi's `format_error/1` handles 3 input shapes (binary verbatim, LangChainError with prefix, other term with prefix + inspect). |
| `:llm_deltas, deltas` | `[%MessageDelta{}]` | yes | First delta emits `TEXT_MESSAGE_START`; every delta emits `TEXT_MESSAGE_CONTENT`. |
| `:llm_message, _message` | `%LangChain.Message{}` | no (catch-all) | `TEXT_MESSAGE_END` deferred to `:idle` so it arrives after the final delta. |
| `:tool_call_identified, tool_info` | atom-keyed `%{call_id:, name:, display_text:, arguments:, status: :identified}` | yes | Emits `TOOL_CALL_START` + `TOOL_CALL_ARGS` + `TOOL_CALL_END` back-to-back via `AgUi.tool_call_lifecycle/3`. |
| `:tool_execution_update, :completed, tool_info` | atom-keyed `%{call_id:, result:, ...}` | yes | Emits `TOOL_CALL_RESULT` via `AgUi.tool_call_result/3`. Other statuses (`:executing`, `:failed`, `:cancelled`, `:interrupted`) fall through to catch-all. |
| `:status_changed, :cancelled / :interrupted, _` | — | no (catch-all) | Cancel UX not implemented; HITL/AskUserQuestion middleware stripped → never fire. |
| `:llm_token_usage, _` | `%LangChain.TokenUsage{}` | no (catch-all) | Hot-path noise. |
| `:display_message_*`, `:todos_updated`, `:conversation_title_generated`, `:agent_shutdown`, `:node_transferring`, `:node_transferred` | — | no (catch-all) | No DB persistence; events not consumed. |

`handle_info(_msg, socket)` at the end of the module silently swallows unhandled events.

## AG-UI event reference

All event structs in `deps/ag_ui_ex/lib/ag_ui/core/events.ex` under `AgUi.Core.Events`. `TrentoWeb.AIAssistant.AgUi` is the **only** caller of `Phoenix.Channel.push(socket, "ag_ui_event", payload)`.

| Event | Type string | Emitted by `AgUi.*` function |
|---|---|---|
| `RunStarted` | `RUN_STARTED` | `run_started/3(socket, run_id, thread_id)` |
| `RunFinished` | `RUN_FINISHED` | `run_finished/3(socket, run_id, thread_id)` |
| `RunError` | `RUN_ERROR` | `run_error/2(socket, message)` |
| `TextMessageStart` | `TEXT_MESSAGE_START` | `maybe_text_message_start/1(socket)` — skipped when `:message_started: true` |
| `TextMessageContent` | `TEXT_MESSAGE_CONTENT` | `maybe_text_message_content/3(socket, msg_id, text)` — skipped on empty text |
| `TextMessageEnd` | `TEXT_MESSAGE_END` | `maybe_text_message_end/3(socket, started?, msg_id)` — skipped when `started?: false` (orphan-pair guard) |
| `ToolCallStart` + `ToolCallArgs` + `ToolCallEnd` | `TOOL_CALL_*` | `tool_call_lifecycle/3(socket, tool_info, parent_message_id)` (all 3 in one call) |
| `ToolCallResult` | `TOOL_CALL_RESULT` | `tool_call_result/3(socket, call_id, result)` (synthesizes `"tool_result_#{call_id}"` message_id) |

The AG-UI protocol expects camelCase keys. `AgUi.push_event/2` (private) delegates encoding to `AgUi.Encoder.EventEncoder.encode_json/1` → `Jason.decode!/1` round-trip → `Phoenix.Channel.push/3`. Single source of truth for wire format.

`RUN_STARTED` and `RUN_FINISHED` carry `runId` + `threadId` on the wire (declared in the struct). Other events don't — assistant-ui correlates non-Run events via `messageId` / `toolCallId`.

### `AgUi.run_error/2` framing

`run_error/2` pipes through a private `format_error/1` with 3 clauses:

| Input | Output |
|---|---|
| binary | passed through verbatim (no prefix) — used when channel callers already crafted user-ready strings like `"Failed to start agent..."` |
| `%LangChainError{message: m}` | `"Sorry, I encountered an error: #{m}"` (apologetic frame for model-side errors) |
| any other term | `"Sorry, I encountered an error: #{inspect(reason)}"` (apologetic frame + inspect for unknown) |

Don't reintroduce the `inspect` wrapping for binaries — it double-quotes legitimate strings.

## AG-UI tool-call lifecycle

Every tool call traverses **4 wire events**:

```
TOOL_CALL_START{tool_call_id, tool_call_name}
TOOL_CALL_ARGS{tool_call_id, delta}        one or more (streaming)
TOOL_CALL_END{tool_call_id}
TOOL_CALL_RESULT{tool_call_id, content}    after execution
```

Sagents collapses the LLM's argument stream into a single in-memory `tool_call.arguments` map BEFORE broadcasting `:tool_call_identified`. So `AgUi.tool_call_lifecycle/3` synthesizes Start + single Args + End back-to-back. assistant-ui's runtime doesn't care if Args is 1 chunk or N.

`tool_call_name` = `tool_info[:display_text] || tool_info[:name]` — prefer the human-friendly label, fall back to the technical name.

The Result half fires from the `:tool_execution_update :completed` handler — same `tool_call_id` correlates the four events on the React side.

## ID ownership

| ID | Owner | Where generated | Lifetime |
|---|---|---|---|
| `runId` | JS client | `assets/js/lib/ai/WebSocketAIAgent.js` `crypto.randomUUID()` | per user-message → response cycle |
| `threadId` | React UI | `assets/js/common/AIAssistant/AIAssistant.jsx` `useState(() => crypto.randomUUID())` + regenerated by "new thread" | until user resets |
| `agent_id` | trento channel | **equals `current_thread_id`** — no DB conversation, no derivation | shared with thread_id |
| `tool_call_id` | sagents / LangChain | `tool_info[:call_id]` from sagents — provider-specific | per LLM tool call |
| `result_message_id` | trento channel | `"tool_result_#{tool_call_id}"` synthesized in `AgUi.tool_call_result/3` | per tool result |
| `message_id` (text streaming) | trento channel | set to `run_id` at `activate_run/2`. Kept as separate assign for future split where a single run produces multiple text messages (e.g. `until_tool` or sub-agents) | per assistant text message |

**No backend ID generation.** JS owns `runId` (always sent in `send_message` payload); sagents owns `tool_call_id`. Channel relies on those contracts.

## Payload contract — `send_message`

`handle_in("send_message", …)` strict-matches:

```elixir
%{
  "message" => message_text,
  "run_id" => run_id,
  "thread_id" => thread_id
}
when is_binary(message_text) and is_binary(run_id) and is_binary(thread_id)
```

Catch-all clause logs `Logger.warning` and replies `{:reply, {:error, :invalid_payload}, socket}`. JS receives via the channel's standard `.receive('error', ...)` callback.

Matched clause does NOT immediately stash the IDs. It calls `handle_incoming_prompt/4` which short-circuits on:
- `:loading: true` (in-flight run)
- empty/whitespace trimmed prompt
- LLMBuilder error (`:no_ai_configuration` or `:user_not_found`)

Only on the happy branch (LLMBuilder returns `{:ok, model_config}`) does `stash_run_ids/3` set the assigns. This prevents a fast double-send from overwriting the live run's IDs.

## `join/3` gating

```elixir
case {AI.enabled?(), allowed?(user_id, current_user_id)} do
  {false, _} -> {:error, :ai_assistant_disabled}
  {_, false} -> {:error, :unauthorized}
  {true, true} -> {:ok, socket}
end
```

`AI.enabled?/0` reads the `:trento, :ai, enabled:` config via the (stubbed-in-tests) `ApplicationConfigLoader`. Disabled flag wins over auth — user with a wrong topic gets `:ai_assistant_disabled`, not `:unauthorized` (avoids leaking whether their user_id is valid when the feature is off).

`allowed?/2` uses `Integer.parse/1` (not `String.to_integer/1`) — non-numeric topic suffixes return `false` cleanly instead of crashing the channel join.

## Loading guard

`socket.assigns.loading` is the **server-side double-send guard**. Set `true` by `activate_run/2` after the sagents trio succeeds; reset `false` by `reset_run/1` (`:idle` success, `:error`, `run_agent` failure).

The channel does **not** push `:loading` to the client. React UI uses `isRunning` from `@assistant-ui/react`'s store, populated by `RUN_STARTED` / `RUN_FINISHED` AG-UI events.

Both layers necessary; neither replaces the other (server protects sagents from duplicate `add_message`; client drives Send button + spinner).

## Adapter / Mox testing pattern

Two behaviours wrap the sagents API surface `Agent.run/2` calls:

- `Trento.AI.Agent.Server` — `subscribe/1`, `add_message/2`
- `Trento.AI.Agent.Supervisor` — `start_agent_sync/1`

Each behaviour module dispatches via `Application.get_env(:trento, :ai, []) |> Keyword.get(:agent_<x>_adapter, <DefaultInfrastructureImpl>)`. Default impls in `lib/trento/infrastructure/ai/` use `defdelegate ... to: Sagents.<Mod>`. No nesting → no `Elixir.` prefix workaround needed.

`test/test_helper.exs` defines both Mocks via `Mox.defmock`. `config/test.exs` routes globally:

```elixir
config :trento, :ai,
  # ...providers...,
  agent_server_adapter: Trento.AI.Agent.Server.Mock,
  agent_supervisor_adapter: Trento.AI.Agent.Supervisor.Mock
```

Production boot does NOT touch the adapters (Sagents.Supervisor in the OTP tree is separate), so global Mock routing is safe. **Any future test calling `Agent.run/2` must set `Mox.expect/3` or fail loudly** under `Mox.verify_on_exit!` — load-bearing safety net.

### Channel test bridging

Channel test file is `async: true` (via `TrentoWeb.ChannelCase`). The channel runs in its own GenServer pid (≠ test pid). Mox expectations are owned by the test pid by default. Bridge with `Mox.allow/3`:

```elixir
{:ok, _, socket} = subscribe_and_join(...)
Mox.allow(Trento.AI.Agent.Supervisor.Mock, self(), socket.channel_pid)
Mox.allow(Trento.AI.Agent.Server.Mock, self(), socket.channel_pid)
expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)
# ...etc
push(socket, "send_message", %{...})
assert_push("ag_ui_event", %{"type" => "RUN_STARTED", ...})
```

Keeps `async: true`. Alternative would be `set_mox_global` + `async: false` — heavier.

## Test coverage map

| File | Tests | Coverage |
|---|---|---|
| `test/trento/ai/agent_test.exs` | 10 | `format_error/1` (3); `new!/1` (2 — shape + middleware whitelist); `run/2` (5 — happy + start short-circuit + subscribe short-circuit + add_message error + already-started accepted) |
| `test/trento_web/channels/ai_assistant_channel_test.exs` | 34 | `join/3` (5 incl. AI-disabled + Integer.parse safety); `send_message` payload contract (6); `handle_info` per-clause (~17 covering running/idle/error/llm_deltas/tool_call_identified/tool_execution_update + catch-all + delayed_completion); 1 send_message happy path; 3 error-path tests (LLMBuilder + sagents start failure + ID non-override) |
| `test/trento/ai/llm_builder_test.exs` | 5 | `user_not_found`, `no_ai_configuration`, GoogleAI + OpenAI + Anthropic providers each return correctly-shaped streaming `ChatModel` struct |
| `test/trento/ai/configurations_test.exs` | (existing) | `create_user_configuration/2`, `update_user_configuration/2`, validation paths |
| `test/trento/ai/llm_registry_test.exs` | (existing) | Provider + model registry lookups |
| `test/trento/ai_test.exs` | (existing) | Top-level `Trento.AI` delegate functions |
| `test/trento_web/controllers/v1/ai_configuration_controller_test.exs` | (existing) | REST surface for user AI config |

Manual smoke is still the verification for the streaming LLM path end-to-end (Mocks short-circuit at the adapter boundary; tests don't drive real `Sagents.AgentServer` execution).

## Common pitfalls

### Channel-side

- **`%Sagents.MiddlewareEntry{module:, config:}` shape post-init.** When inspecting `agent.middleware` after `Sagents.Agent.new!/2`, you get a list of structs, NOT `{mod, opts}` tuples. Destructure via `& &1.module`. Pre-init you pass tuples; the framework wraps them.
- **`Supervisor.start_agent_sync/1` spec is narrowed.** `{:ok, pid()} | {:error, term()}` only. Sagents declares a 3-tuple `{:ok, pid, :already_started}` variant but `wait_for_agent_ready/2` (the actual return path) never emits it. Don't widen back without verifying upstream.
- **`:run_has_started` guards stale `:idle`.** `Sagents.AgentServer.init/1` broadcasts `{:status_changed, :idle, nil}` at boot. Without the guard, the channel could emit a spurious `RUN_FINISHED` with stale IDs.
- **Mox routing is global via `config/test.exs`.** Any new test calling `Agent.run/2` must set expectations. Channel test pattern uses `Mox.allow/3` to bridge from test pid to channel pid (keeps `async: true`).
- **`ai_user_configuration_factory` ignores `attrs[:api_key]`.** Factory hardcodes `Faker.String.base64(32)`. Tests asserting on the api_key must capture the returned record: `%{api_key: key} = insert(:ai_user_configuration, ...)`.
- **`:current_scope` is a partial `%Trento.Users.User{id: id}`.** Only `:id` is populated. Don't read other fields. Tools fetch the full user via `Trento.Users.get_user(scope.id)` when needed.
- **Atom keys only on `tool_info`.** Sagents emits atom keys at every construction site. No string-key defensive fallbacks.
- **`AgUi.format_error/1` binary clause exists for a reason.** Channel string callers (`model_setup_error/1` results, `"Failed to start agent: ..."`) pass through verbatim — don't reintroduce `inspect` wrapping.
- **Don't put `Application.put_env(:trento, :ai_sagents_*_adapter, Mock)` globally in `test_helper.exs`.** Adapters live nested under `:trento, :ai` keyword list. The right keys are `:agent_server_adapter` and `:agent_supervisor_adapter`. Set them in `config/test.exs`, not `test_helper.exs`.

### Langchain-side

- **MALFORMED_FUNCTION_CALL `KeyError` at `chat_google_ai.ex:640`.** Gemini returns a candidate with no `"content"` key + `finishReason: "MALFORMED_FUNCTION_CALL"`. The streaming reduce expects `:index` and crashes. Fixed in the fork at commit `5def67f`, refactored at `a9d39e3`. With patch: surfaces as `Sorry, I encountered an error: Unexpected response`.
- **`empty_stream` `FunctionClauseError` at `chat_google_ai.ex:634`.** `List.flatten("")` crashes when `Req.Response.body` stays as the binary `""` (Gemini returned 200 OK with zero SSE chunks). Fixed in branch `fix/google-ai-empty-stream-body` (commit `468f0a9`) by adding `when is_list(data)` guard + an explicit `{:error, %LangChainError{type: "empty_stream"}}` clause. Surfaces as `Sorry, I encountered an error: Empty streaming response from Gemini (no delta chunks received)`.
- **`Exceeded max failure count`** from `LLMChain.do_run/1`. Default `max_retry_count: 3`. Counter bumps on delta-conversion failures only, not on clean `{:error, %LangChainError{}}` returns. When you see it, scroll back for the three `[error] Agent execution failed: ...` lines — those carry the real cause; the chain doesn't preserve them in the final message.
- **Langchain fork override** at `https://github.com/nelsonkopliku/langchain.git`. Trento's `mix.exs` pins via `{:langchain, github: ..., ref: ..., override: true}`. Bump the ref after pushing new patches.

### Prompt-side

- **Closed allow-lists fight middleware tools.** A "use ONLY these exact names" rule in the system prompt that lists only Trento data tools makes Gemini hallucinate Python-style pseudo-calls when it tries to invoke middleware tools (`write_todos`, etc.) it sees in the schema but the prompt forbids. Either drop the closed list or include middleware tool names.
- **"Always emit a real tool call" rule.** Without an explicit "do not write pseudo-code, Python-style invocations, or print statements describing a call" rule, Gemini 2.5 Flash sometimes produces `print(default_api.tool_name(...))` as text instead of a real function call. Current `@system_prompt` in `Trento.AI.Agent` has this rule — keep it.

## Model selection

- **`gemini-2.5-flash`** — cheap, fast, but produces `MALFORMED_FUNCTION_CALL` regularly with non-trivial tool schemas. Acceptable for prototyping.
- **`gemini-2.5-pro`** — much more reliable for tool calling. Switch to Pro before debugging "is the prompt wrong".
- **Where to switch.** Per-user, in `Trento.AI.UserConfiguration` (encrypted via Cloak). `Trento.AI.LLMBuilder.build_for_user/1` reads it during `handle_incoming_prompt/4`. React UI exposes a config screen.

## Sagents middleware stack

`Trento.AI.Agent.new!/1` configures `replace_default_middleware: true` and provides exactly 3 middleware:

- `Sagents.Middleware.TodoList` — `write_todos` tool for tracking multi-step planning.
- `Sagents.Middleware.Summarization` — auto-compact when token limits approach.
- `Sagents.Middleware.PatchToolCalls` — fix dangling tool calls from interrupted conversations.

Dropped vs sagents default stack: `FileSystem` (no FS UI), `SubAgent` (not used), `HumanInTheLoop` (no approval UX). Don't re-add without updating the channel to surface the new event types.

## Verification recipe

1. **Compile clean.** `mix compile --warnings-as-errors` after editing any AI module.
2. **AI surface tests.** `mix test test/trento/ai test/trento/ai_test.exs test/trento_web/channels/ai_assistant_channel_test.exs test/trento_web/controllers/v1/ai_configuration_controller_test.exs` → ~120 tests, 0 failures.
3. **Full suite.** `mix test`. Some unrelated tests are flaky (Postgrex sandbox / Mox global ownership in non-AI files); re-run if 1-4 failures appear outside `test/trento/ai`.
4. **Boot the app.** `mix phx.server`. Confirm no boot crash; `Sagents.Supervisor` starts cleanly.
5. **Smoke a conversation.** Open AI Assistant pane → channel joins. Send a prompt → watch React console for the full event stream: `RUN_STARTED` → `TOOL_CALL_*` → `TOOL_CALL_RESULT` → `TEXT_MESSAGE_*` → `RUN_FINISHED`. New-thread button → fresh `agent_id`.
6. **Force error paths.** Disable AI via config → channel rejects `join/3` with `:ai_assistant_disabled`. Set invalid model in user AI config → expect `RUN_ERROR` with `Failed to start agent.` Trigger a model error → expect `RUN_ERROR` with `Sorry, I encountered an error: ...`.

## Explicitly deferred work

- **Mid-session model config drift.** When user updates `Trento.AI.UserConfiguration` in another tab while the conversation's `AgentServer` is alive, the new config takes effect on the NEXT conversation OR after agent inactivity_timeout (10 min). Fix: detect drift in the channel and `stop_agent` before next send. Deferred.
- **Cancel UX.** No `handle_in("cancel", ...)`. Sagents `AgentServer.cancel/1` exists; channel doesn't call it. `:status_changed, :cancelled` not handled.
- **HITL / AskUserQuestion middleware.** Stripped from middleware list; no React UI for approvals. Re-add if/when product requires.
- **No `Agent.run/2` integration test** with real sagents + fake LangChain. Mox unit tests at adapter boundary are the chosen coverage.

## Conventions

- **All sagents/langchain calls go through `Trento.AI.Agent`.** Channel imports `Trento.AI.{Agent, LLMBuilder}` + `TrentoWeb.AIAssistant.AgUi` + `Trento.Users.User` only. No `alias Sagents.*` or `alias LangChain.*` in the channel.
- **Channel pushes errors via `AgUi.run_error/2`**, never `assign(:put_flash, ...)` (LiveView leftover — channel can't render flashes).
- **AG-UI event JSON keys are camelCase.** `AgUi.push_event/2` handles encoding. Don't push raw structs.
- **All `AgUi.*` functions are socket-in/socket-out.** Pipe them.
- **Minimal integration.** Don't reintroduce DB persistence, Coordinator-style scaffolding, or LiveView-shaped abstractions (no `:page_title`, no `stream_insert`, no flashes).
- **Don't add tests for tautological functions.** `new!/1`'s shape test is OK because it pins the middleware whitelist (regression value). Skip tests that just re-state the implementation.

## How we got here (lineage)

Trento's AI Assistant didn't land at "thin direct layer + no scaffold" on day one. The architecture evolved through four stops worth understanding before changing anything load-bearing:

1. **[`sagents-ai/agents_demo`](https://github.com/sagents-ai/agents_demo)** — sagents' canonical scaffolded example. LiveView-based. Useful baseline for understanding what `mix sagents.setup` produces (Conversations Ecto context, AgentPersistence + DisplayMessagePersistence callbacks, Coordinator, Factory, LiveView helpers).
2. **[`trento-project/agentic_runtime` PR #5](https://github.com/trento-project/agentic_runtime/pull/5)** — the scaffold output committed verbatim into a standalone `agentic_runtime` library. First step toward reuse.
3. **[`trento-project/agentic_runtime` PR #4](https://github.com/trento-project/agentic_runtime/pull/4)** — adaptation to make the LiveView-shaped scaffold consumable by a Phoenix.Channel host. Where IntegrationHelpers stopped pushing flashes and started accepting socket-in / socket-out call shapes. The original `ServerAdapter` / `SupervisorAdapter` pattern was born here — our current `Trento.AI.Agent.{Server,Supervisor}` mirrors it.
4. **[`trento-project/web` PR #4254](https://github.com/trento-project/web/pull/4254)** — full wire-up of `agentic_runtime` into the trento React UI + channel. The maximalist version of the integration; everything later dropped (DB persistence, HITL, FileSystem, Coordinator, IntegrationHelpers) was once present here.
5. **[`trento-project/docs` PR #164 RFC thread](https://github.com/trento-project/docs/pull/164/changes#r3239963415)** — the discussion that scoped down to "no DB persistence, no HITL, no FileSystem, JS owns thread_id, drop the wrapper". Read this before re-introducing any of those features — the trade-offs are already argued.

Each subsequent decision (drop the wrapper, narrow the middleware, mock-at-adapter) was a delta from #4. This skill describes the *resulting* code; the links above describe what was tried and shed.

## What we deliberately don't have (yet) — opt-in path

The scaffold can be reintroduced incrementally if product demands it. Each item below is independent — you can pick one without dragging the others in. None require re-introducing `agentic_runtime`; they slot directly into the existing `Trento.AI.*` modules.

| Capability | What it gives the UI | What it would take to add |
|---|---|---|
| Multi-conversation history | Persistent threads across browser sessions / tabs | Reintroduce `sagents_conversations` + `sagents_display_messages` tables (see `agentic_runtime` PR #5 for the schema), implement `Sagents.DisplayMessagePersistence` callback module, pass it to `Sagents.AgentsDynamicSupervisor.start_agent_sync(..., display_message_persistence: ...)`, add a `:conversation_id` channel param, update JS to load past messages. |
| `AgentPersistence` (state snapshots) | Survive process restarts / Horde rebalances within an active conversation | Implement `Sagents.AgentPersistence` behaviour with an Ecto-backed module; pass it via `Sagents.AgentsDynamicSupervisor.start_agent_sync(..., agent_persistence: ...)`. |
| `HumanInTheLoop` middleware | Approval gating on configured tools (e.g. destructive actions) | Add `Sagents.Middleware.HumanInTheLoop` to the middleware list in `Trento.AI.Agent.new!/1`; add channel `handle_info` clause for `:status_changed, :interrupted`; add React UI to render the interrupt + collect approve/reject; add `handle_in("resume", ...)` calling `Sagents.AgentServer.resume/2`. |
| `AskUserQuestion` middleware | LLM can ask structured typed questions | Same shape as HITL — middleware add + interrupt handler + React UI for typed responses + resume call. |
| `FileSystem` middleware | LLM can `read_file` / `write_file` against a virtual FS | Middleware add + scope key (`filesystem_scope`) + React UI to surface file events + persistence backend choice (memory / DB / S3). |
| Mid-session model config change | User picks a new model while an AgentServer is alive | Detect config drift in `handle_in("send_message", ...)` and call `Sagents.AgentsDynamicSupervisor.stop_agent(thread_id)` before next start. |
| Conversation title auto-generation | "What we talked about" in a thread-list UI | Re-add the scaffold's `ConversationTitle` middleware to the list + handle the `:conversation_title_generated` PubSub event in the channel + persist via Conversations (requires DB-persistence row above). |
| Cancel UX | "Stop the run" button | Channel `handle_in("cancel", ...)` calls `Sagents.AgentServer.cancel/1`; channel handler for `:status_changed, :cancelled` pushes `RUN_ERROR` or a dedicated cancelled event. |

Order matters: DB persistence unlocks history + title; HITL/AskUserQuestion need both middleware + matching React UI; FileSystem needs all of the above.

## Related skills

- `trento-ai-assistant-ui` — React + JS counterpart (assistant-ui glue, WebSocketAIAgent, providers).
- `sagents` — generic sagents v0.7 library reference (not trento-specific).
