# Tool context: scope, tool_context, state.metadata

A tool function `fn args, context -> ... end` sees three distinct data channels merged into one `context` map. Each has its own lifetime, mutability, and serialization behavior. Mixing them up is the most common source of v0.7 bugs.

## The three channels

| Channel | Lifetime | Mutable? | Persisted? | Use for |
|---|---|---|---|---|
| `agent.scope` → `context.scope` | Set at agent creation; one per session | No | **No** (rebuilt by caller every restart) | Tenant identity, user, auth, org_id |
| `agent.tool_context` → flat keys on `context` | Set at agent creation; static | No | No (virtual field) | Feature flags, request IDs, tenant display name |
| `state.metadata` → `context.state.metadata` | Evolves per round | Yes (middleware + tools write) | **Yes** (JSONB column) | Conversation title, computed flags, cross-middleware data |

Rules of thumb:
- Tenant identity → `:scope`. Always. Persistence callbacks see it as positional arg #1.
- Caller-supplied non-tenant → `:tool_context`. Set once, static across agent lifetime.
- Set or updated during execution → `state.metadata`. String keys only.

## Full `custom_context` shape

`Agent.build_chain` constructs:

```elixir
custom_context =
  Map.merge(
    agent.tool_context || %{},   # caller's flat keys
    %{
      state: state,                                # nested
      parent_middleware: agent.middleware,         # for SubAgent
      parent_tools: agent.tools,                   # for SubAgent
      tool_context: agent.tool_context || %{},    # original map, used by SubAgent extraction
      scope: agent.scope                           # canonical scope key — sagents owns this
    }
  )
```

**Collision rule:** sagents-owned keys (`:state`, `:parent_middleware`, `:parent_tools`, `:tool_context`, `:scope`) **always win** on collision. If `tool_context` contains `:scope`, sagents overrides it with `agent.scope`. Don't put scope in `tool_context`.

A tool sees:

```elixir
fn args, context ->
  # From scope — flat, top-level, canonical
  context.scope                    #=> %Scope{user: %User{...}, org_id: 42}

  # From tool_context — flat, top-level
  context.feature_flags            #=> %{new_search: true}
  context.tenant_name              #=> "Acme"

  # From state — nested
  context.state                    #=> %State{agent_id: "...", metadata: %{...}}
  context.state.metadata           #=> %{"conversation_title" => "My Chat"}

  # Internal (always present)
  context.parent_middleware        #=> [%MiddlewareEntry{}, ...]
  context.parent_tools             #=> [%Function{}, ...]
  context.tool_context             #=> original map (without scope)
end
```

> The `:tool_context` key in `custom_context` holds the original map for SubAgent middleware to extract and forward to children. Tool functions should read flat keys (`context.feature_flags`), not `context.tool_context.feature_flags`.

## Setting scope

Scope is set on the Agent at creation — **not** auto-derived from anywhere:

```elixir
{:ok, agent} = Agent.new(%{
  model: model,
  scope: %MyApp.Accounts.Scope{user: current_user, org_id: 42}
})
```

Coordinator-side wiring (typical):

```elixir
def start_conversation_session(conversation_id, opts) do
  scope = Keyword.fetch!(opts, :scope)              # from socket.assigns.current_scope
  Factory.create_agent(
    agent_id: agent_id,
    scope: scope,                                   # dedicated channel — must set explicitly
    filesystem_scope: filesystem_scope,
    tool_context: tool_context
  )
end
```

**Critical:** scope does NOT flow automatically — it must be explicitly set on the Agent struct inside each factory module. Without this, callbacks receive `nil` for scope and code still compiles (no warning).

## Never persist scope

Scope is **session/runtime state** belonging to the current caller. On restore, scope comes from the fresh Coordinator invocation, not from anything loaded from the database.

```elixir
# DON'T:
State.put_metadata(state, "scope", agent.scope)   # leaks across sessions

# DO:
# Trust that agent.scope is set fresh on every session start by the Coordinator.
```

Persistence callbacks receive scope as positional arg #1 — fed in by the AgentServer from `agent.scope`, not pulled from State.

## Keep scope lean (Erlang term-copy cost)

Scope crosses process boundaries every hop: LiveView → Coordinator call → AgentServer GenServer → SubAgent processes → tool-call executor (per tool invocation). BEAM **copies** the term on each hop. A scope embedding fully-loaded Ecto associations (user → org → memberships → preferences → api_keys) gets copied in entirety even if a tool only reads `scope.user.id`.

For long conversations with many tool calls, define a slim projection:

```elixir
defmodule MyApp.Accounts.AgentScope do
  defstruct [:user_id, :user_email, :org_id, :role]

  def from_scope(%MyApp.Accounts.Scope{} = scope) do
    %__MODULE__{
      user_id: scope.user.id,
      user_email: scope.user.email,
      org_id: scope.org && scope.org.id,
      role: scope.role
    }
  end
end

# At LiveView/Coordinator call site:
Coordinator.start_conversation_session(conversation_id,
  scope: MyApp.Accounts.AgentScope.from_scope(socket.assigns.current_scope),
  filesystem_scope: filesystem_scope
)
```

Update generated `scope_query/2` and `get_owner_id/1` to target slim fields (`scope.user_id` instead of `scope.user.id`).

Not required by default — start with the full Phoenix Scope and slim if (a) Scope preloads deep associations, (b) conversations are long-lived with many tool calls, or (c) profiling shows scope-copy on hot paths.

## Reading from a tool

```elixir
function: fn %{"id" => id}, context ->
  # Same access in main agent and SubAgent
  Projects.get_project(context.scope, id)
end

function: fn _args, context ->
  if context.feature_flags[:new_search], do: new_search(), else: legacy_search()
end

function: fn _args, context ->
  title = State.get_metadata(context.state, "conversation_title", "Untitled")
  {:ok, "Current conversation: #{title}"}
end
```

## Writing from a tool (state delta)

Tools can return updated State as the third tuple element. The delta is merged into the chain's custom_context by `Sagents.Modes.AgentExecution.propagate_state/2`.

```elixir
function: fn %{"query" => query}, context ->
  results = SearchService.search(context.scope, query)
  updated_state = State.put_metadata(context.state, "last_search", query)
  {:ok, format(results), updated_state}
end
```

## SubAgent context propagation

When the SubAgent middleware spawns a child, all three channels propagate from parent:

| Channel | How it propagates | Where it lives in child |
|---|---|---|
| `scope` | Read from parent `custom_context.scope`; assigned to `subagent.scope` | `context.scope` (re-merged by `Agent.build_chain`); positional arg #1 to child's persistence callbacks |
| `tool_context` | Read from parent `custom_context.tool_context` (the original map); passed to SubAgent constructor | Flat keys in child `context`; stored again as `:tool_context` for further nesting |
| `state.metadata` | Copied from parent `State` into fresh child `State` | `context.state.metadata` |

What does **NOT** propagate:
- **Messages** — sub-agent starts fresh (system prompt + instructions only)
- **Todos** — sub-agent has its own empty list
- **Agent ID** — child gets a unique id derived from parent's (e.g. `"parent-1-sub-12345"`)

This isolates sub-agents as independent execution units sharing the parent's environment, with their own conversational state.

```elixir
# Inside a SubAgent tool — same access patterns as main agent
fn _args, context ->
  context.scope                                 #=> %Scope{...}     (from parent)
  context.feature_flags                         #=> %{...}          (from parent's tool_context)
  context.state.metadata["conversation_title"]  #=> "My Chat"       (snapshot from parent)
  context.state.agent_id                        #=> "parent-1-sub-12345"  (own)
end
```

Explicit options on `SubAgent.new_from_config` and `new_from_compiled`: `:parent_tool_context`, `:parent_metadata` — make inheritance explicit and testable.

## Migration from pre-scope-channel API (v0.6 and earlier)

Earlier versions used `tool_context[:current_scope]` for tenant scope. v0.7 promoted scope to a first-class field. The upgrade is a hard break — no deprecation shims.

| Before (v0.6 and earlier) | After (v0.7+) |
|---|---|
| `tool_context: %{current_scope: scope, ...}` at agent creation | `scope: scope, tool_context: %{...}` (two separate keys) |
| `Map.put(tool_context, :current_scope, user_scope)` in Coordinator | Pass `:scope` directly to Factory/Coordinator; drop the manual merge |
| `context.current_scope` in tool function | `context.scope` |
| `context.tool_context[:current_scope]` in MessagePreprocessor callback | `context.scope` (top-level context key) |
| `persist_state(agent_id, data, lifecycle)` callback | `persist_state(scope, data, %{agent_id, conversation_id, lifecycle})` |
| `save_message(conv_id, message)` callback | `save_message(scope, message, %{agent_id, conversation_id})` |
| `Conversations.load_display_messages(conv_id)` | `Conversations.load_display_messages(scope, conv_id)` |

`grep current_scope` in your code (excluding Phoenix's `socket.assigns.current_scope`) surfaces every call site that needs updating.
