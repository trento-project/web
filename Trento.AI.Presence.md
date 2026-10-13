# `Trento.AI.Presence`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/presence.ex#L4)

Viewers of AI agent conversations. sagents stops an idle agent once its last viewer is gone.

# `child_spec`

# `fetch`

# `fetchers_pids`

# `get_by_key`

# `list`

# `track`

# `track`

# `track_viewer`

```elixir
@spec track_viewer(String.t(), String.t()) :: :ok | {:error, term()}
```

Tracks the calling process as a viewer of `agent_id`. Presence drops the viewer when the
process exits, so tracking from the channel covers every way the client goes away.
Tracking twice is a no-op.

# `untrack`

# `untrack`

# `untrack_viewer`

```elixir
@spec untrack_viewer(String.t(), String.t()) :: :ok
```

Untracks the calling process as a viewer of `agent_id`.

# `update`

# `update`

# `viewer_check_delay`

```elixir
@spec viewer_check_delay() :: non_neg_integer()
```

Grace period after the last viewer leaves, so a client that rejoins in time keeps the agent.
Set by `:viewer_check_delay` in the `:ai` application environment.

# `viewers_topic`

```elixir
@spec viewers_topic(String.t()) :: String.t()
```

The Presence topic sagents watches for `agent_id`'s viewers.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
