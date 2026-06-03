# `Trento.SoftwareUpdates.Discovery`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/software_updates/discovery.ex#L4)

Software updates integration service

# `clear_software_updates_discoveries`

```elixir
@spec clear_software_updates_discoveries() :: :ok | {:error, any()}
```

# `clear_tracked_discovery_result`

```elixir
@spec clear_tracked_discovery_result(String.t()) :: :ok
```

# `discover_host_software_updates`

```elixir
@spec discover_host_software_updates(String.t(), String.t()) ::
  {:ok, String.t(), String.t(), any(), any()} | {:error, any()}
```

# `discover_software_updates`

```elixir
@spec discover_software_updates() :: {:ok, {list(), list()}}
```

# `get_discovery_result`

```elixir
@spec get_discovery_result(String.t()) :: {:ok, list(), list()} | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
