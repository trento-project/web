# `Trento.Infrastructure.Prometheus`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/prometheus/prometheus.ex#L4)

Prometheus integration service

# `get_exporters_status`

```elixir
@spec get_exporters_status(String.t()) :: {:ok, map()} | {:error, any()}
```

# `get_targets`

```elixir
@spec get_targets() :: [map()]
```

# `query`

```elixir
@spec query(String.t(), String.t(), DateTime.t()) :: {:ok, map()} | {:error, any()}
```

# `query_range`

```elixir
@spec query_range(String.t(), String.t(), DateTime.t(), DateTime.t()) ::
  {:ok, map()} | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
