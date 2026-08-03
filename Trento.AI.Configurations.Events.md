# `Trento.AI.Configurations.Events`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/configurations/events.ex#L4)

Behaviour + dispatcher for per-user AI configuration lifecycle events.

The default production implementation is
`Trento.Infrastructure.AI.PubSubConfigurationEvents`.

# `broadcast_cleared`

```elixir
@callback broadcast_cleared(non_neg_integer()) :: :ok
```

Broadcasts that the given user's AI configuration was cleared.

# `broadcast_created`

```elixir
@callback broadcast_created(non_neg_integer()) :: :ok
```

Broadcasts that the given user's AI configuration was created.

# `broadcast_updated`

```elixir
@callback broadcast_updated(non_neg_integer(), %{provider: atom(), model: String.t()}) ::
  :ok
```

Broadcasts that the given user's AI provider/model changed.

# `subscribe`

```elixir
@callback subscribe(non_neg_integer() | String.t()) :: :ok | {:error, term()}
```

Subscribes the **calling process** to the given user's AI configuration
lifecycle events.

# `broadcast_cleared`

# `broadcast_created`

# `broadcast_updated`

# `subscribe`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
