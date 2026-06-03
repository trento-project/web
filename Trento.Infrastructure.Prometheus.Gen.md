# `Trento.Infrastructure.Prometheus.Gen`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/prometheus/adapter/gen.ex#L4)

Behaviour of a prometheus adapter.

# `get_exporters_status`

```elixir
@callback get_exporters_status(host_id :: String.t()) :: {:ok, map()} | {:error, any()}
```

# `query`

```elixir
@callback query(query :: String.t(), time :: DateTime.t()) ::
  {:ok, map()} | {:error, any()}
```

# `query_range`

```elixir
@callback query_range(query :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
  {:ok, map()} | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
