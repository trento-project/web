# `Trento.Hosts`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/hosts.ex#L4)

Provides a set of functions to interact with hosts.

# `by_host_id`

# `by_id`

```elixir
@spec by_id(String.t()) ::
  {:ok, Trento.Hosts.Projections.HostReadModel.t()} | {:error, :not_found}
```

# `deregister_host`

```elixir
@spec deregister_host(Ecto.UUID.t(), Trento.Support.DateService) ::
  :ok | {:error, :host_alive} | {:error, :host_not_registered}
```

# `get_all_hosts`

```elixir
@spec get_all_hosts(keyword()) :: [Trento.Hosts.Projections.HostReadModel.t()]
```

# `get_all_sles_subscriptions`

```elixir
@spec get_all_sles_subscriptions() :: non_neg_integer()
```

# `get_host_by_id`

```elixir
@spec get_host_by_id(Ecto.UUID.t()) ::
  Trento.Hosts.Projections.HostReadModel.t() | nil
```

# `get_hosts_for_prometheus_targets`

```elixir
@spec get_hosts_for_prometheus_targets() :: [
  Trento.Hosts.Projections.HostReadModel.t()
]
```

Returns all hosts that are configured for Prometheus pull mode.
Hosts with prometheus_mode set to :push are excluded as they push metrics directly.

# `request_checks_execution`

```elixir
@spec request_checks_execution(String.t()) :: :ok | {:error, any()}
```

# `request_hosts_checks_execution`

# `request_operation`

```elixir
@spec request_operation(atom(), String.t(), map()) ::
  {:ok, String.t()} | {:error, any()}
```

# `select_checks`

```elixir
@spec select_checks(String.t(), [String.t()]) :: :ok | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
