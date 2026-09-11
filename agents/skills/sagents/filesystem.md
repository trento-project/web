# FileSystem middleware

Provides agents with file-operation tools (`list_files`, `read_file`, `create_file`, `replace_file_text`, `replace_file_lines`, `find_in_file`, `move_file`) by delegating to a `FileSystemServer` GenServer identified by a **scope key**. The server is supervised independently from the agent — multiple agents can share the same FileSystem (user-scoped, project-scoped, etc.).

## When to use it (and when NOT)

The FileSystem is a **general-purpose virtual filesystem** for storing text/binary content with paths. It is fundamentally different from a domain-record store.

**Good fits** — genuinely file-shaped content:
- Drafts, notes, reference documents
- Agent-authored Markdown / plain text
- Files the user thinks of as files

**Bad fits** — structured business objects (blog posts, tickets, invoices, projects):
- LLM can't discover custom validation rules from a file API.
- Validation failures corrupt partial state.
- Token waste on metadata schema errors.

For domain records: model them separately, with their own middleware and persistence layer.

The "draft-then-commit" pattern (since v0.6.0 docs rewrite): split content (file) from metadata (domain record) across two tool calls — write the file first, then commit the metadata. Generated tokens aren't thrown away on metadata validation errors.

## Three-step setup

```elixir
# 1. Start the FileSystemServer for this scope (idempotent; safe to call repeatedly)
:ok = FileSystem.ensure_filesystem(
  scope_key,                          # e.g. {:user, user.id}
  persistence_configs,
  opts
)

# 2. Pass scope key to the agent factory
{:ok, agent} = Factory.create_agent(
  agent_id: id,
  scope: scope,
  filesystem_scope: {:user, user.id}, # <- this key
  tool_context: tool_context
)

# 3. Start agent session — connects automatically through scope key
{:ok, _pid} = AgentServer.start_link(agent: agent, initial_state: state, ...)
```

## Scope strategies

Scope is an opaque tuple — sagents doesn't inspect it. Common patterns:

| Strategy | Key | Use case |
|---|---|---|
| User-scoped (default) | `{:user, user_id}` | Personal scratchpad, per-user notes |
| Project-scoped | `{:project, project_id}` | Shared workspace |
| Conversation-scoped | `{:conversation, conv_id}` | Ephemeral per-chat files |
| Custom | anything matching `Persistence` config | Tenant + namespace combinations |

Multiple agents can reference the same FileSystemServer — they share state, file change events, and persistence backend.

## Persistence backends

FileSystem persists via the `Sagents.FileSystem.Persistence` behaviour. Built-in: `Persistence.Disk` (host filesystem, default).

Implement the behaviour for DB-backed storage, S3, etc. Optional callbacks:
- `move_in_storage/3` — handle path changes efficiently (since v0.4.2 for Disk; renames via `File.rename/2` with parent-dir creation).
- `update_metadata_in_storage/2` — efficient metadata-only updates without rewriting content (since v0.4.0).

Per-path config — different backends for different prefixes:

```elixir
persistence_configs = [
  %FileSystemConfig{
    path_prefix: "/templates",
    persistence: {S3Persistence, bucket: "templates"},
    read_only: true
  },
  %FileSystemConfig{
    path_prefix: "/drafts",
    persistence: {DBPersistence, repo: MyApp.Repo}
  },
  %FileSystemConfig{
    default: true,                           # catch-all (added v0.4.0)
    persistence: {Persistence.Disk, base_directory: "/tmp/agents"}
  }
]
```

`default: true` catch-all handles any path with one backend; specific configs take priority.

`persist_file/2` routes to `update_metadata_in_storage` when only non-content fields changed and the backend supports it; otherwise falls back to `write_to_storage`.

## Cross-backend `move_file` rejected

Moves between different persistence backends (e.g. disk → DB) are rejected with an error message that includes the source `base_directory` so the agent knows the valid move scope. Read-only destination check applies on `move_file/3` (since v0.4.2 — previously only the source was checked).

## File seeding

Copy template files for new users **before** starting the FileSystemServer. The seeding step runs against the persistence backend directly (not via tool calls) so the agent's first interaction sees a populated filesystem.

## Runtime injection

`FileSystemServer.register_files/2` — register dynamic files in memory at runtime (e.g. an agent-authored summary that should be readable but not persisted). Useful for "synthetic" files derived from external data sources.

## `FileSystemCallbacks` behaviour

Optional callback module for reacting to filesystem events. v0.7 added `scope` as positional arg #1 to all callbacks:

```elixir
defmodule MyApp.FsCallbacks do
  @behaviour Sagents.FileSystem.FileSystemCallbacks

  @impl true
  def on_write(scope, path, entry, metadata), do: ...
  @impl true
  def on_read(scope, path, entry), do: ...
  @impl true
  def on_delete(scope, path, metadata), do: ...
  @impl true
  def on_list(scope, entries, metadata), do: ...
end
```

## PubSub file change events

Subscribe to file events for real-time UI updates (e.g. a sidebar tree refresh). Topic and event format covered in `pubsub-events.md`.

## v0.7 line-number contract

`read_file`, `replace_file_lines`, and `find_in_file` all use **1-based** line numbers consistently. Output of `read_file` is `cat -n`-style (right-aligned 6-char number + tab separator). When the FileSystem middleware system prompt is generated, a "line-number rules" section is emitted **only when** at least one line-aware edit tool (`replace_file_text` or `replace_file_lines`) is enabled — the prompt explains:
- 1-based numbering
- Line-shift semantics after edits
- Trailing-newline behavior
- `cat -n` prefix is informational, not part of the file content

After `replace_file_text` and `replace_file_lines` execute, the **updated file content is returned immediately** (added v0.7.0). The agent no longer needs a follow-up `read_file` call.

## v0.6 tool renames (BREAKING)

If you list tools explicitly via `:enabled_tools` or reference these names elsewhere:

| Before | After |
|---|---|
| `replace_text` | `replace_file_text` |
| `replace_lines` | `replace_file_lines` |
| `search_text` | `find_in_file` (now searches a **single file**, not the whole filesystem) |

`:enabled_tools` and `:custom_tool_descriptions` now **reject unknown tool names at `init/1`** instead of silently ignoring them — typos and references to retired names will raise at agent startup.

`FileSystem` middleware system prompt is trimmed to only describe tools actually enabled — no more describing tools the LLM can't call.

## Middleware options

| Opt | Purpose |
|---|---|
| `:scope` | scope key tuple identifying the FileSystemServer |
| `:enabled_tools` | whitelist (validated against known tool names) |
| `:custom_tool_descriptions` | per-tool description override (validated) |
| `:custom_display_texts` | per-tool UI label override |
| `:entry_to_map` | controls how `%FileEntry{}` is serialized to JSON for LLM tool results; falls back to `default_entry_to_map/1` |

## `%FileEntry{}` struct

Returned from most file operations (since v0.4.0 — previously many ops returned bare strings). Notable fields:

| Field | Notes |
|---|---|
| `path` | string |
| `content` | binary (nil for directories) |
| `entry_type` | `:file` or `:directory` |
| `title` | display label (added v0.4.0) |
| `id` | external identifier (added v0.4.0) |
| `file_type` | MIME-ish category (added v0.4.0) |
| `dirty_content` | content has unsaved changes (renamed from `dirty` v0.4.0) |
| `dirty_non_content` | metadata has unsaved changes (renamed from `dirty_metadata` v0.4.0) |
| `metadata.custom` | user-defined map |

Update via:
- `update_entry/4` — entry-level fields (title, id, file_type), uses `update_entry_changeset/2`.
- `update_custom_metadata/4` — `metadata.custom` only (renamed from `update_metadata/4`).
- Both persist immediately by default; pass `persist: :debounce` for debounced persistence.

`FileSystemState.list_files/1` filters out directory entries — returns only file paths. Use `list_entries/1` for directories included (synthesized for tree UIs).

## Server-internal helper

`Sagents.TextLines` (since v0.6.0) — extracted from FileSystem middleware. Reusable 1-indexed line-number splitting, rendering (right-aligned 6-char numbers + tab separator), and range operations. Use it in custom tools that need consistent line-numbered text handling.

## v0.7.0 fix worth noting

`FileSystemServer` now handles `{:EXIT, port, reason}` in `handle_info/2` when `trap_exit` is enabled — port exits from `System.cmd` during persistence callbacks were previously crashing the server.
