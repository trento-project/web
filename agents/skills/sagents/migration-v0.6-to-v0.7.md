# Migration: v0.6.0 → v0.7.0

The hard break: **scope** became a first-class field on the `Agent` struct and the first positional argument to every callback in four behaviour modules. There are **no deprecation shims** — the upgrade requires touching every callback module.

## What changed

1. **`Agent` struct** — new `:scope` field. Integrator-defined struct (e.g. `%MyApp.Accounts.Scope{}`).
   - Auto-merged into tool `custom_context` under canonical `:scope` key.
   - **Not serialized** — session state, not stored state.
   - Sagents owns the `:scope` key — overrides any `tool_context[:scope]` collision.

2. **Four behaviours gain `scope` as positional arg #1:**
   - `AgentPersistence`
   - `DisplayMessagePersistence`
   - `FileSystemCallbacks`
   - `MessagePreprocessor`

3. **`AgentPersistence` context arg type changed** — from bare atom/string `agent_id` to typed map `%{agent_id, conversation_id, lifecycle}` for `persist_state/3`, `%{agent_id, conversation_id}` for `load_state/2`.

4. **Coordinator** gains `scope:` option. Caller threads it through from LiveView/controller.

5. **`max_run` configuration** — new on `Agent` and `SubAgent`. Limits LLM rounds; produces user-friendly error when exceeded.

6. **`replace_file_text` / `replace_file_lines`** now return updated file content immediately — no follow-up `read_file` needed.

7. **`on_server_start/2` return values applied** — previously silently discarded; middleware now observe each other's startup state changes.

## Before / after callback signatures

| Before (v0.6) | After (v0.7) |
|---|---|
| `persist_state(agent_id, data, lifecycle)` | `persist_state(scope, data, %{agent_id, conversation_id, lifecycle})` |
| `load_state(agent_id)` | `load_state(scope, %{agent_id, conversation_id})` |
| `save_message(conv_id, message)` | `save_message(scope, message, %{agent_id, conversation_id})` |
| `update_tool_status(tool_info, ctx)` | `update_tool_status(scope, tool_info, callback_context)` |
| `resolve_tool_result(tool_info, ctx)` | `resolve_tool_result(scope, tool_info, callback_context)` |
| `on_write(path, entry, meta)` | `on_write(scope, path, entry, meta)` |
| `on_read(path, entry)` | `on_read(scope, path, entry)` |
| `on_delete(path, meta)` | `on_delete(scope, path, meta)` |
| `on_list(entries, meta)` | `on_list(scope, entries, meta)` |
| `MessagePreprocessor.preprocess(input, ctx)` | `MessagePreprocessor.preprocess(scope, input, ctx)` |
| `tool_context: %{current_scope: scope}` at agent creation | `scope: scope, tool_context: %{...}` (two keys) |
| `context.current_scope` in tool function | `context.scope` |
| `context.tool_context[:current_scope]` | `context.scope` |
| `Conversations.load_display_messages(conv_id)` | `Conversations.load_display_messages(scope, conv_id)` |

## Migration steps

### 1. Update callback signatures

For each `@impl` of `AgentPersistence`, `DisplayMessagePersistence`, `FileSystemCallbacks`, `MessagePreprocessor`: prepend `scope` to the argument list. For `AgentPersistence`, also unpack the typed context map.

```elixir
# Before
def persist_state(agent_id, data, lifecycle), do: ...

# After
def persist_state(scope, data, %{agent_id: agent_id, conversation_id: conv_id, lifecycle: lifecycle}) do
  ...
end
```

### 2. Set scope on the Agent struct (CRITICAL)

Scope does **not** flow automatically. You must set it on the `Agent` struct inside each factory module.

```elixir
# In Factory.create_agent/1
def create_agent(opts) do
  Agent.new(%{
    model: model,
    scope: Keyword.fetch!(opts, :scope),       # <- mandatory
    tool_context: Keyword.get(opts, :tool_context, %{}),
    middleware: [...]
  })
end
```

Without this step, callbacks receive `nil` for scope and code compiles cleanly (no warning). Symptom: persistence queries returning `{:error, :not_found}` for valid records, FunctionClauseErrors in scope-aware contexts.

### 3. Update Coordinator calls

```elixir
# Before
Coordinator.start_conversation_session(conv_id,
  tool_context: %{current_scope: scope, ...}
)

# After
Coordinator.start_conversation_session(conv_id,
  scope: scope,
  tool_context: %{...}                         # no scope here anymore
)
```

The `scope:` parameter is forwarded by the Coordinator to the Factory, which sets it on the Agent.

### 4. Fix direct callback invocations

Any non-`@impl` code that calls persistence modules directly (helper functions, mix tasks, jobs) must add `scope` as arg #1. **These produce runtime errors, not compiler warnings** — search manually:

```bash
grep -r 'AgentPersistence\.\|DisplayMessagePersistence\.\|FileSystemCallbacks\.\|MessagePreprocessor\.' lib test
```

### 5. Update test invocations

Tests calling callbacks directly must add `nil` as the first argument **unless the test specifically exercises scope-dependent behavior**:

```elixir
# Before
assert {:ok, _} = MyApp.AgentPersistence.persist_state("agent-1", data, :on_idle)

# After
context = %{agent_id: "agent-1", conversation_id: "conv-1", lifecycle: :on_idle}
assert {:ok, _} = MyApp.AgentPersistence.persist_state(nil, data, context)

# Or with scope:
assert {:ok, _} = MyApp.AgentPersistence.persist_state(test_scope, data, context)
```

### 6. Migrate tool functions

Only tools previously using the **old `tool_context[:current_scope]` workaround** need changes — replace manual scope injection with `context.scope`:

```elixir
# Before
function: fn args, context ->
  scope = context.tool_context[:current_scope]
  Projects.get(scope, args["id"])
end

# After
function: fn args, context ->
  Projects.get(context.scope, args["id"])
end
```

`grep current_scope` in your code (excluding Phoenix's `socket.assigns.current_scope`, which is unrelated) surfaces every call site that needs updating.

### 7. Re-run the setup generator

For generated files (Coordinator, Factory, persistence modules, LiveView helpers), re-run:

```bash
mix sagents.setup     # with the same options
```

On a clean, committed workspace. Accept the overwrites, then merge your customizations back in with a diff tool. Templates updated:

- `coordinator.ex.eex`
- `factory.ex.eex`
- `agent_persistence.ex.eex`
- `display_message_persistence.ex.eex`
- `agent_live_helpers.ex.eex`
- persistence context template

## Verification

```bash
mix compile
```

Surfaces all callback arity mismatches via deprecation warnings. Then:

```bash
mix test
```

For tests: failures will look like `FunctionClauseError` or `KeyError: key :scope not found`.

End-to-end smoke test — start a conversation session and confirm scope flows:

1. LiveView mount → start session via Coordinator
2. Send a user message
3. Trigger a tool that reads `context.scope`
4. Assert the tool received a non-nil scope matching the LiveView's `socket.assigns.current_scope`

If scope is `nil` in the tool but non-nil in the LiveView, scope is not being set on the Agent struct in the Factory (step 2 above).

## Other v0.7 fixes worth knowing

- Generated `load_display_messages` context function no longer applies a default result-count limit — prevents longer conversations from losing new messages on reload.
- `FileSystemServer` handles `{:EXIT, port, reason}` in `handle_info/2` — port exits from `System.cmd` during persistence callbacks no longer crash the server.
- FileSystem line-number semantics consistently 1-based across `read_file`, `replace_file_lines`, `find_in_file`.
- `SubAgent.task_subagent_boilerplate/0` made public with full documentation (was undocumented despite being referenced).
- LangChain bumped to `>= 0.8.2`.

## Migration prompt (upstream)

The repo includes `MIGRATION_PROMPT_v0.6.0_TO_v0.7.0.md` at the root — drop into your coding assistant for the official walkthrough with exact before/after signatures and coverage of non-obvious call sites.
