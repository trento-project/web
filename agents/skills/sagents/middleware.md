# Middleware

Middleware is sagents' primary extension mechanism. Each middleware can add tools, contribute to the system prompt, transform state before/after LLM calls, handle async messages, register observability callbacks, and trigger HITL interrupts.

## Behaviour callbacks

All optional except where noted.

| Callback | Arity | When | Returns |
|---|---|---|---|
| `init/1` | `(opts)` | Once at `Agent.new`, builds middleware config | `{:ok, config}` or `{:error, reason}` |
| `system_prompt/1` | `(config)` | Once at `Agent.new` — **NOT per execution** | `binary()` (instructions) |
| `tools/1` | `(config)` | Once at `Agent.new` | `[%LangChain.Function{}]` |
| `before_model/2` | `(state, config)` | Forward order, each LLM round | `{:ok, state}` \| `{:interrupt, state, data}` \| `{:error, reason}` |
| `after_model/2` | `(state, config)` | Reverse order, each LLM round | same as `before_model` |
| `handle_resume/5` | `(agent, state, resume_data, config, opts)` | During `Agent.resume/3` | `{:ok, state}` \| `{:cont, state}` \| `{:error, reason}` |
| `handle_message/3` | `(message, state, config)` | When `notify_middleware/3` routes a message to this middleware | `{:ok, state}` |
| `on_server_start/2` | `(state, config)` | AgentServer startup, before first execution | `{:ok, state}` \| `{:error, reason}` |
| `callbacks/1` | `(config)` | Once, registers LangChain callback handlers | `%{...}` callback handler map |

Helpers:
- `Middleware.entry(Module, opts)` — build entry struct.
- `Middleware.apply_handle_resume/5` — safely invokes `handle_resume/5` with `UndefinedFunctionError` rescue (for middleware that don't implement it).
- `Middleware.get_callbacks/1`, `Middleware.collect_callbacks/1` — extract/aggregate observability handlers.

## Sandwich ordering

```
[A, B, C, HumanInTheLoop]

before_model:   A → B → C → HITL → LLM call
after_model:    LLM call → HITL → C → B → A
```

`HumanInTheLoop` **must be last** because it executes tools and detects new interrupts produced by earlier middleware, re-triggering the resume cycle to surface them.

Built-in stack from generator template (`factory.ex.eex`):

```elixir
middleware: [
  TodoList,
  FileSystem,
  SubAgent,
  Summarization,
  PatchToolCalls,
  AskUserQuestion,
  HumanInTheLoop      # always last
]
```

## System prompt is built once

`system_prompt/1` runs **only at `Agent.new`**. Capture stable config in `init/1`, interpolate it in `system_prompt/1`. **Never put user-controlled data in the system prompt** — that's a prompt-injection vector and won't reflect updates anyway.

```elixir
@impl true
def init(opts), do: {:ok, %{timezone: Keyword.fetch!(opts, :timezone)}}

@impl true
def system_prompt(config), do: "Timezone: #{config.timezone}"

@impl true
def before_model(state, _config) do
  # User context goes in messages, not system prompt
  {:ok, prepend_user_info(state)}
end
```

## Triggering interrupts (HITL)

Return `{:interrupt, state, interrupt_data}` from `before_model` or `after_model`. AgentServer transitions to `:interrupted`, persists state (lifecycle `:on_interrupt`), broadcasts status. Resume via `AgentServer.resume(agent_id, resume_data)`.

```elixir
@impl true
def after_model(state, _config) do
  if requires_review?(state) do
    {:interrupt, state, %{type: :review_needed, reason: "sensitive content"}}
  else
    {:ok, state}
  end
end

# Claim the interrupt by pattern-matching its shape
@impl true
def handle_resume(agent, %State{interrupt_data: %{type: :review_needed}} = state,
                  resume_data, _config, _opts) do
  if resume_data.approved, do: {:ok, state}, else: {:error, "User rejected"}
end

# Default head: pass through to next middleware
def handle_resume(_agent, state, _resume_data, _config, _opts), do: {:cont, state}
```

**Re-scan mechanism (since v0.4.3):** if `handle_resume` returns `{:cont, state}` *and* the state has new `interrupt_data`, the middleware stack is re-scanned with `resume_data = nil` so the owning middleware can claim the new interrupt.

## Async tasks (`handle_message/3`)

Spawn background work without blocking the agent loop, then route results back via `AgentServer.notify_middleware/3`.

```elixir
@impl true
def after_model(state, config) do
  agent_id = state.agent_id   # CAPTURE BEFORE SPAWNING — state objects don't carry into closures reliably
  Task.start(fn ->
    title = generate_title(state.messages)
    AgentServer.publish_event_from(agent_id, {:title_updated, title})  # broadcast first
    AgentServer.notify_middleware(agent_id, __MODULE__, {:title_ready, title})  # then state update
  end)
  {:ok, state}
end

@impl true
def handle_message({:title_ready, title}, state, _config) do
  {:ok, State.put_metadata(state, "conversation_title", title)}
end
```

State updates via `handle_message/3` automatically trigger debug events. User-facing broadcasts should fire from the task before sending the completion message (so subscribers see the result regardless of state-update timing).

## Cross-middleware data via metadata

Use **string keys** in `state.metadata` — required for JSONB serialization.

```elixir
# Producer (e.g. on_server_start sets a default)
@impl true
def on_server_start(state, config) do
  {:ok, State.put_metadata(state, "timezone", config.timezone)}
end

# Consumer (in another middleware's tool function)
function: fn _args, context ->
  tz = State.get_metadata(context.state, "timezone") || "UTC"
  {:ok, "Scheduled in #{tz}"}
end
```

`on_server_start/2` return values are **applied** since v0.7.0 (previously discarded — middleware couldn't observe each other's startup changes). If `on_server_start` returns `{:error, reason}`, AgentServer logs which middleware failed and continues startup (since v0.5.0).

## Observability callbacks

Register via the `callbacks/1` callback. Multiple middleware can coexist; all handlers fire per event.

Model-level (LLM lifecycle):
- `on_llm_new_delta` — streaming tokens
- `on_llm_token_usage` — usage metrics
- `on_llm_ratelimit_info` — rate-limit headers
- `on_llm_response_headers` — HTTP headers
- `on_llm_error` — every individual API call failure (incl. transient — broadcast to debug topic as `{:llm_error, error}`, since v0.5.0)

Chain-level (agent behaviour):
- `on_tool_execution_started` / `on_tool_execution_completed` / `on_tool_execution_failed`
- `on_message_processed`
- `on_retries_exceeded`
- `on_error_message_created`
- `on_error` — terminal chain error after all retries/fallbacks (broadcast on main topic as `{:chain_error, error}`, since v0.5.0)

Cascades automatically to sub-agents — unified observability across the whole agent tree.

## Built-in middleware

| Middleware | Purpose | Notable opts |
|---|---|---|
| `TodoList` | `write_todos` tool, broadcasts full snapshots | `:display_text` (UI label override) |
| `FileSystem` | File ops via `FileSystemServer` | `:scope`, `:enabled_tools`, `:custom_tool_descriptions`, `:custom_display_texts`, `:entry_to_map` |
| `SubAgent` | Spawn child agents under DynamicSupervisor | `:configs` (list of `%SubAgent.Config{}`) |
| `Summarization` | Compress message history for LLM context | various thresholds |
| `PatchToolCalls` | Rewrite tool calls before execution | |
| `AskUserQuestion` | `ask_user` tool with typed responses | response formats: `:single_select`, `:multi_select`, `:freeform`; `:allow_other`, `:allow_cancel` |
| `HumanInTheLoop` | Gate tool execution behind approval policy | `:policy` callback |
| `DebugLog` | File-based debug log of execution | `:enabled` (default `true`; set `false` in prod via `Application.compile_env`) |

`SubAgent.task_subagent_boilerplate/0` (public since v0.7.0) — encodes the "no user, complete-or-fail, no clarifying questions" framing for task-style sub-agents. Use as boilerplate in custom `Task` modules implementing `Sagents.SubAgent.Task` behaviour.

## Tool function signature

Tools receive `(args, context)`. `args` are LLM-provided JSON-parsed args. `context` is the merged custom_context map (see `context.md`).

Return shapes:
- `{:ok, result}` — string result, no state change.
- `{:ok, result, updated_state}` — third element merges into State (state delta propagated by `Sagents.Modes.AgentExecution`).
- `{:error, reason}` — surfaces to LLM for recovery handling.

```elixir
Function.new!(%{
  name: "search",
  description: "Search the project",
  parameters_schema: %{type: "object", properties: %{q: %{type: "string"}}, required: ["q"]},
  function: fn %{"q" => q}, context ->
    results = Search.run(context.scope, q)
    {:ok, format(results), State.put_metadata(context.state, "last_search", q)}
  end
})
```

Middleware config is captured via closure when building the function — it is NOT in `context`.

## Modes

Default `Sagents.Modes.AgentExecution` composes:
- `check_pre_tool_hitl/2` — checks tool calls against HITL policy before execution
- tool execution
- `propagate_state/2` — merges tool result state deltas into chain custom_context

Set `agent.mode` to a custom `LLMChain.Mode` impl when you need a different pipeline. Build from reusable `Sagents.Mode.Steps` functions. Sagents detects and warns when agents use lower-level LangChain run modes that bypass HITL/state propagation.

## Testing middleware

- Unit-test each callback directly with `State.new/1` fixtures.
- Integration-test via `Agent.execute/3` with stubbed model.
- `@tag :live_call` for tests requiring real LLM calls.
- Use `Mimic` for mocking external deps.

## Disabling a middleware

When a host app doesn't use one of the built-in middleware (e.g. no HITL approval UI, no FileSystem-backed tools), drop it from the agent's middleware list to shrink the per-LLM-round token budget and the surface area to maintain.

A built-in middleware typically has **five surfaces** in a sagents-consuming app. Disable all five for a clean state:

| Surface | Where | What to comment |
|---|---|---|
| **Factory wiring** | App's agent factory (`build_middleware/N`) | The `Sagents.Middleware.X` entry in the middleware list |
| **SubAgent block_middleware** | Same factory, inside `{Sagents.Middleware.SubAgent, [block_middleware: [...]]}` | Same module, if it's also propagated to sub-agents |
| **Coordinator opt** | Coordinator's `start_conversation_session/2` and per-middleware opts (e.g. `:filesystem_scope`, `:interrupt_on`) | Binding + propagation through `do_start_session/N` + factory_opts merge |
| **Channel / LiveView event handlers** | Host app handlers for `:interrupted`, file-change events, etc. | The `handle_info` / `handle_in` clause(s) — leave a defensive net for unforeseen `:interrupted` if useful |
| **Caller-side state assigns** | LiveView/channel assigns (`:pending_tools`, `:hitl_decisions`, `:interrupt_data`, etc.) | `init_agent_state/1` lines that set them |
| **Tests** | `*_test.exs` | Assertions on disabled middleware; tests for now-undefined functions |

Order matters: factory first (kills the broadcast source), then call sites (no readers), then state assigns (clean slate). Run `mix compile --warnings-as-errors` after each step.

**Sub-agent propagation** — if you disable a middleware in the parent, also remove it from `block_middleware` in any `{SubAgent, ...}` config in the same factory. Otherwise sub-agents still get it.

**Defensive `:interrupted` handler** — even after disabling all interrupt-producing middleware, consider keeping a defensive `handle_info({:agent, {:status_changed, :interrupted, _}}, socket)` clause in the channel that pushes a `RunError`. Sagents itself can fire `:interrupted` for sub-agent HITL escalation in edge cases.
