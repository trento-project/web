# PubSub events

Sagents broadcasts agent state via `Phoenix.PubSub`. LiveViews, controllers, and any other process can subscribe.

## Topics

Per AgentServer:

| Topic | Purpose |
|---|---|
| `"agent_server:#{agent_id}"` | Primary user-facing events |
| `"agent_server:debug:#{agent_id}"` | Debug/observability stream (used by `sagents_live_debugger`) |

## Event envelope

**All events are wrapped in a `{:agent, payload}` tuple** (since v0.2.0 — pre-v0.2 events were unwrapped; this changed for easier `handle_info` routing).

```elixir
def handle_info({:agent, {:status_changed, status, data}}, socket), do: ...
def handle_info({:agent, {:llm_deltas, delta}}, socket), do: ...
def handle_info({:agent, {:llm_message, message}}, socket), do: ...
def handle_info({:agent, {:todos_updated, todos}}, socket), do: ...
def handle_info({:agent, {:tool_started, info}}, socket), do: ...
def handle_info({:agent, {:tool_completed, info}}, socket), do: ...
def handle_info({:agent, {:agent_shutdown, reason}}, socket), do: ...
def handle_info({:agent, {:display_message_persisted, dm}}, socket), do: ...
```

## Event categories (main topic)

| Category | Examples | Notes |
|---|---|---|
| Status transitions | `{:status_changed, :idle, nil}`, `{:status_changed, :running, nil}`, `{:status_changed, :interrupted, interrupt_data}`, `{:status_changed, :paused, nil}`, `{:status_changed, :cancelled, nil}`, `{:status_changed, :error, reason}` | One event per state change |
| LLM streaming | `{:llm_deltas, delta}` | Per-token streaming |
| LLM completion | `{:llm_message, full_message}` | Full message — prefer over accumulating deltas |
| Todos | `{:todos_updated, full_list}` | **Full snapshots, not diffs** |
| Tool lifecycle | `{:tool_started, info}`, `{:tool_completed, info}`, `{:tool_failed, info}`, `{:tool_cancelled, info}`, `{:on_tool_call_identified, info}` | UI display labels propagate via these |
| Display message | `{:display_message_persisted, dm}` | Fired after DisplayMessagePersistence saves a row |
| Shutdown | `{:agent_shutdown, reason}` | Reason ∈ inactivity / explicit stop / presence / cancel |
| Chain error | `{:chain_error, error}` | Terminal chain error after retries/fallbacks (since v0.5.0) |
| Custom | Anything fired via `AgentServer.publish_event_from(agent_id, event)` | Use for middleware-specific signals |

Sub-agent events (also on main topic when emitted by sub-agent infrastructure):
- `{:subagent_failed, %{final_messages, turn_count, error}}` — carries last N messages before failure (since v0.6.0)
- `{:subagent_cancelled, %{final_messages, turn_count}}` — same payload shape
- Minimal fallback broadcast fires within 300ms even when sub-agent is blocked mid-LLM-call

`display_text` re-fires `{:on_tool_call_identified, ...}` once `subagent_type` is known (since v0.6.0) so UI shows "Drafting KB article" instead of generic "Running task".

## Debug topic

Subscribe to `"agent_server:debug:#{agent_id}"` for:

- `{:llm_error, error}` — every individual LLM API call failure, including transient errors recovered via retry/fallback (since v0.5.0)
- Various internal step transitions
- Middleware-supplied debug events

The `sagents_live_debugger` package consumes this stream to render a real-time debugging dashboard.

## Subscription pattern

```elixir
def mount(%{"id" => conv_id}, _session, socket) do
  if connected?(socket) do
    Phoenix.PubSub.subscribe(MyApp.PubSub, "agent_server:#{conv_id}")
  end
  {:ok, socket}
end

def handle_info({:agent, {:llm_message, msg}}, socket) do
  {:noreply, assign(socket, :last_message, msg)}
end

def handle_info({:agent, {:status_changed, status, _data}}, socket) do
  {:noreply, assign(socket, :agent_status, status)}
end
```

`connected?(socket)` guard avoids subscribing during the initial dead-render. Handle missing agents gracefully (the AgentServer may not be running yet — start it on demand via Coordinator).

## Snapshots over deltas (consistency)

Rely on **complete snapshots** (`llm_message`, `todos_updated`) for state reconciliation rather than accumulating deltas. Deltas can drop on transient subscriber issues; snapshots are self-contained.

## Presence-based shutdown

When AgentServer is started with `presence: {MyAppWeb.Presence, "topic"}`, it tracks viewers and shuts down idle agents with no observers:

```
Agent completes execution (status: :idle)
  ↓
Check presence
  ↓
No viewers
  ↓
Grace period (default 5s — viewers can rejoin)
  ↓
Shutdown
```

Running or interrupted agents continue regardless of viewer count — only `:idle` agents are eligible for presence-based shutdown.

Inactivity timeout (separate from presence — default 5 min) also triggers shutdown after no activity. Activity = any add_message / execute / resume / get_state. Auto-saves state if `auto_save: true`.

## Horde transfer events

When configured for cluster distribution (`config :sagents, :distribution, :horde`), AgentServer broadcasts:

- `{:agent, {:node_transferring, %{from: from_node, to: to_node, ...}}}`
- `{:agent, {:node_transferred, %{from: from_node, to: to_node, ...}}}`

`AgentServer` tracks a `restored: true` flag on Horde migrations so middleware can detect post-migration startup.

## Writing custom events from middleware

```elixir
@impl true
def after_model(state, _config) do
  AgentServer.publish_event_from(state.agent_id, {:my_metric, %{count: 42}})
  {:ok, state}
end
```

`publish_event_from/2` works from anywhere (incl. spawned tasks) — it doesn't require GenServer state. Combine with `notify_middleware/3` when an async task needs to both notify subscribers (broadcast) and update state (route to `handle_message/3`):

```elixir
Task.start(fn ->
  result = expensive_compute(state)
  AgentServer.publish_event_from(agent_id, {:result_ready, result})  # broadcast first
  AgentServer.notify_middleware(agent_id, __MODULE__, {:store_result, result})  # then state update
end)
```
