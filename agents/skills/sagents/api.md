# sagents API reference

## `Sagents.Agent` (immutable config)

Created via `Agent.new/1`. Holds model + middleware definitions; no runtime data.

Key fields:
- `model` — LangChain chat model struct (e.g. `ChatOpenAI`, `ChatAnthropic`).
- `middleware` — list of `%Sagents.Middleware.Entry{}` (built via `Middleware.entry/2`).
- `tools` — list of `%LangChain.Function{}` (assembled by middleware `tools/1` callbacks).
- `scope` — integrator-defined struct (e.g. `%MyApp.Accounts.Scope{}`). First-class tenancy/auth channel. Never persisted.
- `tool_context` — caller-supplied static map for non-scope grab-bag data (feature flags, request ID, tenant display name).
- `mode` — optional `LLMChain.Mode` impl. Defaults to `Sagents.Modes.AgentExecution`. Bypassing it skips HITL/state propagation; sagents warns when detected.
- `max_run` — hard cap on LLM rounds before agent stops with user-friendly error (added v0.7.0). Applies to sub-agents too.

```elixir
{:ok, agent} = Agent.new(%{
  model: model,
  scope: %MyApp.Accounts.Scope{user: user, org_id: 42},
  tool_context: %{feature_flags: flags},
  middleware: [
    Middleware.entry(TodoList, []),
    Middleware.entry(FileSystem, scope: {:user, user.id}),
    Middleware.entry(SubAgent, configs: [...]),
    Middleware.entry(AskUserQuestion, []),
    Middleware.entry(HumanInTheLoop, policy: hitl_policy)   # MUST be last
  ],
  max_run: 50
})
```

## `Sagents.State` (mutable runtime data)

What gets persisted. Holds:
- `agent_id` — unique string id.
- `messages` — LLMChain message list.
- `todos` — full snapshot list (not diffs).
- `metadata` — string-keyed map (string keys are required; serialized as JSONB).
- `interrupt_data` — set when middleware returns `{:interrupt, state, data}`.

API:
- `State.put_metadata(state, "key", value)` / `get_metadata(state, "key", default)`.
- `State.new/1` for fresh sessions; restored via `AgentPersistence.load_state/2`.

## `Sagents.AgentServer` (GenServer wrapper)

Process per active conversation. Started by Coordinator, supervised under sagents' DynamicSupervisor (or Horde equivalent).

Start:
```elixir
{:ok, pid} = AgentServer.start_link(
  agent: agent,
  initial_state: state,
  pubsub: {Phoenix.PubSub, MyApp.PubSub},
  auto_save: true,
  inactivity_timeout: :timer.minutes(5),   # default
  presence: {MyAppWeb.Presence, "conversation:#{conv_id}"}
)
```

Status type: `:idle | :running | :interrupted | :paused | :cancelled | :error`.

Lifecycle: `Created → Running → Interrupted → Running → Shutdown`. Inactivity timer resets on any activity (add message, execute, resume, get_state). `:paused` arrives via `{:pause, state}` from `Agent.execute` (e.g. node draining).

Public API (use `agent_id` or pid):
- `AgentServer.execute(agent_id, user_input)` — sync wrapper.
- `AgentServer.resume(agent_id, resume_data)` — polymorphic resume payload (since v0.4.3); used after interrupt.
- `AgentServer.cancel(agent_id)` — kills sub-agents first, then graceful 2s + brutal-kill, drains pending casts, persists `:on_cancel` snapshot, writes cancellation display message (single authoritative writer).
- `AgentServer.stop(agent_id)` — graceful shutdown.
- `AgentServer.add_message(agent_id, msg)` — append user message.
- `AgentServer.get_state(agent_id)` / `export_state/1` (export = serializable copy).
- `AgentServer.agent_info(agent_id)` — `%{pid, status, state, message_count, ...}` (use this, not `export_state`, after the v0.3.0 KeyError fix).
- `AgentServer.list_running_agents/0`, `list_agents_matching/1`, `agent_count/0`, `get_metadata/1` (incl. node info).
- `AgentServer.notify_middleware(agent_id, middleware_id, message)` — routes to that middleware's `handle_message/3`. (Renamed from `send_middleware_message/3` in v0.4.0; old name deprecated wrapper.)
- `AgentServer.publish_event_from(agent_id, event)` — broadcast `{:agent, event}` to subscribers from anywhere (used inside async tasks before sending result back).

## `Agent.execute/3` return shapes

```elixir
{:ok, state}                          # normal completion
{:ok, state, %ToolResult{}}           # when agent.until_tool set (structured completion)
{:interrupt, state, interrupt_data}   # middleware paused for human input
{:pause, state}                       # infrastructure pause (e.g. node drain) — resumable later
{:error, reason}                      # terminal failure after retries/fallbacks
```

`AgentServer.execute_agent/2` and `resume_agent/2` combine PubSub callbacks with middleware-supplied callbacks and handle the 3-tuple `:ok` return.

## `Agent.build_chain/4`

Public (since v0.4.3) so middleware needing to rebuild the LLMChain during resume (e.g. HITL re-executing tools) can do so without reaching into private internals.

## `until_tool` (structured completion)

Set `agent.until_tool: "tool_name"` to make the agent loop until that tool is called, then return `{:ok, state, %ToolResult{}}`. Enforced by `Mode.Steps.continue_or_done_safe/4` — errors if LLM stops without calling the target. Works through HITL interrupt/resume.

## Coordinator pattern

App-side module mapping conversation_id → AgentServer process. Generated by `mix sagents.setup`. Responsibilities:

```elixir
def start_conversation_session(conversation_id, opts) do
  scope = Keyword.fetch!(opts, :scope)
  filesystem_scope = Keyword.fetch!(opts, :filesystem_scope)
  tool_context = Keyword.get(opts, :tool_context, %{})

  # 1. Restore or fresh state
  initial_state =
    case AgentPersistence.load_state(scope, %{agent_id: id, conversation_id: conversation_id}) do
      {:ok, state} -> state
      {:error, :not_found} -> State.new(agent_id: id)
    end

  # 2. Build agent via Factory (sets agent.scope!)
  {:ok, agent} = Factory.create_agent(
    agent_id: id,
    scope: scope,                        # dedicated channel (v0.7+)
    filesystem_scope: filesystem_scope,
    tool_context: tool_context
  )

  # 3. Start AgentServer
  AgentServer.start_link(agent: agent, initial_state: initial_state, pubsub: {...})
end
```

**Critical (v0.7):** scope must be set on `agent.scope` inside the Factory — it does NOT flow automatically. Without this step, all callbacks get `nil` for scope despite code compiling.

## Distribution

Default `:local` (Registry + DynamicSupervisor). Opt into Horde via:

```elixir
config :sagents, :distribution, :horde
```

Adds Horde dependency. `Sagents.ProcessRegistry` and `ProcessSupervisor` switch backend. `Sagents.Horde.ClusterConfig` handles cluster member discovery (incl. Fly.io regional clustering). State auto-migrates on node transfer; `restored` flag set on AgentServer; broadcasts `{:node_transferring, _}` and `{:node_transferred, _}` events.

## Application setup

Sagents has no OTP app of its own (since v0.2.0). Add to your supervision tree:

```elixir
children = [
  {Phoenix.PubSub, name: MyApp.PubSub},
  Sagents.Supervisor,
  # ... your supervisors
]
```

## Test helpers

- `Sagents.TestingHelpers.wait_until/2` — polls (10ms / 1s default) for async state changes (registry cleanups, ETS writes). Pattern: `assert wait_until(fn -> condition end)`.
- Tag live-API tests `@tag :live_call`; run with `mix test --include live_call`.
- Run `mix precommit` before commits — it runs `test --include cluster --include slow`.
