# Persistence

Sagents separates **configuration** (in code, never serialized) from **runtime state** (in DB as JSONB). Configuration includes the model, middleware, tools, and prompts — these are reconstituted from code on every restart. State is messages, todos, and metadata.

## Dual-view conversation storage

Two separate representations of the conversation:

| | **Agent State** | **Display Messages** |
|---|---|---|
| Audience | LLM | UI |
| Storage | Single JSONB blob (`agent_states` table) | Individual rows (`display_messages`) |
| Mutability | Middleware can compress / summarize / rewrite | Immutable; one row per content event |
| Purpose | Token-efficient context | Full unmodified history for users |
| Reload cost | Deserialize one big blob | Stream/page individual rows |

Why split: middleware can summarize 50 messages into 3 condensed ones for the LLM while users still see all 50 originals. Display rows survive any agent-side compression.

## Generated schemas

`mix sagents.setup` generates:

- `Conversation` — links to your application's owner (user, team, organization). Conversation metadata + ownership.
- `AgentState` — serialized State (messages + todos + metadata) as JSONB.
- `DisplayMessage` — UI-friendly per-message rows with flexible content types (thinking blocks, images, tool status).

Plus a generated context module (e.g. `Conversations`) with `Scope`-enforced functions: every context function takes `%Scope{}` as first arg, ensuring "wrong-scope callers receive `{:error, :not_found}`."

## `Sagents.AgentPersistence` behaviour

Optional callback module the AgentServer invokes at lifecycle points. v0.7 changed all signatures — see `migration-v0.6-to-v0.7.md`.

```elixir
defmodule MyApp.AgentPersistence do
  @behaviour Sagents.AgentPersistence

  @impl true
  def persist_state(scope, state_data, %{agent_id: id, conversation_id: conv_id, lifecycle: lifecycle}) do
    # lifecycle ∈ [:on_idle, :on_shutdown, :on_interrupt, :on_cancel, :on_title]
    Conversations.upsert_agent_state(scope, conv_id, state_data)
  end

  @impl true
  def load_state(scope, %{agent_id: id, conversation_id: conv_id}) do
    case Conversations.get_agent_state(scope, conv_id) do
      nil -> {:error, :not_found}
      state_data -> {:ok, state_data}
    end
  end
end
```

Lifecycle reasons (`:lifecycle` key in the persist context map):

| Reason | Triggered when |
|---|---|
| `:on_idle` | Execution completed → returned to `:idle` |
| `:on_shutdown` | Inactivity timeout / explicit `stop/1` |
| `:on_interrupt` | Middleware returned `{:interrupt, _, _}` |
| `:on_cancel` | `AgentServer.cancel/1` (added v0.6.0 — enables page-reload recovery of partial progress) |
| `:on_title` | Title-generation middleware fired |

**Critical:** never serialize `agent.scope` into the State blob. Scope is **session state** belonging to the caller starting the agent right now, not stored state. On restart, scope comes from the fresh Coordinator invocation.

## `Sagents.DisplayMessagePersistence` behaviour

```elixir
defmodule MyApp.DisplayMessagePersistence do
  @behaviour Sagents.DisplayMessagePersistence

  @impl true
  def save_message(scope, display_message, %{agent_id: id, conversation_id: conv_id}) do
    Conversations.insert_display_message(scope, conv_id, display_message)
  end

  @impl true
  def update_tool_status(scope, %{tool_call_id: id, status: status, ...}, callback_context) do
    # status ∈ [:running, :completed, :error, :cancelled]   <- :cancelled added v0.6.0
    Conversations.update_tool_status(scope, id, status)
  end

  @impl true
  def resolve_tool_result(scope, %{tool_call_id: id, result: result}, callback_context) do
    Conversations.set_tool_result(scope, id, result)
  end
end
```

If you have generated templates from before v0.6, re-run `mix sagents.gen.persistence` and merge the new `:cancelled` clause and `cancel_tool_call/1` context function. Existing modules without these will crash when AgentServer's cancel path fires.

Cancellation display message is persisted by **AgentServer** (since v0.6.0), not the LiveView — avoids duplicate rows when multiple tabs subscribe. Generator's `handle_status_cancelled/1` no longer inserts the message itself.

## `Sagents.MessagePreprocessor` behaviour (since v0.4.0)

Splits incoming messages into separate display and LLM versions. Use case: rich `@reference` expansion — `@ProjectBrief` → full content for LLM, styled chip for UI.

```elixir
defmodule MyApp.MessagePreprocessor do
  @behaviour Sagents.MessagePreprocessor

  @impl true
  def preprocess(scope, raw_input, _context) do
    {:ok, display_message, llm_message} = expand_references(scope, raw_input)
    {display_message, llm_message}
  end
end
```

v0.7: signature became `preprocess/3` with `scope` as first positional arg (was `preprocess/2`).

Wired through Coordinator → AgentServer at session start.

## Persistence flow on session start

```
Coordinator.start_conversation_session(conv_id, scope: scope, ...)
  ├─ AgentPersistence.load_state(scope, %{agent_id, conversation_id})
  │   ├─ {:ok, state_data} → State.from_serialized(state_data)
  │   └─ {:error, :not_found} → State.new(agent_id: id)
  ├─ Factory.create_agent(scope: scope, ...) → %Agent{scope: scope, ...}
  └─ AgentServer.start_link(agent: agent, initial_state: state, ...)
       ├─ Triggers on_server_start/2 on each middleware
       ├─ Auto-invokes AgentPersistence callbacks at :on_idle / :on_interrupt / :on_cancel / :on_shutdown / :on_title
       └─ Display messages persist separately via DisplayMessagePersistence (independent of State)
```

## Adding middleware to existing agents

Initialize missing state gracefully **inside the middleware** (typically in `on_server_start/2` or via guarded reads), not via DB migrations. State is JSONB — adding new metadata keys is forward-compatible. Old conversations restart with whatever metadata they had; the middleware fills in defaults on first execution.

```elixir
@impl true
def on_server_start(state, config) do
  # Backfill default if missing (returned value is now actually applied since v0.7.0)
  state =
    case State.get_metadata(state, "my_feature_flag") do
      nil -> State.put_metadata(state, "my_feature_flag", config.default)
      _ -> state
    end
  {:ok, state}
end
```

## What's NOT serialized

- `agent.scope` — session/runtime, comes from fresh caller every time.
- `agent.tool_context` — virtual field, supplied at agent creation per-session.
- `agent.middleware`, `agent.tools`, `agent.model` — code, not data.
- LangChain callback handlers — registered fresh from middleware on each session start.

What IS in State (and JSONB-serialized):
- `messages` (LLMChain message list)
- `todos` (full snapshots)
- `metadata` (string-keyed map)
- `interrupt_data` when interrupted
